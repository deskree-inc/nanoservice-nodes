# Configuration Options
The GoogleCalendar node allows you manage the calendar of a user

For more information 
- https://googleapis.dev/nodejs/googleapis/latest/calendar/classes/Calendar.html
- https://developers.google.com/calendar/api/v3/reference

## Node properties

### Required properties
- `properties` (array): An object containing all the necesary properties for Google's Calendar API to work.
    - `type` (string): The service type of the google's calendar api to manipulate. **List "acl", "calendarList", "calendars", "channels", "colors", "context", "events", "freebusy", "settings"**.
    - `action` (string): The action that wants to be performed. **List "delete", "get", "insert", "list", "patch", "update", "watch"**.
    - `from` (string): The subject of the email or the email that you want to impersonate

### Optional properties
- `configuration` (Object): The html of the email
    - `calendarId` (string): 


## Usage/Examples
### Step Configuration

```json
{
    "name": "google-calendar",
    "node": "google-calendar@1.0.0",
    "type": "local"
}
```

### Node Configuration


```json
"google-calendar": {
    "inputs": {
        "serviceAccountKey": {
            "type": "service_account",
            "project_id": "<project_id>",
            "private_key_id": "<private_key_id>",
            "private_key": "<private_key>",
            "client_email": "<client_email>",
            "client_id": "<client_id>",
            "auth_uri": "https://accounts.google.com/o/oauth2/auth",
            "token_uri": "https://oauth2.googleapis.com/token",
            "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
            "client_x509_cert_url": "<client_x509_cert_url>",
            "universe_domain": "googleapis.com"
        },
        "properties": {
            "type": "events",
            "action": "list",
            "from": "example@email.com",
            "configuration": {
                "calendarId": "primary"
            }
        }
    }
}
```

