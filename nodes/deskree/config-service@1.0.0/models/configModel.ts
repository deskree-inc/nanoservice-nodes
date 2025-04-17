// configModel.ts
/**
 * This is the business logic for managing various configurations
 *
 * @module ConfigModel
 */

// import collectionService from "../helpers/collectionService";
import {BaseModel} from "./baseModel";

export class ConfigModel extends BaseModel{

    private readonly collectionService;
    private readonly configName: string;

    constructor(configName: string, collectionService: any) {
        super();
        this.collectionService = collectionService;
        this.configName = configName;
    }

    /**
     * Create new configuration object
     * @param body configuration body
     * @return Object of configuration
     */
    public async create(body: any) {
        try {
            const collection: any = {
                name: this.configName,
                body: body
            };
            const response: any = await this.collectionService.create(collection, null, false, false);
            collection['uid'] = response.uid;
            delete collection.body;
            return await this.collectionService.getAll(collection);
        } catch (e: any) {
            this.logger.log(this.logger.message.error, e.message, {
                file: 'configModel.ts',
                line: '34-37',
                function: 'create'
            });
            throw e;
        }
    }

    /**
     * Get configuration object by ID
     * @param uid UID of configuration
     * @return array of configurations
     */
    public async getById(uid: string, count?: boolean) {
        try {
            const collection = {
                name: this.configName,
                uid: uid
            };
            const response = await this.collectionService.getAll(collection);

            if(count) {
                for (const collection of response.data) {
                    collection.totalRows = (await this.collectionService.getCount({ name: collection.attributes.name })).count
                }
            }
            return response
        } catch (e: any) {
            this.logger.log(this.logger.message.error, e.message, {
                file: 'configModel.ts',
                line: '59',
                function: 'getById'
            });
            throw e;
        }
    }

    /**
     * Get list of configurations
     * @return array of configurations
     */
    public async getAll(count?: boolean) {
        try {
            const collection = {
                name: this.configName,
                limit: {
                    page: 1,
                    limit: 100
                }
            };
            const response = await this.collectionService.getAll(collection);

            if(count) {
                for (const collection of response.data) {
                    collection.totalRows = (await this.collectionService.getCount({ name: collection.attributes.name })).count
                }
            }
            return response
        } catch (e: any) {
            this.logger.log(this.logger.message.error, e.message, {
                file: 'configModel.ts',
                line: '83',
                function: 'getAll'
            });
            throw e;
        }
    }

    /**
     * Update configuration by ID
     * @param uid UID of configuration
     * @param body configuration object
     * @return array of configurations
     */
    public async update(uid: string, body: any) {
        try {
            delete body.actions;
            const collection = {
                name: this.configName,
                uid: uid,
                body: body
            };
            await this.collectionService.update(collection, undefined, false);
            delete collection.body;
            return await this.collectionService.getAll(collection);
        } catch (e: any) {
            this.logger.log(this.logger.message.error, e.message, {
                file: 'configModel.ts',
                line: '107-109',
                function: 'update'
            });
            throw e;
        }
    }

    /**
     * Delete configuration by ID
     * @param uid UID of configuration object
     * @return string confirmation message
     */
    public async delete(uid: string) {
        try {
            const collection = {
                name: this.configName,
                uid: uid
            };
            return await this.collectionService.delete(collection);
        } catch (e: any) {
            this.logger.log(this.logger.message.error, e.message, {
                file: 'configModel.ts',
                line: '131',
                function: 'delete'
            });
            throw e;
        }
    }
}