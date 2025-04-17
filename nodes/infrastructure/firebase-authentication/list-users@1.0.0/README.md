# Configuration Options

The List-users node description or configuration goes here.
Fill Each section if needed

### Optional properties

-   `firebaseConfig` (object): Firebase connection configuration
-   `limit` (number): The limit of records that will be fetched.

## Usage/Examples

### Step Configuration

```json
{
    "name": "firebase-auth-list-users",
    "node": "google/firebase/auth/list-users@1.0.0",
    "type": "local"
}
```

### Node Configuration

```json
"firebase-auth-list-users": {
    "inputs": {
        "firebaseConfig": {
            "type": "service_account",
            "project_id": "deskree-87e03dbe-e932-4414-b",
            "private_key_id": "201689cc3471d934499c05ac0a75fc7505e1e2f5",
            "private_key": "<-----BEGIN PRIVATE KEY-----\n==\n-----END PRIVATE KEY-----\n>",
            "client_email": "<account.iam.gserviceaccount.com>",
            "client_id": "<client_id>",
            "auth_uri": "https://accounts.google.com/o/oauth2/auth",
            "token_uri": "https://oauth2.googleapis.com/token",
            "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
            "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/<client_email>",
            "universe_domain": "googleapis.com"
        },
        "limit": "<limit>"
    }
}
```
