// permissionsController.ts
/**
 * This is the controller for all permissions configurations
 *
 * @module PermissionsController
 */

import IControllerBase from "../interfaces/IControllerBase";
import { ExpressController } from "./expressController";
import { ConfigModel } from "../models/configModel"
import { PermissionsInterface } from "../interfaces/permissionsInteface";
import { Utils } from "../helpers/utils";
import CollectionsController from "./collectionsController";

export class PermissionsController extends ExpressController implements IControllerBase {
    public path = '/permissions';
    private permissions;
    public name = 'Permissions';
    public description = "Endpoints responsible for endpoint permissions configurations";
    public routes = [
        {
            name: 'GET List of Permissions',
            url: `${this.path}`,
            method: 'GET',
            description: 'Retrieve a list of all permission objects',
            function: this.getPermissionsObject.bind(this)
        },
        {
            name: 'GET Permission Object by ID',
            url: `${this.path}/:permission_id`,
            method: 'GET',
            description: 'Retrieve a permission object by id',
            function: this.getPermissionsObject.bind(this)
        },
        {
            name: 'Create Permission Object',
            url: `${this.path}`,
            method: 'POST',
            description: 'Create a new permission object',
            body: {
                name: 'collections',
                endpoints: [
                    {
                        name: 'users',
                        methods: {
                            get: 'public',
                            post: 'private',
                            put: 'author',
                            delete: ['123', '345']
                        }
                    }
                ],
            },
            function: this.createPermissionsObject.bind(this)
        },
        {
            name: 'Update Permission Object by ID',
            url: `${this.path}/:permission_id`,
            method: 'PUT',
            description: 'Update existing permission object',
            body: {
                name: 'collections',
                endpoints: [
                    {
                        name: 'users',
                        methods: {
                            get: 'public',
                            post: 'private',
                            put: 'author',
                            delete: ['123', '345']
                        }
                    }
                ],
            },
            function: this.updatePermissionsObject.bind(this)
        },
        {
            name: 'Delete Permission Object by ID',
            url: `${this.path}/:permission_id`,
            method: 'DELETE',
            description: 'Delete permission object',
            function: this.deletePermissionsObject.bind(this)
        },
    ];

    constructor(collectionService: any) {
        super();
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
     * Check whether permissions body matches the interface
     * @param obj Express Request Body
     * @return true or error message
     */
    private static permissionsInterfaceGuard(obj: any) {
        if (Utils.checkForNonEmptyObject(obj)) {
            if (obj.name && typeof obj.name === 'string' && !/\s|\d|[^A-Za-z]/.test(obj.name)) {
                if (Utils.checkForNonEmptyArray(obj.endpoints)) {
                    for (const endpoint of obj.endpoints) {
                        if (endpoint.name && typeof endpoint.name === 'string' && /^[a-zA-Z0-9_-]*$/.test(endpoint.name)) {
                            if (Utils.checkForAllMethods(endpoint.methods)) {
                                return true
                            }
                            return 'You must provide methods object containing get, post, put, delete keys. Each key can be either "private", "public", "author", or Array of strings containing UIDs of corresponding roles'
                        }
                        return 'You must provide integration endpoint name or collection name. The string cannot contain any numbers, space, or special characters.'
                    }
                } else if (Utils.checkForArray(obj.endpoints)) {
                    return true
                }
                return 'You must provide array of endpoints. Can be empty if all the routes are private by default.'
            }
            return 'You must provide object name as `collection` or the name of integration. The string cannot contain any numbers, space, or special characters.'
        }
        return 'You must provide proper Permissions configuration object'
    }

    /**
     * Create permissions object
     * @param req Express Request
     * @param res Express Response
     * @return object permissions object
     */
    public async createPermissionsObject(req: any) {
        try {
            const body: PermissionsInterface = req.body;
            const guardCheck = PermissionsController.permissionsInterfaceGuard(body);
            if (typeof guardCheck !== "string") {
                const values = await this.permissions.getAll();
                const isUnique = values.data.every((obj: any) => {
                    return obj.attributes.name !== req.body.name;
                })
                if (isUnique) {
                    const result = await this.permissions.create(body);
                    this.logger.log(this.logger.message.info, this.logger.getStatusMessage(200), {
                        file: 'permissionsController.ts',
                        line: '132',
                        function: 'createPermissionsObject'
                    }, req);
                    return result;
                } else {
                    this.logger.log(this.logger.message.warning, this.logger.getStatusMessage(422), {
                        file: 'permissionsController.ts',
                        line: '136',
                        function: 'createPermissionsObject'
                    }, req);
                    return { code: 422, error: "Collection config already exists" };
                }
            } else {
                this.logger.log(this.logger.message.warning, guardCheck, {
                    file: 'permissionsController.ts',
                    line: '131',
                    function: 'createPermissionsObject'
                }, req);
                return { code: 422, error: guardCheck };
            }
        } catch (e: any) {
            this.logger.log(this.logger.message.error, e.message, {
                file: 'permissionsController.ts',
                line: '132-137',
                function: 'createPermissionsObject'
            }, req);

            return { code: 500, error: e.message };
        }
    }

    /**
     * Get list of permissions object or auth system object by id
     * @param req Express Request
     * @param res Express Response
     * @return array of permissions objects or individual permissions object
     */
    public async getPermissionsObject(req: any) {
        try {
            if (req.params.permission_id) {
                const result = await this.permissions.getById(req.params.permission_id);
                this.logger.log(this.logger.message.info, this.logger.getStatusMessage(200), {
                    file: 'permissionsController.ts',
                    line: '183',
                    function: 'getPermissionsObject'
                }, req);
                return result;
            } else {
                const result = await this.permissions.getAll();
                this.logger.log(this.logger.message.info, this.logger.getStatusMessage(200), {
                    file: 'permissionsController.ts',
                    line: '192',
                    function: 'getPermissionsObject'
                }, req);
                return result;
            }
        } catch (e: any) {
            this.logger.log(this.logger.message.error, e.message, {
                file: 'permissionsController.ts',
                line: '183-192',
                function: 'getPermissionsObject'
            }, req);
            return { code: 500, error: e.message };
        }
    }

    /**
     * Update permissions object by id
     * @param req Express Request
     * @param res Express Response
     * @return object permissions object
     */
    public async updatePermissionsObject(req: any) {
        try {
            const body: PermissionsInterface = req.body;
            const guardCheck = PermissionsController.permissionsInterfaceGuard(body);
            if (typeof guardCheck !== "string") {
                const result = await this.permissions.update(req.params.permission_id, body);
                this.logger.log(this.logger.message.info, this.logger.getStatusMessage(200), {
                    file: 'permissionsController.ts',
                    line: '228',
                    function: 'updatePermissionsObject'
                }, req);

                return result
            } else {
                this.logger.log(this.logger.message.warning, guardCheck, {
                    file: 'permissionsController.ts',
                    line: '223',
                    function: 'updatePermissionsObject'
                }, req);

                return { code: 422, error: guardCheck };
            }
        } catch (e: any) {
            this.logger.log(this.logger.message.error, e.message, {
                file: 'permissionsController.ts',
                line: '223-228',
                function: 'updatePermissionsObject'
            }, req);

            return { code: 500, error: e.message };
        }
    }

    /**
     * Delete permissions object by id
     * @param req Express Request
     * @param res Express Response
     * @return string confirmation message
     */
    public async deletePermissionsObject(req: any) {
        try {
            await this.permissions.delete(req.params.permission_id);
            this.logger.log(this.logger.message.info, this.logger.getStatusMessage(204), {
                file: 'permissionsController.ts',
                line: '273',
                function: 'deletePermissionsObject'
            }, req);
            return "Permission deleted";
        } catch (e: any) {
            this.logger.log(this.logger.message.error, e.message, {
                file: 'permissionsController.ts',
                line: '273',
                function: 'deletePermissionsObject'
            }, req);

            return { code: 500, error: e.message };
        }
    }
}

export default CollectionsController;
