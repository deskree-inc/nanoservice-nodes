# Configuration Options
The GetContext node allows you to get information from the context for the next node

## Node properties

### Required properties
- `context` (string): The property of the context that want to be passed for the next node.

## Usage/Examples
### Step Configuration

```json
{
    "name": "get-context",
    "node": "get-context@1.0.0",
    "type": "local"
}
```

### Node Configuration

```json
"get-context": {
    "inputs": {
        "properties": {
            "context": "request.body"
        }
    }
}
```

