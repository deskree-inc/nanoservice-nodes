# Configuration Options

Firebase Auth CreateUser allows you to create the user object using Firebase Admin SDK auth().createUser() method

### Optional properties

-   `firebaseConfig` (object): firebase connection configuration
-   `userData` (CreateRequest): Data corresponding to the newly created user can be accessed through the userRecord object.

    For more detailed information about the properties and structure of this object, you can refer to the [Firebase documentation](https://firebase.google.com/docs/auth/admin/manage-users#create_a_user).

    <em>Note: If userData is undefined, you can use the data returned by the previous node.</em>

## Usage/Examples

### Step Configuration

```json
{
    "name": "firebase-auth-create-user",
    "node": "google/firebase/auth/create-user@1.0.0",
    "type": "local"
}
```

### Node Configuration

```json
"firebase-auth-create-user": {
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
        "userData": {
            "email": "<email>",
            "emailVerified": "<emailVerified>",
            "password": "<password>",
            "disabled": "<disabled>",
        }
    }
}
```
