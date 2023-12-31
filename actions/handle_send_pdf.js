const PGClient = require("../clients/db");

const handle_send_pdf = async (req, res, next) => 
{
    const script_id = req.params.scriptid;
    const document = req.params.document;

    try
    {
        const pg = new PGClient();
        const document = await pg.getDocument(script_id, document);
        res.redirect(document.url);
    }
    catch (err)
    {
        res.status(404).send(`could not find ${script_id}-${document}.png: ${err}`);
    }
};

module.exports = handle_send_pdf;