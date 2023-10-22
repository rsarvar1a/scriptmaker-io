const PGClient = require("../clients/db");

const handle_send_pdf = async (req, res, next) => 
{
    const script_id = req.params.scriptid;
    const pdf_type = req.params.pdftype;

    try
    {
        const pg = new PGClient();
        const url = await pg.getDownload(script_id, pdf_type);
        res.redirect(url);
    }
    catch (err)
    {
        res.status(404).send(`could not find ${script_id}-${pdf_type}.png: ${err}`);
    }
};

module.exports = handle_send_pdf;