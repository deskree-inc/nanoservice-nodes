# Configuration Options
The Remote is a node that allows you to execute remote nodes running in a cluster of micro services.

### Required properties
- `node` (object): Object containing the note information.
- `config` (object): Object containing the configuration required to run the remote node.
- `request` (object): Object containing the request information.

## Usage/Examples

## Step Configuration

```json
{
    "name": "remote",
    "node": "remote@1.0.0",
    "type": "local"
}
```

### Node Configuration

```json
"remote": {
    "node": {
        "name": "add-properties",
        "node": "add-properties@1.0.0"
    },
    "config": {
        "inputs": {
            "properties": {
                "title": "${data.region}/${data.name}"
            }
        }
    },
    "request": {
        "type": "web",
        "url": "http://localhost:3000/remote"
    }
}
```

