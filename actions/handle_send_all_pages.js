const PGClient = require("../clients/db");

const handle_send_all_pages = async (req, res, next) => 
{
    const script_id = req.params.scriptid;
    const document = req.params.document;

    try
    {
        const pg = new PGClient();
        const pages = await pg.getPages(script_id, document);
        res.status(200).json({
            id: script_id,
            document: document,
            pages: pages
        });
    }
    catch (err)
    {
        res.status(404).send(`could not retrieve all pages for ${script_id}-${document}: ${err}`);
    }
};

module.exports = handle_send_all_pages;