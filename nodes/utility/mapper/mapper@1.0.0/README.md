# Configuration Options
The Mapper node allows you to map the previous node response

### Required properties
- `mapper` (string): The string that will be evaluated as a javascript expression. The result of the expression will be the output of this node

## Usage/Examples
### Step Configuration

```json
{
    "name": "mapper",
    "node": "mapper@1.0.0",
    "type": "local"
}
```

### Node Configuration

```json
"mapper": {
    "inputs": {
        "properties": {
            "mapper": "data[data.length-1].filePath"
        }
    }
}
```
