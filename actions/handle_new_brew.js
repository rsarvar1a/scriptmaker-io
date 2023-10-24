const fetch = require('node-fetch');
const fs = require('fs');
const moment = require('moment');
const path = require("path");
const { spawnSync } = require("child_process");

// Clients

const AWSClient = require("../clients/aws");
const PGClient = require("../clients/db");

// Request validation

const { Validator } = require('jsonschema');
const nightorder_schema = require('../schemas/nightorder')
const script_schema = require("../schemas/script")
const upload_schema = require('../schemas/upload')

const handle_new_brew = async (req, res, next) => 
{
    var working_dir = "";
    var script_id = "";
    var script_name = "homebrew";
    var available_pdfs = [];
    var num_pages = 0;
    var creation_time = moment();

    try 
    {
        // Ensure the request body is a well-formed homebrew

        const homebrew = req.body;

        const validator = new Validator();
        validator.addSchema(script_schema, script_schema['id']);
        validator.addSchema(nightorder_schema, nightorder_schema['id']);

        if (! homebrew || ! validator.validate(homebrew, upload_schema))
        {
            throw Error(`invalid request body`);
        }

        // Figure out where we're getting our script from, and validate everything

        const source = homebrew.source;
        const edition = source.edition;
        const url = source.url;

        const nightorder = source.nightorder;
        const script = source.script;
        const simple = source.simple;
        var script_content = {};

        const make_script = source.make.includes('script');
        const make_almanac = source.make.includes('almanac');

        if (script)
        {
            // Validate the script we found in the body

            if (! validator.validate(script, script_schema))
            {
                throw Error(`provided script has invalid structure`);
            }

            script_content = script;
        }
        else
        {
            // Get the script from bloodstar (or wherever, really)

            try
            {
                const resp = await fetch(url);
                script_content = JSON.parse(await resp.text());
            }
            catch (err)
            {
                throw Error(`could not retrieve script from URL: ${err}`);
            }
        }

        if (nightorder)
        {
            if (! validator.validate(nightorder, nightorder_schema))
            {
                throw Error(`provided nightorder has invalid structure`);
            }
        }
        
        // Determine a script name to steal as a filename, if possible.

        for (const entry of script_content)
        {
            if (entry.id == "_meta" && "name" in entry)
            {
                script_name = entry.name.replaceAll(" ", "_");
                break;
            }
        }

        const nightorder_path = "nightorder.json";
        const script_path = `${script_name}.json`;
        const source_path = "homebrew-source.json";
        
        if (make_script)
        {
            available_pdfs.push('script', 'nightorder');
        }

        if (make_almanac)
        {
            available_pdfs.push('almanac');
        }

        // Create a working directory and save the script, the source, and the nightorder if applicable  

        const directory = fs.mkdtempSync(path.join(__dirname, "../homebrews/", `brew-${edition}-`));

        working_dir = directory;
        script_id = path.basename(directory);

        const source_json = 
        {
            "edition": edition,
            "url": path.join(working_dir, script_path),
            "naming_prefix": script_name,
            "available": available_pdfs
        };

        fs.writeFileSync(path.join(working_dir, source_path), JSON.stringify(source_json));
        fs.writeFileSync(path.join(working_dir, script_path), JSON.stringify(script_content));
        if (nightorder)
        {
            fs.writeFileSync(path.join(working_dir, nightorder_path), JSON.stringify(nightorder));
        }

        console.log(`created ${working_dir}`);

        // Extract / scrape / parse homebrew with scriptmaker

        const scriptmaker_pwd = path.join(__dirname, "../scriptmaker");

        console.log(`bin/homebrew ${working_dir}`);
        const resp_homebrew = spawnSync("bin/homebrew", [working_dir], { cwd: scriptmaker_pwd, shell: true });

        if (resp_homebrew.error)
        {
            throw resp_homebrew.error;
        }

        // Make PDFs with scriptmaker, honouring options

        const make_pdf_args = [path.join(working_dir, script_path)];
        
        if (nightorder)
        {
            make_pdf_args.push("--nightorder", path.join(working_dir, nightorder_path));
        }
        if (simple)
        {
            make_pdf_args.push("--simple");
        }

        if (make_script)
        {
            console.log(`bin/make-pdf ${make_pdf_args}`);
            const resp_makepdf = spawnSync("bin/make-pdf", make_pdf_args, { cwd: scriptmaker_pwd, shell: true });

            if (resp_makepdf.error)
            {  
                throw resp_makepdf.error;
            }
        }

        if (make_almanac)
        {
            const almanac_basename = path.join(working_dir, `${script_name}-almanac.pdf`);
            console.log(`bin/almanac ${working_dir} --output ${almanac_basename}`);
            const resp_almanac = spawnSync("bin/almanac", [working_dir, "--output", almanac_basename], { cwd: scriptmaker_pwd, shell: true });

            if (resp_almanac.error)
            {
                throw resp_almanac.error;
            }
        }

        // Compress PDFs to save space (necessary until I migrate to S3) (and after that too, honestly)

        console.log(`bin/compress ${working_dir}`);
        const resp_compress = spawnSync("bin/compress", [working_dir], { cwd: scriptmaker_pwd, shell: true });

        if (resp_compress.error)
        {
            throw resp_compress.error;
        }

        // PNGify documents so the frontend can fetch and display them

        console.log(`bin/pngify ${path.join(working_dir, script_path)}`);
        const resp_pngify = spawnSync("bin/pngify", [path.join(working_dir, script_path)], { cwd: scriptmaker_pwd, shell: true });

        if (resp_pngify.error)
        {
            throw resp_pngify.error;
        }

        // Create the brew.

        creation_time = moment().format("YYYY-MM-DD H:mm:ss.SSSZZ");

        const aws = new AWSClient();
        const pg = new PGClient();

        await aws.createBrew(script_id);
        await pg.createBrew(script_id, script_name, creation_time);

        // Upload the PDFs to S3 and save paths to the database

        const pdf_basenames = {}
        if (make_script)
        {
            pdf_basenames['script'] = `${script_name}-script.pdf`;
            pdf_basenames['nightorder'] = `${script_name}-nightorder.pdf`;
        }
        if (make_almanac)
        {
            pdf_basenames['almanac'] = `${script_name}-almanac.pdf`;
        }

        for (const document in pdf_basenames)
        {
            const pages_path = path.join(working_dir, `pages`, `${document}`);
            const num_pages = fs.readdirSync(pages_path).length;

            const pdf_full_path = path.join(working_dir, pdf_basenames[document]);
            const url = await aws.uploadDownloadable(script_id, pdf_full_path);
            await pg.createDownload(script_id, document, num_pages, url);
        
            // Create the PNGs in S3 and save paths to the database

            for (var i = 1; i <= num_pages; i++)
            {
                const png_basename = `${script_name}-${document}-${i}.png`;
                const png_full_path = path.join(pages_path, png_basename);
                const url = await aws.uploadPage(script_id, png_full_path);
                await pg.createPage(script_id, document, i, url);
            }
        }
    }
    catch (err)
    {
        console.log(err);

        const pg = new PGClient();
        await pg.destroyBrew(script_id);
        res.status(500).send(`failed to brew: ${err}`);
        return;
    }
    finally
    {
        try
        {
            fs.rmSync(working_dir, { recursive: true });
        }
        catch (err)
        {
            console.log(err);
        }
    }

    // Send the script id and info to the client

    console.log(`processed ${script_id}`);
    
    const pg = new PGClient();
    const script_info = await pg.getBrew(script_id);
    res.status(200).json(script_info);
};

module.exports = handle_new_brew;