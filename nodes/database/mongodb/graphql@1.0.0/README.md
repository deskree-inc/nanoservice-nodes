# Configuration Options
The GraphqlMongodb Node requires the following configuration options in the ctx.config object:

## Node properties

### Required properties
- `mongodbConnectionString *` (string): A string representing the MongoDB connection string. (Required)
- `database *` (string): The name of the MongoDB database to query. (Required)
- `collection *` (string): The name of the MongoDB collection to query. (Required)
- `schema *` (Object): The mongodb schema (folliwing mongoose schema - https://mongoosejs.com/docs/schematypes.html (Required)

## Usage/Examples
### Step Configuration

```json
{
    "name": "mongodb-graphql",
    "node": "mongodb/graphql@1.0.0",
    "type": "local"
}
```

### Node Configuration

```json
"mongodb-graphql": {
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

### Query Resolvers

- `findById`: Fetches a single document by its `ID`.
- `findOne`: Fetches a single document matching the provided filter. You can also specify a `where` clause, `skip` for pagination, and  `sort` for ordering.
- `findMany`: Fetches multiple documents matching the provided filter. You can also specify a `where` and `filter` clause, `limit` and `skip` for pagination, and `sort` for ordering.
- `count`: Returns the count of documents that match the provided filter.
- `connection`: Provides a Relay-style cursor-based pagination. More details can be found here.
- `pagination`: Provides a simple offset-based pagination. More details can be found here.

### Mutation Resolvers
- `createOne`: Creates a new document with the provided record.
- `updateById`: Updates the document with the provided ID using the provided record.
- `removeById`: Removes the document with the provided ID.
- `removeOne`: Removes a single document matching the provided filter.
- `removeMany`: Removes multiple documents matching the provided filter.
- `updateOne`: Updates a single document matching the provided filter with the provided record.
- `updateMany`: Updates multiple documents matching the provided filter with the provided record.
- `createMany`: Creates multiple new documents with the provided records.

### Usage
To use these resolvers, you need to provide the necessary arguments for each resolver. For example, to use findOne, you need to provide a filterargument which is a JSON object specifying the conditions for the documents you want to fetch.

For mutation resolvers, you need to provide the 
record or records argument which is a JSON object or an array of JSON objects representing the new or updated document(s).


#### Query Examples

##### findMany
```graphql
query collection {
  findById(_id: "your-object-id-here") {
    _id
    name
    # other fields
  }
}
```
##### findOne
```graphql
query collection {
  findOne(filter: { fieldName: "fieldValue" }) {
    _id
    name
    # other fields
  }
}
```
##### findMany
```graphql
query collection {
  findMany(filter: { fieldName: "fieldValue" }, limit: 10, skip: 0, sort: { fieldName: 1 }) {
    _id
    name
    # other fields
  }
}

```
##### count
```graphql
query collection {
  count(filter: { fieldName: "fieldValue" })
}
```
##### pagination
```graphql
query collection {
    pagination (
        page: 1,
        perPage: 1,
        filter: {
            age: 23
        },
        sort: _ID_ASC
    ){
        items {
            name,
            lastName,
            age
            # other fields
        },
        count,
        pageInfo {
            currentPage
            perPage,
            itemCount,
            pageCount,
            hasPreviousPage,
            hasNextPage
        }
    }
}
```
##### connection
```graphql
query collection {
    connection(first: 2) {
    count
    pageInfo {
        hasPreviousPage,
        hasNextPage,
        startCursor,
        endCursor
    }
    edges {
        cursor, 
        node {
            _id,
            name,
            lastName,
            age
        }
        
    }
    }
}
```

#### Mutation Resolvers
##### createOne
```graphql
mutation collection {
  createOne(record: { name: "New Record" }) {
    _id
    name
    # other fields
  }
}
```
##### updateById
```graphql
mutation collection {
  createOne(record: { name: "New Record" }) {
    _id
    name
    # other fields
  }
}
```
##### removeById
```graphql
mutation collection {
  removeById(_id: "your-object-id-here")
}
```
##### removeOne
```graphql
mutation collection {
  removeOne(filter: { fieldName: "fieldValue" }) {
    _id
    name
    # other fields
  }
}
```
##### removeOne
```graphql
mutation collection {
  removeOne(filter: { fieldName: "fieldValue" }) {
    _id
    name
    # other fields
  }
}
```
##### removeMany
```graphql
mutation collection {
  removeMany(filter: { fieldName: "fieldValue" })
}
```
##### updateOne
```graphql
mutation collection {
  updateOne(filter: { fieldName: "fieldValue" }, record: { name: "Updated Record" }) {
    _id
    name
    # other fields
  }
}
```
##### updateMany
```graphql
mutation collection {
  updateMany(filter: { fieldName: "fieldValue" }, record: { name: "Updated Record" })
}
```
##### createMany
```graphql
mutation collection {
  createMany(records: [{ name: "Record 1" }, { name: "Record 2" }]) {
    _id
    name
    # other fields
  }
}
```