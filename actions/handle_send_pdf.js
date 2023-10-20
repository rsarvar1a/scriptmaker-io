const fs = require('fs');
const path = require("path");

const handle_send_pdf = async (req, res, next) => 
{
    const params = req.params;
    const scriptid = params.scriptid;
    const pdftype = params.pdftype;

    const working_dir = path.join(__dirname, '../homebrews', scriptid);

    try
    {
        fs.readFile(path.join(working_dir, "homebrew.source"), (err, data) =>
        {
            if (err) throw err;

            const source = JSON.parse(data);
            const name = source.naming_prefix;
            const attachment_name = `${name}-${pdftype}.pdf`;
            const target = path.join(working_dir, attachment_name);

            fs.readFile(target, (err, data) =>
            {
                if (err) throw err;

                res.status(200).sendFile(attachment_name, { root: working_dir }, (err) => 
                {
                    if (err) next(err);
                });
            });
        });
    }
    catch (err)
    {
        res.status(404).send(`could not find ${scriptid}/${pdftype}: ${err}`);
    }
};

module.exports = handle_send_pdf;