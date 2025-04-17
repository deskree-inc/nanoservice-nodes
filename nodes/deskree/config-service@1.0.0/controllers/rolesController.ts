// rolesController.ts
/**
 * This is the controller for all roles configurations
 *
 * @module RolesController
 */

import IControllerBase from "../interfaces/IControllerBase";
import {ExpressController} from "./expressController";
import {ConfigModel} from "../models/configModel"
import {RoleInterface} from "../interfaces/roleInterface";
import {Utils} from "../helpers/utils";
import CollectionsController from "./collectionsController";

export class RolesController extends ExpressController implements IControllerBase {
    public path = '/roles';
    private roles;
    public name = 'Roles';
    public description = "Endpoints responsible for roles configurations";
    public routes = [
        {
            name: 'GET List of Roles',
            url: `${this.path}`,
            method: 'GET',
            description: 'Retrieve a list of all roles',
            function: this.getRoles.bind(this)
        },
        {
            name: 'GET Role by UID',
            url: `${this.path}/:role_id`,
            method: 'GET',
            description: 'Retrieve a role by id',
            function: this.getRoles.bind(this)
        },
        {
            name: 'Create Role',
            url: `${this.path}`,
            method: 'POST',
            description: 'Create a new role',
            body: {
                name: 'admin'
            },
            function: this.createRole.bind(this)
        },
        {
            name: 'Update Role by UID',
            url: `${this.path}/:role_id`,
            method: 'PUT',
            description: 'Update existing role',
            body: {
                name: 'admin'
            },
            function: this.updateRole.bind(this)
        },
        {
            name: 'Delete Role by UID',
            url: `${this.path}/:role_id`,
            method: 'DELETE',
            description: 'Delete role',
            function: this.deleteRole.bind(this)
        }
    ];


    constructor(collectionService: any) {
        super();
        this.roles = new ConfigModel('config-roles', collectionService);
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
     * Check whether roles body matches the interface
     * @param obj Express Request Body
     * @return true or error message
     */
    private static rolesInterfaceGuard(obj: any) {
        if (Utils.checkForNonEmptyObject(obj) && obj.name && typeof obj.name === 'string' && /^[a-zA-Z0-9_-]*$/.test(obj.name)) {
            return true
        }
        return 'You must provide proper roles configuration object with appropriate role name. The string cannot contain any numbers, space, or special characters.'
    }

    /**
     * Create role
     * @param req Express Request
     * @param res Express Response
     * @return object permissions object
     */
    public async createRole(req: any) {
        try {
            const body: RoleInterface = req.body;
            const guardCheck = RolesController.rolesInterfaceGuard(body);
            if (typeof guardCheck !== "string") {
                const values = await this.roles.getAll();
                const isUnique = values.data.every((obj: any) => {
                    return obj.attributes.name !== req.body.name;
                })
                if (isUnique) {
                    const result = await this.roles.create(body);
                    this.logger.log(this.logger.message.info, this.logger.getStatusMessage(200), {
                        file: 'rolesController.ts',
                        line: '101',
                        function: 'createRole'
                    }, req);

                    return result;
                } else {
                    this.logger.log(this.logger.message.warning, {details: 'Role name must be unique', code: 422}, {
                        file: 'rolesController.ts',
                        line: '99',
                        function: 'createRole'
                    }, req);
                    return { code: 422, error: 'Role name must be unique'};
                }
            } else {
                this.logger.log(this.logger.message.warning, {details: guardCheck, code: 422}, {
                    file: 'rolesController.ts',
                    line: '94',
                    function: 'createRole'
                }, req);
                return { code: 422, error: guardCheck};
            }
        } catch (e: any) {
            this.logger.log(this.logger.message.error, e.message, {
                file: 'rolesController.ts',
                line: '95-101',
                function: 'createRole'
            }, req);
            return { code: 500, error: e.message};
        }
    }

    /**
     * Get list of roles or role by id
     * @param req Express Request
     * @param res Express Response
     * @return array of roles or individual role
     */
    public async getRoles(req: any) {
        try {
            if (req.params.role_id) {
                const result = await this.roles.getById(req.params.role_id);
                this.logger.log(this.logger.message.info, this.logger.getStatusMessage(200), {
                    file: 'rolesController.ts',
                    line: '147',
                    function: 'getRoles'
                }, req);
                return result
            } else {
                const result = await this.roles.getAll();
                this.logger.log(this.logger.message.info, this.logger.getStatusMessage(200), {
                    file: 'rolesController.ts',
                    line: '156',
                    function: 'getRoles'
                }, req);
                return result
            }
        } catch (e: any) {
            this.logger.log(this.logger.message.error, e.message, {
                file: 'rolesController.ts',
                line: '146-156',
                function: 'getRoles'
            }, req);
            return { code: 500, error: e.message};
        }
    }

    /**
     * Update role by id
     * @param req Express Request
     * @param res Express Response
     * @return object permissions object
     */
    public async updateRole(req: any) {
        try {
            const body: RoleInterface = req.body;
            const guardCheck = RolesController.rolesInterfaceGuard(body);
            if (typeof guardCheck !== "string") {
                const values = await this.roles.getAll();
                const isUnique = values.data.every((obj: any) => {
                    return obj.attributes.name !== req.body.name;
                })
                if (isUnique) {
                    const result = await this.roles.update(req.params.role_id, body);
                    this.logger.log(this.logger.message.info, this.logger.getStatusMessage(200), {
                        file: 'rolesController.ts',
                        line: '191',
                        function: 'updateRole'
                    }, req);
                     return result;
                } else {
                    this.logger.log(this.logger.message.warning, {details: 'Role name must be unique', code: 422}, {
                        file: 'rolesController.ts',
                        line: '190',
                        function: 'createRole'
                    }, req);
                    return { code: 422, error: 'Role name must be unique'};
                }
            } else {
                this.logger.log(this.logger.message.warning, {details: guardCheck, code: 422}, {
                    file: 'rolesController.ts',
                    line: '185',
                    function: 'createRole'
                }, req);
                return { code: 422, error: guardCheck};
            }
        } catch (e: any) {
            this.logger.log(this.logger.message.error, e.message, {
                file: 'rolesController.ts',
                line: '186-191',
                function: 'createRole'
            }, req);

            return { code: 500, error: e.message};
        }
    }

    /**
     * Delete role by id
     * @param req Express Request
     * @param res Express Response
     * @return string confirmation message
     */
    public async deleteRole(req: any) {
        try {
            await this.roles.delete(req.params.role_id);
            this.logger.log(this.logger.message.info, this.logger.getStatusMessage(204), {
                file: 'rolesController.ts',
                line: '236',
                function: 'deleteRole'
            }, req);
            return "Role deleted"
        } catch (e: any) {
            this.logger.log(this.logger.message.error, e.message, {
                file: 'rolesController.ts',
                line: '236',
                function: 'deleteRole'
            }, req);

            return { code: 500, error: e.message};
        }
    }
}

export default CollectionsController;
