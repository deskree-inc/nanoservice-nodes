# Configuration Options

The while statement creates a loop that executes a specified statement as long as the test condition evaluates to true. The condition is evaluated before executing the statement.

## Node properties

### Required properties

-   `condition` (boolean | string): An expression evaluated before each pass through the loop. If this condition evaluates to true, statement is executed
-   `steps` (array): Array of nodes that will be executed for each iteration.

## Usage/Examples

### Step Configuration

```json
{
    "name": "while",
    "node": "utility/control-flow/while@1.0.0",
    "type": "local"
}
```

### Node Configuration

```json
"while": {
    "condition": "js/ctx.vars.condition === true",
    "steps": []
}
```

```json
"while": {
    "condition": "${ctx.vars.condition === true}",
    "steps": []
}
```
