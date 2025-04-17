# Configuration Options
The MongodDelete is a node that can receive an Object or an Array, depending of the input of the node it will perform  as a deleteMany or bulkWrite deleteOne.

The MongodbDelete Node requires the following configuration options in the ctx.config object:

## Node properties

### Required properties
- `mongodbConnectionString *` (string): A string representing the MongoDB connection string. (Required)
- `database *` (string): The name of the MongoDB database to update. (Required)
- `collection *` (string): The name of the MongoDB collection to update. (Required)
- `where *` (Object): The filter property of the MongoDB collection to update (Required)

## Usage/Examples
### Step Configuration

```json
{
    "name": "update",
    "node": "mongodb/update@1.0.0",
    "type": "local"
}
```

### Node Configuration

```json
"update": {
    "inputs": {
        "properties": {
            "mongodbConnectionString": "mongodb://localhost:27017",
            "database": "bpTests",
            "collection": "users"
        }
    }
}
```

