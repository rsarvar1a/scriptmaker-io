const { Pool } = require("pg");

const pool = new Pool({ 
    connectionString: process.env.DATABASE_URL
});

class PGClient
{
    constructor()
    {
        this.pool = pool;
    }

    // Creates a brew in the brews table
    createBrew = async (script_id, script_name, num_pages) => 
    {
        const client = await this.pool.connect();

        try 
        {
            const statement = "INSERT INTO public.brews(id, script_name, num_pages) VALUES ($1, $2, $3)";
            const params = [script_id, script_name, num_pages];

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
            const statement = "DELETE FROM public.brews WHERE id = $1";
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
            const statement = "SELECT * FROM public.brews WHERE id = $1";
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
                const statement = "INSERT INTO public.downloads(id, pdf_type, s3_url) VALUES ($1, $2, $3)";
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

            const statement = "SELECT pdf_type FROM public.downloads WHERE id = $1";
            const params = [script_id];

            const response = await client.query(statement, query);
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
            await this.validateDownload(script_id. pdf_type);

            const statement = "SELECT s3_url FROM public.downloads WHERE id = $1 AND pdf_type = $2";
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
                const statement = "INSERT INTO public.pages(id, page_number, s3_url) VALUES ($1, $2, $3)";
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
        return resp.num_pages;
    };

    // Gets a link to a page
    getPage = async (script_id, page_number) => 
    {
        const client = await this.pool.connect();

        try 
        {
            await this.validatePageNumber(script_id, page_number);

            const statement = "SELECT s3_url FROM public.pages WHERE id = $1 AND page_number = $2";
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