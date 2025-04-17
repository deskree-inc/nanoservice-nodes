// cetConfigData.ts
/**
 * This is the class gets and returns configuration data from DB
 *
 * @module GetConfigData
 */

import { Logger } from "../../logger@1.0.0/logger";
import Utils from "./utils";

export default class GetConfigData {
    private readonly collectionService;
    private readonly configCollection: string;
    private logger;
    public config!: Array<Record<string, any>>;

    constructor(conf: string, collectionService: any) {
        this.collectionService = collectionService;
        this.configCollection = conf;
        this.logger = new Logger("graphql-service", "deskree-gcp");
    }

    /**
     * Get configuration data from DB
     * @return config configuration object
     */
    public async getConfigData(): Promise<any> {
        try {
            const collection = {
                name: this.configCollection,
            };
            const response = await this.collectionService.getAll(collection);
            if (Utils.checkForArray(response.data)) {
                const result = response.data.map((obj: any) => {
                    return obj.attributes;
                });
                if (this.configCollection === "config-collections") {
                    let object: Record<string, any> = {};
                    for (const config of result) {
                        object[config.name] = [];
                        config.order = 1;
                        for (const item in config.model) {
                            if (GetConfigData.checkForReference(config.model[item])) {
                                object[config.name].push(config.model[item].replace(/<.*$/, "").toLowerCase());
                            }
                        }
                    }
                    for (const item in object) {
                        for (const table of object[item]) {
                            const index = result.findIndex((a: any) => a.name.toLowerCase() === table);
                            if (result[index]) result[index].order += 1;
                        }
                    }
                    for (const config of result) {
                        for (const item in config.model) {
                            if (GetConfigData.checkForReference(config.model[item])) {
                                const name = config.model[item].replace(/<.*$/, "").toLowerCase();
                                const ref = result.find((a: any) => a.name.toLowerCase() === name);
                                if (ref?.order <= config.order) {
                                    ref.order += 1;
                                }
                            }
                        }
                    }
                    this.config = result.sort((a: any, b: any) => (a.order < b.order ? 1 : b.order < a.order ? -1 : 0));
                } else {
                    this.config = result;
                }
            } else {
                this.logger.log(this.logger.message.emergency, this.logger.getStatusMessage(500), {
                    file: "getConfigData.ts",
                    line: "36",
                    function: "getConfigData",
                });
                return new Error(`Invalid Collections Array`);
            }
        } catch (e) {
            this.logger.log(this.logger.message.emergency, this.logger.getStatusMessage(500), {
                file: "getConfigData.ts",
                line: "37",
                function: "getConfigData",
            });
            throw e;
        }
    }

    /**
     * Listen for the configuration updated
     * @return config configuration object
     */
    public listenForChanges(): void {
        const firestore = this.collectionService.firebase.firestore();
        const query = firestore.collection(this.configCollection);
        query.onSnapshot(
            (querySnapshot: any) => {
                const response: Array<Record<string, any>> = [];
                querySnapshot.forEach((doc: any) => {
                    response.push(doc.data());
                });
                this.config = response;
            },
            (e: any) => {
                this.logger.log(this.logger.message.emergency, this.logger.getStatusMessage(500), {
                    file: "getConfigData.ts",
                    line: "56",
                    function: "listenForChanges",
                });
                throw e;
            }
        );
    }

    private static checkForReference(type: string): Boolean {
        switch (type.toLowerCase().replace("?", "")) {
            case "storage":
                return false;
            case "string":
                return false;
            case "integer":
                return false;
            case "float":
                return false;
            case "boolean":
                return false;
            case "array<string>":
                return false;
            case "array<integer>":
                return false;
            case "array<float>":
                return false;
            case "array<boolean>":
                return false;
            case "map":
                return false;
            case "uid":
                return false;
            default:
                return true;
        }
    }
}
