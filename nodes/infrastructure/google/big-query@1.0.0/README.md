# Configuration Options

Google BigQuery Client

### Optional properties

-   `bigQueryConfig` (object): firebase connection configuration.
-   `queryOptions` (object): this configuration pertains to the filter settings utilized for generating the query.
-   `query` (string): The query employed to retrieve the data.

## Usage/Examples

### Step Configuration

```json
{
    "name": "big-query",
    "node": "google/big-query@1.0.0",
    "type": "local"
}
```

### Node Configuration

```json
"big-query": {
    "inputs": {
        "bigQueryConfig": {
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
        "queryOptions": {
            "table":"<table>",
            "type":"SELECT",
            "where": [
                {
                    "attribute": "name",
                    "operator": "=",
                    "value": "John"
                }
            ],
            "limit": 10,
            "group": ["name"],
            "interval": "day",
            "sorted": {
                "attribute": "name",
                "order": "ASC"
            }
        },
        "query": "SELECT * FROM `big-query-public-data.samples.shakespeare` LIMIT 10"
    }
}
```
