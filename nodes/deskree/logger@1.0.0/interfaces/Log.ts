export interface Log {
    severity: 'DEFAULT' | 'DEBUG' | 'INFO' | 'NOTICE' | 'WARNING' | 'ERROR' | 'CRITICAL' | 'ALERT' | 'EMERGENCY'
    message: message
    httpRequest?: httpRequest | {}
    time: string
    labels: object
    sourceLocation: sourceLocation
}

/**
 * severity strings explained:
 * DEFAULT	(0) The log entry has no assigned severity level.
 * DEBUG	(100) Debug or trace information.
 * INFO	(200) Routine information, such as ongoing status or performance.
 * NOTICE	(300) Normal but significant events, such as start up, shut down, or a configuration change.
 * WARNING	(400) Warning events might cause problems.
 * ERROR	(500) Error events are likely to cause problems.
 * CRITICAL	(600) Critical events cause more severe problems or outages.
 * ALERT	(700) A person must take an action immediately.
 * EMERGENCY	(800) One or more systems are unusable.
 */

interface httpRequest {
    requestMethod: string,
    requestUrl: string,
    requestSize?: string,
    status: number,
    responseSize?: string,
    userAgent?: string,
    remoteIp?: string,
    serverIp?: string,
    referer?: string,
    latency: string,
    cacheLookup?: boolean,
    cacheHit?: boolean,
    cacheValidatedWithOriginServer?: boolean,
    cacheFillBytes?: string,
    protocol: string
}

/**
 * requestMethod - The request method. Examples: "GET", "HEAD", "PUT", "POST".
 * requestUrl - The scheme (http, https), the host name, the path and the query portion of the URL that was requested. Example: "http://example.com/some/info?color=red".
 * requestSize - The size of the HTTP request message in bytes, including the request headers and the request body.
 * status - The response code indicating the status of response. Examples: 200, 404.
 * responseSize - The size of the HTTP response message sent back to the client, in bytes, including the response headers and the response body.
 * userAgent - The user agent sent by the client. Example: "Mozilla/4.0 (compatible; MSIE 6.0; Windows 98; Q312461; .NET CLR 1.0.3705)".
 * remoteIp - The IP address (IPv4 or IPv6) of the client that issued the HTTP request. This field can include port information. Examples: "192.168.1.1", "10.0.0.1:80", "FE80::0202:B3FF:FE1E:8329".
 * serverIp - The IP address (IPv4 or IPv6) of the origin server that the request was sent to. This field can include port information. Examples: "192.168.1.1", "10.0.0.1:80", "FE80::0202:B3FF:FE1E:8329".
 * referer - The referer URL of the request, as defined in HTTP/1.1 Header Field Definitions.
 * latency - The request processing latency on the server, from the time the request was received until the response was sent. A duration in seconds with up to nine fractional digits, terminated by 's'. Example: "3.5s".
 * cacheLookup - Whether or not a cache lookup was attempted.
 * cacheHit - Whether or not an entity was served from cache (with or without validation).
 * cacheValidatedWithOriginServer - Whether or not the response was validated with the origin server before being served from cache. This field is only meaningful if cacheHit is True.
 * cacheFillBytes - The number of HTTP response bytes inserted into cache. Set only when a cache fill was attempted.
 * protocol - Protocol used for the request. Examples: "HTTP/1.1", "HTTP/2", "websocket"
 */

export interface sourceLocation {
    file: string
    line: string
    function: string
}

export interface message {
    details: string
    code: number
}