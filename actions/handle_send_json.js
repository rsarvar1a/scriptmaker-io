const PGClient = require("../clients/db");

const handle_send_json = async (req, res, next) =>
{
    const script_id = req.params.scriptid;

    try
    {
        const pg = new PGClient();
        const homebrew = await pg.getBrew(script_id);
        res.redirect(homebrew.json_url);
    }
    catch (err)
    {
        res.status(400).send(`failed to retrieve script.json for ${script_id}: ${err}`);
    }
};

module.exports = handle_send_json;