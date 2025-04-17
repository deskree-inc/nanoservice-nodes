# Configuration Options
The postgresql-rest node allows you with a single node create a restful api.

This node will use the querystrings as its main source of filtering

`http://localhost:4001/postgresql_rest?id=1` will generate a query similtar to `SELECT * FROM Table WHERE id=1`

### Required properties
- `connecetion` (object): Connection details required
    - `host` (string): The host of the postgresql server
    - `port` (string): the port of the postgresql server
    - `user` (string): The user of the Mysq server
    - `password` (string): The password of the postgresql server
    - `database` (string): The database of the postgresql server

### Optional properties
- `table` (string): The table name where you want to run the query


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
        "table": "<table_name>"
    }
}
```
