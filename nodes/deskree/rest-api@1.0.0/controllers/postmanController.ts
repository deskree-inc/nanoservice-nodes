import { PostmanModel } from "../models/postmanModel";
import { BaseModel } from "../models/baseModel";

/**
 * This is the controller that returns Postman collection
 *
 * @module PostmanController
 */

export default class PostmanController extends BaseModel {
    private postman;
    private collectionService;

    constructor(collectionService: any) {
        super();
        this.collectionService = collectionService;
        this.postman = new PostmanModel();
    }

    /**
     * Get list postman collection for the existing endpoints
     * @param req: Express Request
     * @param res: Express Response
     * @param next Express Next
     */
    public async getPostmanCollection(req: any) {
        try {
            const result = await this.postman.getPostmanCollection(this.collectionService);
            // res["processed"] = this.logger.getDuration(req);
            this.logger.log(
                this.logger.message.info,
                this.logger.getStatusMessage(200),
                {
                    file: "postmanController.ts",
                    line: "36",
                    function: "getPostmanCollection",
                },
                req,
                undefined,
                [{ billable: "billable" }]
            );
            return result;
        } catch (e: any) {
            // res["processed"] = this.logger.getDuration(req);
            this.logger.log(
                this.logger.message.error,
                e.message,
                {
                    file: "postmanController.ts",
                    line: "36",
                    function: "getPostmanCollection",
                },
                req,
                undefined
            );
            return {
                code: 500,
                errors: [
                    {
                        code: 500,
                        title: "Internal Server Error",
                        details: e.message,
                    },
                ],
            };
        }
    }
}
