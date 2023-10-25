const PGClient = require("../clients/db");

const handle_send_logo = async (req, res, next) =>
{
    const script_id = req.params.scriptid;

    try
    {
        const pg = new PGClient();
        const homebrew = await pg.getBrew(script_id);
        res.redirect(homebrew.logo_url);
    }
    catch (err)
    {
        res.status(400).send(`failed to retrieve logo for ${script_id}: ${err}`);
    }
};

module.exports = handle_send_logo;