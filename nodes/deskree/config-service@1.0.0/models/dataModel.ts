// dataModel.ts
/**
 * Class for performing general actions on the DB. Such as table deletion or overall data cleanup.
 *
 * @module DataModel
 */
import { BaseModel } from "./baseModel";
import { CollectionService } from "../helpers/collectionService";

export class DataModel extends BaseModel {
    private readonly db!: any;
    private readonly collectionService!: any;
    private readonly FieldValue!: any;

    constructor(collectionService: CollectionService) {
        super();
        this.collectionService = collectionService;
        this.db = this.collectionService.firestore;
        this.FieldValue = this.collectionService.FieldValue;
    }

    /**
     * Delete collection
     * @param path collection id
     * @return Promise
     */
    public async deleteCollection(path: string): Promise<any> {
        const collectionRef = this.db.collection(path);
        const query = collectionRef.orderBy('__name__').limit(250);

        return new Promise((resolve, reject) => {
            this.deleteQueryBatch(query, resolve).catch(reject);
        });
    }

    /**
     * Update & Delete fields
     * @param actions rename or delete actions
     * @return Promise
     */
    public async updateDeleteFields(collection: string, actions: any = {}, model: any = {}): Promise<any> {
        console.time("updateDeleteFields");
        try {
            const docs = await this.db.collection(collection).get();
            const renames = actions.rename ? Object.keys(actions.rename) : [];
            const deletes = actions.delete ? actions.delete : [];
            const news = actions.new ? actions.new : [];
            let batch = this.db.batch();
            let executeBatch = false;

            await docs.forEach(async (item: any) => {
                const doc = item.data();
                const uid = item.id;
                let obj: any = undefined;

                // Rename fields
                renames.forEach((field) => {
                    if (doc.hasOwnProperty(field)) {
                        if (!obj) obj = {};
                        let field_new = actions.rename[field];
                        let field_old = field;
                        obj[field_new] = doc[field_old];
                        obj[field_old] = this.FieldValue.delete();
                    }
                });

                // Delete fields
                deletes.forEach((field: any) => {
                    if (doc.hasOwnProperty(field)) {
                        if (!obj) obj = {};
                        obj[field] = this.FieldValue.delete();
                    }
                });

                // New fields
                news.forEach((field: any) => {
                    if (!doc.hasOwnProperty(field)) {
                        if (!obj) obj = {};
                        let type = model[field];
                        const dataType = type.toLowerCase().replace("?", "");
                        if (dataType === "integer" || dataType === "float") {
                            obj[field] = 0;
                        } else if (dataType === "boolean") {
                            obj[field] = false;
                        } else if (dataType === "map") {
                            obj[field] = {};
                        } else if (dataType.indexOf("array") !== -1) {
                            obj[field] = [];
                        } else {
                            obj[field] = "";
                        }
                    }
                });

                if (obj) {
                    let batchRef = await this.db.collection(collection).doc(uid);
                    batch.update(batchRef, obj);
                    executeBatch = true;
                }
            });

            if (executeBatch) {
                await batch.commit();
            }

            return
        } catch (e) {
            throw e
        }
        finally {
            console.timeEnd("updateDeleteFields");
        }
    }

    /**
     * Delete field
     * @param collection collection id
     * @param field field name
     * @return Promise
     */
    public async deleteField(collection: string, field: string): Promise<any> {
        try {
            const docs = await this.db.collection(collection).get();
            const list: any = []
            docs.forEach((doc: any) => {
                const obj = doc.data();
                obj['uid'] = doc.id;
                list.push(obj);
            });
            for (const doc of list) {
                if (doc.hasOwnProperty(field)) {
                    const data = await this.db.collection(collection).doc(doc.uid);
                    const obj: any = {};
                    obj[field] = this.FieldValue.delete();
                    await data.update(obj);
                }
            }
            return
        } catch (e) {
            throw e
        }
    }

    /**
     * Rename field
     * @param collection collection id
     * @param field_new new field name
     * @param field_old old field name
     * @return Promise
     */
    public async renameField(collection: string, field_new: string, field_old: string): Promise<any> {
        try {
            const docs = await this.db.collection(collection).get();
            const list: any = [];
            docs.forEach((doc: any) => {
                const obj: any = doc.data();
                obj['uid'] = doc.id;
                list.push(obj);
            });
            for (const doc of list) {
                if (doc.hasOwnProperty(field_old)) {
                    const obj: any = {};
                    const uid = doc.uid;
                    delete doc.uid;
                    obj[field_new] = doc[field_old];
                    obj[field_old] = this.FieldValue.delete();
                    await this.db.collection(collection).doc(uid).update(obj);
                }
            }
            return
        } catch (e) {
            throw e
        }
    }

    /**
     * Add column to all documents in a collection
     * @param collection collection id
     * @param field field name
     * @param type field data type
     * @return Promise
     */
    public async addField(collection: string, field: string, type: string): Promise<any> {
        try {
            const docs = await this.db.collection(collection).get();
            const list: any = [];
            docs.forEach((doc: any) => {
                const obj = doc.data();
                obj['uid'] = doc.id;
                list.push(obj);
            });
            for (const doc of list) {
                if (!doc.hasOwnProperty(field)) {
                    const obj: any = {};
                    const uid = doc.uid;
                    const dataType = type.toLowerCase().replace("?", "");
                    delete doc.uid;
                    if (dataType === "integer" || dataType === "float") {
                        obj[field] = 0;
                    } else if (dataType === "boolean") {
                        obj[field] = false;
                    } else if (dataType === "map") {
                        obj[field] = {};
                    } else {
                        obj[field] = "";
                    }
                    await this.db.collection(collection).doc(uid).update(obj);
                }
            }
            return
        } catch (e) {
            throw e
        }
    }

    /**
     * Delete query batch
     * @param query promise query
     * @param resolve promise resolver
     * @return Promise
     */
    private async deleteQueryBatch(query: any, resolve: any) {
        const snapshot = await query.get();

        const batchSize = snapshot.size;
        if (batchSize === 0) {
            // When there are no documents left, we are done
            resolve();
            return;
        }

        // Delete documents in a batch
        const batch = this.db.batch();
        snapshot.docs.forEach((doc: any) => {
            batch.delete(doc.ref);
        });
        await batch.commit();

        // Recurse on the next process tick, to avoid
        // exploding the stack.
        process.nextTick(() => {
            this.deleteQueryBatch(query, resolve);
        });
    }

    /**
     * Create storage configuration object
     * @param total total available storage
     * @param used used storage
     * @return Promise
     */
    public async createStorageConfig(total: number, used: number) {
        try {
            const config: any = {};
            if (total) {
                config['total'] = total;
            }
            if (used !== undefined) {
                config['used'] = used;
            }
            await this.db.collection("config-storage").doc("storage-info").set(config, { merge: true });
            return
        } catch (e) {
            throw e
        }
    }
}
