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
    var script_content = {};

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
            script_content = JSON.parse(await resp.text());
        }
        catch (err)
        {
            console.log(err);
            res.status(400).send(`internal error: ${err}`);
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

    var script_name = "homebrew";

    for (const entry of script_content)
    {
        if (entry.id == "_meta" && "name" in entry)
        {
            script_name = entry.name.replaceAll(" ", "_");
            break;
        }
    }

    // Create a working directory and save the script, the source, and the nightorder if applicable    

    const nightorder_path = "nightorder.json";
    const script_path = `${script_name}.json`;
    const source_path = "homebrew-source.json";

    var working_dir = "";
    var script_id = "";

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
    }
    catch (err)
    {
        res.status(500).send(`internal error: ${err}`);
        return;
    }

    console.log(`created ${working_dir}`);

    // Extract / scrape / parse homebrew with scriptmaker

    const scriptmaker_pwd = path.join(__dirname, "../scriptmaker");

    console.log(`bin/homebrew ${working_dir}`);
    const resp_homebrew = spawnSync("bin/homebrew", [working_dir], { cwd: scriptmaker_pwd, shell: true });

    if (resp_homebrew.error)
    {
        res.status(400).send(`failed to homebrew: ${resp_homebrew.error.message}`);
        fs.rmSync(working_dir, { recursive: true });
        return;
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
            res.status(400).send(`failed to make pdfs: ${resp_makepdf.error.message}`);
            fs.rmdirSync(working_dir, { recursive: true });
            return;
        }
    }

    if (make_almanac)
    {
        console.log(`bin/almanac ${working_dir}`);
        const resp_almanac = spawnSync("bin/almanac", [working_dir], { cwd: scriptmaker_pwd, shell: true });

        if (resp_almanac.error)
        {
            res.status(400).send(`failed to make almanac: ${resp_almanac.error.message}`);
            fs.rmdirSync(working_dir, { recursive: true });
            return;
        }
    }

    const filepaths = fs.readdirSync(working_dir);
    for (const filepath of filepaths)
    {
        if (! filepath.match("*.pdf")) continue;

        const filename = path.join(working_dir, filepath);
        spawnSync("bin/compress", [filename], { cwd: scriptmaker_pwd, shell: true });
    }

    // Send the rendering ID and PDF links to the client

    res.status(200).json({ 
        id: script_id,
        available: available_pdfs
     });
};

module.exports = handle_new_brew;