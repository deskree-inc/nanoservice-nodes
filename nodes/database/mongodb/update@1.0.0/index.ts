import { BlueprintContext, BlueprintNode, ResponseContext } from "@deskree/blueprint-shared";
import { MongoClient, Db, Collection, ObjectId, BulkWriteResult, UpdateResult } from 'mongodb';
import _ from 'lodash';
export default class MongodbUpdate extends BlueprintNode {

  async run(ctx: BlueprintContext): Promise<ResponseContext> {
    let response: ResponseContext = { success: true, data: {}, error: null };
    this.contentType = "application/json";
    let data = ctx.response.data || ctx.request.body;

    let dbCnn: MongoClient | undefined = undefined;
    try {
      this.validate(ctx);
      let opts = ctx.config as any;
      opts = opts[this.name];

      const connectionString: string = opts.inputs.properties.mongodbConnectionString;
      const databaseString: string = opts.inputs.properties.database;
      const collectionString: string = opts.inputs.properties.collection;
      const where: any = opts.inputs.properties.where;

      const { client, collection } = await this.initMongodbConnection(connectionString, databaseString, collectionString);
      dbCnn = client;
      const documents = await this.updateDocuments(collection, where, data);

      response.data = documents;

    } catch (err: any) {
      response.error = this.setError({...err, code: 500});
      response.success = false;
    } finally {
      dbCnn && await dbCnn.close();
    }

    return response;
  }

  async initMongodbConnection(connectionString: string, databaseString: string, collectionString: string) {
    const client = new MongoClient(connectionString);
    await client.connect();
    const db: Db = client.db(databaseString);
    const collection: Collection = db.collection(collectionString);

    return { client, db, collection };
  }

  async updateDocuments(collection: Collection, filter: any, documents: any): Promise<any> {
    try {
      let result: UpdateResult | BulkWriteResult;
      if (Array.isArray(documents)) {
        const bulkOps: any = documents.map((data: any) => {
          let where = this.blueprintMapper(_.cloneDeep(filter), {}, data);
          if (where._id) where._id = new ObjectId(data._id);
          delete data._id;
          return { updateOne: { filter: where, update: { $set: data } } }
        });
        result = await collection.bulkWrite(bulkOps);
      } else {
        if (filter._id) filter._id = new ObjectId(filter._id);
        delete documents._id;
        result = await collection.updateMany(filter, { $set: documents });
      }

      return result;
    } catch (error) {
      throw error;
    }
  }


  validate(ctx: BlueprintContext) {
    if (ctx.config === undefined) throw new Error(`${this.name} node requires a config`);
    let opts = ctx.config as any;
    opts = opts[this.name];

    if (opts?.inputs?.properties.mongodbConnectionString === undefined) throw new Error(`${this.name} requires a valid mongodbConnectionString`);
    if (opts.inputs.properties.database === undefined) throw new Error(`${this.name} requires a valid database`);
    if (opts.inputs.properties.collection === undefined) throw new Error(`${this.name} requires a valid collection`);
    if (opts.inputs.properties.where === undefined) throw new Error(`${this.name} requires a valid where`);
  }
}