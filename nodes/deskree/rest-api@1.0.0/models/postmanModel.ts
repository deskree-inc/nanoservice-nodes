// postmanModel.ts
/**
 * This is the business logic for getting Postman collection
 *
 * @module PostmanModel
 */

import { BaseModel } from "./baseModel";
import { Postman } from "./postmanBuilder";

export class PostmanModel extends BaseModel {
    constructor() {
        super();
    }

    /**
     * Get Postman Collection
     * @return array of blogs
     */
    public async getPostmanCollection(collectionService: any) {
        try {
            const generatePostman = new Postman(collectionService);
            return await generatePostman.getPostmanCollection();
        } catch (e: any) {
            this.logger.log(this.logger.message.error, e.message, {
                file: "postmanModel.ts",
                line: "24",
                function: "getPostmanCollection",
            });
            throw e;
        }
    }
}
