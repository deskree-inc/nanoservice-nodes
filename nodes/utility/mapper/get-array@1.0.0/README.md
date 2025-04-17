# Configuration Options
The GetArray node allows you to get a property from an object.

### Required properties
- `property` (string): The property of the object that want to be extracted.

## Usage/Examples

### Step Configuration

```json
{
    "name": "get-array",
    "node": "get-array@1.0.0",
    "type": "local"
}
```

### Node Configuration

```json
"get-array": {
    "inputs": {
        "properties": {
            "property": "data"
        }
    }
}
```

