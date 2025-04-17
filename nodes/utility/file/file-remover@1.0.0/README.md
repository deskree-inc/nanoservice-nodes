# Configuration Options
The FileRemover node allows you to remove a file from the server.

### Optional properties
- `fileDir` (string): The directory of the file to delete.


## Usage/Examples
### Step Configuration

```json
{
    "name": "file-remover",
    "node": "file-remover@1.0.0",
    "type": "local"
}
```

### Node Configuration

```json
"file-remover": {
    "inputs": {
        "properties": {
            "fileDir": ""
        }
    }
}
```

