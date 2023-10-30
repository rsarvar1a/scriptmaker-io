const PGClient = require("../clients/db");

const handle_document_info = async (req, res, next) =>
{
    const script_id = req.params.scriptid;
    const document = req.params.document;

    try 
    {
        const pg = new PGClient();
        const document_info = await pg.getDocument(script_id, document);
        res.status(200).json(document_info);
    }
    catch (err)
    {
        next(err);
    }
};

module.exports = handle_document_info;