import { BlueprintContext, BlueprintNode, ResponseContext } from "@deskree/blueprint-shared";
import { initializeApp, cert, getApp } from "firebase-admin/app";
import admin from "firebase-admin";
import _ from 'lodash';

export default class FirestoreQuery extends BlueprintNode {
    db: any;
    async run(ctx: BlueprintContext): Promise<ResponseContext> {
        let response: ResponseContext = { success: true, data: {}, error: null };
        let data = ctx.response.data || ctx.request.body;
        let firebaseConfig: any;
        let app: any;
        let queryData: any[] = [];
        try {
            this.validate(ctx);
            ctx.func = { firestore: admin.firestore };
  
            let opts = ctx.config as any;
            opts = this.executeJS(_.cloneDeep(opts[this.name]), ctx);
            firebaseConfig = opts.inputs.firebaseConfig || ctx._PRIVATE_.get("firebase.config");
            const type: string = opts.inputs.properties.type;
            const reference: string = opts.inputs.properties.reference;
            const where: any[] = opts.inputs.properties.where;
            const orderBy: string = opts.inputs.properties.orderBy;
            const limit: number = opts.inputs.properties.limit;
            const offset: number = opts.inputs.properties.offset;
            const count: boolean = opts.inputs.properties.count;
            const includeDocId: boolean = opts.inputs.properties.includeDocId;
            const docKey: string = opts.inputs.properties?.docKey || "_id";

            this.initFirebaseAdmin(firebaseConfig);
            app = admin.app(firebaseConfig?.client_email);
            this.db = app.firestore();

            let docReference = this.getDocumentReference(reference, type);
            if (type === 'document') {
                response.data = await docReference.get().then((doc: { data: () => any; }) => doc.data());
                return response;
            }
            if (where) docReference = this.whereQuery(docReference, where, data, reference, ctx);
            if (orderBy) docReference = this.orderByQuery(docReference, orderBy);
            if (limit) docReference = this.limitQuery(docReference, limit);
            if (offset) docReference = docReference.offset(offset);

            if (count) {
                const snapshot = await docReference.count().get();
                response.data = { count: snapshot.data().count }
                return response;
            }
  
            const queryResult = await docReference.get();

            queryResult?.forEach((doc: { id: any; data: () => any; }) => {
                if (includeDocId) queryData.push({ ...doc.data(), [docKey]: doc.id });
                else queryData.push(doc.data());
            });

            response.data = queryData;
            return response;
        } catch (error: any) {
            response.error = this.setError(error);
            response.success = false;
        } finally {
            if (app && !app.isDeleted_) await app.delete();
        }

        return response;
    }

    initFirebaseAdmin(firebaseConfig: any) { // Initialize Firebase if not already initialized
        try {
            getApp(firebaseConfig?.client_email);
        } catch (e) {
            if (firebaseConfig)
                initializeApp({ credential: cert(firebaseConfig) }, firebaseConfig?.client_email);
            else
                initializeApp({ credential: admin.credential.applicationDefault() });

        }
    }

    getDocumentReference(reference: string, type: string) {
        if (type === 'document') return this.db.doc(reference)
        else if (type === 'collectionGroup') return this.db.collectionGroup(reference)
        else return this.db.collection(reference)
    }

    limitQuery(query: any, limit: number) {
        return query.limit(limit);
    }

    offsetQuery(query: any, offset: number) {
        return query.offset(offset);
    }

    whereQuery(query: any, where: any[], data: any, reference: string, ctx: BlueprintContext) {
        for (const w of where) {
            const field = typeof w.field === "string" && w.field.startsWith('js/') ? this.runJs(w.field.replace("js/", ''), ctx, {}, ctx.func) : w.field;
            const value = typeof w.value === "string" && w.value.startsWith('js/') ? this.runJs(w.value.replace("js/", ''), ctx) : w.value;

            query = query.where(field, w.operator, value);
        }
        return query;
    }

    orderByQuery(query: any, orderBy: any) {
        for (const o of orderBy) {
            query = query.orderBy(o.field, o.direction);
        }
        return query;
    }

    executeJS(item: any, ctx: BlueprintContext) {
        if (item && typeof item === 'object') {
            if (Array.isArray(item)) {
                for (let i = 0; i < item.length; i++) {
                    item[i] = this.executeJS(item[i], ctx);
                }
            } else {
                for (let key in item) {
                    if (item.hasOwnProperty(key)) {
                        item[key] = this.executeJS(item[key], ctx);
                        if (typeof item[key] === 'string' && item[key].startsWith('js/')) {
                            item[key] = this.runJs(item[key].replace("js/", ''), ctx, item, ctx.func)
                        }
                    }
                }
            }
        }
        return item;
    }

    validate(ctx: BlueprintContext) {
        if (ctx.config === undefined) throw new Error(`node requires a config`);
        let opts = ctx.config as any;
        opts = opts[this.name];

        if (opts?.inputs?.properties?.reference === undefined) throw new Error(`node requires a valid reference key`);
        if (opts.inputs.properties.type === undefined || !["document", "collection", "collectionGroup"].includes(opts?.inputs?.properties?.type))
            throw new Error(`node requires a valid type`);
    }

}