import { graphql, printSchema } from "graphql";

import { Controller } from "../interfaces";
import { GraphqlService } from "../services";

export default class MainController {

    public async init({ query, variables, type, request }: Controller, _PRIVATE_: any) {
        const schema = await new GraphqlService(_PRIVATE_).createSchema();
        switch (type) {
            case "collection":
                let result: any = await graphql({
                    schema,
                    source: query,
                    variableValues: variables,
                    contextValue: request,
                });

                if (result.errors) {
                    result.errors = result.errors.map((error: any) => ({
                        message: error.message,
                    }));
                }
                return {
                    ...result,
                    webhooks: request?.webhooks,
                    collection: request?.collection,
                    action: request?.action,
                };
            default:
                return printSchema(schema).toString();
        }
    }
}
