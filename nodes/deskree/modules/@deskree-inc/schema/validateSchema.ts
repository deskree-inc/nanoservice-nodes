// validateSchema.ts

/**
 * This is a class for validating schema
 *
 * @module ValidateSchema
 */

import {
    SchemaTypes,
    SchemaValidator,
    TableNameTypes,
    TableNameValidator,
    ColumnNameTypes,
    ColumnNameValidator,
    DataTypes,
    DataTypeValidator,
    ModelTypes,
    ModelValidator,
    WebhookTypes,
    WebhookValidator,
    StandardDataTypes,
    InfrastructureTypes,
    InfrastructureValidator,
    StandardTypes
} from "./zod/schema.zod";
import {ValidateSchemaInterface} from "./interfaces/validateSchema.interface";
import * as schema from "./deskree-schema.json";
import * as tz from "./tz.json";

export class Validate implements ValidateSchemaInterface{

    public validateSchema(schema: SchemaTypes): boolean {
        try {
            SchemaValidator.parse(schema);
            return true;
        } catch (e) {
            throw e
        }
    }

    public validateTableName(name: TableNameTypes): boolean {
        try {
            TableNameValidator.parse(name);
            return true;
        } catch (e) {
            throw e
        }
    }

    public validateColumnName(name: ColumnNameTypes): boolean {
        try {
            ColumnNameValidator.parse(name);
            return true;
        } catch (e) {
            throw e
        }
    }

    public validateDataType(type: DataTypes): boolean {
        try {
            DataTypeValidator.parse(type);
            return true;
        } catch (e) {
            throw e
        }
    }

    public validateTableModel(type: ModelTypes): boolean {
        try {
            ModelValidator.parse(type);
            return true;
        } catch (e) {
            throw e
        }
    }

    public validateWebhooks(webhooks: WebhookTypes): boolean {
        try {
            WebhookValidator.parse(webhooks);
            return true;
        } catch (e) {
            throw e
        }
    }

    public validateInfrastructureOptions(infrastructure: InfrastructureTypes): boolean {
        try {
            InfrastructureValidator.parse(infrastructure);
            return true;
        } catch (e) {
            throw e
        }
    }

    public getStandardDataTypes(): StandardDataTypes[] {
        return StandardTypes;
    }

    public getSchemaExample(): SchemaTypes {
        // @ts-ignore
        return schema;
    }

    public getTimeZones(): string[] {
        // @ts-ignore
        return tz;
    }
}
