import { BlueprintContext, BlueprintNode, ResponseContext } from "@deskree/blueprint-shared";
import { graphql, parse, } from 'graphql';
import { schemaComposer } from 'graphql-compose';
import { composeWithMongoose } from 'graphql-compose-mongoose';
import mongoose from 'mongoose';
export default class GraphqlMongodb extends BlueprintNode {

  async run(ctx: BlueprintContext): Promise<ResponseContext> {
    let response: ResponseContext = { success: true, data: {}, error: null };
    this.contentType = "application/json";
    let data = ctx.response.data || ctx.request.body;
    const { query, variables } = data;

    let name: string = "";
    let tc: any = undefined;;

    try {
      this.validate(ctx);
      let opts = ctx.config as any;
      opts = opts[this.name];
      let schema: any = undefined;

      const connectionString: string = opts.inputs.properties.mongodbConnectionString;
      const databaseString: string = opts.inputs.properties.database;
      const collection: string = opts.inputs.properties.collection;
      const mongodbSchema: any = opts.inputs.properties.schema;

      const document: any = parse(query);
      if (document.definitions[0]?.name?.value != collection) throw new Error(`Collection name in query must match collection name in node configuration.`);

      name = collection;

      if (schemaComposer) schemaComposer.clear();
      if (mongoose.models[name]) mongoose.deleteModel(name);

      const mongooseModel = mongoose.model(name, new mongoose.Schema(mongodbSchema, { versionKey: false }));
      tc = composeWithMongoose(mongooseModel);
      // console.log("fields",tc.getResolver(`removeOne`).type._gqcFields);
      // console.log("args", tc.getResolver(`removeOne`).args);
      const queryFields = {
        [`findById`]: tc.getResolver(`findById`),
        [`findOne`]: {
          type: tc.getType(),
          args: {
            filter: 'JSON',
            where: 'String',
            skip: 'Int',
            sort: 'JSON',
          },
          resolve: async (source: any, args: any, context: any, info: any) => {
            const { filter, where } = args;
            const mongooseQuery = mongooseModel.findOne(filter);
            if (where) mongooseQuery.where(where);
            const result = await this.mongooseExec(mongooseQuery);
            return result;
          }
        },
        [`findMany`]: {
          type: [tc.getType()],
          args: {
            filter: 'JSON',
            where: 'String',
            limit: 'Int',
            skip: 'Int',
            sort: 'JSON',
          },
          resolve: async (source: any, args: any, context: any, info: any) => {
            const { filter, where, limit, skip, sort } = args;
            const mongooseQuery = mongooseModel.find(filter);

            if (where) mongooseQuery.$where(where);
            if (limit) mongooseQuery.limit(limit);
            if (skip) mongooseQuery.skip(skip);
            if (sort) mongooseQuery.sort(sort);
            
            const result = await this.mongooseExec(mongooseQuery);

            return result;
          },
        },
        [`count`]: tc.getResolver(`count`),
        [`connection`]: tc.getResolver(`connection`), // https://github.com/graphql-compose/graphql-compose-connection
        [`pagination`]: tc.getResolver(`pagination`)  // https://github.com/graphql-compose/graphql-compose-pagination
      };

      const mutationFields = {
        [`createOne`]: {
          type: tc.getType(),
          args: {
            record: tc.getResolver(`createOne`).getArgITC(`record`)
          },
          resolve: async (source: any, args: any, context: any, info: any) => {
            const { record } = args;
            const result = await tc.getResolver(`createOne`).resolve({ source, args: { record }, context, info });
            return result;
          }
        },
        [`updateById`]: {
          type: tc.getType(),
          args: {
            record: tc.getResolver(`updateById`).getArgITC(`record`)
          },
          resolve: async (source: any, args: any, context: any, info: any) => {
            const { record } = args;
            const result = await tc.getResolver(`updateById`).resolve({ source, args: { record }, context, info });
            return result;
          }
        },
        [`removeById`]: tc.getResolver(`removeById`),
        [`removeOne`]: {
          type: tc.getType(),
          args: {
            filter: tc.getResolver(`removeOne`).getArgITC(`filter`)
          },
          resolve: async (source: any, args: any, context: any, info: any) => {
            const result = await tc.getResolver(`removeOne`).resolve({ source, args, context, info });
            return result;
          }
        },
        [`removeMany`]: {
          type: tc.getType(),
          args: {
            filter: tc.getResolver(`removeMany`).getArgITC(`filter`)
          },
          resolve: async (source: any, args: any, context: any, info: any) => {
            const { filter } = args;
            const result = await tc.getResolver(`removeMany`).resolve({ source, args: { filter }, context, info });
            return result;
          }
        },
        [`updateOne`]: {
          type: tc.getType(),
          args: {
            filter: tc.getResolver(`updateOne`).getArgITC(`filter`),
            record: tc.getResolver(`updateOne`).getArgITC(`record`)
          },
          resolve: async (source: any, args: any, context: any, info: any) => {
            const { filter, record } = args;
            const result = await tc.getResolver(`updateOne`).resolve({ source, args: { filter, record }, context, info });
            return result;
          }
        },
        [`updateMany`]: {
          type: tc.getType(),
          args: {
            filter: tc.getResolver(`updateMany`).getArgITC(`filter`),
            record: tc.getResolver(`updateMany`).getArgITC(`record`)
          },
          resolve: async (source: any, args: any, context: any, info: any) => {
            const { filter, record } = args;
            const result = await tc.getResolver(`updateMany`).resolve({ source, args: { filter, record }, context, info });
            return result;
          }
        },
        [`createMany`]: {
          type: tc.getType(),
          args: {
            records: tc.getResolver(`createMany`).getArgITC(`records`)
          },
          resolve: async (source: any, args: any, context: any, info: any) => {
            const { records } = args;
            const result = await tc.getResolver(`createMany`).resolve({ source, args: { records }, context, info });
            return result;
          }
        }
      };

      schemaComposer.Mutation.addFields(mutationFields);
      schemaComposer.Query.addFields(queryFields);
      schema = schemaComposer.buildSchema();

      await mongoose.connect(connectionString + '/' + databaseString);

      const result = await graphql({
        schema,
        source: query,
        variableValues: variables
      })

      response.data = result;

    } catch (err: any) {
       response.error = this.setError({...err, code: 500});
      response.success = false;
    } finally {
      mongoose.disconnect();
    }
    return response;
  }

  async mongooseExec(mongooseQuery: any) {
    try {
      return await mongooseQuery.exec();
    } catch (error) {
      return error;
    }
  }

  validate(ctx: BlueprintContext) {
    if (ctx.config === undefined) throw new Error(`${this.name} node requires a config`);
    let opts = ctx.config as any;
    opts = opts[this.name];

    if (opts?.inputs?.properties.mongodbConnectionString === undefined) throw new Error(`${this.name} requires a valid mongodbConnectionString`);
    if (opts.inputs.properties.database === undefined) throw new Error(`${this.name} requires a valid database`);
    if (opts.inputs.properties.collection === undefined) throw new Error(`${this.name} requires a valid collection`);
  }
  
}