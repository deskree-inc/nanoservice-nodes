# Configuration Options
The MongodbInsert is a node that can receive an Object or an Array, depending of the input of the node it will perform a insertOne or InsertMany, also has the bulkWrite option.

The MongodbInsert Node requires the following configuration options in the ctx.config object:

## Node properties

### Required properties
- `mongodbConnectionString *` (string): A string representing the MongoDB connection string. (Required)
- `database *` (string): The name of the MongoDB database to insert. (Required)
- `collection *` (string): The name of the MongoDB collection to insert. (Required)

### Optional properties

- `bulkWrite` (Boolean): Enable the bulk write operation into the MongoDb collection. 
If this option is enabled, the incoming data should be an array otherwise it will performance as a insertOne.

## Usage/Examples
### Step Configuration

```json
{
    "name": "insert",
    "node": "mongodb/insert@1.0.0",
    "type": "local"
}
```

### Node Configuration

```json
"insert": {
    "inputs": {
        "properties": {
            "mongodbConnectionString": "mongodb://localhost:27017",
            "database": "bpTests",
            "collection": "users",
            "bulkWrite": true
        }
    }
}
```

