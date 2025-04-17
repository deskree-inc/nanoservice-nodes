# Configuration Options

The Firebase Admin SDK facilitates modifying an existing user's data. You need to specify a uid along with the properties to update for that user

### Required properties

-   `uid` (string): user unique ids

### Optional properties

-   `firebaseConfig` (object): firebase connection configuration
-   `userData` (UpdateRequest): Data corresponding to the newly created user can be accessed through the userRecord object.

    <em>Note: If userData is undefined, you can use the data returned by the previous node.</em>

## Usage/Examples

### Step Configuration

```json
{
    "name": "firebase-auth-update-user",
    "node": "google/firebase/auth/update-user@1.0.0",
    "type": "local"
}
```

### Node Configuration

```json
"firebase-auth-update-user": {
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
        "uid": "<uid>",
        "userData": {
            "email": "<email>",
            "emailVerified": "<emailVerified>",
            "password": "<password>",
            "disabled": "<disabled>",
        }
    }
}
```
