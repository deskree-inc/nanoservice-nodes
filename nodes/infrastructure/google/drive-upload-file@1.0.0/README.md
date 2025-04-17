# Configuration Options

The **GoogleDriveUploadFromUrl** node allows you to upload a file to Google Drive from a public URL and specify the destination path within your Google Drive.

This node downloads a file from a publicly accessible URL and uploads it to your Google Drive account using the Google Drive API. You can now specify the exact folder path in Google Drive where the file should be uploaded.

## Usage/Examples

### Step Configuration

```json
{
  "name": "upload-from-url",
  "node": "google/drive/upload-from-url@1.0.0",
  "type": "local"
}
```

### Node Configuration

```json
"upload-from-url": {
    "inputs": {
        "googleConfig": {
            "clientId": "<YOUR_GOOGLE_CLIENT_ID>",
            "clientSecret": "<YOUR_GOOGLE_CLIENT_SECRET>",
            "refreshToken": "<YOUR_GOOGLE_REFRESH_TOKEN>"
        },
        "publicUrl": "https://example.com/path/to/your/file.jpg",
        "fileName": "uploaded-file.jpg",
        "mimeType": "image/jpeg",
        "path": "/Folder1/Subfolder2"
    }
}
```

---

## Detailed Explanation

### **1. Google Configuration (`googleConfig`)**

This object contains your Google API credentials necessary for authentication.

- **`clientId`**: Your Google API Client ID.
- **`clientSecret`**: Your Google API Client Secret.
- **`refreshToken`**: Your Google API Refresh Token.

**Note**: Ensure you have enabled the Google Drive API in your Google Cloud Console and have obtained the necessary OAuth 2.0 credentials with the appropriate scopes.

### **2. Public URL (`publicUrl`)**

The direct URL to the file you wish to upload to Google Drive. This URL must be publicly accessible without authentication.

**Example**:

```json
"publicUrl": "https://example.com/path/to/your/file.jpg"
```

### **3. File Name (`fileName`)**

(Optional) The desired name of the file in Google Drive. If not provided, the file name will be extracted from the `publicUrl`.

**Example**:

```json
"fileName": "my-uploaded-file.jpg"
```

### **4. MIME Type (`mimeType`)**

(Optional) The MIME type of the file. If not provided, it defaults to `"application/octet-stream"`. It's recommended to specify the correct MIME type for proper file handling in Google Drive.

**Example**:

```json
"mimeType": "image/jpeg"
```

### **5. Path (`path`)**

(Optional) The destination path in your Google Drive where the file should be uploaded. If the specified folders do not exist, they will be created automatically.

**Example**:

```json
"path": "/Folder1/Subfolder2"
```

- The `path` should be specified using forward slashes `/` as separators.
- Leading and trailing slashes are optional.
- If the `path` is not provided or is empty, the file will be uploaded to the root directory of Google Drive.

---

## Complete Configuration Example

Combining all the above, here is a complete configuration example:

```json
{
  "upload-from-url": {
    "inputs": {
      "googleConfig": {
        "clientId": "1234567890-abcde12345.apps.googleusercontent.com",
        "clientSecret": "YourGoogleClientSecret",
        "refreshToken": "1//04i-YourRefreshToken"
      },
      "publicUrl": "https://example.com/files/sample.pdf",
      "fileName": "sample.pdf",
      "mimeType": "application/pdf",
      "path": "/MyUploads/Documents"
    }
  }
}
```

In this example:

- The file `sample.pdf` will be downloaded from the provided `publicUrl`.
- The file will be uploaded to Google Drive under the path `MyUploads/Documents`.
- If the folders `MyUploads` or `Documents` do not exist, they will be created automatically.

---

## Steps to Obtain Google API Credentials

1. **Create a Google Cloud Project**:

   - Go to the [Google Cloud Console](https://console.cloud.google.com/).
   - Create a new project or select an existing one.

2. **Enable the Google Drive API**:

   - Navigate to **APIs & Services** > **Library**.
   - Search for **Google Drive API** and enable it.

3. **Configure OAuth Consent Screen**:

   - Go to **APIs & Services** > **OAuth consent screen**.
   - Set up the consent screen (choose **External** if not using a G Suite account).
   - Provide the necessary details and save.

4. **Create OAuth Client Credentials**:

   - Navigate to **APIs & Services** > **Credentials**.
   - Click on **Create Credentials** > **OAuth client ID**.
   - Select **Desktop app** or **Web application** depending on your use case.
   - Download the OAuth 2.0 Client ID JSON file or note down the **Client ID** and **Client Secret**.

5. **Obtain a Refresh Token**:

   - Use a tool like [OAuth 2.0 Playground](https://developers.google.com/oauthplayground/) to obtain a refresh token.
   - In OAuth Playground:
     - Click the gear icon and check **Use your own OAuth credentials**.
     - Enter your **Client ID** and **Client Secret**.
     - In Step 1, select the scope `https://www.googleapis.com/auth/drive.file`.
     - Click **Authorize APIs** and complete the consent process.
     - In Step 2, click **Exchange authorization code for tokens**.
     - Copy the **Refresh Token** provided.

**Important**: Keep your `clientId`, `clientSecret`, and `refreshToken` secure. Do not share them or commit them to version control.

---

## Example Usage in a Workflow

Assuming you are building a workflow, here is how you might incorporate the **GoogleDriveUploadFromUrl** node:

### Workflow Steps

1. **Trigger Node**: (e.g., HTTP request, scheduled job)
2. **Google Drive Upload Node**: Uses the configuration as specified to upload a file from a public URL to Google Drive.
3. **Next Steps**: (e.g., send a confirmation email, update a database, etc.)

### Sample Workflow Configuration

```json
{
  "steps": [
    {
      "name": "upload-from-url",
      "node": "google/drive/upload-from-url@1.0.0",
      "type": "local",
      "inputs": {
        "googleConfig": {
          "clientId": "1234567890-abcde12345.apps.googleusercontent.com",
          "clientSecret": "YourGoogleClientSecret",
          "refreshToken": "1//04i-YourRefreshToken"
        },
        "publicUrl": "https://example.com/files/sample.pdf",
        "fileName": "sample.pdf",
        "mimeType": "application/pdf",
        "path": "/Projects/Reports/2023"
      }
    }
    // ... other steps
  ]
}
```

In this workflow:

- The file `sample.pdf` will be downloaded from the provided `publicUrl`.
- It will be uploaded to the Google Drive path `Projects/Reports/2023`.
- Subsequent steps can use the output data (e.g., file ID) for further processing.

---

## Additional Information

### Error Handling

The node includes error handling to manage various failure scenarios:

- **Authentication Errors**: If the credentials are invalid or the refresh token is expired.
- **Network Errors**: Issues with downloading the file from the public URL.
- **Upload Errors**: Problems uploading the file to Google Drive (e.g., insufficient permissions, invalid path).
- **Folder Creation Errors**: Errors encountered while creating folders in the specified path.

Ensure to monitor logs and handle errors appropriately in your workflow.

### Security Considerations

- **Credential Management**: Store your Google API credentials securely, preferably using environment variables or a secrets management system.
- **Least Privilege Principle**: Use the minimum necessary scopes for your OAuth tokens. The scope `https://www.googleapis.com/auth/drive.file` allows the app to read and write files it creates or has been given access to.
- **Data Privacy**: Be mindful of the data you are transferring and storing, ensuring compliance with any relevant data protection regulations.

### Limitations and Quotas

- **API Quotas**: Google Drive API has usage limits. Monitor your API usage in the Google Cloud Console to avoid exceeding quotas.
- **File Size Limits**: Be aware of the maximum file size allowed by both the source and Google Drive.
- **Folder Hierarchy Limitations**: Avoid excessively deep folder structures to prevent hitting any limits imposed by Google Drive.

---

## Tips for Using the `path` Field

- **Creating Nested Folders**: The node will automatically create any folders specified in the `path` if they do not already exist.
- **Existing Folders**: If folders in the specified path already exist, the node will use them, avoiding duplication.
- **Special Characters**: Be cautious when using special characters in folder names, as they may need to be URL-encoded.
- **Root Directory**: To upload files directly to the root directory, omit the `path` field or set it to an empty string.

---

## References

- **Google Drive API Documentation**:
  - [Files: create](https://developers.google.com/drive/api/v3/reference/files/create)
  - [Search for Files and Folders](https://developers.google.com/drive/api/v3/search-files)
  - [Manage Uploads](https://developers.google.com/drive/api/v3/manage-uploads)
- **Google Cloud Console**: [APIs & Services](https://console.cloud.google.com/apis/dashboard)
- **OAuth 2.0 Playground**: [OAuth 2.0 Playground](https://developers.google.com/oauthplayground/)
