# Configuration Options

The Firebase Admin SDK has a built-in method for creating custom tokens. At a minimum, you need to provide a uid, which can be any string but should uniquely identify the user or device you are authenticating.

### Optional properties

-   `firebaseConfig` (object): firebase connection configuration
-   `uid` (string): a user unique identifier.

    <em>Note: If uid is undefined, you can use the data returned by the previous node.</em>

## Usage/Examples

### Step Configuration

```json
{
    "name": "create-custom-token",
    "node": "google/firebase/auth/create-custom-token@1.0.0",
    "type": "local"
}
```

### Node Configuration

```json
"create-custom-token": {
        "inputs": {
            "firebaseConfig": {
                "type": "service_account",
                "project_id": "b9365840-6ef3-4b18-9",
                "private_key_id": "asdpjoiasjpoasdjopsdapo",
                "private_key": "nkoasdkoasdioasdpoj",
                "client_email": "firebaseq@b9365840-6ef3-4b18-9.iam.gserviceaccount.com",
                "client_id": "i3939041912934u128401824u",
                "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                "token_uri": "https://oauth2.googleapis.com/token",
                "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
                "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebaseq%4b9365840-6ef3-4b18-9.iam.gserviceaccount.com",
                "universe_domain": "googleapis.com"
            },
            "uid": "<uid>"
    }
}
```
