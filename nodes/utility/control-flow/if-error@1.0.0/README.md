# Configuration Options
The IfError node allows you to have a conditional statement to validate a property and throw an error.

## Node properties

### Required properties
- `condition` (string): The condition string to be checked.
- `error` (string): The throw error message.

### Optional properties
- `code` (number): The response error code.
- `steps` (array): Array of nodes that will be executed for each iteration.


## Usage/Examples
### Step Configuration

```json
{
    "name": "if-error",
    "node": "if-error@1.0.0",
    "type": "local"
}
```

### Node Configuration

```json
"if-error": {
    "condition": "data.name === 'John'",
    "error": "Name must be John",
    "steps": []
}
```
<p></p>

```json
"if-error": {
    "condition": "data.name === 'John'",
    "error": {
        "message": "Name must be ${ctx.response.data.name}"
    },
    "code": 422
}
```

