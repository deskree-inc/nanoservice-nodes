# Configuration Options
The FirestoreQuery node allows you to query a firestore database.

### Required properties
- `reference *` (string): The that references the path of the subcollection.
- `type *` (string: collection | collectionGroup | document): The batch method process.

### Optional properties
- `where` ({ [key: string]: string }): A query filter using Mongoose query syntax.
- `limit` (number): A number representing the maximum number of documents to return.
- `skip` (number): Skips the specified number of documents before returning results.
- `sort` ({ [key: string]: string }): An object defining the sorting criteria for the query results.
- `count` (boolean): A boolean indicating whether to return the count of documents instead of the documents themselves.
- `includeDocId` (boolean): A boolean indicator that allows adding the documentId to the response of the query.
- `docKey` (string): A string that indicates which is the key of the document ID. This will only work if includeDocId is true.

## Usage/Examples
### Step Configuration

```json
{
    "name": "query",
    "node": "google/firestore/query@1.0.0",
    "type": "local"
}
```

### Node Configuration

```json
"query": {
    "inputs": {
        "firebaseConfig": {
            "apiKey": "<apiKey>",
            "authDomain": "deskree-bp-test.firebaseapp.com",
            "projectId": "deskree-bp-test",
            "storageBucket": "deskree-bp-test.appspot.com",
            "messagingSenderId": "570304672981",
            "appId": "1:570304672981:web:55abc317b8be9a82735e5c",
            "measurementId": "G-Y9PP1Y7340"
        },
        "properties": {
            "reference": "users/{city}/user/{name}",
            "type": "collection",
            "where": [
                {
                    "field": "name",
                    "operator": "==",
                    "value": "test"
                }
            ],
            "orderBy": [
                {
                    "field": "name",
                    "direction": "desc"
                }
            ],
            "limit": 100,
            "count": false,
            "includeDocId": true,
            "docKey": "_id"
        }
    }
}
```

