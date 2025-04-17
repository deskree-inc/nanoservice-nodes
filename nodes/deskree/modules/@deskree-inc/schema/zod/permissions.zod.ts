import {z} from "zod";

const EndpointMethodValidator = z.string().optional().or(z.array(z.string()).optional());

const EndpointValidator = z.object({
    name: z.string(),
    methods: z.object({
        get: EndpointMethodValidator,
        get_uid: EndpointMethodValidator,
        post: EndpointMethodValidator,
        patch: EndpointMethodValidator,
        delete: EndpointMethodValidator,
    })
});

const PermissionConfigValidator = z.object({
    name: z.string(),
    endpoints: z.array(EndpointValidator)
});

const PermissionsValidator = z.object({
    roles: z.array(z.object({
        name: z.string(),
        uid: z.string(),
    })),
    configs: z.array(PermissionConfigValidator)
});

type PermissionTypes = z.infer<typeof PermissionsValidator>;

export {
    PermissionTypes,
    PermissionsValidator
};
