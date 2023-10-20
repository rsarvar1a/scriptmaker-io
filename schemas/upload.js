const upload_schema = 
{  
    "id": "/UploadSchema",
    "type": "object",
    "properties":
    {
        "source": 
        {
            "type": "object",
            "required": true,
            "properties": 
            {
                "edition": 
                {
                    "type": "string",
                    "required": true
                },
                "url": 
                {
                    "type": "string",
                    "required": true
                },
                "simple": 
                {
                    "type": "boolean", 
                    "required": false
                }
            }
        },

        "script":
        {
            "$ref": "/ScriptSchema",
            "required": false
        },

        "nightorder":
        {
            "$ref": "/NightorderSchema",
            "required": false
        }
    }
};

module.exports = upload_schema;