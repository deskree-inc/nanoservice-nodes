// GraphqlResolvers.ts
/**
 * GraphQl module for handling query and mutation resolvers
 *
 * @module GraphqlResolvers
 */
import fileType from "file-type";
import { GraphQLObjectType } from "graphql";
import { v1 as uuidv1 } from "uuid";
import { StorageService } from "../../modules/@deskree-inc/storage-service";
import { Logger } from "../../logger@1.0.0/logger";
import { Utils, ResolversErrors } from "../helpers";
import { Error } from "../interfaces/Error";
import { GraphqlCheckPermissions } from "./graphqlCheckPermissions";
import _ from "lodash";

export class GraphqlResolvers {
    private logger;
    private resError = new ResolversErrors("graphqlResolvers.ts");
    private readonly collectionFields: Array<any>;
    private readonly collectionService;
    private readonly storageService;
    private checkPermissions!: GraphqlCheckPermissions;
    private config: any;
    private _PRIVATE_: any

    constructor(collectionFields: Array<any>, config: any, _PRIVATE_: any) {
        this._PRIVATE_ = _PRIVATE_;
        this.logger = new Logger("graphql-service", _PRIVATE_.get("gcp.project.id") as string);
        this.collectionFields = collectionFields;
        this.collectionService = _PRIVATE_.get("collectionService");
        this.storageService = new StorageService(
            _PRIVATE_.get("gcp.project.id") as string,
            _PRIVATE_.get("firebase.storage.bucket") as string,
            this.collectionService,
            _PRIVATE_.get("firebase.config")
        );
        this.config = config;
    }

    async initialize() {
        try {
            this.checkPermissions = new GraphqlCheckPermissions(this._PRIVATE_);
            await this.checkPermissions.initialize();
        } catch (e: any) {
            this.logger.log(this.logger.message.emergency, e.message, {
                file: "graphqlResolver.ts",
                line: "39",
                function: "initialize",
            });
            throw e;
        }
    }

    private checkWebhooks(collection: string, method: string): undefined | Record<string, Array<string>> {
        const collectionConfig = this.config.find((obj: any) => obj.name.toLowerCase() === collection.toLowerCase());
        if (
            collectionConfig &&
            Object.prototype.hasOwnProperty.call(collectionConfig, "webhooks") &&
            collectionConfig.webhooks[method].length > 0
        ) {
            return collectionConfig.webhooks[method];
        } else {
            return undefined;
        }
    }

    private async sendWebhooks(response: any, method: string, line: string, context: any, collectionName: string) {
        try {
            const webhooks = this.checkWebhooks(collectionName, method);
            this.logger.log(
                this.logger.message.info,
                { details: this.logger.getStatusMessage(200).details, code: 200 },
                {
                    file: "GraphqlResolvers.ts",
                    line: line,
                    function: `${method}MutationResolver`,
                },
                context,
                {
                    processed: this.logger.getDuration(context),
                    statusCode: 200,
                },
                [{ billable: "billable" }]
            );
            context["webhooksTriggered"] = 0;
            context["action"] = method;
            context["webhooks"] = webhooks;
            context["collection"] = collectionName;
            return response;
        } catch (e: any) {
            console.error(e);
            throw e;
        }
    }

    /**
     * Get collection document by UID or list of collection documents and all related files
     * @param field GraphQL field
     * @param models array of models
     * @param uid document uid if exist
     * @param page page number
     * @param limit number of documents per page
     * @param context GraphQL Context
     * @return document updated document
     */
    public async queryResolver(
        field: GraphQLObjectType,
        models: Array<any>,
        uid: string,
        page: number,
        limit: number,
        context: any
    ) {
        try {
            await this.checkPermissions.checkPermissions(context, uid);
            const collection_name: string = field.name;
            let response: any = {
                data: [],
            };
            // If UID is provided we get document by id
            if (uid) {
                const obj: Record<string, any> = {};
                const result: any = await this.getCollectionData({ name: collection_name }, models, context, uid);
                const data = result?.data;
                if (!data) {
                    this.logger.log(
                        this.logger.message.warning,
                        { details: this.logger.getStatusMessage(404).details, code: 404 },
                        {
                            file: "GraphqlResolvers.ts",
                            line: "189-210",
                            function: "queryResolver",
                        },
                        context,
                        { processed: this.logger.getDuration(context), statusCode: 404 },
                        [{ billable: "billable" }]
                    );
                    throw {
                        code: "404",
                        title: this.logger.getStatusMessage(404).details,
                        detail: "Request object was not found",
                    } as Error;
                }
                obj["uid"] = uid;
                delete data.uid;
                obj["attributes"] = data;
                response.data = [obj];
                // Otherwise we get list of documents in the collection
            } else {
                const collection = {
                    name: collection_name,
                    limit: {
                        limit: 50,
                        page: 1,
                    },
                };
                if (limit) {
                    collection.limit.limit = limit;
                }
                if (page) {
                    collection.limit["page"] = page;
                }
                response = await this.getCollectionData(collection, models, context);
            }

            this.logger.log(
                this.logger.message.info,
                { details: this.logger.getStatusMessage(200).details, code: 200 },
                {
                    file: "GraphqlResolvers.ts",
                    line: "64-107",
                    function: "queryResolver",
                },
                context,
                {
                    processed: this.logger.getDuration(context),
                    statusCode: 200,
                },
                [{ billable: "billable" }]
            );
            const data = await Promise.all(
                response.data.map((obj: any) =>
                    this.getReferenceFields(collection_name, { ...obj.attributes, uid: obj.uid }, models, context)
                )
            );
            return data;
        } catch (e: any) {
            if (e.hasOwnProperty("code") && e.hasOwnProperty("title") && e.hasOwnProperty("detail")) {
                this.logger.log(
                    e.code < 500 ? this.logger.message.warning : this.logger.message.error,
                    {
                        details: e.detail,
                        code: e.code,
                    },
                    {
                        file: "graphqlCheckPermissions.ts",
                        line: "",
                        function: "checkPermissions",
                    },
                    context,
                    {
                        processed: this.logger.getDuration(context),
                        statusCode: e.code,
                    },
                    [{ billable: "billable" }]
                );
                throw e as Error;
            } else if (e.message.includes("NOT_FOUND")) {
                this.logger.log(
                    this.logger.message.warning,
                    { details: this.logger.getStatusMessage(404).details, code: 404 },
                    {
                        file: "GraphqlResolvers.ts",
                        line: "189-210",
                        function: "queryResolver",
                    },
                    context,
                    { processed: this.logger.getDuration(context), statusCode: 404 },
                    [{ billable: "billable" }]
                );
                throw {
                    code: "404",
                    title: this.logger.getStatusMessage(404).details,
                    detail: "Request object was not found",
                } as Error;
            } else {
                this.logger.log(
                    this.logger.message.error,
                    e.message,
                    {
                        file: "GraphqlResolvers.ts",
                        line: "189-210",
                        function: "queryResolver",
                    },
                    context,
                    { processed: this.logger.getDuration(context), statusCode: 500 }
                );
                throw {
                    code: "500",
                    title: this.logger.getStatusMessage(500).details,
                    detail: e.message,
                } as Error;
            }
        }
    }

    public async getReferenceFields(
        collection_name: string,
        attributes: any,
        models: Array<any>,
        context: any
    ): Promise<any> {
        const databaseModel = this.config.find((c: any) => c.name === collection_name).model;
        for (const key in attributes) {
            const keyType = databaseModel[key].replace("?", "");
            const tableReference = keyType.match(/^(\w+)<.*/);
            if (!tableReference) {
                continue;
            }
            const result = this.collectionFields.find((obj) => {
                return obj.name === tableReference[1];
            });
            if (result && attributes[key]) {
                if (typeof attributes[key] === "string") {
                    let { uid, data } = await this.getCollectionData(
                        { name: result.name },
                        models,
                        context,
                        attributes[key]
                    );
                    if (!data) {
                        data = null;
                    } else {
                        data.uid = uid;
                    }
                    attributes[key] = data;
                } else if (Utils.checkForArray(attributes[key])) {
                    const list = [];
                    for (const item of attributes[key]) {
                        let { data, uid } = await this.getCollectionData(
                            { name: result.name.toLowerCase() },
                            models,
                            context,
                            item
                        );
                        if (!data) {
                            data = null;
                        } else {
                            data.uid = uid;
                        }
                        list.push(data);
                    }
                    attributes[key] = list;
                } else {
                    attributes[key] = null;
                }
            }
        }
        return attributes;
    }

    /**
     * Create collection document and all related files
     * @param field GraphQL field
     * @param models array of models
     * @param data document body data
     * @param context GraphQL Context
     * @return document updated document
     */
    public async createMutationResolver(field: GraphQLObjectType, models: Array<any>, data: any, context: any) {
        try {
            await this.checkPermissions.checkPermissions(context);
            const collection_name: string = field.name;
            const model = models.find((obj) => obj.name === collection_name);
            const storageExist = Utils.checkStorageType(model.model);
            if (
                Utils.checkForArray(storageExist) &&
                context.hasOwnProperty("storage_limit_hit") &&
                context.storage_limit_hit
            ) {
                return new Error(
                    "You have reached the storage limit for a Free project. Please, upgrade your project at deskree.com"
                );
            }
            const body: any = await this.createFile(storageExist, data, collection_name);
            // Add missing keys
            for (const key in model.model) {
                if (body[key] === undefined) {
                    const type = model.model[key].toLowerCase().replace("?", "");
                    if (type === "integer" || type === "float") {
                        body[key] = 0;
                    } else if (type !== "uid") {
                        body[key] = "";
                    }
                }
            }
            const collection: any = {
                name: collection_name,
                body: body,
            };
            const response = await this.collectionService.create(
                collection,
                null,
                model.config.createdAt,
                model.config.updatedAt,
                model.config.timezone
            );
            if (response) {
                collection["uid"] = response.uid;
                delete collection.body;
                const { data }: any = await this.collectionService.getAll(collection);
                if (data) {
                    data["uid"] = response.uid;
                    for (const key of storageExist) {
                        if (data[key] && data[key] !== "") {
                            const host = context.headers["deskree-main-domain"]
                                ? context.headers["deskree-main-domain"] + "/api/v1/rest"
                                : `https://${process.env.DESKREE_ID}.api.deskree.com/api/v1/rest`;
                            const result: any = this.createStorageUrl(key, data[key], host);
                            data[key] = result[0];
                        }
                    }
                    const result = await this.getReferenceFields(collection_name, data, models, context);
                    return await this.sendWebhooks(result, "post", "139", context, collection_name);
                }
                return new Error("Unable to retrieve an object");
            }
            return new Error("Unable to create an object");
        } catch (e: any) {
            if (e.hasOwnProperty("code") && e.hasOwnProperty("title") && e.hasOwnProperty("detail")) {
                throw this.resError.throwError(e, context, "createMutationResolver", "246", true) as Error;
            } else {
                throw this.resError.throwError(
                    {
                        code: "403",
                        title: this.logger.getStatusMessage(403).details,
                        detail: "Auth token has expired. Get a fresh ID token from your client app and try again.",
                    },
                    context,
                    "createMutationResolver",
                    "246",
                    true
                ) as Error;
            }
        }
    }

    /**
     * Update collection document by UID and all related files
     * @param field GraphQL field
     * @param models array of models
     * @param uid document uid
     * @param data document body data
     * @param context GraphQL Context
     * @return document updated document
     */
    public async updateMutationResolver(
        field: GraphQLObjectType,
        models: Array<any>,
        uid: string,
        data: any,
        context: any
    ) {
        const collection_name = field.name;
        const model = models.find((obj) => obj.name === collection_name);
        const storageExist = Utils.checkStorageType(model.model);
        if (collection_name === "users" && data.hasOwnProperty("email")) {
            delete data.email;
        }
        try {
            await this.checkPermissions.checkPermissions(context, uid);
            if (
                Utils.checkForArray(storageExist) &&
                context.hasOwnProperty("storage_limit_hit") &&
                context.storage_limit_hit
            ) {
                return new Error(
                    "You have reached the storage limit for a Free project. Please, upgrade your project at deskree.com"
                );
            }
            const body = await this.createFile(storageExist, data, collection_name);
            const collection: any = {
                name: collection_name,
                uid: uid,
                body: body,
            };
            const { data: currentData }: any = await this.collectionService.getAll(collection);
            for (const key of storageExist) {
                if (collection.body[key] && collection.body[key] !== "" && currentData[key]) {
                    const fileName = currentData[key];
                    await this.storageService.deleteFile(fileName);
                }
            }
            const response = await this.collectionService.update(
                collection,
                undefined,
                model.config.updatedAt,
                model.config.timezone
            );
            if (response) {
                delete collection.body;
                const { data }: any = await this.collectionService.getAll(collection);
                if (data) {
                    data["uid"] = uid;
                    for (const key of storageExist) {
                        if (data[key] && data[key] !== "") {
                            const host = context.headers["deskree-main-domain"]
                                ? context.headers["deskree-main-domain"] + "/api/v1/rest"
                                : `https://${process.env.DESKREE_ID}.api.deskree.com/api/v1/rest`;
                            const result: any = this.createStorageUrl(key, data[key], host);
                            data[key] = result[0];
                        }
                    }
                    const result = await this.getReferenceFields(collection_name, data, models, context);
                    return await this.sendWebhooks(result, "patch", "377", context, collection_name);
                }
                return new Error("Unable to retrieve an object");
            }
            return new Error("Unable to update an object");
        } catch (e: any) {
            if (e.hasOwnProperty("code") && e.hasOwnProperty("title") && e.hasOwnProperty("detail")) {
                throw this.resError.throwError(e, context, "updateMutationResolver", "347", true) as Error;
            } else if (e.message.includes("NOT_FOUND")) {
                throw this.resError.throwError(
                    {
                        code: "404",
                        title: this.logger.getStatusMessage(404).details,
                        detail: "Requested object was not found",
                    },
                    context,
                    "updateMutationResolver",
                    "347",
                    true
                ) as Error;
            } else {
                throw this.resError.throwError(
                    {
                        code: "500",
                        title: this.logger.getStatusMessage(500).details,
                        detail: e.message,
                    },
                    context,
                    "updateMutationResolver",
                    "347",
                    true
                ) as Error;
            }
        }
    }

    /**
     * Delete collection document and all related files
     * @param field GraphQL field
     * @param models array of models
     * @param uid document uid
     * @param context GraphQL Context
     * @return message document deleted
     */
    public async deleteMutationResolver(field: GraphQLObjectType, models: Array<any>, uid: string, context: any) {
        try {
            await this.checkPermissions.checkPermissions(context, uid);
            const collection_name = field.name;
            const collection = {
                name: collection_name,
                uid: uid,
            };
            const model = models.find((obj) => obj.name === collection_name);
            const storageExist = Utils.checkStorageType(model.model);
            const { data: currentData }: any = await this.collectionService.getAll(collection);
            if (!currentData) {
                throw this.resError.throwError(
                    {
                        code: "404",
                        title: this.logger.getStatusMessage(404).details,
                        detail: "Requested object was not found",
                    },
                    context,
                    "deleteMutationResolver",
                    "419",
                    true
                ) as Error;
            }
            for (const key of storageExist) {
                const fileName = currentData[key];
                if (fileName && fileName !== "") {
                    await this.storageService.deleteFile(fileName);
                }
            }
            await this.collectionService.delete(collection);
            return await this.sendWebhooks(
                `${uid} from ${collection_name} deleted`,
                "delete",
                "428",
                context,
                collection_name
            );
        } catch (e: any) {
            if (e.hasOwnProperty("code") && e.hasOwnProperty("title") && e.hasOwnProperty("detail")) {
                throw this.resError.throwError(e, context, "deleteMutationResolver", "419", true) as Error;
            } else if (e.message.includes("NOT_FOUND")) {
                throw this.resError.throwError(
                    {
                        code: "404",
                        title: this.logger.getStatusMessage(404).details,
                        detail: "Requested object was not found",
                    },
                    context,
                    "deleteMutationResolver",
                    "419",
                    true
                ) as Error;
            } else {
                throw this.resError.throwError(
                    {
                        code: "500",
                        title: this.logger.getStatusMessage(500).details,
                        detail: e.message,
                    },
                    context,
                    "updateMutationResolver",
                    "419",
                    true
                ) as Error;
            }
        }
    }

    private createStorageUrl(fieldName: string, imagePath: string, host: string) {
        return [`${host}/storage/${fieldName}/${imagePath.replace("/", "_")}`];
    }

    /**
     * Get Firebase Collection Data by UID
     * @param collection_base collection base object
     * @param uid uid of a document in collection
     * @param models array of collection configs
     * @return returns data object
     */
    private async getCollectionData(collection_base: any, models: Array<any>, req: any, uid?: String) {
        const collection = collection_base;
        const model = models.find((obj) => obj.name.toLowerCase() === collection_base.name.toLowerCase());
        if (model === undefined) {
            return new Error("Unable to find database table model");
        }
        const storageExist = Utils.checkStorageType(model.model);
        if (uid) {
            collection["uid"] = uid;
        }
        try {
            const response: any = await this.collectionService.getAll(collection);
            if (response && response?.data && Array.isArray(response.data)) {
                // check whether the model contains any storage data types
                for (const doc of response.data) {
                    const attributes = doc.attributes;
                    if (Utils.checkForArray(storageExist)) {
                        for (const key of storageExist) {
                            if (attributes[key] && attributes[key] !== "") {
                                const host = req.headers["deskree-main-domain"]
                                    ? req.headers["deskree-main-domain"] + "/api/v1/rest"
                                    : `https://${process.env.DESKREE_ID}.api.deskree.com/api/v1/rest`;
                                const result: any = this.createStorageUrl(key, attributes[key], host);
                                attributes[key] = result[0];
                            }
                        }
                    }
                }
                return response;
            } else if (response && response?.data) {
                response.uid = uid;
                if (Utils.checkForArray(storageExist)) {
                    for (const key of storageExist) {
                        if (response.data[key] && response.data[key] !== "") {
                            const host = req.headers["deskree-main-domain"]
                                ? req.headers["deskree-main-domain"] + "/api/v1/rest"
                                : `https://${process.env.DESKREE_ID}.api.deskree.com/api/v1/rest`;
                            const result: any = await this.createStorageUrl(key, response.data[key], host);
                            response.data[key] = result[0];
                        }
                    }
                }
                return response;
            }
        } catch (e: any) {
            this.logger.log(this.logger.message.error, e.message, {
                file: "GraphqlResolvers.ts",
                line: "304-324",
                function: "getCollectionData",
            });
            throw e;
        }
    }

    /**
     * Create necessary files & setup collection object
     * @param storageExist Array of storage fields from the model
     * @param body Request body
     * @param collection name of the collection
     * @return Collection collection body
     */
    private async createFile(storageExist: Array<string>, body: Record<string, any>, collection: string) {
        try {
            if (Utils.checkForArray(storageExist)) {
                for (const key of storageExist) {
                    if (body[key] && Utils.checkFileType(body[key]) === "base64") {
                        const buffer = Buffer.from(body[key], "base64");
                        const res = await fileType.fromBuffer(buffer);
                        const type = res?.ext || "";
                        const uid = uuidv1();
                        body[key] = await this.storageService.uploadFile(body[key], `${collection}/${uid}.${type}`);
                    } else if (body[key] && Utils.checkFileType(body[key]) === "url") {
                        const type = body[key].split(/[#?]/)[0].split(".").pop().trim();
                        const uid = uuidv1();
                        body[key] = await this.storageService.uploadFile(body[key], `${collection}/${uid}.${type}`);
                    }
                }
            }
            return body;
        } catch (e: any) {
            /* istanbul ignore next */
            this.logger.log(this.logger.message.error, e.message, {
                file: "GraphqlResolvers.ts",
                line: "354-360",
                function: "createFile",
            });
            /* istanbul ignore next */
            throw e;
        }
    }
}
