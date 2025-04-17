// getConfigData.ts
/**
 * This is the class gets and returns configuration data from DB
 *
 * @module GetConfigData
 */

import Utils from "./utils";
//@ts-ignore
import { Logger } from "../../logger@1.0.0/logger";

export default class GetConfigData {
    private readonly collectionService;
    private readonly collection = "config-collections";
    private logger;
    public config: any[] = [];

    constructor(collectionService: any) {
        this.collectionService = collectionService;
        this.logger = new Logger("rest", process.env.PROJECT_ID as string);
    }
    /**
     * Get configuration data from DB
     * @return config configuration object
     */
    public async getConfigData() {
        try {
            const collection = {
                name: this.collection,
            };
            const response = await this.collectionService.getAll(collection);
            if (Utils.checkForArray(response.data)) {
                /* istanbul ignore next */
                this.config = response.data.map((obj: { attributes: any }) => {
                    return obj.attributes;
                });
                return this.config;
            }
            throw new Error(`Invalid configuration Array`);
        } catch (e: any) {
            this.logger.log(this.logger.message.emergency, e.message, {
                file: "getConfigData.ts",
                line: "28",
                function: "getConfigData",
            });
            throw e;
        }
    }

    public listenForChanges() {
        const firestore = this.collectionService.firebase.firestore();
        const query = firestore.collection(this.collection);
        query.onSnapshot(
            (querySnapshot: any) => {
                const response: any[] = [];
                querySnapshot.forEach((doc: { data: () => any }) => {
                    response.push(doc.data());
                });
                this.config = response;
            },
            (e: { message: any }) => {
                this.logger.log(this.logger.message.emergency, e.message, {
                    file: "getConfigData.ts",
                    line: "56",
                    function: "listenForChanges",
                });
                throw e;
            }
        );
    }
}
