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

## Example

Here's an example of a script that creates a brew and downloads some requested PDFs.

```python
import argparse
import os
import requests


parser = argparse.ArgumentParser()
parser.add_argument('--url', required=True)
parser.add_argument('--edition', required=True)
args = parser.parse_args()

# If you could use domain_dev, you could just use scriptmaker directly instead...
domain_dev = "http://localhost:3000" 
domain_prd = "https://scriptmaker.fly.dev"
domain = domain_prd

#
# Upload a brew
#

response = requests.post(f"{domain}/api/brew", json = {
    "source": {
        "url": args.url,
        "edition": args.edition,
        "make": ['script']
    }
})

if not response.ok:
    # Might be a good time to open a GitHub issue
    print(response.status_code, response.content.decode())
    exit(1)

script_id = response.json()['id']
available = response.json()['available']

#
# Save all available PDFs
#

if not os.path.exists("output"):
    os.mkdir("output")

save_dir = f"output/{script_id}"
if not os.path.exists(save_dir):
    os.mkdir(save_dir)

for pdf_type in available:
    response_pdf = requests.get(f"{domain}/api/{script_id}/download/{pdf_type}")
    if response_pdf.ok:
        with open(f"{save_dir}/{pdf_type}.pdf", "wb") as file:
            file.write(response_pdf.content)
    else:
        # Significantly likely to be a good time to open a GitHub issue
        print(response_pdf.status_code, response_pdf.content.decode())
```

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