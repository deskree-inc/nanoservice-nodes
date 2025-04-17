export interface RestControllerType {
    method: string;
    request: any;
    type: RestApiType;
}

export type RestApiType = "collection" | "postman" | "storage";
