# scriptmaker-io

A front-end for my [scriptmaker](https://github.com/rsarvar1a/scriptmaker) utility.


- frontend
    - `scriptmaker.fly.dev/`
        - React, `ejs`
- backend
    - `scriptmaker.fly.dev/api`
        - Node.js, `express`, `webpack`
    - `scriptmaker`
        - Python, `poetry`, `jinja2`, `weasyprint`, `ghostscript`
- deployment
    - Docker, [fly.io](https://fly.io)

# API

If you'd just like to use the server for your own needs, here you go.

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
    "available": ["script", "nightorder", "almanac"]
}
```

***

```http
GET /api/:script_id/available
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

If `pdftype` is available, returns the requested PDF file in the request content.