# Configuration Options
The CsvStreamReader node allows you to stream CSV files to JSON objects


## Node properties

### Required properties
- `steps *` (node): Steps of nodes. (Required)

### Optional properties

- `batchSize` (number): The batch size of the stream read.

## Usage/Examples
### Step Configuration

```json
{
    "name": "csv-stream-reader",
    "node": "csv-stream-reader@1.0.0",
    "type": "local"
}
```

### Node Configuration

```json
"csv-stream-reader": {
    "inputs": {
        "properties": {
            "batchSize": 500
        },
        "steps": []
    }
}
```

