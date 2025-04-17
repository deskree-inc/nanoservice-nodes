// rolesController.ts
/**
 * This is the controller for all roles configurations
 *
 * @module SecretsController
 */

import IControllerBase from "../interfaces/IControllerBase";
import { ExpressController } from "./expressController";
import { RoleInterface } from "../interfaces/roleInterface";
import { Utils } from "../helpers/utils";
import { SecretModel } from "../models/secretModel";
import CollectionsController from "./collectionsController";

export class SecretsController extends ExpressController implements IControllerBase {
    public path = '/secrets';
    private secrets;
    public name = 'Secrets';
    public description = "Endpoints responsible for secrets manager";
    public routes = [
        {
            name: 'Create Secret',
            url: `${this.path}`,
            method: 'POST',
            description: 'Create a new secret',
            body: {
                name: 'admin'
            },
            function: this.createSecret.bind(this)
        },
        {
            name: 'Update Secret by UID',
            url: `${this.path}/:secret_id`,
            method: 'PUT',
            description: 'Update existing secret',
            body: {
                name: 'admin'
            },
            function: this.updateSecret.bind(this)
        },
        {
            name: 'Delete Secret by UID',
            url: `${this.path}/:secret_id`,
            method: 'DELETE',
            description: 'Delete secret',
            function: this.deleteSecret.bind(this)
        }
    ];


    constructor(credentials?: any) {
        super();
        this.secrets = new SecretModel({
            credentials: credentials
        });
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
     * Check whether secrets body matches the interface
     * @param obj Express Request Body
     * @return true or error message
     */
    private static secretsInterfaceGuard(obj: any) {
        if (Utils.checkForNonEmptyObject(obj)
            && obj.name && typeof obj.name === 'string'
            && /^[a-zA-Z0-9_-]*$/.test(obj.name)
        ) {
            if (obj.value && typeof obj.value === 'string') {
                return true
            }

            return 'You must provide proper secret configuration object with appropriate secret value.'
        }

        return 'You must provide proper secret configuration object with appropriate secret name. The string cannot contain any numbers, space, or special characters.'
    }

    /**
     * Create secret
     * @param req Express Request
     * @param res Express Response
     * @return object permissions object
     */
    public async createSecret(req: any) {
        try {
            const body: RoleInterface = req.body;
            const guardCheck = SecretsController.secretsInterfaceGuard(body);

            if (typeof guardCheck !== "string") {
                
                const result = await this.secrets.create(body);
                this.logger.log(this.logger.message.info, this.logger.getStatusMessage(200), {
                    file: 'secretsController.ts',
                    line: '89',
                    function: 'createSecret'
                }, req);
                return result;
            } else {
                this.logger.log(this.logger.message.warning, { details: guardCheck, code: 422 }, {
                    file: 'secretsController.ts',
                    line: '117',
                    function: 'createSecret'
                }, req);
                return { code: 422, error: guardCheck };
            }
        } catch (e: any) {
            console.log(e);
            this.logger.log(this.logger.message.error, e.message, {
                file: 'secretsController.ts',
                line: '126',
                function: 'createSecret'
            }, req);
            return { code: 500, error: e.message };
        }
    }

    /**
     * Update secret by id
     * @param req Express Request
     * @param res Express Response
     * @return object permissions object
     */
    public async updateSecret(req: any) {
        try {
            const body: RoleInterface = req.body;
            const guardCheck = SecretsController.secretsInterfaceGuard(body);
            if (typeof guardCheck !== "string") {
                const result = await this.secrets.update(body);
                this.logger.log(this.logger.message.info, this.logger.getStatusMessage(200), {
                    file: 'secretsController.ts',
                    line: '191',
                    function: 'updateSecret'
                }, req);
                return result;
            } else {
                this.logger.log(this.logger.message.warning, { details: guardCheck, code: 422 }, {
                    file: 'secretsController.ts',
                    line: '185',
                    function: 'updateSecret'
                }, req);
                return { code: 422, error: guardCheck };
            }
        } catch (e: any) {
            this.logger.log(this.logger.message.error, e.message, {
                file: 'secretsController.ts',
                line: '186-191',
                function: 'updateSecret'
            }, req);
            return { code: 500, error: e.message };
        }
    }

    /**
     * Delete secret by id
     * @param req Express Request
     * @param res Express Response
     * @return string confirmation message
     */
    public async deleteSecret(req: any) {
        try {
            await this.secrets.delete(req.params.secret_id);
            this.logger.log(this.logger.message.info, this.logger.getStatusMessage(204), {
                file: 'secretsController.ts',
                line: '236',
                function: 'deleteSecret'
            }, req);
            return "Secret deleted"
        } catch (e: any) {
            this.logger.log(this.logger.message.error, e.message, {
                file: 'secretsController.ts',
                line: '236',
                function: 'deleteSecret'
            }, req);
            return { code: 500, error: e.message };
        }
    }
}

export default CollectionsController;
