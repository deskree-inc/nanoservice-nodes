// graphql.ts
/**
 * GraphQl service for handling GraphQl requests
 *
 * @module GraphqlService
 */

import {
    GraphQLBoolean,
    GraphQLFloat,
    GraphQLID,
    GraphQLInputObjectType,
    GraphQLInt,
    GraphQLList,
    GraphQLNonNull,
    GraphQLObjectType,
    GraphQLSchema,
    GraphQLString,
} from "graphql";
import GraphQLJSON from "graphql-type-json";
import { Utils } from "../helpers";
import { GraphqlResolvers } from "./graphqlResolvers";
import { GetConfigData } from "../helpers";
import { Logger } from "../../logger@1.0.0/logger";

export default class GraphqlService {
    private logger;
    public graphQlHttp: any;
    private collectionFields: Array<any> = [];
    private resolvers!: GraphqlResolvers;
    private readonly collectionService: any;
    private _PRIVATE_: any;

    constructor(_PRIVATE_: any) {
        this.collectionService = _PRIVATE_.get("collectionService");
        this.logger = new Logger("graphql-service", _PRIVATE_.get("gcp.project.id") as string);
        this._PRIVATE_ = _PRIVATE_;
    }

    public async createSchema(): Promise<GraphQLSchema> {
        try {
            const configData = await new GetConfigData("config-collections", this.collectionService);
            await configData.getConfigData();
            const config = await configData.config;
            this.collectionFields = this.populateCollectionFields(config);
            this.resolvers = new GraphqlResolvers(this.collectionFields, config, this._PRIVATE_);
            await this.resolvers.initialize();
            return this.buildSchema(config);
        } catch (e: any) {
            this.logger.log(this.logger.message.emergency, e.message, {
                file: "graphqlService.ts",
                line: "40",
                function: "createSchema",
            });
            throw e;
        }
    }

    /**
     * Creates GraphQL object types out of appConfig file
     * @param config Configuration array
     * @return collection Array of GraphQL objects
     */
    private populateCollectionFields(config: Array<any>) {
        const collection: Array<any> = [];
        if (Utils.checkForArray(config)) {
            for (const conf of config) {
                if (
                    typeof conf === "object" &&
                    conf !== null &&
                    conf.hasOwnProperty("model") &&
                    conf.hasOwnProperty("name") &&
                    conf.hasOwnProperty("config")
                ) {
                    let fields = this.buildFieldsFromConfig(collection, conf.model, conf.config);
                    const newType = new GraphQLObjectType({
                        name: conf.name,
                        description: `${conf.name} type definition`,
                        fields,
                    });
                    collection.push(newType);
                    const name = conf.name.toLowerCase();
                    fields = this.buildFieldsFromConfigInput(collection, conf.model, name);
                    const newInputType = new GraphQLInputObjectType({
                        name: `${conf.name.slice(0, -1)}Input`,
                        description: `Input payload for ${name !== "users" ? "creating and" : ""} updating ${
                            conf.name
                        }`,
                        fields,
                    });
                    collection.push(newInputType);
                } else {
                    this.logger.log(
                        this.logger.message.debug,
                        { code: 500, details: "Invalid Configuration File" },
                        {
                            file: "graphql.ts",
                            line: "216",
                            function: "populateCollectionFields",
                        }
                    );
                    throw new Error("Invalid Configuration File");
                }
            }
            return collection;
        }
        this.logger.log(
            this.logger.message.debug,
            { code: 500, details: "Invalid Configuration Array" },
            {
                file: "graphql.ts",
                line: "216",
                function: "populateCollectionFields",
            }
        );
        throw new Error(`Invalid Configuration Array`);
    }

    /**
     * Creates GraphQL Schema out of appConfig file
     * @param models array of collection configs
     * @return GraphQLSchema GraphQL schema
     */
    private buildSchema(models: Array<any>) {
        return new GraphQLSchema({
            query: this.buildQuery(models),
            mutation: this.buildMutation(models),
        });
    }

    /**
     * Creates GraphQL Query Object
     * @param models array of collections configs
     * @return GraphQLObjectType complete GraphQL query object
     */
    private buildQuery(models: Array<any>) {
        const fields: Record<any, any> = {};
        const config = this.collectionFields;
        if (Utils.checkForArray(config)) {
            for (const field of config) {
                if (field.hasOwnProperty("name")) {
                    if (!field.name.includes("Input")) {
                        fields[field.name] = this.createQueryObject(field, models);
                    }
                } else {
                    this.logger.log(
                        this.logger.message.debug,
                        {
                            details: `Invalid Configuration File`,
                            code: 500,
                        },
                        {
                            file: "graphql.ts",
                            line: "216",
                            function: "buildQuery",
                        }
                    );
                    throw new Error("Invalid Configuration File");
                }
            }
            return new GraphQLObjectType({
                name: "Query",
                fields,
            });
        }
        this.logger.log(
            this.logger.message.debug,
            {
                details: `Invalid Configuration Array`,
                code: 500,
            },
            {
                file: "graphql.ts",
                line: "216",
                function: "buildQuery",
            }
        );
        throw new Error(`Invalid Configuration Array`);
    }

    /**
     * Creates GraphQL Query fields and assigns resolve methods
     * @param field GraphQL field object
     * @param models config model object
     * @return fields GraphQL field object
     */
    private createQueryObject(field: GraphQLObjectType, models: Array<any>) {
        return {
            type: new GraphQLList(field),
            args: {
                uid: {
                    type: GraphQLID,
                },
                page: {
                    type: GraphQLInt,
                },
                limit: {
                    type: GraphQLInt,
                },
            },
            resolve: async (_: any, { uid, page, limit }: any, req: any) => {
                try {
                    return await this.resolvers.queryResolver(field, models, uid, page, limit, req);
                } catch (e: any) {
                    throw new Error(Utils.errorFormatter(e));
                }
            },
        };
    }

    /**
     * Creates GraphQL Mutation and assigns resolve methods
     * @param models array of collection configs
     * @return GraphQLObjectType complete GraphQL query object
     */
    private buildMutation(models: Array<any>) {
        const fields: Record<any, any> = {};

        for (const field of this.collectionFields) {
            if (!field.name.includes("Input")) {
                if (field.name.toLowerCase() === "users") {
                    fields[`update${field.name.slice(0, -1)}`] = this.updateMutation(field, models);
                } else {
                    fields[`create${field.name.slice(0, -1)}`] = this.createMutation(field, models);
                    fields[`update${field.name.slice(0, -1)}`] = this.updateMutation(field, models);
                    fields[`delete${field.name.slice(0, -1)}`] = this.deleteMutation(field, models);
                }
            }
        }
        return new GraphQLObjectType({
            name: "Mutation",
            fields,
        });
    }

    /**
     * Creates GraphQL CREATE Mutation
     * @param field GraphQL object
     * @param models array of collection configs
     * @return createMutation GraphQL CREATE Mutation Object
     */
    private createMutation(field: GraphQLObjectType, models: Array<any>) {
        const name = `${field.name.slice(0, -1)}Input`;
        const inputType = this.collectionFields.find((field) => {
            return field.name.toLowerCase() === name.toLowerCase();
        });
        if (inputType) {
            return {
                type: new GraphQLNonNull(field),
                args: {
                    data: {
                        type: new GraphQLNonNull(inputType),
                    },
                },
                resolve: async (_: any, { data }: any, req: any) => {
                    try {
                        return await this.resolvers.createMutationResolver(field, models, data, req);
                    } catch (e: any) {
                        throw new Error(Utils.errorFormatter(e));
                    }
                },
            };
        }
        this.logger.log(
            this.logger.message.debug,
            {
                details: `No Input File Exist`,
                code: 500,
            },
            {
                file: "graphql.ts",
                line: "216",
                function: "createMutation",
            }
        );
        throw new Error("No Input Type exists");
    }

    /**
     * Creates GraphQL UPDATE Mutation
     * @param field GraphQL object
     * @param models array of collection configs
     * @return updateMutation GraphQL UPDATE Mutation Object
     */
    private updateMutation(field: GraphQLObjectType, models: Array<any>) {
        const name = `${field.name.slice(0, -1)}Input`;
        const inputType = this.collectionFields.find((field) => {
            return field.name.toLowerCase() === name.toLowerCase();
        });
        if (inputType) {
            return {
                type: new GraphQLNonNull(field),
                args: {
                    uid: {
                        type: GraphQLID,
                    },
                    data: {
                        type: new GraphQLNonNull(inputType),
                    },
                },
                resolve: async (_: any, { uid, data }: any, req: any) => {
                    try {
                        return await this.resolvers.updateMutationResolver(field, models, uid, data, req);
                    } catch (e: any) {
                        throw new Error(Utils.errorFormatter(e));
                    }
                },
            };
        }
        this.logger.log(
            this.logger.message.debug,
            {
                details: `No Input Type Exists`,
                code: 500,
            },
            {
                file: "graphql.ts",
                line: "216",
                function: "updateMutation",
            }
        );
        throw new Error("No Input Type exists");
    }

    /**
     * Creates GraphQL DELETE Mutation
     * @param field GraphQL object
     * @param models array of collection configs
     * @return deleteMutation GraphQL DELETE Mutation Object
     */
    private deleteMutation(field: GraphQLObjectType, models: Array<any>) {
        return {
            type: GraphQLString,
            args: {
                uid: {
                    type: GraphQLID,
                },
            },
            resolve: async (_: any, { uid }: any, req: any) => {
                try {
                    return await this.resolvers.deleteMutationResolver(field, models, uid, req);
                } catch (e: any) {
                    throw new Error(Utils.errorFormatter(e));
                }
            },
        };
    }

    /**
     * Creates GraphQL Schema out of appConfig file
     * @param collection array of GraphQL objects
     * @param type Type defined in config file
     * @return returns a GraphQL type
     */
    private getGraphQlType(collection: Array<any>, type: String) {
        switch (type.toLowerCase()) {
            case "storage":
                return GraphQLString;
            case "string":
                return GraphQLString;
            case "integer":
                return GraphQLInt;
            case "float":
                return GraphQLFloat;
            case "boolean":
                return GraphQLBoolean;
            case "array<string>":
                return new GraphQLList(GraphQLString);
            case "array<integer>":
                return new GraphQLList(GraphQLInt);
            case "array<float>":
                return new GraphQLList(GraphQLFloat);
            case "array<boolean>":
                return new GraphQLList(GraphQLBoolean);
            case "uid":
                return GraphQLID;
            case "map":
                return GraphQLJSON;
            default:
                if (type.includes("Array")) {
                    return new GraphQLList(
                        collection.find((field) => {
                            return field.name.toLowerCase() === type.replace(/<.*$/, "").toLowerCase();
                        })
                    );
                }
                return collection.find((field) => {
                    return field.name.toLowerCase() === type.replace(/<.*$/, "").toLowerCase();
                });
        }
    }

    /**
     * Creates GraphQL types out of appConfig file
     * @param collection array of GraphQL objects
     * @param model Configuration file model
     * @param conf Configuration file config
     * @return response a GraphQL type
     */
    private buildFieldsFromConfig(collection: Array<any>, model: Object, conf: Record<any, any>) {
        const response: Record<any, any> = {};
        for (let [key, value] of Object.entries(model)) {
            // Check whether there is an optional parameter specified
            if (value.endsWith("?")) {
                value = value.slice(0, -1);
                response[key] = {
                    type: this.getGraphQlType(collection, value),
                };
            } else {
                response[key] = {
                    type: new GraphQLNonNull(this.getGraphQlType(collection, value)),
                };
            }
        }
        if (conf.hasOwnProperty("createdAt") && conf.createdAt) {
            response["createdAt"] = {
                type: GraphQLString,
            };
        }
        if (conf.hasOwnProperty("updatedAt") && conf.updatedAt) {
            response["updatedAt"] = {
                type: GraphQLString,
            };
        }
        return response;
    }

    /**
     * Creates GraphQL input types out of appConfig file
     * @param collection array of GraphQL objects
     * @param conf configuration file model
     * @param name collection name
     * @return response a GraphQL type
     */
    private buildFieldsFromConfigInput(collection: Array<any>, conf: Record<string, any>, name: string) {
        const response: Record<any, any> = {};
        for (const key in conf) {
            let confKeys = Object.keys(conf);
            if (confKeys.length > 0) {
                for (let i = 0; i < confKeys.length; i++) {
                    let fixedValue = conf[confKeys[i]];
                    let notValid = ["s", "i", "f", "b", "m", "a"];
                    let firstLetter = fixedValue.charAt(0);
                    if (notValid.includes(firstLetter)) {
                        conf[confKeys[i]] = conf[confKeys[i]].charAt(0).toUpperCase() + conf[confKeys[i]].slice(1);
                    }
                }
            }

            if (name !== "users" || (name === "users" && key.toLowerCase() !== "email")) {
                const allowedValues = [
                    "Storage",
                    "String",
                    "Integer",
                    "Float",
                    "Boolean",
                    "Map",
                    "Array<string>",
                    "Array<integer>",
                    "Array<float>",
                    "Array<boolean>",
                ];
                // Check whether there is an optional parameter specified
                // if it is we make it nullable
                if (conf[key].endsWith("?")) {
                    conf[key] = conf[key].slice(0, -1);
                    // Check that the model value is one of the allowedValues
                    // if it is then it is a standard and non-referencing field
                    if (allowedValues.includes(conf[key])) {
                        response[key] = {
                            type: this.getGraphQlType(collection, conf[key]),
                        };
                        // otherwise we treat is as a referencing field and make sure it is not a UID
                    } else if (conf[key] !== "UID") {
                        // example referencing field for one-to-one: discountcodetypes<string>
                        // example referencing field for one-to-many: users<Array<string>>
                        // here we check which type of referencing field it is
                        let type = conf[key].match(/<(.*?)>/);
                        type = type[1];
                        if (type !== "string") {
                            type = "array<string>";
                        }
                        const name = key.replace(/<.*$/, "");
                        response[name] = {
                            type: this.getGraphQlType(collection, type),
                        };
                    }
                    // otherwise it is non-nullable
                } else {
                    // Check that the model value is one of the allowedValues
                    // if it is then it is a standard and non-referencing field
                    if (allowedValues.includes(conf[key])) {
                        response[key] = {
                            type: new GraphQLNonNull(this.getGraphQlType(collection, conf[key])),
                        };
                        // otherwise we treat is as a referencing field and make sure it is not a UID
                    } else if (conf[key] !== "UID") {
                        // example referencing field for one-to-one: discountcodetypes<string>
                        // example referencing field for one-to-many: users<Array<string>>
                        // here we check which type of referencing field it is
                        let type = conf[key].match(/<(.*?)>/);
                        type = type[1];
                        if (type !== "string") {
                            type = "array<string>";
                        }
                        const name = key.replace(/<.*$/, "");
                        response[name] = {
                            type: new GraphQLNonNull(this.getGraphQlType(collection, type)),
                        };
                    }
                }
            }
        }
        return response;
    }
}
