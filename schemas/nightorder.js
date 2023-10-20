const nightorder_schema = 
{
    "id": "/NightorderSchema",
    "type": "object",
    "properties":
    {
        "first":
        {
            "type": "array",
            "required": true,
            "items":
            {
                "type": "string"
            }
        },

        "other":
        {
            "type": "array",
            "required": true,
            "items":
            {
                "type": "string"
            }
        }
    }
};

module.exports = nightorder_schema;