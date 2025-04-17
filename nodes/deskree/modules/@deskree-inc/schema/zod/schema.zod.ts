import {z} from "zod";
import {GeneralTypes, GeneralValidator} from "./general.zod";
import {
    LocationTypes,
    LocationValidator,
    ServiceTypes,
    ServiceValidator,
    IdentityTypes,
    IdentityValidator,
    InfrastructureTypes,
    InfrastructureValidator
} from "./infrastructure.zod";
import {
    DatabaseTypes, DatabaseValidator,
    TableNameTypes,
    TableNameValidator,
    TableTypes,
    TableValidator,
    ColumnNameTypes,
    ColumnNameValidator,
    ModelTypes,
    ModelValidator,
    DataTypes,
    DataTypeValidator,
    WebhookTypes,
    WebhookValidator,
    StandardDataTypes,
    StandardDataTypesValidator,
    StandardTypes
} from "./database.zod";
import {PermissionTypes, PermissionsValidator} from "./permissions.zod";

const SchemaValidator = z.object({
    general: GeneralValidator,
    infrastructure: InfrastructureValidator,
    databases: z.array(DatabaseValidator),
    permissions: PermissionsValidator
});

type SchemaTypes = z.infer<typeof SchemaValidator>;

export {
    GeneralTypes,
    GeneralValidator,
    LocationTypes,
    LocationValidator,
    ServiceTypes,
    ServiceValidator,
    IdentityTypes,
    IdentityValidator,
    InfrastructureTypes,
    InfrastructureValidator,
    DatabaseTypes,
    DatabaseValidator,
    TableNameTypes,
    TableNameValidator,
    TableTypes,
    TableValidator,
    ColumnNameTypes,
    ColumnNameValidator,
    DataTypes,
    DataTypeValidator,
    ModelTypes,
    ModelValidator,
    WebhookTypes,
    WebhookValidator,
    PermissionTypes,
    PermissionsValidator,
    SchemaTypes,
    SchemaValidator,
    StandardDataTypes,
    StandardDataTypesValidator,
    StandardTypes
}
