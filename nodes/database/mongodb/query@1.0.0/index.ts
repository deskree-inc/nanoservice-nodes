import { BlueprintContext, BlueprintNode, ResponseContext } from "@deskree/blueprint-shared";
import { MongoClient, Db, Collection, ObjectId } from 'mongodb';
export default class MongodbQuery extends BlueprintNode {

  async run(ctx: BlueprintContext): Promise<ResponseContext> {
    let response: ResponseContext = { success: true, data: {}, error: null };
    this.contentType = "application/json";

    let dbCnn: MongoClient | undefined = undefined;
    try {
      this.validate(ctx);
      let opts = ctx.config as any;
      opts = opts[this.name];

      const connectionString: string = opts.inputs.properties.mongodbConnectionString;
      const databaseString: string = opts.inputs.properties.database;
      const collectionString: string = opts.inputs.properties.collection;
      const $where: string = opts.inputs.properties.$where || "";
      const where: any = opts.inputs.properties.where || {};
      const count: boolean = opts.inputs.properties.count;
      const limit: number = parseInt(opts.inputs.properties.limit);
      const sort: any = opts.inputs.properties.sort;
      const skip: number = parseInt(opts.inputs.properties.skip);
      const projection: any = opts.inputs.properties.projection;
      const aggregate: any = opts.inputs.properties.aggregate;

      const { client, collection } = await this.initMongodbConnection(connectionString, databaseString, collectionString);
      dbCnn = client;

      let options: any = {}, query: any = {};
      if (where) {
        if (where._id) {
          const ids = where._id.split(",");
          where._id = { $in: ids.map((id: string) => new ObjectId(id)) };
        }
        query = where;
      }
      if ($where) query.$where = $where;
      if (where)  options.match = where;
      if (limit) options.limit = limit;
      if (sort) options.sort = sort;
      if (skip) options.skip = skip;
      if (projection) options.projection = projection;
      if (count) {
        if (where._id) where._id = new ObjectId(where._id);
        response.data = { count: await collection.countDocuments(query, options) };
        return response;
      }

      if (Array.isArray(aggregate) && aggregate.length > 0)
        response.data = await this.executeAgregation(collection, aggregate, options);
      else
        response.data = await collection.find(query, options).toArray();

    } catch (err: any) {
      response.error = this.setError({...err, code: 500});
      response.success = false;
    } finally {
      dbCnn && await dbCnn.close();
    }

    return response;
  }

  async executeAgregation(collection: Collection, aggregate: any[], options: any) {
    const aggregation: any = [];
    if (options.match) aggregation.push({ $match: options.match });
    if (options.sort) aggregation.push({ $sort: options.sort });
    if (options.skip) aggregation.push({ $skip: options.skip });
    if (options.limit) aggregation.push({ $limit: options.limit });
    if (options.projection) aggregation.push({ $project: options.projection });
    if (aggregate) aggregation.push(...aggregate);

    return collection.aggregate(aggregation).toArray();
  }

  async initMongodbConnection(connectionString: string, databaseString: string, collectionString: string) {
    const client = new MongoClient(connectionString);
    await client.connect();
    const db: Db = client.db(databaseString);
    const collection: Collection = db.collection(collectionString);

    return { client, db, collection };
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