const fs = require('fs');
const path = require('path');

const handle_available = async (req, res, next) =>
{
    try 
    {
        fs.readFile(path.join(__dirname, "../homebrews", "homebrew.source"), (err, data) =>
        {
            if (err) throw err;

            const source_json = JSON.parse(data);
            const available = source_json.available;

            res.status(200).json({
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