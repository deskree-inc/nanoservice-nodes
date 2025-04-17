// postmanModel.ts
/**
 * This is the business logic for getting Postman collection
 *
 * @module PostmanModel
 */

import * as fs from 'fs'
import {Logger} from "../../logger@1.0.0/logger";

export class PostmanModel  {
    private logger;

    constructor() {
        this.logger = new Logger("config", process.env.PROJECT_ID || "");
    }

    /**
     * Get Postman Collection
     * @return array of blogs
     */
    public getPostmanCollection() {
        try {
            const collection = fs.readFileSync('./collection.json');
            return JSON.parse(collection.toString());
        } catch (e: any) {
            this.logger.log(this.logger.message.error, e.message, {
                file: 'postmanModel.ts',
                line: '34-37',
                function: 'getPostmanCollection'
            });
            throw e;
        }
    }
}
