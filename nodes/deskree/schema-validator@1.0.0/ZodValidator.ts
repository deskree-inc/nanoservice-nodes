import { z } from "zod";

export default class ZodValidator {
    private model;
    private body;

    constructor(model: any, body: any) {
        this.model = model;
        this.body = body;
    }

    public mapper(value: string) {
        let optional = value.indexOf('?') > -1;
        let type = value.replace('?', '');

        switch (type.toLowerCase()) {
            case 'string':
                return optional ? z.string().optional() : z.string();
            case 'integer':
            case 'float':
                return optional ? z.number().optional() : z.number();
            case 'boolean':
                return optional ? z.boolean().optional() : z.boolean();
            case 'array<string>':
                return optional ? z.array(z.string()).optional() : z.array(z.string());
            case 'array<integer>':
            case 'array<float>':
                return optional ? z.array(z.number()).optional() : z.array(z.number());
            case 'array<boolean>':
                return optional ? z.array(z.boolean()).optional() : z.array(z.boolean());
            case 'storage':
                return optional ? z.union([z.string(), z.record(z.string(), z.any())], z.array(z.number())).optional() : z.union([z.string(), z.record(z.string(), z.any())], z.array(z.number()));
            case 'map':
                return optional ? z.record(z.string(), z.any()).optional() : z.record(z.string(), z.any());
            case 'date':
                return optional ? z.date().optional() : z.date();
            case 'email':
                return optional ? z.string().email().optional() : z.string().email();
            default:
                return optional ? z.any().optional() : z.any();
        }
    }

    public createPostModel() {
        let z_model: any = {};

        Object.keys(this.model).forEach((entry) => {
            let key = entry;
            let value = this.model[entry];

            if (key !== 'uid') {
                z_model[key] = this.mapper(value);
            }
        });

        return z.object(z_model);
    }

    public createPatchModel() {
        let z_model: any = {};

        Object.keys(this.body).forEach((entry) => {
            let key = entry;
            let value = this.model[entry];

            if (key !== 'uid') {
                z_model[key] = this.mapper(value);
            }
        });

        return z.object(z_model);
    }

    public getModel(method: string) {
        return method.toLowerCase() === 'patch' ? this.createPatchModel() : this.createPostModel();
    }
}