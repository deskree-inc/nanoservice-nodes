// baseModel.ts
/**
 * This is the base model class
 *
 * @module BaseModel
 */

import {Logger} from "../../logger@1.0.0/logger";

export class BaseModel {
    protected logger;

    constructor() {
        this.logger = new Logger('config', process.env.PROJECT_ID || "");
    }
}
