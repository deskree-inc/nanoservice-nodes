# Configuration Options
The SetTimeout node allows you to set a timer for a specific amount of time before the next node will be executed.

## Node properties

### Required properties
- `time` (number | string): The time, in milliseconds that the timer should wait before the next node will be executed

## Usage/Examples
### Step Configuration

```json
{
    "name": "set-timeout",
    "node": "set-timeout@1.0.0",
    "type": "local"
}
```

### Node Configuration

```json
"set-timeout": {
    "time": 1000,
}
```



```json
"set-timeout": {
    "time": "${ctx.vars.timeout}",
}
```

