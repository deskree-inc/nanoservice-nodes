# Configuration Options

The Pub/Sub node enables you to send messages to the topic; however, it does not support subscribing to that specific topic.

### Required properties

-   `topic` (string): The name of the topic where we're going to send the message

### Optional properties

-   `pubSubCredentials` (ClientConfig): Pub/Sub credentials configuration
-   `data` (string | object | array): The data to be sent to the pubsub topic

## Usage/Examples

### Step Configuration

```json
{
    "name": "pubsub",
    "node": "google/pubsub@1.0.0",
    "type": "local"
}
```

### Node Configuration

```json
"pubsub": {
    "inputs": {
        "pubSubCredentials": {
            "projectId": "<projectId>",
            "keyFilename": "<keyFilename>"
        },
        "topic": "<topic>",
        "data": "<data>"
    }
}
```
