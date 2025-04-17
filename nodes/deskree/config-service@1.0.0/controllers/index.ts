import {CollectionsController} from "./collectionsController";
import {PermissionsController} from "./permissionsController";
import {RolesController} from "./rolesController";
import {DataController} from "./dataController";
import {AuthController} from "./authController";
import {SecretsController} from "./secretsController";
import {WebhooksController} from "./webhooksController";
import {PostmanController} from "./postmanController";
export default class RestController {
    public init(controller: any, collectionService: any, _PRIVATE_: any) {
        switch (controller) {
            case "collections":
                return new CollectionsController(collectionService);
            case "permissions":
                return new PermissionsController(collectionService);
            case "roles":
                return new RolesController(collectionService);
            case "data":
                return new DataController(collectionService);
            case "auth":
                return new AuthController(collectionService);
            case "secrets":
                return new SecretsController(_PRIVATE_.get("firebase.config"));
            case "webhooks":
                return new WebhooksController(collectionService);
            case "postman":
                return new PostmanController();
            default:
                throw new Error("Invalid controller");
        }
    }
}
