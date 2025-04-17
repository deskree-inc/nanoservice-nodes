// postman.ts
/**
 * This is the controller that returns Postman collection
 *
 * @module PostmanController
 */

import { ExpressController } from "./expressController";
import IControllerBase from "../interfaces/IControllerBase";
import { PostmanModel } from "../models/postmanModel";
import CollectionsController from "./collectionsController";

export class PostmanController extends ExpressController implements IControllerBase {

    public path = '/postman';
    private postman;

    constructor() {
        super();
        this.postman = new PostmanModel();
    }


    public async initRoutes(req: any): Promise<any> {
        if (this.validateRoute(this.path, req.path) && "get" === req.method.toLowerCase()) {
            req.params = this.handleDynamicRoute(this.path, req);
            return await this.getPostmanCollection(req).bind(this);
        } else
            return { code: 404, error: 'Route not found' };
    }

    /**
     * Get list postman collection for the existing endpoints
     * @param req: Express Request
     * @param res: Express Response
     * @return array of blogs or individual blog object
     */
    public getPostmanCollection(req: any) {
        try {
            const result = this.postman.getPostmanCollection();
            this.logger.log(this.logger.message.info, this.logger.getStatusMessage(200), {
                file: 'postman.ts',
                line: '35',
                function: 'getPostmanCollection'
            }, req);
            return result
        } catch (e: any) {
            this.logger.log(this.logger.message.error, e.message, {
                file: 'postman.ts',
                line: '35',
                function: 'getPostmanCollection'
            }, req);
            return { code: 500, error: e.message };
        }
    }
}


export default CollectionsController;
