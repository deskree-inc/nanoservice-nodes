// collectionService.ts
/**
 * This is the main collection service class responsible for managing Firestore data
 *
 * @module CollectionService
 */

import * as admin from "firebase-admin";
import { CollectionQuery, CreateCollection, DeleteCollection, EditCollection } from "./interfaces";
import { CollectionException } from "./exceptions/collectionException";
import { Utils } from "./utils";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import timezones from "./tz.json";
import { GetCollection } from "./interfaces/getCollection";
import { getApp, getApps } from "firebase-admin/app";

export class CollectionService {
    private firestore: any = null;
    public firebase: any;
    public readonly FieldValue;
    public readonly admin;

    constructor() {
        dayjs.extend(utc);
        dayjs.extend(timezone);
        this.admin = admin;
        this.initFirebaseAdmin();
        this.FieldValue = admin.firestore.FieldValue;
    }

    public initFirebaseAdmin(firebaseConfig?: any) {
        // Initialize Firebase if not already initialized
        try {
            if (getApps().length > 0)
                this.firebase = getApp(firebaseConfig?.client_email);
            else 
                this.firebase = admin.initializeApp({ credential: admin.credential.applicationDefault() });
        } catch (e) {
            if (firebaseConfig)
                this.firebase = admin.initializeApp({ credential: admin.credential.cert(firebaseConfig) }, firebaseConfig?.client_email);
        } finally {
            if(this.firebase) {
                this.firestore = this.firebase.firestore();
            }
        }
    }

    /**
     * Parse query and get data from firebase collection
     * @param data: FirebaseCollection
     * @param collection: CollectionQuery
     * @return FirebaseCollection
     **/
    private static parseQuery(data: any, collection: CollectionQuery) {
        let newCollection = data;
        if (!Utils.isNullOrUndefined(collection.query) && collection.query && collection.query.length > 0) {
            for (const q of collection.query) {
                newCollection = newCollection.where(q.attribute, q.operator, q.value);
            }
        }
        if (!Utils.isNullOrUndefined(collection.sorted) && collection.sorted) {
            newCollection = newCollection.orderBy(collection.sorted.param, collection.sorted.how);
        }
        // else {
        //     if(!collection.name.startsWith("config-")) {
        //         newCollection = newCollection.orderBy("createdAt");
        //     }
        // }

        return newCollection;
    }

    /**
     * Get collection data
     * @param firebaseCollection FirebaseCollection
     * @param collection CollectionQuery
     * @return FirebaseCollection
     **/
    private async getCollection(firebaseCollection: any, collection: CollectionQuery) {
        const object = await firebaseCollection.doc(collection.uid).get();
        if (!object) {
            return null;
        } else {
            let data = object.data();
            if (
                !Utils.isNullOrUndefined(collection.includes) &&
                collection.includes &&
                collection.includes.length > 0
            ) {
                data = await this.getIncludes(collection, data);
            }
            return data;
        }
    }

    /**
     * Get includes data from firebase, get every string in the include array as a new collection
     * @param collection: CollectionQuery
     * @param data: collection data
     * @return FirebaseCollection
     **/
    private async getIncludes(collection: any, data: any) {
        let includesCount = 0;
        for (const include of collection.includes) {
            if (include.type === "one") {
                if (
                    data.hasOwnProperty(include.key) &&
                    typeof data[include.key] === "string" &&
                    data[include.key] !== ""
                ) {
                    const doc = await this.firestore.collection(include.table).doc(data[include.key]).get();
                    data[include.key] = doc.data();
                    includesCount++;
                }
            } else {
                if (
                    data.hasOwnProperty(include.key) &&
                    Array.isArray(data[include.key]) &&
                    data[include.key].length > 0
                ) {
                    const includes = [];
                    for (const key of data[include.key]) {
                        const doc = await this.firestore.collection(include.table).doc(key).get();
                        includes.push({ uid: doc.id, attributes: doc.data() });
                        includesCount++;
                    }
                    data[include.key] = includes;
                }
            }
        }
        return { data: data, includesCount: includesCount };
    }

    /**
     *  Create collection
     * @param collection: CreateCollection
     * @param subCollection: CreateCollection
     * @param createdAt whether to track the createdAt time
     * @param updatedAt whether to track the updatedAt time
     * @param timezone valid timezone from tz database
     **/

    /* istanbul ignore next */
    public async create(
        collection: CreateCollection,
        subCollection: CreateCollection | null = null,
        createdAt: boolean,
        updatedAt: boolean,
        tzone?: string
    ) {
        try {
            const now = dayjs().format("YYYY-MM-DD HH:mm:ss");
            const tz = tzone && timezones.includes(tzone) ? tzone : "America/Toronto";
            if (createdAt) {
                collection.body["createdAt"] = dayjs(now).tz(tz).format();
            }
            if (updatedAt) {
                collection.body["updatedAt"] = dayjs(now).tz(tz).format();
            }
            if (
                Utils.isNullOrUndefined(collection.uid) &&
                !Utils.isNullOrUndefined(collection.name) &&
                Utils.isNullOrUndefined(subCollection)
            ) {
                // empty url /collection/{collection}
                const ref = await this.firestore.collection(collection.name!).add({
                    ...collection.body,
                });
                return {
                    uid: ref.id,
                };
            } else if (!Utils.isNullOrUndefined(collection.uid) && Utils.isNullOrUndefined(subCollection)) {
                //  url with uid /collection/{collection}/{uid}
                await this.firestore
                    .collection(collection.name!)
                    .doc(collection.uid!)
                    .set({
                        ...collection.body,
                    });
                return {
                    uid: collection.uid,
                };
            } else if (
                !Utils.isNullOrUndefined(collection.uid) &&
                !Utils.isNullOrUndefined(subCollection) &&
                !Utils.isNullOrUndefined(subCollection!.uid)
            ) {
                //  url with uid and subCollection /collection/{collection}/{uid}/{subCollection}
                const ref = await this.firestore
                    .collection(collection.name!)
                    .doc(collection.uid!)
                    .collection(subCollection!.name!)
                    .add({
                        ...collection.body,
                    });
                return {
                    uid: ref.id,
                };
            }
            return null;
        } catch (e) {
            console.log(e);
            throw new CollectionException("Can not create collection");
        }
    }

    /**
     * Get collection data
     * @param collection: CollectionQuery
     **/
    public async getAll(collection: CollectionQuery): Promise<GetCollection> {
        try {
            const firebaseCollection = this.firestore.collection(collection.name);
            if (!Utils.isNullOrUndefined(collection.uid)) {
                const data = await this.getCollection(firebaseCollection, collection);
                return {
                    meta: {
                        includesCount:
                            !Utils.isNullOrUndefined(data) && data.hasOwnProperty("includesCount")
                                ? data.includesCount
                                : 0,
                        total: 1,
                        limit: 1,
                        page: 1,
                    },
                    data: !Utils.isNullOrUndefined(data) && data.hasOwnProperty("data") ? data.data : data,
                };
            } else {
                const filterCollection = CollectionService.parseQuery(firebaseCollection, collection);
                let limit = 50;
                let page = 1;
                if (!Utils.isNullOrUndefined(collection.limit) && collection.limit) {
                    page = collection.limit.page !== undefined ? collection.limit.page : page;
                    limit = collection.limit.limit !== undefined ? collection.limit.limit : limit;
                }
                const totalSnapshot = await filterCollection.count().get();
                const total = totalSnapshot.data().count;

                let collectionObject;
                if (page === 1) {
                    collectionObject = await filterCollection.limit(limit).get();
                } else if (!Utils.isNullOrUndefined(collection.sorted)) {
                    collectionObject = await filterCollection
                        .limit(limit)
                        .offset((page - 1) * limit)
                        .get();
                } else if (
                    !Utils.isNullOrUndefined(collection.query) &&
                    collection.query &&
                    collection.query.length > 0
                ) {
                    collectionObject = await filterCollection
                        .orderBy(collection.query[0].attribute)
                        .limit(limit)
                        .offset((page - 1) * limit)
                        .get();
                } else {
                    collectionObject = await filterCollection
                        .limit(limit)
                        .offset((page - 1) * limit)
                        .get();
                }
                const returnObject: { meta: any; data: Array<any> } = {
                    meta: {
                        total: total,
                        limit: limit,
                        page: page,
                        includesCount: 0,
                    },
                    data: [],
                };
                const data = collectionObject.docs;
                returnObject.data = await Promise.all(
                    data.map(async (doc: any) => {
                        let obj = doc.data();
                        if (
                            !Utils.isNullOrUndefined(collection.includes) &&
                            collection.includes &&
                            collection.includes.length > 0
                        ) {
                            obj = await this.getIncludes(collection, obj);
                        }
                        if (obj.hasOwnProperty("includesCount")) {
                            returnObject.meta.includesCount += obj.includesCount;
                        }
                        return {
                            uid: doc.id,
                            attributes: obj.hasOwnProperty("data") ? obj.data : obj,
                        };
                    })
                );
                return returnObject;
            }
        } catch (e) {
            throw e;
        }
    }

    public async getCount(collection: CollectionQuery): Promise<{ count: number; collection: string }> {
        try {
            const snapshot = await this.firestore.collection(collection.name).count().get();
            return { count: snapshot.data().count, collection: collection.name };
        } catch (e) {
            throw e;
        }
    }

    /**
     * Update collection with uid
     * @param collection EditCollection
     * @param subCollection EditCollection
     * @param updatedAt whether to track the updatedAt time
     * @param timezone valid timezone from tz database
     * @return boolean
     **/

    /* istanbul ignore next */
    public async update(
        collection: EditCollection,
        subCollection: EditCollection | undefined = undefined,
        updatedAt: boolean,
        tzone?: string
    ) {
        try {
            if (updatedAt) {
                const now = dayjs().format("YYYY-MM-DD HH:mm:ss");
                const tz = tzone && timezones.includes(tzone) ? tzone : "America/Toronto";
                collection.body["updatedAt"] = dayjs(now).tz(tz).format();
            }
            if (
                !Utils.isNullOrUndefined(collection) &&
                !Utils.isNullOrUndefined(collection.uid) &&
                (Utils.isNullOrUndefined(subCollection) || Utils.isNullOrUndefined(subCollection!.uid))
            ) {
                await this.firestore
                    .collection(collection.name)
                    .doc(collection.uid)
                    .update({
                        ...collection.body,
                    });
                return true;
            } else if (!Utils.isNullOrUndefined(subCollection) && !Utils.isNullOrUndefined(subCollection!.uid)) {
                await this.firestore
                    .collection(collection.name)
                    .doc(collection.uid)
                    .collection(subCollection!.name)
                    .doc(subCollection!.uid)
                    .update({
                        ...subCollection!.body,
                    });
                return true;
            } else {
                return false;
            }
        } catch (e) {
            throw e;
        }
    }

    /**
     * Delete collection with uid
     * @param collection: DeleteCollection
     **/
    public async delete(collection: DeleteCollection) {
        try {
            if (collection.uid !== undefined) {
                await this.firestore.collection(collection.name).doc(collection.uid).delete();
            }
            return new Error("Bad request. No UID provided.");
        } catch (e) {
            throw e;
        }
    }
}
