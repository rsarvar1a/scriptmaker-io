const PGClient = require("../clients/db");

const handle_script_info = async (req, res, next) =>
{
    const script_id = req.params.scriptid;

    try
    {
        const pg = new PGClient();
        const homebrew = await pg.getBrew(script_id);
        res.status(200).json(homebrew);
    }
    catch (err)
    {
        res.status(400).send(`failed to retrieve brew ${script_id}: ${err}`);
    }
};

module.exports = handle_script_info;