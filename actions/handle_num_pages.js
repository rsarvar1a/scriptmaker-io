const PGClient = require("../clients/db");

const handle_num_pages = async (req, res, next) =>
{
    const script_id = req.params.scriptid;
    const document = req.params.document;

    try 
    {
        const pg = new PGClient();
        const num_pages = await pg.getNumberOfPages(script_id, document);
        
        res.status(200).json({
            id: script_id,
            document: document,
            pages: num_pages
        });
    }
    catch (err)
    {
        res.status(400).send(`failed to retrieve number of pages: ${err}`);
    }
};

module.exports = handle_num_pages;