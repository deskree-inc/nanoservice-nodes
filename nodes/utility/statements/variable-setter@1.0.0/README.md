# Configuration Options
The VariableSetter node allows you to store a variable into the context vars.

### Optional properties
- `variable` (array): Array of object that allows yo to store a key-value into the context vars.
- `node` (object): Allows yo to store all the response of the previous node with a custom name into the context vars.

## Usage/Examples
### Step Configuration

```json
{
    "name": "variable-setter",
    "node": "variable-setter@1.0.0",
    "type": "local"
}
```

### Node Configuration

```json
"variable-setter": {
    "inputs": {
        "properties": {
            "variables": [
                {
                    "name": "variable_name",
                    "value": "variable value"
                }
            ],
            "node": {
                "name": "collectionConfig"
            }
        }
    }
}
```

