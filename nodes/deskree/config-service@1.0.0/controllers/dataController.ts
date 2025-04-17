// dataController.ts
/**
 * This is the controller for all database configurations
 *
 * @module DataController
 */

import IControllerBase from "../interfaces/IControllerBase";
import { ExpressController } from "./expressController";
import { DataModel } from "../models/dataModel";
import { ConfigModel } from "../models/configModel";
import CollectionsController from "./collectionsController";

export class DataController extends ExpressController implements IControllerBase {
    public path = '/data';
    private dataModel;
    private collections;
    private permissions;
    private storage;
    public name = 'Data Management';
    public description = "Endpoints responsible for specific actions when managing database data.";
    public routes = [
        {
            name: 'DELETE Collection',
            url: `${this.path}/collections/:collection_id`,
            method: 'DELETE',
            description: 'Delete a specific collection',
            function: this.deleteCollection.bind(this)
        },
        {
            name: 'DELETE Collection Field',
            url: `${this.path}/collections/:collection_id/fields/:field`,
            method: 'DELETE',
            description: 'Delete a specific field across the whole collection.',
            function: this.deleteField.bind(this)
        },
        {
            name: 'Rename Collection Field',
            url: `${this.path}/collections/:collection_id/fields/:field`,
            method: 'PUT',
            description: 'Rename a specific field across the whole collection.',
            body: {
                name: 'new_field_name'
            },
            function: this.renameField.bind(this)
        },
        {
            name: 'Add Collection Field',
            url: `${this.path}/collections/:collection_id/fields`,
            method: 'POST',
            description: 'Add a new field to the whole collection.',
            body: {
                name: 'field_name',
                type: 'string'
            },
            function: this.addField.bind(this)
        },
        {
            name: 'Create storage configuration',
            url: `${this.path}/storage`,
            method: 'POST',
            description: 'Create storage configuration object',
            body: {
                total: 100,
                used: 0
            },
            function: this.createStorageConfig.bind(this)
        }
    ];

    constructor(collectionService: any) {
        super();
        this.dataModel = new DataModel(collectionService);
        this.collections = new ConfigModel('config-collections', collectionService);
        this.permissions = new ConfigModel('config-permissions', collectionService);
        this.storage = new ConfigModel('config-storage', collectionService);
    }

    public async initRoutes(req: any): Promise<any> {
        for(const route of this.routes) {
            if(this.validateRoute(route.url, req.path) && route.method.toLocaleLowerCase() === req.method.toLowerCase()){
                req.params = this.handleDynamicRoute(route.url, req);
                return await route.function(req);
            }
        }
        return { code: 404, error: 'Route not found' };
    }

    /**
     * Delete collection
     * @param req Express Request
     * @param res Express Response
     */
    public async deleteCollection(req: any) {
        try {
            const collection_id = req.params.collection_id.toLowerCase();
            if (collection_id !== "users") {
                // Delete collection data
                await this.dataModel.deleteCollection(req.params.collection_id);
                // Delete collection model
                const collections = await this.collections.getAll();
                for (const collection of collections.data) {
                    if (collection.attributes.name === collection_id) {
                        await this.collections.delete(collection.uid);
                    }
                }
                // Delete collection permissions
                const permissions = await this.permissions.getAll();
                for (const permission of permissions.data) {
                    if (permission.attributes.name === "collections") {
                        const endpoints = permission.attributes.endpoints.filter((endpoints: any) => {
                            return endpoints.name !== collection_id;
                        });
                        const body = {
                            name: permission.attributes.name,
                            endpoints: endpoints
                        }
                        console.log("New permissions object");
                        console.log(body)
                        await this.permissions.update(permission.uid, body);
                    }
                }
                this.logger.log(this.logger.message.info, this.logger.getStatusMessage(204), {
                    file: 'dataController.ts',
                    line: '288',
                    function: 'deleteCollection'
                }, req);
                return "Collection deleted"
            } else {
                this.logger.log(this.logger.message.info, this.logger.getStatusMessage(204), {
                    file: 'dataController.ts',
                    line: '288',
                    function: 'deleteCollection'
                }, req);

                return {
                    code: "403",
                    title: this.logger.getStatusMessage(403).details,
                    detail: "Users table cannot be deleted",
                };
            }
        } catch (e: any) {
            this.logger.log(this.logger.message.error, e.message, {
                file: 'dataController.ts',
                line: '55',
                function: 'deleteCollection'
            }, req);
            return {
                errors: [{
                    code: "500",
                    title: this.logger.getStatusMessage(500).details,
                    detail: e.message,
                }]
            }
        }
    }

    /**
     * Delete collection field
     * @param req Express Request
     * @param res Express Response
     */
    public async deleteField(req: any) {
        try {
            const values = await this.collections.getAll();
            if (values.hasOwnProperty('data')) {
                const result = values.data.find((obj: any) => {
                    return obj.attributes.name === req.params.collection_id
                });
                const attributes = result.attributes;
                if (result) {
                    if (attributes.model.hasOwnProperty(req.params.field)) {
                        const uid = result.uid;
                        delete attributes.model[req.params.field];
                        await this.collections.update(uid, attributes);
                        await this.dataModel.deleteField(req.params.collection_id, req.params.field);
                        this.logger.log(this.logger.message.info, this.logger.getStatusMessage(204), {
                            file: 'dataController.ts',
                            line: '81',
                            function: 'deleteField'
                        }, req);
                        return "Field deleted"
                    } else {
                        this.logger.log(this.logger.message.warning, this.logger.getStatusMessage(422), {
                            file: 'dataController.ts',
                            line: '121',
                            function: 'deleteField'
                        }, req);
                        return {
                            errors: [{
                                code: "404",
                                title: this.logger.getStatusMessage(422).details,
                                detail: 'Field name does not exist'
                            }]
                        }
                    }
                } else {
                    this.logger.log(this.logger.message.warning, this.logger.getStatusMessage(404), {
                        file: 'dataController.ts',
                        line: '115',
                        function: 'deleteField'
                    }, req);
                    return {
                        errors: [{
                            code: "404",
                            title: this.logger.getStatusMessage(404).details,
                            detail: 'No collection model found'
                        }]
                    }
                }
            } else {
                this.logger.log(this.logger.message.error, this.logger.getStatusMessage(500), {
                    file: 'dataController.ts',
                    line: '121-122',
                    function: 'deleteField'
                }, req);
                return {
                    errors: [{
                        code: "500",
                        title: this.logger.getStatusMessage(500).details,
                        detail: this.logger.getStatusMessage(500).details,
                    }]
                }
            }
        } catch (e: any) {
            this.logger.log(this.logger.message.error, e.message, {
                file: 'dataController.ts',
                line: '81',
                function: 'deleteField'
            }, req);
            return {
                errors: [{
                    code: "500",
                    title: this.logger.getStatusMessage(500).details,
                    detail: e.message,
                }]
            }
        }
    }

    /**
     * Add column to all documents in a collection
     * @param req Express Request
     * @param res Express Response
     * @return object collection model
     */
    public async addField(req: any) {
        try {
            const body = req.body;
            if (body.hasOwnProperty('name') && body.hasOwnProperty('type')) {
                const values = await this.collections.getAll();
                if (values.hasOwnProperty('data')) {
                    const result = values.data.find((obj: any) => {
                        return obj.attributes.name === req.params.collection_id
                    });
                    const attributes = result.attributes;
                    if (result) {
                        const uid = result.uid;
                        const exist = attributes.model.hasOwnProperty(req.body.name);
                        if (!exist) {
                            attributes.model[req.body.name] = req.body.type;
                            await this.dataModel.addField(req.params.collection_id, req.body.name, req.body.type);
                            await this.collections.update(uid, attributes);
                            this.logger.log(this.logger.message.info, this.logger.getStatusMessage(204), {
                                file: 'dataController.ts',
                                line: '121',
                                function: 'addField'
                            }, req);
                            return attributes;
                        } else {
                            this.logger.log(this.logger.message.warning, this.logger.getStatusMessage(422), {
                                file: 'dataController.ts',
                                line: '121',
                                function: 'addField'
                            }, req);
                            return {
                                errors: [{
                                    code: "422",
                                    title: this.logger.getStatusMessage(422).details,
                                    detail: 'Field name must be unique'
                                }]
                            }
                        }
                    } else {
                        this.logger.log(this.logger.message.warning, this.logger.getStatusMessage(404), {
                            file: 'dataController.ts',
                            line: '115',
                            function: 'addField'
                        }, req);
                        return {
                            errors: [{
                                code: "404",
                                title: this.logger.getStatusMessage(404).details,
                                detail: 'No collection model found'
                            }]
                        }
                    }
                } else {
                    this.logger.log(this.logger.message.error, this.logger.getStatusMessage(500), {
                        file: 'dataController.ts',
                        line: '121-122',
                        function: 'addField'
                    }, req);
                    return {
                        errors: [{
                            code: "500",
                            title: this.logger.getStatusMessage(500).details,
                            detail: this.logger.getStatusMessage(500).details,
                        }]
                    }
                }
            } else {
                this.logger.log(this.logger.message.warning, this.logger.getStatusMessage(422), {
                    file: 'dataController.ts',
                    line: '109',
                    function: 'addField'
                }, req);
                return {
                    errors: [{
                        code: "422",
                        title: this.logger.getStatusMessage(422).details,
                        detail: "Body must include type and name of the new field",
                    }]
                }
            }
        } catch (e: any) {
            this.logger.log(this.logger.message.error, e.message, {
                file: 'dataController.ts',
                line: '121',
                function: 'addField'
            }, req);
            return {
                errors: [{
                    code: "500",
                    title: this.logger.getStatusMessage(500).details,
                    detail: e.message,
                }]
            }
        }
    }

    /**
     * Rename a column in all documents in a collection
     * @param req Express Request
     * @param res Express Response
     * @return object collection model
     */
    public async renameField(req: any) {
        try {
            const body = req.body;
            if (body.hasOwnProperty('name') && body.name !== req.params.field) {
                const values = await this.collections.getAll();
                if (values.hasOwnProperty('data')) {
                    const result = values.data.find((obj: any) => {
                        return obj.attributes.name === req.params.collection_id
                    });
                    const attributes = result.attributes;
                    if (result) {
                        const uid = result.uid;
                        let type = attributes.model[req.params.field];
                        if (body.hasOwnProperty('type') && body.type.toLowerCase() !== type.toLowerCase()) {
                            type = body.type;
                        }
                        const exist = attributes.model.hasOwnProperty(req.body.name);
                        if (!exist) {
                            delete attributes.model[req.params.field];
                            attributes.model[req.body.name] = type;
                            await this.dataModel.renameField(req.params.collection_id, body.name, req.params.field);
                            await this.collections.update(uid, attributes);
                            this.logger.log(this.logger.message.info, this.logger.getStatusMessage(204), {
                                file: 'dataController.ts',
                                line: '199',
                                function: 'renameField'
                            }, req);
                            return attributes;
                        } else {
                            this.logger.log(this.logger.message.warning, this.logger.getStatusMessage(422), {
                                file: 'dataController.ts',
                                line: '195',
                                function: 'renameField'
                            }, req);
                            return {
                                errors: [{
                                    code: "422",
                                    title: this.logger.getStatusMessage(422).details,
                                    detail: 'Field name must be unique',
                                }]
                            }
                        }
                    } else {
                        this.logger.log(this.logger.message.warning, this.logger.getStatusMessage(404), {
                            file: 'dataController.ts',
                            line: '191',
                            function: 'renameField'
                        }, req);
                        return {
                            errors: [{
                                code: "404",
                                title: this.logger.getStatusMessage(404).details,
                                detail: 'No collection model found',
                            }]
                        }
                    }
                } else {
                    this.logger.log(this.logger.message.error, this.logger.getStatusMessage(500), {
                        file: 'dataController.ts',
                        line: '159-164',
                        function: 'addField'
                    }, req);
                    return {
                        errors: [{
                            code: "500",
                            title: this.logger.getStatusMessage(500).details,
                            detail: this.logger.getStatusMessage(500).details,
                        }]
                    }
                }
            } else {
                this.logger.log(this.logger.message.warning, this.logger.getStatusMessage(422), {
                    file: 'dataController.ts',
                    line: '187',
                    function: 'renameField'
                }, req);
                return {
                    errors: [{
                        code: "422",
                        title: this.logger.getStatusMessage(422).details,
                        detail: "Body must include the new name of the field",
                    }]
                }
            }
        } catch (e: any) {
            this.logger.log(this.logger.message.error, e.message, {
                file: 'dataController.ts',
                line: '199',
                function: 'renameField'
            }, req);
            return {
                errors: [{
                    code: "500",
                    title: this.logger.getStatusMessage(500).details,
                    detail: e.message,
                }]
            }
        }
    }

    /**
     * Create storage configuration collection
     * @param req Express Request
     * @param res Express Response
     * @return object collection model
     */
    public async createStorageConfig(req: any) {
        try {
            const config = await this.storage.getAll();
            if (config.hasOwnProperty("data") && (req.body.hasOwnProperty("total") || req.body.hasOwnProperty("used"))) {
                await this.dataModel.createStorageConfig(req.body.total, req.body.used);
                this.logger.log(this.logger.message.info, this.logger.getStatusMessage(204), {
                    file: 'dataController.ts',
                    line: '415',
                    function: 'createStorageConfig'
                }, req);

                return "Storage configuration created"
            } else {
                this.logger.log(this.logger.message.warning, this.logger.getStatusMessage(422), {
                    file: 'dataController.ts',
                    line: '414',
                    function: 'createStorageConfig'
                }, req);
                return {
                    errors: [{
                        code: "422",
                        title: this.logger.getStatusMessage(422).details,
                        detail: "Storage configuration has been already created or request is missing params",
                    }]
                }
            }
        } catch (e: any) {
            this.logger.log(this.logger.message.error, e.message, {
                file: 'dataController.ts',
                line: '415',
                function: 'createStorageConfig'
            }, req);
            return {
                errors: [{
                    code: "500",
                    title: this.logger.getStatusMessage(500).details,
                    detail: e.message,
                }]
            }
        }
    }
}

export default CollectionsController;
