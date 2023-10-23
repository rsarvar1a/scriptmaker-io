const PGClient = require("../clients/db");

const handle_search = async (req, res, next) =>
{
    try 
    {
        if (! 'script_name' in req.body)
        {
            throw Error("missing search parameter script_name");
        }

        const script_name = req.body.script_name.replaceAll(" ", "_");
        const db = new PGClient();
        const rows = await db.searchBrews(script_name);
        
        res.status(200).json({
            query: script_name,
            brews: rows
        });
    }
    catch (err)
    {
        res.status(500).send(`could not search brews: ${err}`);
    };
};

module.exports = handle_search;