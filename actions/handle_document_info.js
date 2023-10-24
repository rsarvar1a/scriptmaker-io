const PGClient = require("../clients/db");

const handle_document_info = async (req, res, next) =>
{
    const script_id = req.params.scriptid;
    const document = req.params.document;

    try 
    {
        const pg = new PGClient();
        const document = await pg.getDocument(script_id, document);
        res.status(200).json(document);
    }
    catch (err)
    {
        res.status(404).send(`failed to retrieve document: ${err}`);
    }
};

module.exports = handle_document_info;