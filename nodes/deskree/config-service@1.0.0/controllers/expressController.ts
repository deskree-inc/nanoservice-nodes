// expressController.ts
/**
 * This is the base controller class
 *
 * @module ExpressController
 */

import * as express from "express";
import { Logger } from "../../logger@1.0.0/logger";
import { validateRoute, handleDynamicRoute } from "../../../../triggers/trigger-util"

export class ExpressController {
    protected router: express.Router;
    protected logger;

    constructor() {
        this.router = express.Router();
        this.logger = new Logger('config', process.env.PROJECT_ID || "");
    }

    validateRoute = validateRoute;
    handleDynamicRoute = handleDynamicRoute;

}
