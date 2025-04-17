export interface PostmanCollection {
    name: string;
    description: string;
    routes: PostmanRoute[];
}

interface PostmanRoute {
    name: string;
    url: string;
    method: "GET" | "POST" | "PATCH" | "DELETE";
    description: string;
    params?: Array<string>;
    headers?: Array<string>;
    body?: any;
}
