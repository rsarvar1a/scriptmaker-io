const PGClient = require("../clients/db");

const handle_send_page = async (req, res, next) => 
{
    const script_id = req.params.scriptid;
    const document = req.params.document;
    const page_num = req.params.page;

    try
    {
        const num = parseInt(page_num);
        const pg = new PGClient();
        const page = await pg.getPage(script_id, document, num);
        res.redirect(page);
    }
    catch (err)
    {
        res.status(404).send(`could not find ${script_id}-${document}-${page_num}.png: ${err}`);
    }
};

module.exports = handle_send_page;