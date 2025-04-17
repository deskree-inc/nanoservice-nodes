# Configuration Options
The postgresql-query node allows you to update a record of a postgresql database

### Required properties
- `connecetion` (object): Connection details required
    - `host` (string): The host of the postgresql server
    - `port` (string): the port of the postgresql server
    - `user` (string): The user of the postgresql server
    - `password` (string): The password of the postgresql server
    - `database` (string): The database of the postgresql server

### Optional properties
- `query` (string): Raw query to execute
- `fields` (string): Columns that you want to retrieve data from.
- `where` (object): Object to filter the selection
- `limit` (number): Limitant to the amount of records to query


### Step Configuration

```json
{
    "name": "database/postgresql/query",
    "node": "database/postgresql/query@1.0.0",
    "type": "local"
}
```

### Node Configuration


```json
"postgresql-query": {
    {
        "connection": {
            "host": "127.0.0.1",
            "port": 5432,
            "user": "<user>",
            "password": "<password>",
            "database": "<database>"
        },
        "query": "SELECT * FROM test",
        "fields": "*",
        "table": "<table_name>",
        "where": {
            "id": 1
        },
        "limit": 10
    }
}
```
