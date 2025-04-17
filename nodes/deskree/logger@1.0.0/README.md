# Configuration Options
The Deskree-logger node description or configuration goes here.
Fill Each section if needed

### Required properties
- `service` (string): Name of the service where the logger is used
- `projectId` (string): Deskree project id
- `severity` (string): Log message severity. Can be either 'DEFAULT' | 'DEBUG' | 'INFO' | 'NOTICE' | 'WARNING' | 'ERROR' | 'CRITICAL' | 'ALERT' | 'EMERGENCY'
- `status` (integer): HTTP status code
- `message`	 (string):	Log entry message
- `sourceLocation` (object): Object containing file name, line number, and function name

### Optional properties
- `labels` (object): Object representing the labels associated with the log. See below for more examples of Deskree labels being used.

## Usage/Examples
### Step Configuration

```json
{
    "name": "deskree-logger",
    "node": "deskree/logger@1.0.0",
    "type": "local"
}
```

### Node Configuration


```json
"deskree-logger": {
    "inputs": {
        "service": "deskree-logger",
        "projectId": "deskree-project_id",
        "severity": "DEFAULT",
        "message": "Message",
        "sourceLocation": {
            "file": "deskree-file",
            "line": 200,
            "function": "deskree-function"
        },
        "labels": [
            {
                "billable": "billable"
            }
        ]
    }
}
```
