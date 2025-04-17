// graphqlCheckPermissions.ts
/**
 * GraphQl module for checking permissions
 *
 * @module GraphqlCheckPermissions
 */
// import CollectionService from "../services/collectionService";
import { PermissionCheck } from "../../modules/@deskree-inc/permissions-check";
import { Logger } from "../../logger@1.0.0/logger";
import { GetConfigData } from "../helpers";
import { Error } from "../interfaces/Error";
import { CollectionService } from './collectionService';

export class GraphqlCheckPermissions {
    private logger;
    private configData: GetConfigData;
    private collectionService: CollectionService;
    private permissionCheck: PermissionCheck;

    constructor(_PRIVATE_: any) {
        this.logger = new Logger("graphql-service", process.env.PROJECT_ID as string);
        this.collectionService = _PRIVATE_.get("collectionService") as CollectionService;
        this.configData = new GetConfigData("config-permissions", this.collectionService);
        this.permissionCheck = new PermissionCheck(
            this.collectionService,
            _PRIVATE_.get("gcp.ip.url") as string,
            _PRIVATE_.get("gcp.ip.apiKey") as string
        );
    }

    async initialize() {
        try {
            await this.configData.getConfigData();
            this.configData.listenForChanges();
        } catch (e: any) {
            this.logger.log(this.logger.message.emergency, e.message, {
                file: "graphqlCheckPermissions.ts",
                line: "22",
                function: "initialize",
            });
            throw e;
        }
    }

    /**
     * Check permissions against configuration
     * @param req Express Request
     * @param uid optional object uid
     * @return boolean or error
     */
    public async checkPermissions(req: any, uid?: string) {
        if (!this.configData.config) {
            await this.initialize();
        }
        if (req.body.query) {
            const collectionConfig: any = this.configData.config.find((obj) => obj.name === "collections");
            let split = req.body.query.match(/(\w+)\s*\(/)
                ? req.body.query.match(/(\w+)\s*\(/)![1]
                : req.body.query.match(/(mutation|query)\s*([^\s($]+)?\s*{/)[2];
            let method: string = GraphqlCheckPermissions.convertMethod(split);
            if (method === "get" && uid !== undefined) {
                method = "get_uid";
            }
            const name: string = GraphqlCheckPermissions.convertName(split);
            const adminToken =
                req.headers.hasOwnProperty("deskree-admin") && req.headers["deskree-admin"] === "verified";
            try {
                return await this.permissionCheck.checkInstancePermissions(
                    "GRAPH",
                    "collections",
                    name,
                    req,
                    method,
                    collectionConfig,
                    adminToken,
                    uid
                );
            } catch (e) {
                throw e;
            }
        }
        throw {
            code: "422",
            title: this.logger.getStatusMessage(422).details,
            detail: "Please specify the query or mutation name.",
        } as Error;
    }

    /**
     * Convert query or mutation name to collection name
     * @param name operationName of the request
     * @return name collection name
     */
    private static convertName(name: string) {
        if (name.includes("create")) {
            return `${name.replace("create", "").toLowerCase()}s`;
        }
        if (name.includes("update")) {
            return `${name.replace("update", "").toLowerCase()}s`;
        }
        if (name.includes("delete")) {
            return `${name.replace("delete", "").toLowerCase()}s`;
        }
        return name.toLowerCase();
    }

    /**
     *
     * Convert query or mutation name to request method
     * @param method operationName of the request
     * @return method request method
     */
    private static convertMethod(method: string) {
        if (method.includes("create")) {
            return "post";
        }
        if (method.includes("update")) {
            return "patch";
        }
        if (method.includes("delete")) {
            return "delete";
        }
        return "get";
    }
}
