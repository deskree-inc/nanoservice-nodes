import { BlueprintContext, BlueprintNode, ResponseContext } from "@deskree/blueprint-shared";
import { initializeApp, cert, getApp } from "firebase-admin/app";
import admin from "firebase-admin";

export default class FirestoreBatchImport extends BlueprintNode {
    db: any;
    async run(ctx: BlueprintContext): Promise<ResponseContext> {
        let response: ResponseContext = { success: true, data: {}, error: null };
        const BATCH_LIMIT = 5000;
        let data = ctx.response.data || ctx.request.body;
        let counter = 0;
        let firebaseConfig: any;
        let app: any;

        try {
            ctx.func = {
                firestore: admin.firestore
            }
            this.validate(ctx);

            let opts = ctx.config as any;
            opts = opts[this.name];

            firebaseConfig = opts.inputs.firebaseConfig || ctx._PRIVATE_.get("firebase.config");
            const type: string = opts.inputs.properties.type;
            const reference: string = opts.inputs.properties.reference;
            const exclude: Array<string> = opts.inputs.properties.exclude;
            const merge: boolean = opts.inputs.properties.merge;

            this.initFirebaseAdmin(firebaseConfig);
            app = admin.app(firebaseConfig?.client_email);
            this.db = app.firestore();

            let dataBatch: any[] = [];
            let batches: any[] = [];
            if (!Array.isArray(data)) data = [data];
            await data.forEach(async (item: any, i: number) => {
                counter++;
                const docReference = this.getDocumentReference(reference, item);
                const executedItem = this.executeJS(item, ctx);

                if (exclude) {
                    exclude.forEach((key: string) => {
                        delete executedItem[key];
                    });
                }

                dataBatch.push({ docReference, item: executedItem });

                if (counter >= BATCH_LIMIT || i >= data.length - 1) {
                    counter = 0;
                    batches.push(dataBatch);
                    dataBatch = [];
                }
            });

            response.data = (await Promise.all(batches.map((batch: any, i: number) => this.processBulk(batch, type, merge)))).flat();
        } catch (error: any) {
            response.error = this.setError(error);
            response.success = false;
        } finally {
            await this.closeFirebaseAdmin(app);
        }

        return response;
    }

    async processBulk(batch: any, type: string, merge: boolean | undefined = undefined): Promise<any> {
        try {
            const bulkWriter = this.db.bulkWriter();

            for (const doc of batch) {
                const ref = this.db.doc(doc.docReference);
                if (type === 'delete') bulkWriter.delete(ref);
                else if (type === 'update') bulkWriter.update(ref, doc.item);
                else if (type === 'set') bulkWriter.set(ref, doc.item, { merge });
                else if (type === 'create')
                    bulkWriter[type](ref, doc.item);

                doc.id = ref.id;
            }

            await bulkWriter.close();
            return batch;
        } catch (error: any) {
            throw error;
        }
    }

    initFirebaseAdmin(firebaseConfig: any) {
        // Initialize Firebase if not already initialized
        try {
            getApp(firebaseConfig?.client_email);
        } catch (e) {
            if (firebaseConfig) initializeApp({ credential: cert(firebaseConfig) }, firebaseConfig?.client_email);
            else initializeApp({ credential: admin.credential.applicationDefault() });
        }
    }

    async closeFirebaseAdmin(app: any) {
        // Close Firebase if initialized
        try {
            if (!app.isDeleted_) await app.delete();
        } catch (e) {
        }
    }

    executeJS(item: any, ctx: BlueprintContext) {
        try {
            if (item && typeof item === "object" && !Object.isFrozen(item)) {
                if (Array.isArray(item)) {
                    for (let i = 0; i < item.length; i++) {
                        item[i] = this.executeJS(item[i], ctx);
                    }
                } else {
                    for (let key in item) {
                        if (item.hasOwnProperty(key)) {
                            item[key] = this.executeJS(item[key], ctx);
                            if (typeof item[key] === "string" && item[key].startsWith("js/")) {
                                item[key] = this.runJs(
                                    item[key].replace("js/", ""),
                                    ctx,
                                    item,
                                    ctx.func
                                );
                            }
                        }
                    }
                }
            }
        } catch (error: any) {
        } finally {
            return item;
        }
    }

    getDocumentReference(reference: string, item: any): string {
        const FIRESTORE_PREBUILT_FUNCTIONS: any = {
            "#uid": this.db.collection("uid").doc().id,
        };

        return reference.replace(/\${(.*?)}/g, (match: any, key: any) => {
            if (FIRESTORE_PREBUILT_FUNCTIONS[key]) return FIRESTORE_PREBUILT_FUNCTIONS[key];
            return item[key] || match;
        });
    }

    validate(ctx: BlueprintContext) {
        if (ctx.config === undefined) throw new Error(`${this.name} node requires a config`);
        let opts = ctx.config as any;
        opts = opts[this.name];

        if (opts?.inputs?.properties?.reference === undefined)
            throw new Error(`${this.name} requires a valid reference key`);
        if (
            opts.inputs.properties.type === undefined ||
            !["set", "create", "update", "delete"].includes(opts.inputs.properties.type)
        )
            throw new Error(`${this.name} requires a valid type`);
    }
}
