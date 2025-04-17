# Configuration Options
The JsonStreamReader node allows you to stream read a JSON file.

## Node properties

### Required properties
- `steps` (array): Array of nodes that will be executed for each iteration.

### Optional properties
- `batchSize` (number): The number of records to be read in each batch.

## Usage/Examples
### Step Configuration

```json
{
    "name": "json-stream-reader",
    "node": "json-stream-reader@1.0.0",
    "type": "local"
}
```

### Node Configuration

```json
"json-stream-reader": {
    "inputs": {
        "properties": {
            "batchSize": 1000
        }
    },
    "steps": [
        {
            "name": "firestore-batch-import",
            "node": "firestore-batch-import",
            "type": "local"
        }
    ]
}
```

