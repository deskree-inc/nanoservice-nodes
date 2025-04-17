import { describe, it, before } from 'node:test';
import assert from 'node:assert';
import Node from '../index';

describe('AddProperties', () => {  
    let node: Node;

    before(() => {        
        node = new Node();
        node.name = "add-properties";
    });

    it('should add properties to the object', async () => {
        const ctx: any = {
            response: {
                data: { prop1: "value1", prop2: "value2" }
            },
            request: {
                body: null
            },
            config: {
                "add-properties": {
                    inputs: {
                        properties: {
                            prop3: "value3",
                            prop4: "value4"
                        }
                    }
                }
            }
        };
        const result = await node.run(ctx);
        assert.deepStrictEqual(result, { prop1: "value1", prop2: "value2", prop3: "value3", prop4: "value4" });
    });

    it('should add properties to the object with a function', async () => {
        const ctx: any = {
            response: {
                data: null
            },
            request: {
                body: { prop1: "value1", prop2: "value2" }
            },
            config: {
                "add-properties": {
                    inputs: {
                        properties: {
                            "owner": "",
                            "uniqueKey": "js/func.uuid()",
                            "createdAt": "js/new Date().toISOString()",
                            "updatedAt": "js/new Date().toISOString()"
                          }
                    }
                }
            }
        };
        const result = await node.run(ctx);
        assert.ok(typeof result.uniqueKey === "string");
    });

    // unit test should throw error
    it('should throw error if the input data is an array', async () => {
        const ctx: any = {
            response: {
                data: []
            },
            request: {
                body: null
            },
            config: {}
        };
        try {
            await node.run(ctx);
        } catch (error: any) {
           assert.strictEqual(error.message, "(add-properties) Error: AddProperties node can't be used with array");
        }
    });

});