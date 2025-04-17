import { BlueprintContext, BlueprintNode, ResponseContext } from "@deskree/blueprint-shared";
import { MongoClient, Db, Collection, InsertOneResult, InsertManyResult, BulkWriteResult } from 'mongodb';
export default class MongodbInsert extends BlueprintNode {

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
      const isBulkWrite: boolean = opts.inputs.properties.bulkWrite;


      const { client, collection } = await this.initMongodbConnection(connectionString, databaseString, collectionString);
      dbCnn = client;

      const documents = await this.insertDocuments(collection, data, isBulkWrite);

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

  async insertDocuments(collection: Collection, documents: any, isBulkWrite: Boolean = false): Promise<any> {
    try {
      let insertResult: InsertOneResult | InsertManyResult | BulkWriteResult;
 
      if (Array.isArray(documents) && isBulkWrite) {
        const bulkOps = documents.map((document: any) => ({ insertOne: { document } }));
        insertResult = await collection.bulkWrite(bulkOps);
      } else if (Array.isArray(documents) && !isBulkWrite) {
        insertResult = await collection.insertMany(documents);
      } else {
        insertResult = await collection.insertOne(documents);
      }

      return insertResult;
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
  }
}