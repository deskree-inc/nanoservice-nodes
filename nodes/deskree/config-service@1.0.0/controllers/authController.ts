// authController.ts
/**
 * Class responsible for configuring authentication functionality
 *
 * @module AuthController
 */

import { ExpressController } from "./expressController";
import IControllerBase from "../interfaces/IControllerBase";
import { AuthModel } from "../models/authModel";
import { UsersModel } from "../models/usersModel";
import { AuthEmailAndPasswordRes, EmailBody } from "../interfaces/AuthEmailPassword";
import { ConfigModel } from "../models/configModel";
import { EmailConfigInterface } from "../interfaces/emailConfigInteface";
import CollectionsController from "./collectionsController";
// import collectionService from '../../rest-api@1.0.0/services/collectionService';

export class AuthController extends ExpressController implements IControllerBase {

    public path = '/auth';
    private gcpip;
    private user;
    private auth;

    public name = 'Accounts';
    public description = 'A collection of endpoints to manage accounts data.'
    public routes = [
        {
            name: 'Get email config',
            url: `${this.path}/email`,
            method: 'GET',
            description: 'Get email configurations',
            function: this.getEmailConfig.bind(this)
        },
        {
            name: 'Create email config',
            url: `${this.path}/email`,
            method: 'POST',
            description: 'Create email configurations',
            function: this.createEmailConfig.bind(this)
        },
        {
            name: 'Update email config',
            url: `${this.path}/email`,
            method: 'PATCH',
            description: 'Update email configurations',
            function: this.updateEmailConfig.bind(this)
        },
        {
            name: 'Get list of users',
            url: `${this.path}/accounts`,
            method: 'GET',
            description: 'Get all users registered in the system',
            function: this.getUsers.bind(this)
        },
        {
            name: 'Update Email',
            url: `${this.path}/accounts/:account_id/update-email`,
            method: 'POST',
            description: 'Update the user email.',
            body: {
                email: "example@example.com"
            },
            function: this.updateEmail.bind(this)
        },
        {
            name: 'Delete Account',
            url: `${this.path}/accounts/:account_id/`,
            method: 'DELETE',
            description: 'Delete account based on the user UID. The system will also delete the corresponding user object inside the Users table.',
            function: this.deleteAccount.bind(this)
        }
    ]


    constructor(collectionService: any) {
        super();
        this.gcpip = new AuthModel();
        this.user = new UsersModel(collectionService);
        this.auth = new ConfigModel('config-auth', collectionService);
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
     * Get email configuration
     * @param req: Express Request
     * @param res: Express Response
     */

    public async getEmailConfig(req: any) {
        try {
            const result = await this.auth.getAll();
            this.logger.log(this.logger.message.info, this.logger.getStatusMessage(200), {
                file: 'authController.ts',
                line: '94',
                function: 'getEmailConfig'
            }, req);
            return result;
        } catch (e: any) {
            this.logger.log(this.logger.message.error, e.message, {
                file: 'authController.ts',
                line: '103',
                function: 'getEmailConfig'
            }, req);
            return {
                code: 500,
                title: this.logger.getStatusMessage(500).details,
                detail: e.message
            }
        }
    }

    /**
     * Create email configuration
     * @param req: Express Request
     * @param res: Express Response
     */
    public async createEmailConfig(req: any) {
        try {
            const body: EmailConfigInterface = req.body;
            const result = await this.auth.create(body);
            this.logger.log(this.logger.message.info, this.logger.getStatusMessage(200), {
                file: 'authController.ts',
                line: '85',
                function: 'getUsers'
            }, req);
            return result
        } catch (e: any) {
            this.logger.log(this.logger.message.error, e.message, {
                file: 'authController.ts',
                line: '85',
                function: 'getUsers'
            }, req);
            return {
                code: 500,
                errors: [{
                    code: "500",
                    title: this.logger.getStatusMessage(500).details,
                    detail: e.message
                }]
            }
        }
    }

    /**
     * Update email configuration
     * @param req: Express Request
     * @param res: Express Response
     */
    public async updateEmailConfig(req: any) {
        try {
            const body: EmailConfigInterface = req.body;
            if (body.hasOwnProperty("email_config_url") &&
                body.hasOwnProperty("pass_res_url") &&
                body.hasOwnProperty("req_email_conf") &&
                body.hasOwnProperty("user_invite_url")) {
                const configs = await this.auth.getAll();
                const data = configs.data.find((obj: any) => obj.attributes.name === "email_password");
                if (data) {
                    body.name = "email_password";
                    const result = await this.auth.update(data.uid, body);
                    this.logger.log(this.logger.message.info, this.logger.getStatusMessage(200), {
                        file: 'authController.ts',
                        line: '85',
                        function: 'updateEmailConfig'
                    }, req);
                    return result;
                } else {
                    this.logger.log(this.logger.message.warning, { code: 422, details: this.logger.getStatusMessage(422).details }, {
                        file: 'authController.ts',
                        line: '183',
                        function: 'updateEmailConfig'
                    }, req, [{ billable: 'billable' }]);
                    return {
                        code: 422,
                        errors: [{
                            code: 422,
                            title: this.logger.getStatusMessage(422).details,
                            detail: "No email_password configuration exists in the project"
                        }]
                    }
                }
            } else {


                this.logger.log(this.logger.message.warning, { code: 422, details: this.logger.getStatusMessage(422).details }, {
                    file: 'authController.ts',
                    line: '183',
                    function: 'updateEmailConfig'
                }, req, [{ billable: 'billable' }]);
                return {
                    code: 422,
                    errors: [{
                        code: "422",
                        title: this.logger.getStatusMessage(422).details,
                        detail: "Missing required parameters"
                    }]
                }
            }
        } catch (e: any) {
            this.logger.log(this.logger.message.error, e.message, {
                file: 'authController.ts',
                line: '85',
                function: 'updateEmailConfig'
            }, req);
            return {
                code: 500,
                errors: [{
                    code: "500",
                    title: this.logger.getStatusMessage(500).details,
                    detail: e.message
                }]
            }
        }
    }

    /**
     * Get list of users
     * @param req: Express Request
     * @param res: Express Response
     */
    public async getUsers(req: any) {
        try {
            const result = await this.user.get(req.query);
            this.logger.log(this.logger.message.info, this.logger.getStatusMessage(200), {
                file: 'authController.ts',
                line: '111',
                function: 'getUsers'
            }, req, [{ billable: 'billable' }]);
            return result;
        } catch (e: any) {

            if (e.hasOwnProperty('errorInfo') && e.errorInfo.hasOwnProperty('message')) {
                this.logger.log(this.logger.message.warning, { details: e.errorInfo.message, code: 422 }, {
                    file: 'authController.ts',
                    line: '111',
                    function: 'getUsers'
                }, req, [{ billable: 'billable' }]);
                return {
                    code: 422,
                    errors: [{
                        code: "422",
                        title: this.logger.getStatusMessage(422).details,
                        detail: e.errorInfo.message
                    }]
                }
            } else {
                this.logger.log(this.logger.message.error, e.message, {
                    file: 'authController.ts',
                    line: '111',
                    function: 'getUsers'
                }, req);
                return {
                    code: 500,
                    errors: [{
                        code: "500",
                        title: this.logger.getStatusMessage(500).details,
                        detail: e.message
                    }]
                }
            }
        }
    }

    /**
     * Delete user account
     * @param req: Express Request
     * @param res: Express Response
     */
    public async deleteAccount(req: any) {
        try {
            await this.gcpip.deleteAccount(req.params.account_id);
            await this.user.delete(req.params.account_id);
            this.logger.log(this.logger.message.info, this.logger.getStatusMessage(200), {
                file: 'authController.ts',
                line: '147',
                function: 'deleteAccount'
            }, req, [{ billable: 'billable' }]);
            return "Account deleted"
        } catch (e: any) {

            if (e.hasOwnProperty('errorInfo') && e.errorInfo.hasOwnProperty('message')) {
                this.logger.log(this.logger.message.warning, { details: e.errorInfo.message, code: 422 }, {
                    file: 'authController.ts',
                    line: '147',
                    function: 'deleteAccount'
                }, req, [{ billable: 'billable' }]);
                return {
                    code: 422,
                    errors: [{
                        code: "422",
                        title: this.logger.getStatusMessage(422).details,
                        detail: e.errorInfo.message
                    }]
                }
            } else {
                this.logger.log(this.logger.message.error, e.message, {
                    file: 'authController.ts',
                    line: '147',
                    function: 'deleteAccount'
                }, req);
                return {
                    code: 500,
                    errors: [{
                        code: "500",
                        title: this.logger.getStatusMessage(500).details,
                        detail: e.message
                    }]
                }
            }
        }
    }

    /**
     * Update email
     * @param req: Express Request
     * @param res: Express Response
     */
    public async updateEmail(req: any) {
        try {
            const body = req.body as EmailBody;
            if (body.email) {
                const result = await this.gcpip.updateEmail(body, req.params.account_id) as AuthEmailAndPasswordRes;
                this.logger.log(this.logger.message.info, this.logger.getStatusMessage(200), {
                    file: 'authController.ts',
                    line: '184',
                    function: 'updateEmail'
                }, req, [{ billable: 'billable' }]);
                return result;
            } else {
                this.logger.log(this.logger.message.warning, { code: 422, details: this.logger.getStatusMessage(422).details }, {
                    file: 'authController.ts',
                    line: '183',
                    function: 'updateEmail'
                }, req, [{ billable: 'billable' }]);
                return {
                    code: 422,
                    errors: [{
                        code: "422",
                        title: this.logger.getStatusMessage(422).details,
                        detail: "No email provided"
                    }]
                }
            }
        } catch (e: any) {

            if (e.hasOwnProperty('errorInfo') && e.errorInfo.hasOwnProperty('message')) {
                this.logger.log(this.logger.message.warning, { details: e.errorInfo.message, code: 422 }, {
                    file: 'authController.ts',
                    line: '184',
                    function: 'updateEmail'
                }, req, [{ billable: 'billable' }]);
                return {
                    code: 422,
                    errors: [{
                        code: "422",
                        title: this.logger.getStatusMessage(422).details,
                        detail: e.errorInfo.message
                    }]
                }
            } else {
                this.logger.log(this.logger.message.error, e.message, {
                    file: 'authController.ts',
                    line: '184',
                    function: 'updateEmail'
                }, req);
                return {
                    code: 500,
                    errors: [{
                        code: "500",
                        title: this.logger.getStatusMessage(500).details,
                        detail: e.message
                    }]
                }
            }
        }
    }
}

export default CollectionsController;
