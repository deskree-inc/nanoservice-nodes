# Configuration Options
The DeskreeSchemaValidator node allows validate the json schema using Deskree validation

### Required properties
- `variables.zodSchema` (string): The context vars key of the collection configuration.

## Usage/Examples
### Step Configuration

```json
{
    "name": "deskree-schema-validator",
    "node": "deskree-schema-validator@1.0.0",
    "type": "local"
}
```

### Node Configuration

```json
"deskree-schema-validator": {
    "inputs": {
        "properties": {
            "variables": {
                "zodSchema": "collectionConfig"
            }
        }
    }
}
```

