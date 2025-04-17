# Configuration Options
The MongodbQuery Node requires the following configuration options in the ctx.config object:

## Node properties

### Required properties
- `mongodbConnectionString *` (string): A string representing the MongoDB connection string. (Required)
- `database *` (string): The name of the MongoDB database to query. (Required)
- `collection *` (string): The name of the MongoDB collection to query. (Required)

### Optional properties

- `$where` (string): A query filter using JavaScript evaluation.
- `where` ({ [key: string]: string }): A query filter using Mongoose query syntax.
- `projection` (Array): Specifies which fields to include or exclude in the result.
- `limit` (number): A number representing the maximum number of documents to return.
- `skip` (number): Skips the specified number of documents before returning results.
- `sort` ({ [key: string]: string }): An object defining the sorting criteria for the query results.
- `count` (boolean): A boolean indicating whether to return the count of documents instead of the documents themselves.
- `aggregate` (Array): An array of aggregate pipeline. If this option is enabled, the query will be exected as an aggregation-pipeline [ https://docs.mongodb.com/manual/reference/operator/aggregation-pipeline/](aggregation-pipeline). 

## Usage/Examples
### Step Configuration

```json
{
    "name": "query",
    "node": "mongodb/query@1.0.0",
    "type": "local"
}
```

### Node Configuration

```json
"query": {
    "inputs": {
        "properties": {
            "mongodbConnectionString": "mongodb://localhost:27017",
            "database": "bpTests",
            "collection": "users",
            "$where": "this.age === 24",
            "where": {
                "name": "Ernesto",
                "age": 24
            },
            "projection": ["name"],
            "skip": 1,
            "limit": 1,
            "sort": {
                "age": "desc"
            },
            "count": false,
            "aggregate": [{
                "$facet": {
                    "metadata": [{ "$count": "total" }],
                    "data": []
                }
            }]
        }
    }
}
```

