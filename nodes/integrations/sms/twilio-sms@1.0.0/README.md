# Configuration Options
The TwilioSMS node allows you to send email through sendgrid.

## Node properties

### Required properties
- `accountSid` (string): Twilio account sid.
- `authToken` (string): Twilio auth token.
- `from` (string): Twilio from phone number.
- `to` (array | string): Phone number(s) to send SMS to.
- `body` (string): SMS body.


### Optional properties
- `options` (object): All the available options according to the Twilio doc https://github.com/twilio/twilio-node#readme

## Usage/Examples
### Step Configuration

```json
{
    "name": "twilio-sms",
    "node": "twilio-sms@1.0.0",
    "type": "local"
}
```

### Node Configuration

```json
"twilio-sms": {
    "inputs": {
        "properties": {
            "accountSid": "<accountSid>",
            "authToken": "<authToken>",
            "from": "<from>",
            "to": "<to>",
            "body": "<body>",
            "options": {
                "autoRetry": true,
                "maxRetries": 3
            }
        }
    }
}
```

