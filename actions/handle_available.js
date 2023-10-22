const PGClient = require("../clients/db");

const handle_available = async (req, res, next) =>
{
    const script_id = req.params.scriptid;

    try 
    {
        const pg = new PGClient();
        const available = await pg.getAvailableDownloads(script_id);

        req.status(200).json({ 
            id: script_id,
            available: available
        });
    }
    catch (err)
    {
        res.status(404).send(`failed to retrieve available download types: ${err}`);
    }
};

module.exports = handle_available;