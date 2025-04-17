export interface PermissionsInterface {
    name: string
    endpoints: PermissionsEndpointsInterface[]
}

interface PermissionsEndpointsInterface {
    name: String
    methods: PermissionsMethodsInterface
}

interface PermissionsMethodsInterface {
    get: "private" | "public" | "author" | Array<string>
    post: "private" | "public" | "author" | Array<string>
    put: "private" | "public" | "author" | Array<string>
    delete: "private" | "public" | "author" | Array<string>
    get_uid: "private" | "public" | "author" | Array<string>
}