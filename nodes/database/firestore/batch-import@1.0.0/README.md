# Configuration Options
The FirestoreBatchImport node allows you to prepare a firestore batch process

### Required properties
- `reference *` (string): The that references the path of the subcollection. In this section you can use `${}` to directly point to property of the incoming data.
- `type *` (string: set | create | update | delete ): The batch method process.

### Optional properties
- `exclude` : (Array<strings>): Array of string of fields to exclude during the process.
- `merge`: (boolean): Boolean value if you want to process to be merged.

## Usage/Examples
### Step Configuration

```json
{
    "name": "batch-import",
    "node": "google/firestore/batch-import@1.0.0",
    "type": "local"
}
```

### Node Configuration

```json
"batch-import": {
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
            "reference": "users/${city}/user/${name}",
            "type": "set",
            "exclude": ["_id"],
            "merge": true
        }
    }
}
```

