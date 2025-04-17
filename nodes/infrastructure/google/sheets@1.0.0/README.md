# Configuration Options
The GoogleSheets node allows you manage the calendar of a user

For more information 
- https://developers.google.com/sheets/api/reference/rest

## Node properties

### Required properties
- `properties` (array): An object containing all the necesary properties for Google's Sheets API to work.
    - `type` (string): The service type of the google's sheet api to manipulate.
    - `action` (string): The action that wants to be performed.

### Optional properties
- `configuration` (Object): The configuration for the spreadsheet object https://developers.google.com/sheets/api/reference/rest


## Usage/Examples
### Step Configuration

```json
{
    "name": "google-sheet",
    "node": "google/sheetsheet@1.0.0",
    "type": "local"
}
```

### Node Configuration


```json
"google-sheet": {
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
            "type": "values",
            "action": "get",
            "configuration": {
                "spreadsheetid": "<spreadsheetid>",
                "range": "<range>",
                "valueInputOption": "USER_ENTERED"
            }
        }
    }
}
```

