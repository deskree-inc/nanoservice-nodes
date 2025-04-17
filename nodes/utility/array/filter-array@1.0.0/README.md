# Configuration Options
The ValidateJsonKey node allows you filter an array


### Required properties
- `condition *` (string): The javascript based condition to filter the array.

## Usage/Examples

### Step Configuration

```json
{
    "name": "filter-array",
    "node": "filter-array@1.0.0",
    "type": "local"
}
```

### Node Configuration

```json
"filter-array": {
    "inputs": {
        "conditions": "data.valid === true" 
    }
}
```

