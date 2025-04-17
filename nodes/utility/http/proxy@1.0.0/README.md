# Configuration Options
The Proxy Node requires the following configuration options in the ctx.config object:

## Node properties

### Required properties

- `url` (string): The target URL where the proxy will forward the request. (Required)
- `path` (string): The path that needs to match to forward the request. This options allows the `*` wildcard (e.g: `/api/v1/rest/collections/*`) (Required)

### Optional properties

- `pathRewrite` (string): Custom path to be appended to the target URL. Default is the original request path.
- `options` (object): An object containing path and query manipulations:
    - `remove` (string[]): Array of path segments to remove.
    - `replace` ({ [key: string]: string }): Object with path segments to replace and their corresponding replacements.
    - `appendPath` (string): A path segment to append at the end of the path.
    - `prependPath` (string): A path segment to prepend at the beginning of the path.
    - `query` ({ [key: string]: string | number | boolean }): Object with query string parameters and their values.
    - `add` (boolean): A flag that allows duplicate query parameters to be added. Default is false.

## Usage/Examples
### Step Configuration

```json
{
    "name": "proxy",
    "node": "proxy@1.0.0",
    "type": "local"
}
```

### Node Configuration

```json
"proxy": {
    "inputs": {
        "properties": {
            "targetUrl": "https://bp-firestore-stack.api-dev.deskree.com",
            "pathRewrite": "/api/v1/rest/collections/users/${7}",
            "options": {
                "remove": [
                    "api",
                    "v1"
                ],
                "replace": {
                    "users": "accounts",
                    "profile": "info"
                },
                "query": {
                    "filter": "all",
                    "newParam": "value"
                },
                "appendPath": "details",
                "prependPath": "prefix",
                "add": true
            }
        }
    }
}
```

