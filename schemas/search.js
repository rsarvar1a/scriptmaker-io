const search_schema = 
{
    "id": "/SearchSchema",
    "type": "object",
    "properties": 
    {
        "conditions":
        {
            "type": "array",
            "required": true,
            "items":
            {
                "type": "object",
                "properties": 
                {
                    "condition":
                    {
                        "type": "string",
                        "required": true
                    },
                    "input":
                    {
                        "type": "string",
                        "required": true
                    }
                }
            }
        },

        "order": 
        {
            "type": "array",
            "required": false,
            "items": 
            {
                "type": "object",
                "properties": 
                {
                    "order_by": 
                    {
                        "type": "string",
                        "required": true
                    },
                    "ascending": 
                    {
                        "type": "boolean",
                        "required": true
                    }
                }
            }
        },

        "limit":
        {
            "type": "object",
            "required": true,
            "properties": 
            {
                "count_per_page":
                {
                    "type": "number",
                    "minimum": "1",
                    "required": true
                },
                "page_number":
                {
                    "type": "number",
                    "minimum": "1",
                    "required": true
                }
            }
        }
    }
}