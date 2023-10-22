const fs = require('fs');
const path = require('path');

const handle_available = async (req, res, next) =>
{
    try 
    {
        const script_id = req.params.scriptid;

        fs.readFile(path.join(__dirname, "../homebrews", script_id, "homebrew-source.json"), (err, data) =>
        {
            if (err) throw err;

            const source_json = JSON.parse(data);
            const available = source_json.available;

            res.status(200).json({
                id: script_id,
                available: available
            });
        });
    }
    catch (err)
    {
        res.status(404).send("no such script");
    }
};

module.exports = handle_available;