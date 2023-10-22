const fs = require('fs');
const path = require("path");

const handle_send_page = async (req, res, next) => 
{
    const params = req.params;
    const scriptid = params.scriptid;
    const pagenum = params.pagenum;

    const working_dir = path.join(__dirname, '../homebrews', scriptid);

    try
    {
        fs.readFile(path.join(working_dir, "homebrew-source.json"), (err, data) =>
        {
            if (err) throw err;

            const source = JSON.parse(data);
            const name = source.naming_prefix;
            const attachment_name = `${name}-${pagenum}.png`;
            const target = path.join(working_dir, "pages", attachment_name);
            const num_pages = source.pages;

            try
            {
                const num = parseInt(pagenum);
            }
            catch (err)
            {
                throw TypeError("page number must be an int");
            }

            if (num < 1 || num > num_pages)
            {
                throw RangeError("page number out of range");
            }

            fs.readFile(target, (err, data) =>
            {
                if (err) throw err;
                res.status(200).sendFile(attachment_name, { root: working_dir }, (err) => 
                {
                    if (err)
                    {
                        res.status(500).send(`internal error: ${err}`);
                        throw err;
                    }
                });
            });
        });
    }
    catch (err)
    {
        res.status(404).send(`could not find ${scriptid}-${pagenum}.png: ${err}`);
    }
};

module.exports = handle_send_page;