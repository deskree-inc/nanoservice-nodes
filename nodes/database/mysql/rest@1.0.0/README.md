# Configuration Options
The Mysql-rest node allows you with a single node create a restful api.

This node will use the querystrings as its main source of filtering

`http://localhost:4001/mysql_rest?id=1` will generate a query similtar to `SELECT * FROM Table WHERE id=1`

### Required properties
- `connecetion` (object): Connection details required
    - `host` (string): The host of the Mysql server
    - `port` (string): the port of the Mysql server
    - `user` (string): The user of the Mysq server
    - `password` (string): The password of the Mysql server
    - `database` (string): The database of the Mysql server

### Optional properties
- `table` (string): The table name where you want to run the query


### Step Configuration

```json
{
    "name": "database/mysql/query",
    "node": "database/mysql/query@1.0.0",
    "type": "local"
}
```

### Node Configuration


```json
"mysql-query": {
    {
        "connection": {
            "host": "127.0.0.1",
            "port": 3306,
            "user": "<user>",
            "password": "<password>",
            "database": "<database>"
        },
        "table": "<table_name>"
    }
}
```
