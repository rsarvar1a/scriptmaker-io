const PGClient = require("../clients/db");

const handle_send_page = async (req, res, next) => 
{
    const script_id = req.params.scriptid;
    const page_num = req.params.pagenum;

    try
    {
        const num = parseInt(page_num);
        const pg = new PGClient();
        const url = await pg.getPage(script_id, num);
        res.redirect(url);
    }
    catch (err)
    {
        res.status(404).send(`could not find ${script_id}-${page_num}.png: ${err}`);
    }
};

module.exports = handle_send_page;