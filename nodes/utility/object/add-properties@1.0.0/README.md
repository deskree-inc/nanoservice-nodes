# Configuration Options
The AddProperties is a node that allows you to add more property to the incoming object

### Required properties
- `properties` (object): Object containing the new properties to be added.

## Usage/Examples

### Step Configuration

```json
{
    "name": "add-properties",
    "node": "add-properties@1.0.0",
    "type": "local"
}
```

### Node Configuration

```json
"add-properties": {
    "inputs": {
        "properties": {
            "owner": "",
            "uniqueKey": "js/func.uuid()",
            "createdAt": "js/new Date().toISOString()",
            "updatedAt": "js/new Date().toISOString()"
        }
    }
}
```

