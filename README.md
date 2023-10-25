# scriptmaker-io

A front-end for my [scriptmaker](https://github.com/rsarvar1a/scriptmaker) utility.

## current stack

- frontend
    - `scriptmaker.fly.dev/`
        - React, Tailwind CSS
- backend
    - `scriptmaker.fly.dev/api`
        - Node.js, express.js, ejs, webpack, Postgres, Amazon S3
    - `scriptmaker`
        - Python, poetry, jinja2, weasyprint, ghostscript
- deployment
    - Docker, fly.io

## planned improvements

- frontend
    - actually have a frontend

# API

## Example

You can find some (really basic) examples [here.](https://github.com/rsarvar1a/scriptmaker-examples)

## API reference

***

```http
POST /api/brew
```

Every request body contains a source object. The `make` array contains the requests; `script` builds a script and nightorder, while `almanac` builds the almanac.

```json
{
    "source": {
        "edition": "a-tag-for-your-homebrew",
        "url": "https://www.bloodstar.xyz/link-to-script.json",
        "make": ["almanac", "script"]
    }
}
```

If you would like a single-page nightorder without reminder text, add a `simple` property:

```json
{
    "source": {
        ...,
        "simple": true
    }
}
```

If you would rather upload the script yourself, include it in the request body. For more info on the character schema, see [the official one.](https://github.com/ThePandemoniumInstitute/botc-release)

```json
{
    "source": {
        ...,
        "url": "",
        ...,
    },

    "script": [
        {
            "id": "_meta",
            "name": "My Amazing Homebrew Script"
        },
        {
            "id": "homebrew_character_id",
            "name": "Amazing Homebrew Character",
            "team": "townsfolk, outsider, minion, demon, fabled or traveler",
            "image": "https://link-to-character-icon.png",
            "ability": "You have ability text. [+1 setup condition]"
        },
        {
            "id": "official_character_id"
        },
        ...,
    ]
}
```

If your script characters do not contain `firstNight` and `otherNight` attributes, the generated
nightorder will probably not be very useful. In that case, you can also include a custom one:

```json
{
    "source": {
        ...,
    },

    "nightorder": {
        "first": ["list", "of", "character", "ids"],
        "other": ["list", "of", "character", "ids"]
    }
}
```

The nightorder supports four special ids. These are `DUSK`, `DAWN`, `DEMON` (info) and `MINION` (info).

Returns the script id and properties:
```json
{
    "id": "brew-your-edition-name-abc123",
    "name": "My Amazing Homebrew Script",
    "created_on": "timestamp",
}
```

***

```http
POST /api/search
```

The request must contain a non-empty array of conditions, and an array of orderings (the orderings array might be empty):
```json
{
    "conditions":
    [
        {
            "condition": "name" or "before" or "after",
            "input": "script_name" or "date"
        },
        ...,
    ],

    "order":
    [
        {
            "order_by": "name" or "date",
            "ascending": true or false
        },
        ...,
    ],

    "limit":
    {
        "count_per_page": 25,
        "page_number": 2
    }
}
```

Returns a list of brews matching the input query, as well as a total matching row count:
```json
{
    "query": ...,
    "total_count": 5000,
    "brews": 
    [
        {
            "id": "brew-your-edition-name-abc123",
            "name": "My Amazing Homebrew Script",
            "created_on": "timestamp"
        },
        ...,
    ]
}
```

***

```http
GET /api/:script_id
```

If `script_id` is a valid script id, returns the script id, name, and creation date:
```json
{
    "id": "brew-your-edition-name-abc123",
    "name": "My Amazing Homebrew Script",
    "created_on": "timestamp",
}
```

***

```http
GET /api/:script_id/documents
```

If `script_id` is a valid script id, returns the script id and a list of available documents:
```json
{
    "id": "brew-your-edition-name-abc123",
    "available": ["script", "nightorder", "almanac"]
}
```

***

```http
GET /api/:script_id/documents/:document
```

`document` should be one of `script`, `nightorder`, or `almanac`.

If `script_id` is a valid script id, and `document` is available, returns information about that document:

```json
{
    "id": "brew-your-edition-name-abc123",
    "document": "script",
    "url": "s3.amazonaws.com/scriptmaker.fly.dev/script-url.pdf",
    "pages": 2
}
```

***

```http
GET /api/:script_id/documents/:document/download
```

If `script_id` is a valid script id, and `document` is available, redirects to S3.

***

```http
GET /api/:script_id/documents/:document/pages
```

If `script_id` is a valid script id, and `document` is available, returns the page count:
```json
{
    "id": "brew-your-edition-name-abc123",
    "document": "script",
    "pages": 2
}
```

***

```http
GET /api/:script_id/documents/:document/pages/all
```

If `script_id` is a valid script id, and `document` is available, returns all available pages:
```json
{
    "id": "brew-your-edition-name-abc123",
    "document": "script",
    "pages": 
    [
        {
            "page": 1,
            "url": "path-to-page.png"
        },
        ...,
    ]
}
```

***

```http
GET /api/:script_id/documents/:document/pages/:page
```

If `script_id` is a valid script id, `document` is available, and `page` is in range, redirects to S3.

***

```http
GET /api/:script_id/logo
```

If `script_id` is a valid script id, redirects to the logo on S3.

***

```http
GET /api/:script_id/script
```

If `script_id` is a valid script id, redirects to the script JSON on S3.