// permissionCheck.ts
/**
 * This is the middleware for checking permissions for collection and integrations requests
 *
 * @module PermissionCheck
 */

import axios from "axios";
import { Error, CollectionConfig } from "./interfaces";

export class PermissionCheck {
    private collectionService;
    private readonly baseUrl;
    private readonly apikey;

    constructor(collection: any, GCP_IP_BASE_URL: string, GCP_IP_API_KEY: string) {
        this.collectionService = collection;
        this.baseUrl = GCP_IP_BASE_URL;
        this.apikey = GCP_IP_API_KEY;
    }

    /**
     * Check if a user has permissions to access the endpoint
     * @param api either 'REST' or 'GRAPH'
     * @param type either 'collections' or the name of integration
     * @param name name of the endpoints
     * @param req express request object
     * @param method GET | GET_UID | POST | PATCH | DELETE | PUT
     * @param collectionConfig CollectionConfig
     * @param uid optional object uid
     * @param adminToken whether Deskree Admin token is present, verified, and valid
     */
    public async checkInstancePermissions(
        api: string,
        type: string,
        name: string,
        req: any,
        method: string,
        collectionConfig: CollectionConfig,
        adminToken: boolean,
        uid?: string | undefined
    ) {
        if (collectionConfig && collectionConfig.endpoints) {
            if (name === "postman" && !adminToken) {
                throw {
                    code: "403",
                    title: "Forbidden",
                    detail: "You can only access this endpoint with an admin token.",
                };
            }
            if (name === "users" && (method === "delete" || method === "post")) {
                if (method === "post") {
                    throw {
                        code: "403",
                        title: "User cannot be created",
                        detail: `To create a user, you can use signup with email/password https://${process.env.DESKREE_ID}.api.deskree.com/api/v1/auth/accounts/signup endpoint. Or sign in with a selected OAUTH provider via https://${process.env.DESKREE_ID}.api.deskree.com/api/v1/auth/accounts/sign-in/idp`,
                    } as Error;
                } else if (method === "delete") {
                    throw {
                        code: "403",
                        title: "User cannot be deleted",
                        detail: `To delete a user, please use https://${process.env.DESKREE_ID}.api.deskree.com/api/v1/auth/accounts/delete endpoint.`,
                    } as Error;
                }
            }
            const endpointConfig: any = collectionConfig.endpoints.find(
                (obj) => obj.name.toLowerCase() === name.toLowerCase()
            );
            if (endpointConfig && endpointConfig.methods) {
                if (adminToken) {
                    return true;
                }
                const permission = endpointConfig.methods[method];
                const token = PermissionCheck.checkHeader(req.headers, api);
                if (token) {
                    let user: any;
                    try {
                        user = await this.getUserFromFirebase(token);
                    } catch (e) {
                        if (permission === "public") {
                            PermissionCheck.authorCheck(type, req, "", name, method, api);
                            return true;
                        } else {
                            throw {
                                code: "403",
                                title: "Forbidden",
                                detail: "Auth token has expired. Get a fresh ID token from your client app and try again.",
                            } as Error;
                        }
                    }
                    if (user) {
                        PermissionCheck.authorCheck(type, req, user.uid, name, method, api);
                        if (permission === "private") {
                            return true;
                        } else if (
                            permission === "author" &&
                            uid &&
                            type === "collections" &&
                            (method === "patch" || method === "delete" || method === "get_uid")
                        ) {
                            const collection = {
                                name: name,
                                uid: uid,
                            };
                            try {
                                const result = await this.collectionService.getAll(collection);
                                if (name === "users") {
                                    if (uid === user.uid) {
                                        req.headers["user"] = user;
                                        return true;
                                    }
                                } else {
                                    return result.data.author === user.uid;
                                }
                            } catch (e) {
                                throw {
                                    code: "403",
                                    title: "Forbidden",
                                    detail: "Current user is not the author of the requested object",
                                } as Error;
                            }
                        } else if (Array.isArray(permission) && user.roles) {
                            const roleMatch = permission.some((obj) => {
                                return !!user.roles.includes(obj);
                            });
                            if (roleMatch) {
                                return true;
                            }
                            throw {
                                code: "403",
                                title: "Forbidden",
                                detail: "Current user does not have sufficient role to access this endpoint.",
                            } as Error;
                        } else if (permission === "public") {
                            return true;
                        } else if (permission === "admin" && !adminToken) {
                            throw {
                                code: "403",
                                title: "Forbidden",
                                detail: "You can only access this endpoint with an admin token.",
                            };
                        } else {
                            throw {
                                code: "500",
                                title: "Internal Server Error",
                                detail: "Invalid permission configuration.",
                            } as Error;
                        }
                    } else if (permission === "admin" && !adminToken) {
                        throw {
                            code: "403",
                            title: "Forbidden",
                            detail: "You can only access this endpoint with an admin token.",
                        };
                    } else if (permission === "public") {
                        PermissionCheck.authorCheck(type, req, "", name, method, api);
                        return true;
                    } else {
                        throw {
                            code: "403",
                            title: "Forbidden",
                            detail: "Only authenticated users are allowed to make this request.",
                        };
                    }
                } else if (permission === "admin" && !adminToken) {
                    throw {
                        code: "403",
                        title: "Forbidden",
                        detail: "You can only access this endpoint with an admin token.",
                    };
                } else if (permission === "public") {
                    PermissionCheck.authorCheck(type, req, "", name, method, api);
                    return true;
                } else {
                    throw { code: "403", title: "Forbidden", detail: "Token is not valid" } as Error;
                }
            }
            throw {
                code: "500",
                title: "Internal Server Error",
                detail: "Bad collection configuration object: no endpoint configuration found.",
            } as Error;
        }
        throw { code: "500", title: "Internal Server Error", detail: "No collection configuration object." } as Error;
    }

    /**
     * Check if author param should be assigned
     * @param type collection || integration
     * @param req Express request object
     * @param author value to assign to author
     * @param collectionName name of the collection
     * @param method GET | GET_UID | POST | PATCH | DELETE | PUT
     * @param api either 'REST' or 'GRAPH'
     */
    private static authorCheck(
        type: string,
        req: any,
        author: string,
        collectionName: string,
        method: string,
        api: string
    ) {
        if (
            collectionName !== "users" &&
            type === "collections" &&
            (method === "post" || method === "put" || method === "patch")
        ) {
            if (api === "REST") {
                req.body["author"] = author;
            } else if (api === "GRAPH") {
                req.body.query.replace("data: {", "data: { author: null");
            }
        }
    }

    /**
     * Check if the request has authorization header present
     * @param headers express request headers
     * @param api either 'REST' or 'GRAPH'
     * @return boolean whether the header is present
     */
    private static checkHeader(headers: any, api: string) {
        let header = "";
        if (api === "REST") {
            header = headers["Authorization"] || headers["authorization"];
        } else if (api === "GRAPH") {
            header = headers["firebaseAuthorization"] || headers["firebaseauthorization"];
        }
        return header ? header.split("Bearer ")[1] : null;
    }

    /**
     * Get user object from Firebase
     * @param token authentication token from Authorization header
     * @return user user object or false
     */
    private async getUserFromFirebase(token: any) {
        try {
            const result = await axios.post(`${this.baseUrl}accounts:lookup?key=${this.apikey}`, {
                idToken: token,
            });
            if (
                result.data &&
                result.data.hasOwnProperty("users") &&
                result.data.users[0] &&
                result.data.users[0].hasOwnProperty("localId")
            ) {
                const collection = {
                    name: "users",
                    uid: result.data.users[0].localId,
                };
                const user = await this.collectionService.getAll(collection);
                user["uid"] = result.data.users[0].localId;
                return { ...user.data, uid: result.data.users[0].localId };
            } else {
                return false;
            }
        } catch (e) {
            throw e;
        }
    }
}
