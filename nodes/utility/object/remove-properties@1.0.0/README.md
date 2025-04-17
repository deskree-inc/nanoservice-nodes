# Configuration Options
The RemoveProperties node allows you to remove properties in json object.

### Required properties
- `properties` (array): An array of string containing the keys that wants to be removed from the object.

## Usage/Examples
### Step Configuration

```json
{
    "name": "remove-properties",
    "node": "remove-properties@1.0.0",
    "type": "local"
}
```

### Node Configuration

```json
"remove-properties": {
    "inputs": {
        "properties": [
            "name",
            "age"
        ]
    }
}
```

