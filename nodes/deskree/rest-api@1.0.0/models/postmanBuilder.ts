import { Utils, GetConfigData } from "../helpers";
import { Collection, ItemGroup } from "postman-collection";
import { PostmanCollection } from "../interfaces/PostmanCollection";
import * as fs from "fs";

export class Postman {
    private collectionService: any;
    private postmanCollection;
    private config: Array<any> = [];
    private readonly baseUrl: string;

    constructor(collectionService: any) {
        this.collectionService = collectionService;
        this.baseUrl = `https://${process.env.DESKREE_ID}.api.deskree.com/api/v1/rest/collections`;
        this.postmanCollection = new Collection({
            info: {
                name: process.env.DESKREE_ID,
            },
        });
    }

    async getPostmanCollection() {
        try {
            const configData = new GetConfigData(this.collectionService);
            this.config = await configData.getConfigData();
            const collections = await this.generatePostmanDataFromModel();
            for (const collection of collections) {
                this.generatePostmanCollection(collection);
            }

            return this.postmanCollection.toJSON();
        } catch (e) {
            throw e;
        }
    }

    async initialize(filePath = ".") {
        try {
            const configData = new GetConfigData(this.collectionService);
            this.config = await configData.getConfigData();
            const collections = await this.generatePostmanDataFromModel();
            for (const collection of collections) {
                this.generatePostmanCollection(collection);
            }
            this.saveFile(filePath);
        } catch (e) {
            throw e;
        }
    }

    /**
     * Generated postman objects from configuration model
     * @return array
     */
    private async generatePostmanDataFromModel() {
        const postmanData: Array<any> = [];
        if (Utils.checkForArray(this.config)) {
            this.config.map((obj) => {
                if (obj.name && typeof obj.name === "string" && obj.model && typeof obj.model === "object") {
                    const nameSingular = obj.name.slice(0, -1);
                    const path = `/${obj.name}`;
                    const model = JSON.parse(JSON.stringify(obj.model));
                    // normalize model types to match JS
                    for (const key in model) {
                        model[key] = Utils.normalizeTypes(model[key]);
                    }
                    delete model.uid;
                    if (model.hasOwnProperty("createdAt")) {
                        delete model.createdAt;
                    }
                    if (model.hasOwnProperty("updatedAt")) {
                        delete model.updatedAt;
                    }
                    if (model.hasOwnProperty("author")) {
                        delete model.author;
                    }
                    let description;
                    let routes;
                    if (obj.name.toLowerCase() === "users") {
                        description = `Collection of endpoints for managing Users data. Note that in order to create a user you need to use AUTH endpoint to sign up either with email/password or OAUTH. And in order to delete one, you need to use /api/v1/auth/accounts/delete endpoint.`;
                        if (model.hasOwnProperty("email")) {
                            delete model.email;
                        }
                        routes = [
                            {
                                name: `Get users`,
                                url: path,
                                method: "GET",
                                description: `Retrieve a list of all Users`,
                                params: [
                                    'where=[{"attribute":"userUid","operator":"=","value":"Sdu2DTtF4bOlSfYJvC4X"}]',
                                    "sorted[param]=name",
                                    "sorted[how]=desc",
                                    "page=1",
                                    "limit=10",
                                    'includes=["products","discountCodeType"]',
                                ],
                            },
                            {
                                name: `Get user by UID`,
                                url: `${path}/{{${nameSingular}_uid}}`,
                                method: "GET",
                                params: ['includes=["products","discountCodeType"]'],
                                description: `Get a single ${nameSingular} by its UID`,
                            },
                            {
                                name: `Update user by UID`,
                                url: `${path}/{{${nameSingular}_uid}}`,
                                method: "PATCH",
                                description: `Update User by UID. Note that email field can only be updated via AUTH endpoint /api/v1/auth/accounts/update-email`,
                                params: ["skipFileExceptions=false"],
                                body: model,
                            },
                        ];
                    } else {
                        description = `Collection of endpoints for managing ${Utils.capitalizeFirstLetter(
                            obj.name
                        )} data.`;
                        routes = [
                            {
                                name: `Get ${obj.name}`,
                                url: path,
                                method: "GET",
                                description: `Retrieve a list of all ${obj.name}`,
                                params: [
                                    'where=[{"attribute":"userUid","operator":"=","value":"Sdu2DTtF4bOlSfYJvC4X"}]',
                                    "sorted[param]=name",
                                    "sorted[how]=desc",
                                    "page=1",
                                    "limit=10",
                                    'includes=["users","discountCodeType"]',
                                ],
                            },
                            {
                                name: `Get ${nameSingular} by UID`,
                                url: `${path}/{{${nameSingular}_uid}}`,
                                method: "GET",
                                params: ['includes=["products","discountCodeType"]'],
                                description: `Get a single ${nameSingular} by its UID`,
                            },
                            {
                                name: `Create ${nameSingular}`,
                                url: path,
                                method: "POST",
                                description: `Create new ${nameSingular}`,
                                params: ["skipFileExceptions=false"],
                                body: model,
                            },
                            {
                                name: `Update ${nameSingular} by UID`,
                                url: `${path}/{{${nameSingular}_uid}}`,
                                method: "PATCH",
                                description: `Update ${obj.name} by UID`,
                                params: ["skipFileExceptions=false"],
                                body: model,
                            },
                            {
                                name: `Delete ${nameSingular} by UID`,
                                url: `${path}/{{${nameSingular}_uid}}`,
                                method: "DELETE",
                                description: `Delete ${obj.name} by UID`,
                            },
                        ];
                    }
                    postmanData.push({
                        name: Utils.capitalizeFirstLetter(obj.name),
                        description: description,
                        routes: routes,
                    });
                } else {
                    throw Error("Invalid configuration Array");
                }
            });
            return postmanData;
        }
        throw Error("Invalid configuration Array");
    }

    private generatePostmanCollection(obj: PostmanCollection) {
        if (obj.hasOwnProperty("routes")) {
            const group = new ItemGroup({ name: obj.name });
            group.describe(obj.description);

            obj.routes.forEach((obj) => {
                const request: Record<string, any> = {
                    url: `${this.baseUrl}${obj.url}`,
                    method: obj.method,
                    headers: {
                        "Content-Type": "application/json",
                    },
                };
                if (obj.hasOwnProperty("body")) {
                    request["body"] = {
                        mode: "raw",
                        raw: JSON.stringify(obj.body),
                        options: {
                            raw: {
                                language: "json",
                            },
                        },
                    };
                }
                if (obj?.params && obj.hasOwnProperty("params")) {
                    request.url += "?";
                    for (const param of obj.params) {
                        request.url += `${param}&`;
                    }
                    request.url = request.url.slice(0, -1);
                }
                if (obj.hasOwnProperty("description")) {
                    request["description"] = obj.description;
                }
                const item = {
                    name: obj.name,
                    request: request,
                };
                group.items.add(item);
            });
            //@ts-ignore
            this.postmanCollection.items.add(group);
        }
    }

    private saveFile(outputPath: string) {
        // Convert the collection to JSON
        // so that it can be exported to a file

        const collectionJSON = this.postmanCollection.toJSON();
        // Create a collection.json file. It can be imported to postman
        fs.writeFile(`${outputPath}/lib/collection.jimport collectionService from '../../config-service@1.0.0/helpers/collectionService';
son`, JSON.stringify(collectionJSON), (err) => {
            /* istanbul ignore next */
            if (err) {
                throw err;
            }
        });
    }
}
