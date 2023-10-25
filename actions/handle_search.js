const PGClient = require("../clients/db");

// Request validation

const { Validator } = require('jsonschema');
const search_schema = require('../schemas/search');

const handle_search = async (req, res, next) =>
{
    try 
    {
        const query = req.body;

        const db = new PGClient();
        const { row_count, rows } = await db.searchBrews(query);
        
        res.status(200).json({
            query: query,
            total_rows: row_count,
            brews: rows
        });
    }
    catch (err)
    {
        res.status(500).send(`could not search brews: ${err}`);
    };
};

module.exports = handle_search;