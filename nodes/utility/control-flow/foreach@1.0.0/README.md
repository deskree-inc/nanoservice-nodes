# Configuration Options
The Foreach node allows you to iterate through an array an call other nodes.

## Node properties

### Required properties
- `steps` (array): Array of nodes that will be executed for each iteration.

## Usage/Examples
### Step Configuration

```json
{
    "name": "foreach",
    "node": "foreach@1.0.0",
    "type": "local"
}
```

### Node Configuration
```json
"foreach": {
    "steps": []
}
```

