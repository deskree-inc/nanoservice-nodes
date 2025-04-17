// collectionModel.ts

/**
 * This is the business logic for collection and storage functions
 *
 * @module CollectionModel
 */

//@ts-ignore
import { StorageService } from "../../modules/@deskree-inc/storage-service/storageService";
import * as mime from "mime-types";
import { v1 as uuidv1 } from "uuid";
import fileType from "file-type";
import { Utils } from "../helpers";
import { FirestoreIndexFieldInterface, Collection } from "../interfaces";
import { BaseModel } from "./baseModel";
import {
    CreateCollection,
    DeleteCollection,
    EditCollection,
} from "../../modules/@deskree-inc/collection-service/interfaces";

export class CollectionModel extends BaseModel {
    private collection;
    private storage;

    constructor(_PRIVATE_: any) {
        super();
        this.collection = _PRIVATE_.get("collectionService");
        this.storage = new StorageService(
            _PRIVATE_.get("gcp.project.id"),
            _PRIVATE_.get("firebase.storage.bucket"),
            this.collection,
            _PRIVATE_.get("firebase.config")
        );
    }

    private parseCollection(req: any): Collection {
        return {
            name: req.headers.collection,
            uid: req.headers.uid,
            query: req.headers.hasOwnProperty("where") ? JSON.parse(req.headers.where) : undefined,
            includes: req.headers.hasOwnProperty("includes") ? JSON.parse(req.headers.includes) : undefined,
            sorted: req.headers.hasOwnProperty("sorted") ? JSON.parse(req.headers.sorted) : undefined,
            limit: {
                page:
                    req.hasOwnProperty("query") && req.query.hasOwnProperty("page")
                        ? parseInt(req.query.page)
                        : undefined,
                limit:
                    req.hasOwnProperty("query") && req.query.hasOwnProperty("limit")
                        ? parseInt(req.query.limit)
                        : undefined,
            },
        } as Collection;
    }

    public async getFileStorageUrl(fieldName: string, imagePath: string) {
        let storageExist = [fieldName + ""];
        let includesStorageExist = {};
        let data: { meta: Record<string, any>; data: Record<string, any> } = {
            meta: {
                includesCount: 0,
                total: 1,
                limit: 1,
                page: 1,
            },
            data: {},
        };

        data.data[fieldName] = imagePath;

        try {
            const result = await this.populateStorageFields(data, storageExist, includesStorageExist);
            return result;
        } catch (e) {
            console.log("ERROR collectionModel.getFileStorageUrl", e);
            throw e;
        }
    }

    private createStorageUrl(fieldName: string, imagePath: string, host: string) {
        return [`${host}/storage/${fieldName}/${imagePath.replace("/", "_")}`];
    }

    private async populateUrlFields(
        data: any,
        storageExist: Array<string>,
        includesStorageExist: Record<string, any>,
        host: string
    ) {
        try {
            if (Utils.checkForArray(storageExist) || Object.keys(includesStorageExist).length > 0) {
                // Check if it is a get all request
                if (Utils.checkForArray(data.data)) {
                    for (const obj of data.data) {
                        for (const key of storageExist) {
                            if (obj.attributes[key] && obj.attributes[key] !== "") {
                                const result = this.createStorageUrl(key, obj.attributes[key], host);
                                obj.attributes[key] = result[0];
                            }
                        }
                        // Includes storage URLs
                        if (Utils.objectIsNotEmpty(includesStorageExist)) {
                            for (const ref in includesStorageExist) {
                                if (obj.attributes[ref] && typeof obj.attributes[ref] === "object") {
                                    // One to many
                                    if (Utils.checkForArray(obj.attributes[ref])) {
                                        for (const item of obj.attributes[ref]) {
                                            if (
                                                Utils.objectContainsKey(item, "attributes") &&
                                                Utils.objectIsNotEmpty(item.attributes) &&
                                                includesStorageExist[ref].length > 0
                                            ) {
                                                for (const key of includesStorageExist[ref]) {
                                                    if (
                                                        Utils.objectContainsKey(item.attributes, key) &&
                                                        item.attributes[key] !== ""
                                                    ) {
                                                        const result = this.createStorageUrl(
                                                            key,
                                                            item.attributes[key],
                                                            host
                                                        );
                                                        item.attributes[key] = result[0];
                                                    }
                                                }
                                            }
                                        }
                                        // One to one
                                    } else if (Utils.objectIsNotEmpty(obj.attributes[ref])) {
                                        for (const key of includesStorageExist[ref]) {
                                            if (obj.attributes[ref][key] && obj.attributes[ref][key] !== "") {
                                                const result = this.createStorageUrl(
                                                    key,
                                                    obj.attributes[ref][key],
                                                    host
                                                );
                                                obj.attributes[ref][key] = result[0];
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                    // Check if it is a get one request
                } else {
                    for (const key of storageExist) {
                        if (data.data[key] && data.data[key] !== "") {
                            const result = this.createStorageUrl(key, data.data[key], host);
                            data.data[key] = result[0];
                        }
                    }
                    if (Object.keys(includesStorageExist).length > 0) {
                        for (const ref in includesStorageExist) {
                            if (data.data[ref] && typeof data.data[ref] === "object") {
                                // One to many
                                if (Utils.checkForArray(data.data[ref]) && data.data[ref].length > 0) {
                                    for (const item of data.data[ref]) {
                                        for (const key of includesStorageExist[ref]) {
                                            if (item[key] && item[key] !== "") {
                                                const result = this.createStorageUrl(key, item[key], host);
                                                item[key] = result[0];
                                            }
                                        }
                                    }
                                    // One to one
                                } else if (Object.keys(data.data[ref]).length > 0) {
                                    for (const key of includesStorageExist[ref]) {
                                        if (data.data[ref][key] && data.data[ref][key] !== "") {
                                            const result = this.createStorageUrl(key, data.data[ref][key], host);
                                            data.data[ref][key] = result[0];
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
            return data;
        } catch (e) {
            console.log("ERROR collectionModel.populateUrlFields", e);
            throw e;
        }
    }

    private async populateStorageFields(
        data: any,
        storageExist: Array<string>,
        includesStorageExist: Record<string, any>
    ) {
        try {
            if (Utils.checkForArray(storageExist) || Object.keys(includesStorageExist).length > 0) {
                // Check if it is a get all request
                if (Utils.checkForArray(data.data)) {
                    for (const obj of data.data) {
                        for (const key of storageExist) {
                            if (obj.attributes[key] && obj.attributes[key] !== "") {
                                const result: any = await this.storage.getDownloadURL(obj.attributes[key]);
                                obj.attributes[key] = result[0];
                            }
                        }
                        // Includes storage URLs
                        if (Utils.objectIsNotEmpty(includesStorageExist)) {
                            for (const ref in includesStorageExist) {
                                if (obj.attributes[ref] && typeof obj.attributes[ref] === "object") {
                                    // One to many
                                    if (Utils.checkForArray(obj.attributes[ref])) {
                                        for (const item of obj.attributes[ref]) {
                                            if (
                                                Utils.objectContainsKey(item, "attributes") &&
                                                Utils.objectIsNotEmpty(item.attributes) &&
                                                includesStorageExist[ref].length > 0
                                            ) {
                                                for (const key of includesStorageExist[ref]) {
                                                    if (
                                                        Utils.objectContainsKey(item.attributes, key) &&
                                                        item.attributes[key] !== ""
                                                    ) {
                                                        const result: any = await this.storage.getDownloadURL(
                                                            item.attributes[key]
                                                        );
                                                        item.attributes[key] = result[0];
                                                    }
                                                }
                                            }
                                        }
                                        // One to one
                                    } else if (Utils.objectIsNotEmpty(obj.attributes[ref])) {
                                        for (const key of includesStorageExist[ref]) {
                                            if (obj.attributes[ref][key] && obj.attributes[ref][key] !== "") {
                                                const result: any = await this.storage.getDownloadURL(
                                                    obj.attributes[ref][key]
                                                );
                                                obj.attributes[ref][key] = result[0];
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                    // Check if it is a get one request
                } else {
                    for (const key of storageExist) {
                        if (data.data[key] && data.data[key] !== "") {
                            const result: any = await this.storage.getDownloadURL(data.data[key]);
                            data.data[key] = result[0];
                        }
                    }
                    if (Object.keys(includesStorageExist).length > 0) {
                        for (const ref in includesStorageExist) {
                            if (data.data[ref] && typeof data.data[ref] === "object") {
                                // One to many
                                if (Utils.checkForArray(data.data[ref]) && data.data[ref].length > 0) {
                                    for (const item of data.data[ref]) {
                                        for (const key of includesStorageExist[ref]) {
                                            if (item[key] && item[key] !== "") {
                                                const result: any = await this.storage.getDownloadURL(item[key]);
                                                item[key] = result[0];
                                            }
                                        }
                                    }
                                    // One to one
                                } else if (Object.keys(data.data[ref]).length > 0) {
                                    for (const key of includesStorageExist[ref]) {
                                        if (data.data[ref][key] && data.data[ref][key] !== "") {
                                            const result: any = await this.storage.getDownloadURL(data.data[ref][key]);
                                            data.data[ref][key] = result[0];
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
            return data;
        } catch (e) {
            throw e;
        }
    }

    /**
     * Get list of all collection items or collection item by id
     * @param req Express request
     * @return data collection data
     */
    public async get(req: any) {
        const collection = this.parseCollection(req);

        try {
            const data = await this.collection.getAll(collection);
            const storageExist = Utils.checkStorageType(JSON.parse(req.headers.model));
            let includesStorageExist: Record<string, any> = {};
            if (collection.includes !== undefined && collection.includes.length > 0) {
                const r = await this.collection.getAll({
                    name: "config-collections",
                });
                const allCollections = r.data.map((obj: any) => {
                    return obj.attributes;
                });
                for (const ref of collection.includes) {
                    const includesCollection = allCollections.find((obj: any) => {
                        return obj.name.toLowerCase() === ref.table.toLowerCase();
                    });
                    if (includesCollection !== undefined) {
                        includesStorageExist[ref.key] = Utils.checkStorageType(includesCollection.model);
                    }
                }
            }

            if (data !== undefined && data.data !== undefined && data.data !== null) {
                const host = req.headers["deskree-main-domain"] + "/api/v1/rest";
                return await this.populateUrlFields(data, storageExist, includesStorageExist, host);
            }
            return null;
        } catch (e: any) {
            this.logger.log(this.logger.message.error, e.message, {
                file: "collectionModel.ts",
                line: "47-63",
                function: "get",
            });
            if (e.code === 9) {
                await this.createIndex(req.headers.collection, collection.query || [], collection.sorted);
                throw {
                    code: 412,
                    title: "Index not created",
                    detail: "We are currently creating an index for the provided query. Please, allow a few minutes before making the same request again.",
                };
            } else {
                throw e;
            }
        }
    }

    /**
     * Create index for the specified query
     * @param collection collection name
     * @param query query header
     * @param sorted sorted header
     */
    private async createIndex(collection: string, query: any, sorted: any) {
        try {
            const client = new this.collection.admin.firestore.v1.FirestoreAdminClient();
            const project_id = await client.getProjectId();
            const collection_group_path = await client.collectionGroupPath(project_id, "(default)", collection);
            const sortedExists =
                sorted !== undefined &&
                Object.prototype.hasOwnProperty.call(sorted, "param") &&
                Object.prototype.hasOwnProperty.call(sorted, "how");

            const index: { queryScope: any; fields: Array<any> } = {
                queryScope: "COLLECTION",
                fields: [],
            };

            for (const item of query) {
                if (!/[A-Za-z]+/.test(item.operator)) {
                    const field: FirestoreIndexFieldInterface = {
                        fieldPath: item.attribute,
                        order: "ASCENDING",
                    };

                    if (sortedExists) {
                        if (sorted.param.trim().toLowerCase() !== item.attribute.trim().toLowerCase()) {
                            index.fields.push(field);
                        }
                    } else {
                        index.fields.push(field);
                    }
                } else {
                    const field: FirestoreIndexFieldInterface = {
                        fieldPath: item.attribute,
                        arrayConfig: "CONTAINS",
                    };
                    index.fields.push(field);
                }
            }

            if (sortedExists) {
                const field: FirestoreIndexFieldInterface = {
                    fieldPath: sorted.param,
                    order: sorted.how.toUpperCase() === "ASC" ? "ASCENDING" : "DESCENDING",
                };
                index.fields.push(field);
            }
            const output = await client.createIndex({
                parent: collection_group_path,
                index: index,
            });
            console.log("output:");
            console.log(output);
        } catch (e) {
            console.error(e);
        }
    }

    /**
     * Create collection
     * @param req Express Request
     * @return data collection data
     */
    public async create(req: any) {
        try {
            const storageExist = Utils.checkStorageType(JSON.parse(req.headers.model));
            if (
                Utils.checkForArray(storageExist) &&
                req.headers.hasOwnProperty("storage_limit_hit") &&
                req.headers.storage_limit_hit
            ) {
                return {
                    error: "You have reached the storage limit for a Free project. Please, upgrade your project at deskree.com",
                };
            }
            const collectionSetup = await this.setupCollection(req, storageExist);
            const collection = collectionSetup.collection;
            const config = JSON.parse(req.headers.config);
            const data = await this.collection.create(
                collection as CreateCollection,
                null,
                config.createdAt,
                config.updatedAt,
                config.timezone
            );
            if (data) {
                collection["uid"] = data.uid;
                //@ts-ignore
                delete collection["body"];
                const response: any = await this.collection.getAll(collection);
                if (response) {
                    response.data["uid"] = data.uid;
                    for (const key of storageExist) {
                        if (
                            response.data[key] &&
                            response.data[key] !== "" &&
                            Object.prototype.hasOwnProperty.call(response.data, key) &&
                            response.data[key].length > 0
                        ) {
                            const result: any = this.createStorageUrl(
                                key,
                                response.data[key],
                                req.headers["deskree-main-domain"] + "/api/v1/rest"
                            );
                            response.data[key] = result[0];
                        }
                    }
                    if (collectionSetup.errors.length > 0) {
                        response["errors"] = collectionSetup.errors;
                    }
                    return response;
                } else {
                    return false;
                }
            } else {
                return false;
            }
        } catch (e: any) {
            this.logger.log(this.logger.message.error, e.message, {
                file: "collectionModel.ts",
                line: "181-192",
                function: "create",
            });
            throw e;
        }
    }

    /**
     * Update collection item by id
     * @param req Express Request
     * @return data collection data
     */
    public async update(req: any) {
        try {
            const storageExist = Utils.checkStorageType(JSON.parse(req.headers.model));
            if (
                Utils.checkForArray(storageExist) &&
                req.headers.hasOwnProperty("storage_limit_hit") &&
                req.headers.storage_limit_hit
            ) {
                return {
                    error: "You have reached the storage limit for a Free project. Please, upgrade your project at deskree.com",
                };
            }
            const collectionSetup = await this.setupCollection(req, storageExist);
            const collection = collectionSetup.collection;
            const currentData = await this.collection.getAll(collection);
            if (currentData === undefined || currentData.data === undefined || currentData.data === null) {
                return { code: 404, detail: "Requested object is not found" };
            }
            for (const key of storageExist) {
                if (
                    req.body[key] &&
                    req.body[key] !== "" &&
                    Object.prototype.hasOwnProperty.call(currentData.data, key) &&
                    currentData.data[key].length > 0
                ) {
                    const fileName = currentData.data[key];
                    await this.storage.deleteFile(fileName);
                }
            }
            const config = JSON.parse(req.headers.config);
            await this.collection.update(collection as EditCollection, undefined, config.updatedAt, config.timezone);
            const data: any = await this.collection.getAll(collection);
            for (const key of storageExist) {
                if (data.data[key] && data.data[key] !== "") {
                    const result: any = this.createStorageUrl(
                        key,
                        data.data[key],
                        req.headers["deskree-main-domain"] + "/api/v1/rest"
                    );
                    data.data[key] = result[0];
                }
            }
            if (collectionSetup.errors.length > 0) {
                data["errors"] = collectionSetup.errors;
            }
            return data;
        } catch (e: any) {
            this.logger.log(this.logger.message.error, e.message, {
                file: "collectionModel.ts",
                line: "226-239",
                function: "delete",
            });
            throw e;
        }
    }

    /**
     * Delete collection item by id
     * @param req Express Request
     * @return null
     */
    public async delete(req: any) {
        try {
            const collection: Collection = {
                name: req.headers.collection,
                uid: req.headers.uid,
                query: undefined,
                includes: undefined,
                sorted: undefined,
                limit: {
                    page: undefined,
                    limit: undefined,
                },
            } as unknown as Collection;
            const storageExist = Utils.checkStorageType(JSON.parse(req.headers.model));
            const currentData = await this.collection.getAll(collection);
            if (currentData === undefined || currentData.data === undefined || currentData.data === null) {
                return { code: 404, detail: "Requested object is not found" };
            }
            for (const key of storageExist) {
                const fileName = currentData.data[key];
                if (fileName && fileName !== "") {
                    try {
                        await this.storage.deleteFile(fileName);
                    } catch (sError) {
                        console.log(sError);
                    }
                }
            }
            await this.collection.delete(collection as DeleteCollection);
            return null;
        } catch (e: any) {
            console.log(e);
            this.logger.log(this.logger.message.error, e.message, {
                file: "collectionModel.ts",
                line: "273-282",
                function: "delete",
            });
            throw e;
        }
    }

    /**
     * Create necessary files & setup collection object
     * @param req Express Request
     * @param storageExist Array of storage fields from the model
     * @return Collection collection body
     */
    private async setupCollection(
        req: any,
        storageExist: Array<string>
    ): Promise<{ collection: Collection; errors: Array<any> }> {
        try {
            let body = req.body;
            const skipFileExceptions =
                req.hasOwnProperty("query") && req.query.hasOwnProperty("skipFileExceptions")
                    ? req.query.skipFileExceptions
                    : false;
            const fileBuffer = Object.prototype.hasOwnProperty.call(req, "files") ? req.files : [];
            if (fileBuffer.length > 0) {
                fileBuffer.forEach((file: any) => {
                    body[file.fieldname] = file.buffer;
                });
            }
            body = await this.createFile(
                storageExist,
                body,
                req.headers.collection,
                Boolean(Utils.stringToBoolean(skipFileExceptions)),
                fileBuffer
            );
            const collection = {
                name: req.headers.collection,
                uid: req.headers.uid,
                body: body.body,
                query: req.headers.where,
                includes: undefined,
                sorted: req.headers.sorted,
                limit: {
                    page: req.query.page,
                    limit: req.query.limit,
                },
            } as Collection;
            return {
                collection: collection,
                errors: body.errors,
            };
        } catch (e: any) {
            this.logger.log(this.logger.message.error, e.message, {
                file: "collectionModel.ts",
                line: "301",
                function: "setupCollection",
            });
            throw e;
        }
    }

    /**
     * Create necessary files & setup collection object
     * @param storageExist Array of storage fields from the model
     * @param body Request body
     * @param collection name of the collection
     * @param skipFileExceptions whether to throw an error if image fails to download
     * @param file
     * @return Collection collection body
     */
    private async createFile(
        storageExist: Array<string>,
        body: Record<string, any>,
        collection: string,
        skipFileExceptions: boolean,
        file?: Array<Record<string, any>>
    ): Promise<{ body: any; errors: Array<any> }> {
        try {
            if (Utils.checkForArray(storageExist)) {
                for (const key of storageExist) {
                    const fileKeyValue = body[key];
                    if (fileKeyValue) {
                        const uid = uuidv1();
                        if (file && file.length > 0) {
                            const buffer = file.find((obj) => {
                                return obj.fieldname === key;
                            });
                            if (buffer !== undefined) {
                                let mimetype = mime.contentType(buffer.originalname) as string;
                                const type = mime.extension(mimetype);
                                body[key] = await this.storage.uploadFile(
                                    body[key],
                                    `${collection}/${uid}.${type}`,
                                    buffer.size
                                );
                            }
                        } else if (fileKeyValue !== "") {
                            const uploadType = Utils.checkFileType(body[key], key);
                            body[key] = "";
                            if (uploadType === "base64") {
                                body[key] = await this.base64AndUrlUpload(uploadType, fileKeyValue, collection, uid);
                            } else if (uploadType === "url") {
                                body[key] = await this.base64AndUrlUpload(uploadType, fileKeyValue, collection, uid);
                            } else if (uploadType === "object") {
                                const type = Object.prototype.hasOwnProperty.call(fileKeyValue, "ext")
                                    ? fileKeyValue.ext
                                    : undefined;
                                const name = Object.prototype.hasOwnProperty.call(fileKeyValue, "name")
                                    ? fileKeyValue.name
                                    : undefined;
                                const uploadDataType = Utils.checkFileType(fileKeyValue.data, key);
                                body[key] = await this.base64AndUrlUpload(
                                    uploadDataType,
                                    fileKeyValue.data,
                                    collection,
                                    uid,
                                    type,
                                    name
                                );
                            }
                        }
                    }
                }
            }
            return { body: body, errors: [] };
        } catch (e: any) {
            const code = e.hasOwnProperty("response") && e.response.hasOwnProperty("status") ? e.response.status : 500;
            const message = code === 404 ? "Provided file could not be downloaded" : e.message;
            this.logger.log(
                this.logger.message.error,
                {
                    code: code,
                    details: message,
                },
                {
                    file: "collectionModel.ts",
                    line: "337-343",
                    function: "createFile",
                }
            );
            if (skipFileExceptions) {
                return {
                    body: body,
                    errors: [
                        {
                            code: code,
                            title: this.logger.getStatusMessage(code).details,
                            detail: message,
                        },
                    ],
                };
            } else if (e && e.code && e.title && e.message) {
                throw e;
            } else {
                throw { code: code, message: message };
            }
        }
    }

    /**
     * Check whether the file is base64 or url type
     * @param uploadType string base64 or url
     * @param fileKeyValue string base64 or url
     * @param collection string name of the collection
     * @param uid string unique id
     * @param t string type of the file
     * @param n string name of the file
     * @return string either base64, url, buffer, or object
     **/
    private async base64AndUrlUpload(
        uploadType: string,
        fileKeyValue: string,
        collection: string,
        uid: string,
        t?: string,
        n?: string
    ) {
        try {
            const name = n !== undefined ? n : uid;
            if (uploadType === "base64") {
                let file;
                let type;
                if (fileKeyValue.startsWith("data:")) {
                    type = t !== undefined ? t : fileKeyValue.split(";")[0].split("/")[1];
                    file = fileKeyValue.split(",")[1];
                } else {
                    const buffer = Buffer.from(fileKeyValue, "base64");
                    const res = await fileType.fromBuffer(buffer);
                    const ext = res?.ext || "";
                    type = t !== undefined ? t : ext;
                    file = fileKeyValue;
                }
                return await this.storage.uploadFile(file, `${collection}/${name}.${type}`, 0);
            } else if (uploadType === "url") {
                const type = t !== undefined ? t : fileKeyValue.split(/[#?]/)[0].split(".").pop()!.trim();
                return await this.storage.uploadFile(fileKeyValue, `${collection}/${name}.${type}`, 0);
            } else {
                throw "Invalid file type";
            }
        } catch (e) {
            throw e;
        }
    }
}
