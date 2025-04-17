export interface Controller {
    query: any;
    variables: any;
    request: any;
    type: "collection" | "schema";
}
