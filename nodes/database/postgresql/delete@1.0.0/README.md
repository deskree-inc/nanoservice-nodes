# Configuration Options
The postgresql-delete node allows you to delete a record from a table.

### Required properties
- `connecetion` (object): Connection details required
    - `host` (string): The host of the postgresql server
    - `port` (string): the port of the postgresql server
    - `user` (string): The user of the Mysq server
    - `password` (string): The password of the postgresql server
    - `database` (string): The database of the postgresql server

### Optional properties
- `table` (string): Name of the table you want to execute the query
- `where` (object | string): Object to filter o raw SQL filtering string 


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
