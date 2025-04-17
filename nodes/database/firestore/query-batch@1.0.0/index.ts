import { BlueprintContext, ResponseContext, BlueprintNode } from "@deskree/blueprint-shared";
import { initializeApp, cert, getApp } from "firebase-admin/app";
import { v4 as uuidv4 } from 'uuid';
import admin from "firebase-admin";

export default class FirestoreQueryBatch extends BlueprintNode {
    db: any;
    async run(ctx: BlueprintContext): Promise<ResponseContext> {
        let response: ResponseContext = { success: true, data: {}, error: null };
        let data = ctx.response.data || ctx.request.body;
        let firebaseConfig: any;
        let app: any;
        let batch: any[] = [];
        let responses: any[] = [];
        let streamBatchCounter = 0;
        const batchID = uuidv4();

        try {
            this.validate(ctx);

            let opts = ctx.config as any;
            opts = opts[this.name];

            firebaseConfig = opts.inputs.firebaseConfig || ctx._PRIVATE_.get("firebase.config");
            const type: string = opts.inputs.properties.type;
            const reference: string = opts.inputs.properties.reference;
            const where: any[] = opts.inputs.properties?.where;
            const orderBy: string = opts.inputs.properties?.orderBy;
            const limit: number = opts.inputs.properties?.limit || 1000;
            const includeDocId: boolean = opts.inputs.properties?.includeDocId;
            const docKey: string = opts.inputs.properties?.docKey || "_id";
            let batchSize: number = opts.inputs.properties?.batchSize || 1000;
            let counter = 0;

            this.initFirebaseAdmin(firebaseConfig);
            app = admin.app(firebaseConfig?.client_email);
            this.db = app.firestore();

            const docRef = this.getDocumentReferenceString(reference, data);
            let docReference = this.getDocumentReference(docRef, type);

            if (type === 'document') return docReference.get().then((doc: any) => doc.data());

            if (where) docReference = this.whereQuery(docReference, where, data);
            if (orderBy) docReference = this.orderByQuery(docReference, orderBy);

            let lastDocument = null;
            this.setVar(ctx, { "__batchID": batchID });
            this.setVar(ctx, { "__batchProgress": "START" });
            while (true) {
                if (app.isDeleted_) this.initFirebaseAdmin(firebaseConfig);

                let query = docReference.orderBy(admin.firestore.FieldPath.documentId());

                if (lastDocument) query = query.startAfter(lastDocument);

                if (counter + batchSize > limit) batchSize = limit - counter;
                query = query.limit(batchSize);

                const querySnapshot = await query.get();
                counter += querySnapshot.size;

                if (querySnapshot.size === 0) break;

                await querySnapshot.forEach(async (doc: any) => {
                    const data = doc.data();
                    if (includeDocId) batch.push({ ...data, [docKey]: doc.id });
                    else batch.push(data);
                    lastDocument = doc;
                });

                streamBatchCounter++;
                ctx.response.data = batch;
                responses.push(await this.runSteps(opts.step, ctx));
                this.setVar(ctx, { "__batchProgress": "STREAMING" });
                batch = [];

                if (counter >= limit) break;
            }
            this.setVar(ctx, { "__batchProgress": "END" });
            ctx.response.data = batch;
            responses.push(await this.runSteps(opts.step, ctx));
            response.data = responses;
        } catch (error: any) {
            response.error = this.setError(error);
            response.success = false;
        } finally {
            if (!app.isDeleted_) await app.delete();
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

    getDocumentReferenceString(reference: string, item: any): string {
        return reference.replace(/\${(.*?)}/g, (match: any, key: any) => {
            return item[key] || match;
        })
    }

    getDocumentReference(reference: string, type: string) {
        if (type === 'document') return this.db.doc(reference)
        else if (type === 'collectionGroup') return this.db.collectionGroup(reference)
        else return this.db.collection(reference)
    }

    whereQuery(query: any, where: any[], data: any) {
        for (const w of where) {
            if (/\{([^}]+)\}/g.test(w.value)) w.value = this.getDocumentReferenceString(w.value, data);
            query = query.where(w.field, w.operator, w.value);
        }
        return query;
    }

    orderByQuery(query: any, orderBy: any) {
        for (const o of orderBy) {
            query = query.orderBy(o.field, o.direction);
        }
        return query;
    }

    validate(ctx: BlueprintContext) {
        if (ctx.config === undefined) throw new Error(`node requires a config`);
        let opts = ctx.config as any;
        opts = opts[this.name];

        if (!opts || !opts.steps || opts.steps.length === 0) throw new Error(`node requires a list of nodes`);
        if (opts.inputs?.properties?.reference === undefined) throw new Error(`node requires a valid reference key`);
        if (opts.inputs.properties.type === undefined || !["document", "collection", "collectionGroup"].includes(opts.inputs.properties.type))
            throw new Error(`node requires a valid type`);
    }
}