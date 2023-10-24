const moment = require('moment');
const { Validator, ValidationError } = require("jsonschema");
const search_schema = require('../schemas/search');
const { Pool } = require("pg");

console.log(`pg: connecting with URI ${process.env.DATABASE_URL}`);
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

class PGClient
{
    constructor()
    {
        this.pool = pool;

        this.public_prefix = `"public".`;
        this.brews = `${this.public_prefix}"brews"`;
        this.downloads = `${this.public_prefix}"downloads"`;
        this.pages = `${this.public_prefix}"pages"`;

        console.log(`pg: referencing tables with syntax ${this.brews}`);
    }

    // Creates a brew in the brews table
    createBrew = async (script_id, script_name, num_pages, creation_time) => 
    {
        const client = await this.pool.connect();

        try 
        {
            const statement = `INSERT INTO ${this.brews}(id, "name", pages, created_on) VALUES ($1, $2, $3, $4)`;
            const params = [script_id, script_name, num_pages, creation_time];

            await client.query("BEGIN");
            await client.query(statement, params);
            await client.query("COMMIT");
        }
        catch (err)
        {
            await client.query("ROLLBACK");
            throw err;
        }
        finally
        {
            client.release();
        }
    };

    // Silently destroys a brew, ignoring any errors
    destroyBrew = async (script_id) =>
    {
        const client = await this.pool.connect();

        try
        {
            const statement = `DELETE FROM ${this.brews} WHERE id = $1`;
            const params = [script_id];
            await client.query(statement, params);
        }
        catch (err)
        {
            console.log(err);
        }
        finally
        {
            client.release();
        }
    };

    // Gets information on this brew
    getBrew = async (script_id) =>
    {
        const client = await this.pool.connect();

        try 
        {
            const statement = `SELECT * FROM ${this.brews} WHERE id = $1`;
            const params = [script_id];

            const response = await client.query(statement, params);

            if (response.rowCount == 0)
            {
                throw Error(`a brew with id ${script_id} does not exist`);
            }

            return response.rows[0];
        }
        catch (err)
        {
            throw Error(`pg: failed to get brew ${script_id}: ${err}`);
        }
        finally
        {
            client.release();
        }
    };

    // Returns all brews with a matchine name.
    searchBrews = async (query) =>
    {
        const client = await this.pool.connect();
        
        try 
        {
            // Ensure structure 

            if (! query || ! new Validator().validate(query, search_schema))
            {
                throw new ValidationError("invalid search request structure", query, search_schema);
            }

            // Create WHERE clause

            let i = 1;
            let conditions = [];
            let params = [];

            for (const condition_block of query.conditions)
            {
                const condition = condition_block.condition;
                const input = condition_block.input;
                
                const fragment = ((condition, i) => 
                {
                    switch (condition)
                    {
                        case "name":    return `"name" LIKE '%' || $${i} || '%'`;
                        case "before":  return `created_on < $${i}`;
                        case "after":   return `created_on > $${i}`;
                    }
                    throw Error(`invalid condition ${condition}`);
                })(condition, i);

                const param = ((condition, input) => 
                {
                    switch (condition)
                    {
                        case "name":    return input.replaceAll(" ", "_");
                        case "before":  return moment(input).format("YYYY-MM-DD H:mm:ss.SSSZZ");
                        case "after":   return moment(input).format("YYYY-MM-DD H:mm:ss.SSSZZ");
                    }
                    throw Error(`invalid condition ${condition}`);
                })(condition, input);

                conditions.push(fragment);
                params.push(param);
                i += 1;
            }

            // Create ORDER BY clause

            let orderings = [];

            for (const ordering_block of query.order)
            {
                const by = ordering_block.order_by;
                const direction = ordering_block.ascending;

                const validate_by = ((by) => 
                {
                    switch (by)
                    {
                        case "name": return `"name"`;
                        case "date": return `created_on`;
                    }
                    throw Error(`invalid ordering ${by}`);
                })(by);

                orderings.push(`${validate_by} ${direction ? "ASC" : "DESC"}`);
            }

            // Create limits

            const count = query.limit.count_per_page;
            const pages = query.limit.page_number;
            const offset = (pages - 1) * count;

            // Create statement

            const where = `WHERE ${conditions.join(" AND ")}`;
            const order = orderings.length > 0 ? `ORDER BY ${orderings.join(" ")}` : ``;
            const limit = `LIMIT ${offset}, ${count}`;
            const statement = `SELECT * FROM ${this.brews} ${where} ${order} ${limit}`;

            console.log(`executing ${statement} with params ${params}`);

            // Map response so each brew also contains its available PDFs

            const response = await client.query(statement, params);
            return await Promise.all(response.rows.map(async (v, i, a) =>
            {
                v['available'] = await this.getAvailableDownloads(v.script_id);
                return v;
            }, this));
        }
        catch (err)
        {
            throw Error(`pg: could not search homebrews: ${err}`);
        }
        finally 
        {
            client.release();
        }
    };

    // Ensures a brew exists; if not, throws an error
    validateBrew = async (script_id) =>
    {
        this.getBrew(script_id);
    };

    // Saves a download link for this brew
    createDownload = async (script_id, pdf_type, s3_url) => 
    {
        const client = await this.pool.connect();

        try 
        {
            await this.validateBrew(script_id);

            try 
            {
                const statement = `INSERT INTO ${this.downloads}(id, pdf_type, s3_url) VALUES ($1, $2, $3)`;
                const params = [script_id, pdf_type, s3_url];

                await client.query("BEGIN");
                await client.query(statement, params);
                await client.query("COMMIT");
            }
            catch (err)
            {
                await client.query("ROLLBACK");
                throw err;
            }
        }
        catch (err)
        {
            throw Error(`pg: failed to create download ${script_id}/${pdf_type}: ${err}`);
        }
        finally
        {
            client.release();
        }
    };

    // Gets the available PDF types for this brew
    getAvailableDownloads = async (script_id) =>
    {
        const client = await this.pool.connect();

        try 
        {
            await this.validateBrew(script_id);

            const statement = `SELECT pdf_type FROM ${this.downloads} WHERE id = $1`;
            const params = [script_id];

            const response = await client.query(statement, params);
            return response.rows.map((v, i, a) => { return v.pdf_type; });
        }
        catch (err)
        {
            throw Error(`pg: failed to get available downloads for ${script_id}: ${err}`);
        }
        finally 
        {
            client.release();
        }
    };

    // Gets a link to a PDF
    getDownload = async (script_id, pdf_type) => 
    {
        const client = await this.pool.connect();

        try 
        {
            await this.validateBrew(script_id);
            await this.validateDownload(script_id, pdf_type);

            const statement = `SELECT s3_url FROM ${this.downloads} WHERE id = $1 AND pdf_type = $2`;
            const params = [script_id, pdf_type];

            const response = await client.query(statement, params);
            return response.rows[0].s3_url;
        }
        catch (err)
        {
            throw Error(`pg: failed to get download ${script_id}/${pdf_type}: ${err}`);
        }
        finally
        {
            client.release();
        }
    };

    // Ensures the brew exists, and that the pdf type is valid for the brew
    validateDownload = async (script_id, pdf_type) =>
    {
        const types = await this.getAvailableDownloads(script_id);
        if (! types.includes(pdf_type))
        {
            throw Error(`no url for object ${pdf_type}`);
        }
    };

    // Saves a page link for this brew
    createPage = async (script_id, page_number, s3_url) => 
    {
        const client = await this.pool.connect();

        try 
        {
            await this.validatePageNumber(script_id, page_number);

            try 
            {
                const statement = `INSERT INTO ${this.pages}(id, page_num, s3_url) VALUES ($1, $2, $3)`;
                const params = [script_id, page_number, s3_url];

                await client.query("BEGIN");
                await client.query(statement, params);
                await client.query("COMMIT");
            }
            catch (err)
            {
                await client.query("ROLLBACK");
                throw err;
            }
        }
        catch(err)
        {
            throw Error(`pg: failed to create page ${script_id}/${page_number}: ${err}`);
        }
        finally
        {
            client.release();
        }
    };

    // Gets the number of pages in this brew
    getNumberOfPages = async (script_id) => 
    {
        const resp = await this.getBrew(script_id);
        return resp.pages;
    };

    // Gets a link to a page
    getPage = async (script_id, page_number) => 
    {
        const client = await this.pool.connect();

        try 
        {
            await this.validatePageNumber(script_id, page_number);

            const statement = `SELECT s3_url FROM ${this.pages} WHERE id = $1 AND page_num = $2`;
            const params = [script_id, page_number];

            const response = await client.query(statement, params);
            return response.rows[0].s3_url;
        }
        catch (err)
        {
            throw Error(`pg: failed to get page ${script_id}/${page_number}: ${err}`);
        }
        finally
        {
            client.release();
        }   
    };

    // Ensures that the brew exists, and that the page number is valid for the brew
    validatePageNumber = async (script_id, page_number) =>
    {
        const num_pages = await this.getNumberOfPages(script_id);
        
        if (page_number < 1 || page_number > num_pages)
        {
            throw RangeError(`${script_id}/${page_number} is out of range`);
        }
    }
}

module.exports = PGClient;