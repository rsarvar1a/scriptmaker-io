const PGClient = require("../clients/db");

const handle_all_documents = async (req, res, next) =>
{
    const script_id = req.params.scriptid;

    try 
    {
        const pg = new PGClient();
        const available = await pg.getDocuments(script_id);

        res.status(200).json({ 
            id: script_id,
            documents: available
        });
    }
    catch (err)
    {
        res.status(404).send(`failed to retrieve available document types: ${err}`);
    }
};

module.exports = handle_all_documents;