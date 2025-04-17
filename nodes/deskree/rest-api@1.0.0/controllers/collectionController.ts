// collectionController.ts
/**
 * This is the controller for managing collection data
 *
 * @module CollectionController
 */
//@ts-ignore
import { Logger } from "../../logger@1.0.0/logger";
import IControllerBase from "../interfaces/IControllerBase";
import { CollectionModel } from "../models/collectionModel";
import { ResError, GetConfigData, requestNotFound } from "../helpers";

export default class CollectionController implements IControllerBase {
    protected logger;
    private collection;
    private resError;
    private configData;

    constructor(_PRIVATE_?: any) {
        this.collection = new CollectionModel(_PRIVATE_);
        this.configData = new GetConfigData(_PRIVATE_.get("collectionService"));
        this.resError = new ResError("collectionController.ts");
        this.logger = new Logger("rest", process.env.PROJECT_ID as string);
    }

    public async init(method: string, req: any) {
        switch (method) {
            case "GET":
                return await this.getAll(req);
            case "POST":
                return await this.post(req);
            case "PATCH":
                return await this.patch(req);
            case "DELETE":
                return await this.delete(req);
            default:
                return requestNotFound();
        }
    }

    async initialize() {
        try {
            await this.configData.getConfigData();
            this.configData.listenForChanges();
        } catch (e) {
            throw e;
        }
    }

    /**
     * Function to process error requests
     * @param e: Http Error object
     * @param req: Express Request
     * @param res: Express Response
     * @param functionName: Name of the function that throws an error
     * @param line: Code line where the error originates
     */
    public catchError(e: any, req: any, functionName: string, line: string) {
        if (e.hasOwnProperty("message") && e.message !== undefined && e.message.hasOwnProperty("NOT_FOUND")) {
            return this.resError.sendErrorResponse(req, 404, functionName, line, true, e.message);
        } else if (e.hasOwnProperty("code") && e.hasOwnProperty("message")) {
            return this.resError.sendErrorResponse(req, e.code, functionName, line, true, e.message);
        } else if (e.hasOwnProperty("code") && e.hasOwnProperty("detail") && e.hasOwnProperty("title")) {
            return this.resError.sendErrorResponse(req, parseInt(e.code), functionName, line, true, e.detail, e.title);
        } else if (
            e.hasOwnProperty("response") &&
            e.response.hasOwnProperty("data") &&
            e.response.data.hasOwnProperty("message") &&
            e.hasOwnProperty("code")
        ) {
            return this.resError.sendErrorResponse(req, e.code, functionName, line, true, e.response.data.message);
        } else if (e.hasOwnProperty("errorInfo") && e.errorInfo.hasOwnProperty("message")) {
            return this.resError.sendErrorResponse(req, 422, functionName, line, true, e.errorInfo.message);
        } else {
            return this.resError.sendErrorResponse(req, 500, functionName, line, false, e.message);
        }
    }

    private checkWebhooks(req: any, method: string): Record<string, Array<string>> | undefined {
        const collectionConfig = this.configData.config!.find(
            (obj) => obj.name.toLowerCase() === req.headers.collection.toLowerCase()
        );
        if (
            collectionConfig &&
            Object.prototype.hasOwnProperty.call(collectionConfig, "webhooks") &&
            Object.prototype.hasOwnProperty.call(collectionConfig.webhooks, method) &&
            collectionConfig.webhooks[method].length > 0
        ) {
            return collectionConfig.webhooks[method];
        } else {
            return undefined;
        }
    }

    private async createResponse(req: any, response: any, method: string, line: string) {
        try {
            const webhooks = this.checkWebhooks(req, method);
            this.logger.log(
                this.logger.message.info,
                this.logger.getStatusMessage(200),
                {
                    file: "collectionController.ts",
                    line: line,
                    function: method,
                },
                req,
                undefined,
                [{ billable: "billable" }]
            );

            const send = {
                data: response.hasOwnProperty("data") ? response.data : response,
                meta: response.hasOwnProperty("meta") ? response.meta : {},
                webhooks,
            };
            if (response.hasOwnProperty("uid")) {
                send.data["uid"] = response.uid;
            }
            if (response.hasOwnProperty("errors")) {
                // @ts-ignore
                send["errors"] = response.errors;
            }
            return send;
        } catch (e: any) {
            return {
                error: [
                    {
                        code: 500,
                        title: "Internal Server Error",
                        detail: e.message,
                    },
                ],
                code: 500,
            };
        }
    }

    /**
     * Get list of all collection items or collection item by id
     * @param req Express Request
     * @param res Express Response
     * @param next Express Next
     */
    public async getAll(req: any) {
        try {
            const data = await this.collection.get(req);
            if (data) {
                this.logger.log(
                    this.logger.message.info,
                    this.logger.getStatusMessage(200),
                    {
                        file: "collectionController.ts",
                        line: "135",
                        function: "getAll",
                    },
                    req,
                    undefined,
                    [{ billable: "billable" }]
                );
                return data;
            } else {
                return this.resError.sendErrorResponse(req, 404, "getAll", "137", true, "Requested object not found");
            }
        } catch (e) {
            return this.catchError(e, req, "getAll", "135");
        }
    }

    /**
     * Create new collection item
     * @param req Express Request
     * @param res Express Response
     * @param next Express Next
     */
    public async post(req: any) {
        const method = "post";
        try {
            if (this.configData.config.length === 0) {
                await this.initialize();
            }
            if (Object.keys(req.body).length !== 0) {
                const response = await this.collection.create(req);
                // res["processed"] = this.logger.getDuration(req);
                if (response) {
                    return await this.createResponse(req, response, method, "166");
                } else {
                    return this.resError.sendErrorResponse(req, 500, method, "168", true, "Unable to create an object");
                }
            }
            return this.resError.sendErrorResponse(req, 422, method, "165", true, "Please provide request body");
        } catch (e) {
            return this.catchError(e, req, method, "166");
        }
    }

    /**
     * Update collection item by id
     * @param req Express Request
     * @param res Express Response
     * @param next Express Next
     */
    public async patch(req: any) {
        const method = "patch";
        try {
            if (this.configData.config.length === 0) {
                await this.initialize();
            }
            if (req.headers.uid && Object.keys(req.body).length !== 0) {
                const data = await this.collection.update(req);
                // res["processed"] = this.logger.getDuration(req);
                if (data.hasOwnProperty("code") && data.hasOwnProperty("detail") && Object.keys(data).length === 2) {
                    this.logger.log(
                        this.logger.message.warning,
                        this.logger.getStatusMessage(data.code),
                        {
                            file: "collectionController.ts",
                            line: "196",
                            function: method,
                        },
                        req,
                        undefined,
                        [{ billable: "billable" }]
                    );
                    return {
                        errors: [
                            {
                                code: data.code.toString(),
                                title: this.logger.getStatusMessage(data.code).details,
                                detail: data.detail,
                            },
                        ],
                        code: data.code,
                    };
                } else {
                    return await this.createResponse(req, data, method, "194");
                }
            } else {
                return this.resError.sendErrorResponse(req, 422, method, "193", true, "Please provide object UID");
            }
        } catch (e) {
            return this.catchError(e, req, method, "194");
        }
    }

    /**
     * Delete collection item by id
     * @param req Express Request
     * @param res Express Response
     * @param next Express Next
     */
    public async delete(req: any) {
        const method = "delete";
        try {
            if (this.configData.config.length === 0) {
                await this.initialize();
            }
            if (req.headers.uid) {
                const result = await this.collection.delete(req);
                // res["processed"] = this.logger.getDuration(req);
                if (result === null) {
                    return await this.createResponse(
                        req,
                        {
                            uid: req.headers.uid,
                            resource: req.headers.collection,
                        },
                        method,
                        "233"
                    );
                } else {
                    this.logger.log(
                        this.logger.message.warning,
                        this.logger.getStatusMessage(result.code),
                        {
                            file: "collectionController.ts",
                            line: "235",
                            function: method,
                        },
                        req,
                        undefined,
                        [{ billable: "billable" }]
                    );
                    return {
                        errors: [
                            {
                                code: result.code.toString(),
                                title: this.logger.getStatusMessage(result.code).details,
                                detail: result.detail,
                            },
                        ],
                        code: result.code,
                    };
                }
            } else {
                return this.resError.sendErrorResponse(req, 422, method, "232", true, "Please provide object UID");
            }
        } catch (e) {
            return this.catchError(e, req, method, "233");
        }
    }
}
