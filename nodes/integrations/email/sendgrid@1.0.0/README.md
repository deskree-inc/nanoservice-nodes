# Configuration Options
The Sendgrid node allows you to send email through sendgrid.

### Required properties
- `properties` (array): An object containing all the necesary properties for sendgrid service to work.
    - `sendGridApiKey` (string): The send grid api key.
    - `to` (array | string): Array or string of array.
    - `subject` (string): The subject of the email
    - `HTML` (string): The html of the email


### Optional properties
- `options` (object): All the available options according to the sendgrid doc https://github.com/sendgrid/sendgrid-nodejs

## Usage/Examples
### Step Configuration

```json
{
    "name": "sendgrid",
    "node": "sendgrid@1.0.0",
    "type": "local"
}
```

### Node Configuration

```json
"sendgrid": {
    "inputs": {
        "type": "object",
        "properties": {
            "sendGridApiKey": "<sendGridApiKey>",
            "to": ["ernesto@deskree.com"],
            "subject": "Hello, World!",
            "html": "<h1>Hello, {{-name-}} World!</h1>",
            "options": {
                "from": "no-reply@deskree.com",
                "templateId": "d-30dd024fc5d4445aada12ebf3b6f4abb",
                "substitutions": {
                    "-name-": "Ernesto Deskree"
                }
            }
        }
    }
}
```

