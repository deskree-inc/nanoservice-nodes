// import { Validate } from "../validateSchema";
import * as Types from "../zod/schema.zod";

function test() {
    try {
        const data = { "name": "weapons", "subCollections": [], "config": { "createdAt": true, "timezone": "America/Toronto", "updatedAt": true }, "order": 4, "model": { "uid": "UID", "createdAt": "String?", "author": "String?", "updatedAt": "String?", "test": "String?", "reference": "String?" }, "actions": { "rename": {}, "delete": [], "new": ["test"] } }
        Types.TableValidator.parse(data)
        console.info('\x1b[32m Test succeeded! \x1b[0m')
    } catch (error) {
        console.error('\x1b[31m Test failed! \x1b[0m')
        console.error(error)

    }
}

test();