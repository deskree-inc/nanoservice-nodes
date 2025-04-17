// storageService.ts
/**
 * This is the main storage service class responsible for managing GCP storage data
 *
 * @module StorageService
 */

import { Storage } from "@google-cloud/storage";
import { StorageException } from "./exceptions/storageException";
import { Stream } from "stream";
import { Logger } from "../../../logger@1.0.0/logger";
import axios from "axios";
import isBase64 from "is-base64";

export class StorageService {
    private readonly storage;
    private readonly bucket;
    private readonly logger;
    private collectionService;

    constructor(projectId: string, bucketName: string, collection: any, firebaseConfig: any) {
        this.collectionService = collection;
        this.storage = this.initializeStorage(firebaseConfig);
        this.bucket = this.storage.bucket(bucketName);
        this.logger = new Logger("storage", projectId);
    }

    /*
     * Initialize storage
     * @return Storage new storage instance
     **/
    private initializeStorage(firebaseConfig?: any) {
        if (firebaseConfig)
            return new Storage({ credentials: firebaseConfig });
        return new Storage();
    }

    /**
     * Get signed download URL that is valid for 7 days.
     * @param path file path within bucket
     * @return signedUrl signed download URL of the file
     **/
    public async getDownloadURL(path: string, expiration?: number) {
        try {
            const exist = await this.bucket.file(path).exists();
            if (exist) {
                return await this.bucket.file(path).getSignedUrl({
                    action: "read",
                    expires: expiration === undefined ? Date.now() + 1000 * 60 * 60 * 12 : expiration,
                    version: "v4",
                });
            }
            return new StorageException("File does not exist");
        } catch (e) {
            throw e;
        }
    }

    /**
     * Check if a string is valid URL string
     * @param url URL string
     * @return boolean when the string is URL or not
     **/
    private static stringIsAValidUrl(url: string) {
        try {
            new URL(url);
            return true;
        } catch (err) {
            return false;
        }
    }

    /**
     * Check whether the file is base64 or url type
     * @param file file as base64 or URL string
     * @return string either 'url', 'base64', or 'buffer'
     **/
    private checkFileType(file: any) {
        if (StorageService.stringIsAValidUrl(file)) {
            return "url";
        } else if (isBase64(file)) {
            return "base64";
        } else if (Buffer.isBuffer(file)) {
            return "buffer";
        }
        throw new StorageException("Invalid file type");
    }

    private async checkStorageLimit() {
        let data;
        try {
            data = await this.collectionService.getAll({
                name: "config-storage",
                uid: "storage-info",
                query: undefined,
                includes: undefined,
                sorted: undefined,
                limit: {
                    page: undefined,
                    limit: undefined,
                },
            });
        } catch (e) {
            throw e;
        }
        if (data.data === undefined) {
            throw {
                code: 500,
                title: "You storage configuration is not set",
                message: "You storage configuration is not set, Please, contact our support team to resolve this issue.",
            };
        }
        const used = data.data && data.data.used ? data.data.used : 1;
        const total = data.data && data.data.total ? data.data.total : 0;
        if (used <= total) {
            return true;
        } else {
            throw {
                code: 403,
                title: "Storage limit exceeded",
                message: "You have reached the storage limit for your project. Please, upgrade your project at deskree.com",
            };
        }
    }

    /**
     * Upload file to storage bucket either from base64 or URL
     * @param file file as base64 or URL string
     * @param dist file path within bucket
     * @param fileSize file size in bytes
     * @return ServiceAccount
     **/
    public async uploadFile(file: string, dist: string, fileSize?: number) {
        try {
            return new Promise(async (resolve, reject) => {
                await this.checkStorageLimit();
                const fileType = this.checkFileType(file);
                if (fileType === "base64" || fileType === "buffer") {
                    const newFile = this.bucket.file(dist);
                    const writeStream = newFile.createWriteStream();
                    const stream = new Stream.PassThrough();
                    if (fileType === "base64") {
                        stream.end(Buffer.from(file, "base64"));
                    } else {
                        stream.end(file);
                    }
                    stream.pipe(writeStream);
                    stream.on("error", (err) => {
                        console.log("Stream error");
                        console.log(err);
                        reject(new StorageException(err.message));
                    });
                    let size = fileSize !== undefined ? fileSize : 0;
                    if (size === 0) {
                        stream.on("data", (chunk) => {
                            size += chunk.length;
                        });
                    }
                    writeStream.on("finish", async () => {
                        await this.collectionService.firebase
                        .firestore()
                        .collection("config-storage")
                        .doc("storage-info")
                        .update("used", this.collectionService.FieldValue.increment(size));
                        resolve(dist);
                    });
                    this.logger.log(
                        this.logger.message.info,
                        { code: 200, details: "File uploaded" },
                        {
                            file: "storageService.ts",
                            line: "137",
                            function: "uploadFile",
                        },
                        {},
                        {}
                    );
                    // return dist;
                } else if (fileType === "url") {
                    const newFile = this.bucket.file(dist);
                    const writeStream = newFile.createWriteStream();
                    const stream = await axios({ url: file, method: "GET", responseType: "stream" });
                    let size = 0;
                    stream.data.pipe(writeStream);
                    stream.data.on("data", (chunk: any) => {
                        size += chunk.length;
                    });
                    writeStream.on("finish", async () => {
                        await this.collectionService.firebase
                            .firestore()
                            .collection("config-storage")
                            .doc("storage-info")
                            .update("used", this.collectionService.FieldValue.increment(size));
                        resolve(dist);
                    });
                    this.logger.log(
                        this.logger.message.info,
                        { code: 200, details: "File uploaded" },
                        {
                            file: "storageService.ts",
                            line: "148",
                            function: "uploadFile",
                        },
                        {},
                        {}
                    );
                    // return dist;
                } else {
                    // return new StorageException("Invalid file type");
                    reject(new StorageException("Invalid file type"));
                }
            });
        } catch (e) {
            console.log("Error in uploadFile", e);
            throw e;
        }
    }

    /**
     * Delete file or directory from storage bucket
     * @param path file path
     * @return ServiceAccount
     **/
    public async deleteFile(path: string) {
        try {
            const exist = await this.bucket.file(path).exists();
            if (exist) {
                const [metadata] = await this.bucket.file(path).getMetadata();
                await this.bucket.file(path).delete();
                const size = -Math.abs(parseInt(metadata.size as string));
                await this.collectionService.firebase
                    .firestore()
                    .collection("config-storage")
                    .doc("storage-info")
                    .update("used", this.collectionService.FieldValue.increment(size));
                this.logger.log(
                    this.logger.message.info,
                    { code: 200, details: "File uploaded" },
                    {
                        file: "storageService.ts",
                        line: "148",
                        function: "deleteFile",
                    },
                    {},
                    {}
                );
                return true;
            }
            return new StorageException("File does not exist");
        } catch (e) {
            console.error(e);
            throw e;
        }
    }
}
