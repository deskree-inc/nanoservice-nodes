# Configuration Options
The Mysql-query node allows you update a record in a mysql database

### Required properties
- `connecetion` (object): Connection details required
    - `host` (string): The host of the Mysql server
    - `port` (string): the port of the Mysql server
    - `user` (string): The user of the Mysq server
    - `password` (string): The password of the Mysql server
    - `database` (string): The database of the Mysql server

### Optional properties
- `query` (string): Raw query to execute
- `fields` (string): Columns that you want to retrieve data from.
- `where` (object): Object to filter the selection
- `limit` (number): Limitant to the amount of records to query


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
