// Logger.ts
/**
 * This is a logging class that creates logs according to GCP Logging standards
 *
 * @module Logger
 */
import { message, sourceLocation } from "./interfaces/Log";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

export class Logger {
    private readonly service;
    private readonly project_id;
    public message = {
        default: "DEFAULT",
        debug: "DEBUG",
        info: "INFO",
        notice: "NOTICE",
        warning: "WARNING",
        error: "ERROR",
        critical: "CRITICAL",
        alert: "ALERT",
        emergency: "EMERGENCY",
    };

    constructor(service: string, project_id: string = "deskree-gcp") {
        dayjs.extend(utc);
        dayjs.extend(timezone);
        this.service = service;
        this.project_id = project_id;
    }

    /**
     * Create console.log following GCP Logging Guidelines
     * @param severity string as 'DEFAULT' | 'DEBUG' | 'INFO' | 'NOTICE' | 'WARNING' | 'ERROR' | 'CRITICAL' | 'ALERT' | 'EMERGENCY'
     * @param message log entry message
     * @param sourceLocation object containing file name, line number, and function name
     * @param req? optional Express request
     * @param res? optional Express response
     * @param labels array of labels objects
     */
    public log(
        severity: any,
        message: message | string,
        sourceLocation: sourceLocation,
        req?: any,
        res?: any,
        labels?: object[]
    ) {
        const now = dayjs().format("YYYY-MM-DD HH:mm:ss");
        const tz = "America/Toronto";
        if (typeof message === "string") {
            message = {
                details: message,
                code: 500,
            };
        }
        const error: any = {
            severity: severity,
            message: message,
            time: dayjs(now).tz(tz).format(),
            httpRequest: {},
            labels: {
                service: this.service,
                project_id: this.project_id,
                logger: "@deskree-inc/logger",
            },
            sourceLocation: sourceLocation,
        };
        if (req) {
            let ip: string | string[] = req.hasOwnProperty("ip") ? req.ip : "";
            if (req.headers && req.headers["x-forwarded-for"] !== undefined) {
                ip = req.headers["x-forwarded-for"];
            }

            let protocol: string | string[] = req.hasOwnProperty("protocol") ? req.protocol : "";
            if (req.headers && req.headers["x-forwarded-proto"] !== undefined) {
                protocol = req.headers["x-forwarded-proto"];
            }

            error.httpRequest["requestMethod"] = req?.method ? req.method : undefined;
            error.httpRequest["requestUrl"] = this.createRequestUrl(req);
            error.httpRequest["remoteIp"] = ip;
            error.httpRequest["protocol"] = protocol;
            if (req.headers) {
                error.httpRequest["requestSize"] = req.headers["content-length"]
                    ? req.headers["content-length"]
                    : undefined;
                error.httpRequest["userAgent"] = req.headers["user-agent"] ? req.headers["user-agent"] : undefined;
                error.httpRequest["referer"] = req.headers.referer ? req.headers.referer : undefined;
            }
        }
        if (res) {
            error.httpRequest["latency"] = res.processed ? res.processed : undefined;
            error.httpRequest["status"] = res.statusCode ? res.statusCode : undefined;
        }
        if (labels) {
            for (const label of labels) {
                error["labels"] = { ...error["labels"], ...label };
            }
        }
        console.log(JSON.stringify(error));
    }

    /**
     * Get a status message based on status code
     * @param status Status code of http response
     * @return string number of milliseconds
     **/
    public getStatusMessage(status: number): message {
        switch (status) {
            // 200 codes
            case 200: {
                return { details: "OK", code: 200 };
            }
            case 201: {
                return { details: "Create", code: 201 };
            }
            case 202: {
                return { details: "Accepted", code: 202 };
            }
            case 203: {
                return { details: "Non-Authoritative Information", code: 203 };
            }
            case 204: {
                return { details: "No content", code: 204 };
            }
            case 205: {
                return { details: "Reset content", code: 205 };
            }
            case 206: {
                return { details: "Partial Content", code: 206 };
            }
            // 300 codes
            case 300: {
                return { details: "Multiple choice", code: 300 };
            }
            case 301: {
                return { details: "Moved Permanently", code: 301 };
            }
            case 302: {
                return { details: "Found", code: 302 };
            }
            case 303: {
                return { details: "See Other", code: 303 };
            }
            case 304: {
                return { details: "Not Modified", code: 304 };
            }
            case 307: {
                return { details: "Temporary Redirect", code: 307 };
            }
            case 308: {
                return { details: "Permanent Redirect", code: 308 };
            }
            // 400 codes
            case 400: {
                return { details: "Bad Request", code: 400 };
            }
            case 401: {
                return { details: "Unauthorized", code: 401 };
            }
            case 402: {
                return { details: "Payment Required", code: 402 };
            }
            case 403: {
                return { details: "Forbidden", code: 403 };
            }
            case 404: {
                return { details: "Not found", code: 404 };
            }
            case 405: {
                return { details: "Method Not Allowed", code: 405 };
            }
            case 406: {
                return { details: "Not Acceptable", code: 406 };
            }
            case 407: {
                return { details: "Proxy Authentication Required", code: 407 };
            }
            case 408: {
                return { details: "Request Timeout", code: 408 };
            }
            case 409: {
                return { details: "Conflict", code: 409 };
            }
            case 410: {
                return { details: "Gone", code: 410 };
            }
            case 411: {
                return { details: "Length Required", code: 411 };
            }
            case 412: {
                return { details: "Precondition Failed", code: 412 };
            }
            case 413: {
                return { details: "Payload Too Large", code: 413 };
            }
            case 414: {
                return { details: "URI Too Long", code: 414 };
            }
            case 415: {
                return { details: "Unsupported Media Type", code: 415 };
            }
            case 416: {
                return { details: "Range Not Satisfiable", code: 416 };
            }
            case 417: {
                return { details: "Expectation Failed", code: 417 };
            }
            case 418: {
                return { details: "I'm a teapot", code: 418 };
            }
            case 422: {
                return { details: "Unprocessable Entity", code: 422 };
            }
            case 426: {
                return { details: "Upgrade Required", code: 426 };
            }
            case 428: {
                return { details: "Precondition Required", code: 428 };
            }
            case 429: {
                return { details: "Too Many Requests", code: 429 };
            }
            case 431: {
                return { details: "Request Header Fields Too Large", code: 431 };
            }
            case 451: {
                return { details: "Unavailable For Legal Reasons", code: 451 };
            }
            // 500 codes
            case 500: {
                return { details: "Internal Server Error", code: 500 };
            }
            case 501: {
                return { details: "Not Implemented", code: 501 };
            }
            case 502: {
                return { details: "Bad Gateway", code: 502 };
            }
            case 503: {
                return { details: "Service Unavailable", code: 503 };
            }
            case 504: {
                return { details: "Gateway Timeout", code: 504 };
            }
            case 505: {
                return { details: "HTTP Version Not Supported", code: 505 };
            }
            case 506: {
                return { details: "Variant Also Negotiates", code: 506 };
            }
            case 507: {
                return { details: "Insufficient Storage", code: 507 };
            }
            case 508: {
                return { details: "Loop Detected", code: 508 };
            }
            case 510: {
                return { details: "Not Extended", code: 510 };
            }
            case 511: {
                return { details: "Network Authentication Required", code: 511 };
            }
            default: {
                return { details: "Unknown status code", code: 500 };
            }
        }
    }

    public createRequestUrl(req: any): string {
        if (req.originalUrl) {
            if (req?.originalUrl.includes("deskree-rest-api-service-v1")) {
                return `/v1/rest/collections/${req?.headers?.collection}${
                    req?.headers?.uid ? `/${req?.headers?.uid}` : ""
                }${req?.originalUrl.includes("?") ? `?${req?.originalUrl.split("?")[1]}` : ""}`;
            } else if (req?.originalUrl.includes("deskree-rest-api-service-postman-v1")) {
                return `/v1/rest/postman`;
            } else if (req?.originalUrl.includes("deskree-rest-api-service-storage-v1")) {
                return `/v1/rest/storage${req?.originalUrl.split("deskree-rest-api-service-storage-v1/storage")[1]}`;
            } else if (req?.originalUrl.includes("deskree-graphql-service-v1")) {
                return `/v1/graphql`;
            } else if (req?.originalUrl.includes("deskree-graphql-service-schema-v1")) {
                return `/v1/graphql/schema`;
            }
        }

        return req.originalUrl ? req.originalUrl : undefined;
    }

    /**
     * Calculate the duration and convert it to seconds as string
     * @param req Express request
     * @return string number of milliseconds
     **/
    public getDuration(req: any): string {
        const seconds = new Date().getTime() - req.processed;
        const milliseconds = parseFloat((seconds / 1000).toFixed(9));
        return `${milliseconds.toString()}s`;
    }
}
