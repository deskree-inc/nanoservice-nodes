import { BlueprintContext, BlueprintNode } from "@deskree/blueprint-shared";
import admin from "firebase-admin";

export default class LoggerFirestore extends BlueprintNode {
    async run(ctx: BlueprintContext) {
        this.contentType = "application/json";
        let data = ctx.response.data || ctx.request.body;
        let result: any = { data };

        try {
            const id: string = data.id;
            const app = this.initFirebaseAdmin();
            const db = admin.firestore(app);

            const doc: any = db.collection("logs").doc("workflows").collection("test").doc(id);
            if (data?.isInit) {
                data.data.createdAt = admin.firestore.FieldValue.serverTimestamp();
                await doc.set(data.data);
            } else if (data?.error) {
                await doc.update({ error: data?.error });
            } else if (data?.logs) {
                await doc.update({ logs: data?.logs });
            } else if (data?.data) {
                await doc.update({ steps: admin.firestore.FieldValue.arrayUnion(data?.data) });
            }
        } catch (e: any) {
            // throw new Error("(" + this.name + ") " + (e as Error).message);
            console.log("deskree-logger-firestore error", e.message);
        }

        return result;
    }

    private reduceArrays(obj: any, amount: number): any {
        if (Array.isArray(obj)) {
            return obj.slice(0, amount).map(item => this.reduceArrays(item, amount));
        } else if (typeof obj === 'object' && obj !== null) {
            return Object.keys(obj).reduce((acc: any, key) => {
                acc[key] = this.reduceArrays(obj[key], amount);
                return acc;
            }, {});
        } else {
            return obj;
        }
    }

    initFirebaseAdmin() {
        try {
            const app: any = admin.initializeApp({
                credential: admin.credential.cert({
                    projectId: process.env.DESKREE_FIREBASE_PROJECT_ID,
                    clientEmail: process.env.DESKREE_FIREBASE_CLIENT_EMAIL,
                    privateKey: process.env.DESKREE_FIREBASE_PRIVATE_KEY?.replace(
                        /\\n/g,
                        '\n',
                    ),
                }),
            }, "deskree-main");
            return app;
        } catch (e) {
            const app = admin.app("deskree-main");
            return app;
        }
    }
}
