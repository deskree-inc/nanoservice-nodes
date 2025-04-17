import { z } from "zod";
import timezones from "../tz.json";

const StandardTypes = [
    "UID",
    "Storage",
    "String",
    "Integer",
    "Float",
    "Boolean",
    "Map",
    "Array<string>",
    "Array<integer>",
    "Array<float>",
    "Array<boolean>",
    "Storage?",
    "String?",
    "Integer?",
    "Float?",
    "Boolean?",
    "Map?",
    "Array<string>?",
    "Array<integer>?",
    "Array<float>?",
    "Array<boolean>?",
];

// Deprecated for now
// const RequireModelUserValidator = z.object({
//     uid: z.string(),
//     roles: z.array(z.string()),
//     email: z.string(),
//     createdAt: z.string(),
//     updatedAt: z.string()
// });

const RequireModelGeneralValidator = z.object({
    uid: z.string(),
    createdAt: z.string(),
    updatedAt: z.string()
});

const StandardDataTypesValidator = z.enum(JSON.parse(JSON.stringify(StandardTypes)))
const RelationsDataTypesValidator = z.string().regex(/<(.*?)>/);
const DataTypeValidator = z.union([StandardDataTypesValidator, RelationsDataTypesValidator]);

const ColumnNameValidator = z.string()
    .min(3, "This field must be at least 3 characters")
    .max(50, "This field cannot exceed 50 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "This field must contain only alphanumeric characters")
    .trim()
    .refine((value: string) => !value.startsWith("config-"), {
        message: "config- is a reserved prefix"
    }).or(z.literal("uid"));

const TableNameValidator = z.string()
    .min(3,"This field must be at least 3 characters")
    .max(50, "This field cannot exceed 50 characters")
    .regex(/^[a-zA-Z_]+$/, "This field must contain only alphabetic characters")
    .trim()
    .refine((value: string) => !value.startsWith("config-"), {
        message: "config- is a reserved prefix"
    });

const ModelValidator = z.intersection(RequireModelGeneralValidator, z.record(ColumnNameValidator, DataTypeValidator));

const WebhookValidator = z.object({
    post: z.array(z.string().url()),
    patch: z.array(z.string().url()),
    delete: z.array(z.string().url()),
    get: z.array(z.string().url()),
    get_uid: z.array(z.string().url())
}).optional();

const TableValidator = z.object({
    name: TableNameValidator,
    order: z.number().min(1),
    config: z.object({
        createdAt: z.boolean(),
        updatedAt: z.boolean(),
        timezone: z.enum(JSON.parse(JSON.stringify(timezones))),
    }),
    subCollections: z.array(z.string()).max(0),
    model: ModelValidator,
    webhooks: WebhookValidator
});

const DatabaseValidator = z.object({
    type: z.enum(["default"]),
    tables: z.array(TableValidator)
});

type DatabaseTypes = z.infer<typeof DatabaseValidator>;
type TableNameTypes = z.infer<typeof TableNameValidator>;
type ColumnNameTypes = z.infer<typeof ColumnNameValidator>;
type ModelTypes = z.infer<typeof ModelValidator>;
type WebhookTypes = z.infer<typeof WebhookValidator>;
type StandardDataTypes = z.infer<typeof StandardDataTypesValidator>;
type DataTypes = z.infer<typeof DataTypeValidator>;
type TableTypes = z.infer<typeof TableValidator>;

export {
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
    StandardDataTypes,
    StandardDataTypesValidator,
    StandardTypes
};
