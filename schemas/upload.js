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
                "make":
                {
                    "type": "array",
                    "required": true,
                    "items":
                    {
                        "type": "string"
                    }
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