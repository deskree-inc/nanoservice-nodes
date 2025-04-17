# Configuration Options
The FileUploader node allows you to upload file to the server

### Optional properties
- `uploadDir` (string): The directory for placing file uploads in.
- `keepName` (boolean): A boolean indicator to maintain file's original name.


## Usage/Examples
### Step Configuration

```json
{
    "name": "file-uploader",
    "node": "file-uploader@1.0.0",
    "type": "local"
}
```

### Node Configuration

```json
"file-uploader": {
    "inputs": {
        "properties": {
            "uploadDir": "",
            "keepName": false
        }
    }
}
```

