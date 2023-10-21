const fetch = require('node-fetch');
const fs = require('fs');
const moment = require('moment');
const path = require("path");
const { spawnSync } = require("child_process");

// Request validation

const { Validator } = require('jsonschema');
const nightorder_schema = require('../schemas/nightorder')
const script_schema = require("../schemas/script")
const upload_schema = require('../schemas/upload')

const handle_new_brew = async (req, res, next) => 
{
    // Ensure the request body is a well-formed homebrew

    const homebrew = req.body;

    const validator = new Validator();
    validator.addSchema(script_schema, script_schema['id']);
    validator.addSchema(nightorder_schema, nightorder_schema['id']);

    if (! homebrew || ! validator.validate(homebrew, upload_schema))
    {
        res.status(400).send('bad request body');
        return;
    }

    // Figure out where we're getting our script from, and validate everything

    const source = homebrew.source;
    const edition = source.edition;
    const url = source.url;

    const nightorder = source.nightorder;
    const script = source.script;
    const simple = source.simple;
    const script_content = {};

    const make_script = source.make.includes('script');
    const make_almanac = source.make.includes('almanac');

    if (script)
    {
        // Validate the script we found in the body

        if (! validator.validate(script, script_schema))
        {
            res.status(400).send('provided script has invalid structure');
            return;
        }

        script_content = script;
    }
    else
    {
        // Get the script from bloodstar (or wherever, really)

        try
        {
            const resp = await fetch(url);
            script_content = await resp.json();
        }
        catch (err)
        {
            res.status(400).send('could not find script at url');
            return;
        }
    }

    if (nightorder)
    {
        if (! validator.validate(nightorder, nightorder_schema))
        {
            res.status(400).send('provided nightorder has invalid structure');
            return;
        }
    }
    
    // Determine a script name to steal as a filename, if possible.

    const script_name = "homebrew";

    for (const entry of script_content)
    {
        if ("_meta" in entry && "name" in entry._meta)
        {
            script_name = entry._meta.name;
            break;
        }
    }

    // Create a working directory and save the script, the source, and the nightorder if applicable    

    const nightorder_path = "homebrew.nightorder";
    const script_path = `${script_name}.script`;
    const source_path = "homebrew.source";

    const working_dir = "";
    const script_id = "";

    const available_pdfs = [];
    
    if (make_script)
    {
        available_pdfs.push('script', 'nightorder');
    }

    if (make_almanac)
    {
        available_pdfs.push('almanac');
    }

    try
    {
        fs.mkdtemp(path.join(__dirname, "../homebrews/", `brew-${edition}-`), (err, directory) =>
        {
            if (err)
            {
                res.status(500).send('internal error: failed to make brew directory');
                throw err;
            }

            working_dir = directory;
            script_id = path.basename(directory);

            const source_json = 
            {
                "edition": edition,
                "url": script_path,
                "naming_prefix": script_name,
                "available": available_pdfs
            };

            fs.writeFile(path.join(working_dir, source_path), JSON.stringify(source_json), (err) =>
            {
                res.status(500).send('internal error: failed to save source');
                fs.rmdirSync(directory, { recursive: true });
                throw err;
            });

            fs.writeFile(path.join(working_dir, script_path), JSON.stringify(script_content), (err) =>
            {
                res.status(500).send('internal error: failed to save script');
                fs.rmdirSync(directory, { recursive: true });
                throw err;
            });

            if (nightorder)
            {
                fs.writeFile(path.join(working_dir, nightorder_path), JSON.stringify(nightorder), (err) =>
                {
                    res.status(500).send('internal error: failed to save nightorder');
                    fs.rmdirSync(directory, { recursive: true });
                    throw err;
                })
            }
        });
    }
    catch (err)
    {
        return;
    }

    // Extract / scrape / parse homebrew with scriptmaker

    const scriptmaker_pwd = path.join(__dirname, "../scriptmaker");

    const resp_homebrew = spawnSync("bin/homebrew", [working_dir], { cwd: scriptmaker_pwd });

    if (resp_homebrew.error)
    {
        res.status(400).send(`failed to homebrew: ${resp_homebrew.stderr.toString()}`);
        fs.rmdirSync(working_dir, { recursive: true });
        return;
    }

    // Make PDFs with scriptmaker, honouring options

    const make_pdf_args = [script_path, "--homebrew_directory", working_dir];
    
    if (nightorder)
    {
        make_pdf_args.push("--nightorder", nightorder_path);
    }
    if (simple)
    {
        make_pdf_args.push("--simple");
    }

    if (make_script)
    {
        const resp_makepdf = spawnSync("bin/make-pdf", make_pdf_args, { cwd: scriptmaker_pwd });

        if (resp_makepdf.error)
        {
            res.status(400).send(`failed to make pdfs: ${resp_makepdf.stderr.toString()}`);
            fs.rmdirSync(working_dir, { recursive: true });
            return;
        }
    }

    if (make_almanac)
    {
        const resp_almanac = spawnSync("bin/almanac", [working_dir], { cwd: scriptmaker_pwd });

        if (resp_almanac.error)
        {
            res.status(400).send(`failed to make almanac: ${resp_almanac.stderr.toString()}`);
            fs.rmdirSync(working_dir, { recursive: true });
            return;
        }
    }

    // Send the rendering ID and PDF links to the client

    res.status(200).json({ 
        id: script_id,
        available: available_pdfs
     });
};

module.exports = handle_new_brew;