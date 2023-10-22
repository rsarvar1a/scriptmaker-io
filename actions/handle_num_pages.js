const fs = require('fs');
const path = require('path');

const handle_num_pages = async (req, res, next) =>
{
    try 
    {
        const script_id = req.params.scriptid;

        fs.readFile(path.join(__dirname, "../homebrews", script_id, "homebrew-source.json"), (err, data) =>
        {
            if (err) throw err;

            const source_json = JSON.parse(data);
            const num_pages = source_json.pages;

            res.status(200).json({
                id: script_id,
                pages: num_pages
            });
        });
    }
    catch (err)
    {
        res.status(404).send("no such script");
    }
};

module.exports = handle_num_pages;