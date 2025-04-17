import { CollectionService } from "./collectionService";

// Test script to test functionality locally
async function test() {
    const collectionService = new CollectionService();
    const collection = {
        name: "docs",
        uid: undefined,
        query: undefined,
        includes: [],
        sorted: undefined,
        limit: {
            page: process.argv.length >= 3 ? parseInt(process.argv[2]) : 1,
            limit: process.argv.length >= 4 ? parseInt(process.argv[3]) : 50,
        },
    };
    try {
        const result = await collectionService.getAll(collection);

        // let docs = [];
        // docs.slice(startAt, startAt + collection.limit.limit)

        let startAt = collection.limit.limit * (collection.limit.page - 1);
        console.log({ startAt }, result.meta);
        console.log(result.data.map((r: any) => r.uid));
    } catch (e) {
        console.error(e);
    }
}

test();
