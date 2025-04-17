# Configuration Options

This node provides a method to download files from a Google Cloud Storage bucket, compress them into a ZIP archive, upload the archive to Firebase Storage, and return a download URL

### Required properties

-   `folderPath` (string): Path of the folder inside google cloud storage that you want to download

### Optional properties

-   `bucketName` (string): Name of the bucket where the folder was stored

-   `destinationPath` (string): Path where the zip file will be stored

## Usage/Examples

### Step Configuration

```json
{
    "name": "download-folder-url",
    "node": "infrastructure/firebase-storage/download-folder-url@1.0.0@1.0.0",
    "type": "local"
}
```

### Node Configuration

```json
"download-folder-url": {
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
        "properties": {
            "folderPath": "reports/1234"
        }
    }
}
```
