// webhooksController.ts
/**
 * Controller for managing webhooks configurations
 *
 * @module WebhooksController
 */

import { ExpressController } from "./expressController";
import IControllerBase from "../interfaces/IControllerBase";
import { z } from "zod";
import { ResError } from "../helpers/resError";
import { ResSuccess } from "../helpers/resSuccess";
import { ConfigModel } from "../models/configModel";
import CollectionsController from "./collectionsController";

const WebhookUpdateBodyValidator = z.object({
    webhooks: z.array(z.string()),
    method: z.enum(["POST", "PATCH", "DELETE"])
});


export class WebhooksController extends ExpressController implements IControllerBase {


    private collections;
    private resError = new ResError("webhooksController.ts");
    private resSuccess = new ResSuccess("webhooksController.ts");

    constructor(collectionService: any) {
        super();
        this.collections = new ConfigModel('config-collections', collectionService);
    }

    public path = '/webhooks';
    public name = 'Webhooks';
    public description = "Endpoints for managing webhooks configurations. To get the list of webhooks, use GET List of Collections Models from Collections endpoints folder";
    public routes = [
        {
            name: 'Update a list of webhooks',
            url: `${this.path}/:collection_id`,
            method: 'PATCH',
            description: 'Update a list of webhooks for a given collection. To manage webhooks specify the method and the table where you want the webhook to be triggered as well as the list of urls where the requests should be sent to. To delete all webhooks, send an empty array for the webhooks property. Note that webhooks cannot be sent to users table and to the same URL where webhook is triggered.',
            body: {
                webhooks: ["https://example.com/webhook1", "https://example.com/webhook2"],
                method: "PATCH"
            },
            function: this.updateWebhooks.bind(this)
        }
    ];

    public async initRoutes(req: any): Promise<any> {
        for (const route of this.routes) {
            if (this.validateRoute(route.url, req.path) && route.method.toLocaleLowerCase() === req.method.toLowerCase()) {
                req.params = this.handleDynamicRoute(route.url, req);
                return await route.function(req);
            }
        }
        return { code: 404, error: 'Route not found' };
    }

    /**
     * Update a list of webhooks
     * @param req: Express Request
     * @param res: Express Response®
     */
    public async updateWebhooks(req: any) {
        try {
            const body = WebhookUpdateBodyValidator.parse(req.body);
            const existing = await this.collections.getById(req.params.collection_id);
            let go = true;
            for (const webhook of body.webhooks) {
                const matchCollection = /\/rest\/collections\/([A-z]+)(\/?([A-z0-9]+))?(\/([A-z]+)(\/?([A-z0-9]+))?)?/gm.exec(
                    webhook);
                if (matchCollection && (matchCollection[1] === existing.data.name || matchCollection[1] === 'users')) {
                    go = false;
                }
            }
            if (go) {
                const data = Object.prototype.hasOwnProperty.call(existing.data, 'webhooks') ? existing.data.webhooks : {};
                data[body.method.toLowerCase()] = body.webhooks;
                const result = await this.collections.update(req.params.collection_id, { webhooks: data });
                this.resSuccess.sendSuccessResponse(req, 200, "updateWebhooks", "72", { data: result });
            } else {
                this.resError.sendErrorResponse(req, 422, "updateWebhooks", "69", false, "Webhooks cannot be sent to users table and to the same URL where webhook is triggered.");
            }
        } catch (e) {
            this.resError.catchError(e, req, "updateWebhooks", "60");
        }
    }
}

export default CollectionsController;
