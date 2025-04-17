# Configuration Options

The **S3 Download URL** node allows you to get the download URL of a file from AWS S3 storage.

This node requires your AWS configuration credentials, the S3 bucket name, and the key (path) of the file in the S3 bucket. It generates a pre-signed URL that you can use to download the file.

## Usage/Examples

### Step Configuration

```json
{
  "name": "download-url",
  "node": "aws/s3/storage/download-url@1.0.0",
  "type": "local"
}
```

### Node Configuration

```json
"download-url": {
    "inputs": {
        "awsConfig": {
            "accessKeyId": "<YOUR_AWS_ACCESS_KEY_ID>",
            "secretAccessKey": "<YOUR_AWS_SECRET_ACCESS_KEY>",
            "region": "<YOUR_AWS_REGION>"
            // "sessionToken": "<YOUR_AWS_SESSION_TOKEN>" // Include if using temporary credentials
        },
        "properties": {
            "bucket": "<your-s3-bucket-name>",
            "remoteFileName": "<path/to/your/file.ext>"
        },
        "signedUrlConfig": {
            "Expires": 3600,
            "ResponseContentDisposition": "attachment",
            "ResponseContentType": "application/octet-stream"
        }
    }
}
```

- **`awsConfig`**: Contains your AWS credentials and region.

  - **`accessKeyId`**: Your AWS Access Key ID.
  - **`secretAccessKey`**: Your AWS Secret Access Key.
  - **`region`**: The AWS region where your S3 bucket is located (e.g., `"us-west-2"`).
  - **`sessionToken`**: (Optional) Your AWS Session Token if you're using temporary credentials.

- **`properties`**: Contains the S3 bucket information.

  - **`bucket`**: The name of your AWS S3 bucket.
  - **`remoteFileName`**: The key (path) of the file in your S3 bucket.

- **`signedUrlConfig`**: Configuration for generating the signed URL.
  - **`Expires`**: Time in seconds before the pre-signed URL expires (e.g., `3600` for 1 hour).
  - **`ResponseContentDisposition`**: Sets the `Content-Disposition` header of the response. `"attachment"` prompts a download.
  - **`ResponseContentType`**: Sets the `Content-Type` header of the response (e.g., `"application/octet-stream"`).

## Notes

- Ensure that your AWS credentials have the necessary permissions to access the specified S3 bucket and object.
- Be cautious with your AWS credentials. Do not commit them to source control or expose them publicly.
- The `Expires` parameter controls how long the generated URL remains valid. Adjust it according to your security requirements.
- You can include additional parameters in `signedUrlConfig` to control response headers, such as `ResponseCacheControl`, `ResponseContentLanguage`, etc.

## Example

Here's an example with actual values (replace placeholders with your real values):

```json
"download-url": {
    "inputs": {
        "awsConfig": {
            "accessKeyId": "<acces_key_id>,
            "secretAccessKey": "<secret_access_key>",
            "region": "us-west-2"
        },
        "properties": {
            "bucket": "my-s3-bucket",
            "remoteFileName": "documents/report.pdf"
        },
        "signedUrlConfig": {
            "Expires": 600,
            "ResponseContentDisposition": "attachment; filename=\"report.pdf\"",
            "ResponseContentType": "application/pdf"
        }
    }
}
```

- This configuration will generate a pre-signed URL valid for 10 minutes (`600` seconds) for the file `documents/report.pdf` in the bucket `my-s3-bucket`.
- The response headers will prompt the browser to download the file as `report.pdf` and set the content type to `application/pdf`.

## Security Considerations

- **Credential Management**: Use environment variables or a secure secrets manager to store your AWS credentials.
- **Least Privilege Principle**: The IAM user or role should have only the permissions necessary to perform the required operations (e.g., `s3:GetObject` for the specific bucket and key).
- **URL Expiration**: Set an appropriate expiration time for the pre-signed URL to limit the window of exposure.
- **HTTPS**: Always use HTTPS to ensure secure communication.

## Additional Parameters

You can include more parameters in `signedUrlConfig` to customize the response:

- **`ResponseCacheControl`**: Controls caching behavior.
- **`ResponseContentLanguage`**: Sets the `Content-Language` header.
- **`ResponseExpires`**: Sets the `Expires` header (must be in HTTP-date format).
- **`ResponseContentEncoding`**: Sets the `Content-Encoding` header.

## References

- **AWS SDK for JavaScript Documentation**: [getSignedUrl](https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#getSignedUrl-property)
- **AWS S3 Pre-signed URLs**: [Sharing Objects Using Pre-signed URLs](https://docs.aws.amazon.com/AmazonS3/latest/userguide/ShareObjectPreSignedURL.html)

## Troubleshooting

- **Invalid Credentials**: Ensure that the `accessKeyId` and `secretAccessKey` are correct and correspond to an IAM user with the necessary permissions.
- **Access Denied**: Verify that the IAM user or role has `s3:GetObject` permission for the specified bucket and key.
- **URL Not Working**: Check that the `Expires` time is sufficient and that the URL hasn't expired. Also, ensure that the `remoteFileName` is correct.
