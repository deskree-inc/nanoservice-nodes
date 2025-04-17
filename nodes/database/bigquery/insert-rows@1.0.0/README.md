# Configuration Options

This function manages the process of inserting data into Google BigQuery. It handles the entire workflow from validating input to creating necessary structures and inserting data

### Required properties

-   `datasetId *` (string): The dataset id.
-   `tableId *` (string): The table id.
-   `tableOptions *` (object): The options of the table.
-   `tableOptions.location *` (string): The location of the table.
-   `tableOptions.schema *` (any): A comma-separated list of name:type pairs. Valid types are "string", "integer", "float", "boolean", and "timestamp". If the type is omitted, it is assumed to be "string". Example: "name:string, age:integer". Schemas can also be specified as a JSON array of fields, which allows for nested and repeated fields.
-   `rows *` (any): The rows to insert in the table

## Usage/Examples

### Step Configuration

```json
{
    "name": "bigquery-insert-row",
    "node": "database/bigquery/insert-rows@1.0.0",
    "type": "local"
}
```

### Node Configuration

```json
"bigquery-insert-row": {
    "inputs": {
        "properties": {
            "datasetId": "dataset",
            "datasetOptions": {
                "location": "US"
            },
            "tableId": "table",
            "tableOptions": {
                "location": "US",
                "schema": [
                    {
                        "name": "name",
                        "type": "STRING"
                    },
                    {
                        "name": "age",
                        "type": "INTEGER"
                    }
                ]
            },
            "rows": [
                {
                    "name": "John",
                    "age": 30
                },
                {
                    "name": "Jane",
                    "age": 25
                }
            ]
        }
    }
}
```
