import {
    SchemaTypes,
    TableNameTypes,
    ColumnNameTypes,
    DataTypes,
    ModelTypes,
    WebhookTypes,
    StandardDataTypes,
    InfrastructureTypes,
} from "../zod/schema.zod";

export interface ValidateSchemaInterface {
    validateSchema(schema: SchemaTypes): boolean;
    validateTableName(name: TableNameTypes): boolean;
    validateColumnName(name: ColumnNameTypes): boolean;
    validateDataType(type: DataTypes): boolean;
    validateTableModel(type: ModelTypes): boolean;
    validateWebhooks(webhook: WebhookTypes): boolean;
    validateInfrastructureOptions(infrastructure: InfrastructureTypes): boolean;
    getStandardDataTypes(): StandardDataTypes[];

    getSchemaExample(): SchemaTypes;

    getTimeZones(): string[];

}
