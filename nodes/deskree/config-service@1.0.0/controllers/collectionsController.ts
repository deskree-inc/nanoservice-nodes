// collectionsController.ts
/**
 * This is the controller for all database configurations
 *
 * @module CollectionsController
 */

import IControllerBase from "../interfaces/IControllerBase";
import { ExpressController } from "./expressController";
import { ConfigModel } from "../models/configModel";
import { TableTypes, TableValidator } from "../../modules/@deskree-inc/schema/zod/database.zod";
import { ResError } from "../helpers/resError";
import { ResSuccess } from "../helpers/resSuccess";
import { DataModel } from "../models/dataModel";

export class CollectionsController extends ExpressController implements IControllerBase {
    public path = '/collections';
    private collections;
    private permissions;
    private resError;
    private resSuccess;
    public name = 'Collections';
    public description = "Endpoints responsible for Database models configurations";
    public routes = [
        {
            name: 'GET List of Collections Models',
            url: `${this.path}`,
            method: 'GET',
            description: 'Retrieve a list of all collections models including webhooks configurations',
            function: this.getCollectionModel.bind(this)
        },
        {
            name: 'GET Collection Model by ID',
            url: `${this.path}/:collection_id`,
            method: 'GET',
            description: 'Retrieve a collection model by id',
            function: this.getCollectionModel.bind(this)
        },
        {
            name: 'Create Collection Model',
            url: `${this.path}`,
            method: 'POST',
            description: 'Create a new collection model',
            body: {
                name: 'myProducts',
                subCollections: ['reviews', 'recipes'],
                config: {
                    createdAt: true,
                    updateAt: false,
                    timezone: 'America/Toronto'
                },
                model: {
                    uid: "UID",
                    title: "String",
                    price: "Integer",
                    weight: "Float",
                    published: "Boolean",
                    images: "Array<string>",
                    barcodes: "Array<integer>",
                    breakdowns: "Array<float>",
                    conditions: "Array<boolean>",
                    productType: "discountcodetypes<string>",
                    collection: "users<Array<string>>",
                    image: "Storage"
                }
            },
            function: this.createCollectionModel.bind(this)
        },
        {
            name: 'Update Collection Model by ID without data migration',
            url: `${this.path}/:collection_id`,
            method: 'PUT',
            description: 'Update existing collection model without data migration',
            body: {
                name: 'myProducts',
                subCollections: ['reviews', 'recipes'],
                config: {
                    createdAt: true,
                    updateAt: false,
                    timezone: 'America/Toronto'
                },
                model: {
                    uid: "UID",
                    title: "String",
                    price: "Integer",
                    weight: "Float",
                    published: "Boolean",
                    images: "Array<string>",
                    barcodes: "Array<integer>",
                    breakdowns: "Array<float>",
                    conditions: "Array<boolean>",
                    productType: "discountcodetypes<string>",
                    collection: "users<Array<string>>",
                    image: "Storage?"
                }
            },
            function: this.updateCollectionModel.bind(this)
        },
        {
            name: 'Delete Collection Model by ID',
            url: `${this.path}/:collection_id`,
            method: 'DELETE',
            description: 'Delete collection model',
            function: this.deleteCollectionModel.bind(this)
        },
    ];
    public dataModel: DataModel;

    constructor(collectionService: any) {
        super();
        this.dataModel = new DataModel(collectionService);

        this.resError = new ResError('collectionsController.ts');
        this.resSuccess = new ResSuccess('collectionsController.ts');
        this.collections = new ConfigModel('config-collections', collectionService);
        this.permissions = new ConfigModel('config-permissions', collectionService);

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
     * Create collection model
     * @param req Express Request
     * @param res Express Response
     * @return object collection model
     */
    public async createCollectionModel(req: any) {
        try {
  
            const body: TableTypes = TableValidator.parse(req.body);
            const values = await this.collections.getAll();
            const isUnique = values.data.every((obj: any) => {
                return obj.attributes.name !== req.body.name;
            })
            if (!req.body.hasOwnProperty("author") && req.body.name.toLowerCase() !== "users") {
                req.body.model["author"] = "String?";
            }
            if (!req.body.hasOwnProperty("roles") && req.body.name.toLowerCase() === "users") {
                req.body.model["roles"] = "Array<string>";
            }
            if (isUnique) {
                // Create new collection config
                const result = await this.collections.create(body);

                // Check whether collection permission object is present
                const values = await this.permissions.getAll();
                const permission = values.data.find((obj: any) => {
                    return obj.attributes.name === "collections"
                });
                if (permission) {
                    // If present
                    const data = permission.attributes;
                    data.endpoints.push({
                        name: body.name,
                        methods: {
                            delete: "public",
                            get: "public",
                            get_uid: "public",
                            patch: "public",
                            post: "public",
                        }
                    });
                    await this.permissions.update(permission.uid, data);
                }
    
               return this.resSuccess.send(req, 200, 'createCollectionModel', '139', result);
            } else {
                return this.resError.sendErrorResponse(req, 422, 'createCollectionModel', '141', false, 'Collection name must be unique');
            }
        } catch (e) {
            return this.resError.catchError(e, req, 'createCollectionModel', '124');
        }
    }

    /**
     * Get list of collection models or collection model by id
     * @param req Express Request"http": new HttpTrigger() as BlueprintTrigger
     * @param res Express Response
     * @return array of collection models or individual collection model object
     */
    public async getCollectionModel(req: any) {
        try {
            if (req.params.collection_id) {
                const result = await this.collections.getById(req.params.collection_id, req.query?.count);
                return this.resSuccess.send(req, 200, 'getCollectionModel', '179', result);
            } else {
                const result = await this.collections.getAll(req.query?.count);
                return this.resSuccess.send(req, 200, 'getCollectionModel', '182', result);
            }
        } catch (e) {
            return this.resError.catchError(e, req, 'getCollectionModel', '179');
        }
    }

    /**
     * Update collection model
     * @param req Express Request
     * @param res Express Response
     * @return object collection model object
     */
    public async updateCollectionModel(req: any) {
        try {
            const body: TableTypes = TableValidator.parse(req.body);
            const result = await this.collections.update(req.params.collection_id, body);
            return this.resSuccess.send(req, 200, 'updateCollectionModel', '199', result);
        } catch (e) {
            return this.resError.catchError(e, req, 'updateCollectionModel', '198');
        }
    }

    /**
     * Delete collection model by id
     * @param req Express Request
     * @param res Express Response
     * @return string confirmation message
     */
    public async deleteCollectionModel(req: any) {
        try {
            const collection_id = req.params.collection_id.toLowerCase();
            if (collection_id !== "users") {
                // Delete collection model
                const collections = await this.collections.getAll();
                for (const collection of collections.data) {
                    if (collection.attributes.name.toLowerCase() === collection_id) {
                        await this.collections.delete(collection.uid);
                    }
                }
                // Delete collection permissions
                const permissions = await this.permissions.getAll();
                for (const permission of permissions.data) {
                    if (permission.attributes.name === "collections") {
                        const endpoints = permission.attributes.endpoints.filter((endpoints: any) => {
                            return endpoints.name.toLowerCase() !== collection_id;
                        });
                        const body = {
                            name: permission.attributes.name,
                            endpoints: endpoints
                        }
                        await this.permissions.update(permission.uid, body);
                    }
                }
                this.resSuccess.send(req,  204, 'deleteCollectionModel', '234', {});
            } else {
                this.resError.sendErrorResponse(
                    req,
                    403,
                    'deleteCollectionModel',
                    '141',
                    false,
                    'Users table cannot be deleted');
            }
        } catch (e) {
            this.resError.catchError(e, req,  'deleteCollectionModel', '217');
        }
    }
}

export default CollectionsController;
