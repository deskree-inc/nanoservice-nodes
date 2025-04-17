# Configuration Options
The Jsonschema node allows you to validate the JSON object using json-schema standars.

### Required properties
- `schema` (object): The json-schema that will be used to validate the object.

## Usage/Examples
### Step Configuration

```json
{
    "name": "jsonschema",
    "node": "jsonschema@1.0.0",
    "type": "local"
}
```

### Node Configuration

```json
"jsonschema": {
    "inputs": {
        "properties": {
            "schema": {
                "properties": {
                    "name": {
                        "type": "string"
                    },
                    "city": {
                        "type": "string"
                    },
                    "age": {
                        "type": "string"
                    },
                    "owner": {
                        "type": "string"
                    },
                    "uniqueKey": {
                        "type": "string"
                    },
                    "createdAt": {
                        "type": "string"
                    },
                    "updatedAt": {
                        "type": "string"
                    }
                },
                "required": [
                    "name",
                    "city",
                    "age"
                ],
                "additionalProperties": false
            }
        }
    }
}
```

