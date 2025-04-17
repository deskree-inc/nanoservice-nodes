import { RestControllerType } from "../interfaces";
import { requestNotFound } from "../helpers";

import CollectionController from "./collectionController";
import PostmanController from "./postmanController";
import StorageController from "./storageController";

export default class RestController {
    public async init({ method, request, type }: RestControllerType, _PRIVATE_?: any) {
        switch (type) {
            case "collection":
                return await new CollectionController(_PRIVATE_).init(method, request);
            case "postman":
                return await new PostmanController(_PRIVATE_.get("collectionService")).getPostmanCollection(request);
            case "storage":
                return await new StorageController(_PRIVATE_).getFileFromStorage(request);
            default:
                return requestNotFound();
        }
    }
}
