# Configuration Options

A TryCatch node does not process a message in any way, it represents only a decision point in a message flow

## Node properties

### Required properties

-   `steps` (array): Array of nodes that will be executed for each iteration.

## Usage/Examples

### Step Configuration

```json
{
    "name": "try-catch",
    "node": "try-catch@1.0.0",
    "type": "local"
}
```

### Node Configuration

```json
"try-catch": {
    "try": {
        "steps": []
    },
    "catch": {
        "steps": []
    }
}
```
