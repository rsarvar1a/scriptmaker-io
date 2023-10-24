const script_schema =
{
    "id": "/ScriptSchema",
    "type": "array",

    "items":
    {
        "type": "object",
        "properties": 
        {
            "id": 
            {
                "type": "string",
                "required": true
            }
        }
    }
};

module.exports = script_schema;