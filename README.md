# scriptmaker-io

A front-end for my [scriptmaker](https://github.com/rsarvar1a/scriptmaker) utility.

## current stack

- frontend
    - `scriptmaker.fly.dev/`
        - React, ejs
- backend
    - `scriptmaker.fly.dev/api`
        - Node.js, express.js, webpack, Postgres, Amazon S3
    - `scriptmaker`
        - Python, poetry, jinja2, weasyprint, ghostscript
- deployment
    - Docker, fly.io

## planned improvements

- frontend
    - actually have a frontend

# API

## Example

Coming soon...

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

Returns the script id and a list of available `pdftype`s:
```json
{
    "id": "brew-your-edition-name-abc123",
    "name": "My Amazing Homebrew Script",
    "created_on": "timestamp",
    "available": ["script", "nightorder", "almanac"],
    "pages": 4
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

Returns a list of brews matching the input query:
```json
{
    "query": ...,
    "brews": 
    [
        {
            "id": "brew-your-edition-name-abc123",
            "name": "My Amazing Homebrew Script",
            "created_on": "timestamp",
            "available": ["script", "nightorder", "almanac"],
            "pages": 4
        },
        ...,
    ]
}
```

***

```http
GET /api/:script_id
```

If `script_id` is a valid script id, returns the script id, name, and page count:
```json
{
    "id": "brew-your-edition-name-abc123",
    "name": "My Amazing Homebrew Script",
    "created_on": "timestamp",
    "available": ["script", "nightorder", "almanac"],
    "pages": 4
}
```

***

```http
GET /api/:script_id/download
```

If `script_id` is a valid script id, returns the script id and a list of available `pdftype`s:
```json
{
    "id": "brew-your-edition-name-abc123",
    "available": ["script", "nightorder", "almanac"]
}
```

***

```http
GET /api/:script_id/download/:pdftype
```

`pdftype` should be one of `script`, `nightorder`, or `almanac`.

If `script_id` is a valid script id, and `pdftype` is available, redirects to the file on S3.

***

```http
GET /api/:script_id/pages
```

If `script_id` is a valid script id, returns the script id and the number of available PNGs:
```json
{
    "id": "brew-your-edition-name-abc123",
    "pages": 4,
}
```

***

```http
GET /api/:script_id/pages/:page_number
```

If `script_id` is a valid script id, and `page_number` is in range, redirects to the file on S3.