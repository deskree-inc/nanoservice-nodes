# Configuration Options
The FirebaseStorageFileDelete node allows you to delete a file from firebase storage

This node receives a string that points to the firebase storage file.

### Optional properties
- `prefix` (string): The prefix of the file in the firebase storage.
- `bucket` (string): The bucket name of the firebase storage.


## Usage/Examples
### Step Configuration

```json
{
    "name": "file-delete",
    "node": "google/firebase/storage/file-delete@1.0.0",
    "type": "local"
}
```

### Node Configuration


```json
"file-delete": {
    "inputs": {
        "firebaseConfig": {
            "type": "service_account",
            "project_id": "<project_id>",
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
        "properties": {
            "bucket": "<bucket_name>",
            "prefix": "<prefix>"
        }
    }
}
```

