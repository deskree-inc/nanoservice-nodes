# Configuration Options
The Mysql-delete node allows you to delete a record from a table.

### Required properties
- `connecetion` (object): Connection details required
    - `host` (string): The host of the Mysql server
    - `port` (string): the port of the Mysql server
    - `user` (string): The user of the Mysq server
    - `password` (string): The password of the Mysql server
    - `database` (string): The database of the Mysql server

### Optional properties
- `table` (string): Name of the table you want to execute the query
- `where` (object | string): Object to filter o raw SQL filtering string 


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
