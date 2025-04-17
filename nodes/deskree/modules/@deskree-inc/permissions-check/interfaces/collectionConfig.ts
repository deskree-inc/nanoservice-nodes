export interface CollectionConfig {
    name: string;
    endpoints: Array<ConfigPermissionObjectInterface>;
}

interface ConfigPermissionObjectInterface {
    methods: {
        post?: string | Array<string>;
        get?: string | Array<string>;
        get_uid?: string | Array<string>;
        patch?: string | Array<string>;
        delete?: string | Array<string>;
    };
    name: string;
}
