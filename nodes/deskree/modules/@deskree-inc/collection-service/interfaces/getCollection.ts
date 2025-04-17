export interface GetCollection {
    meta: {
        total: number;
        includesCount?: number;
        page?: number;
        limit?: number;
    };
    data: any;
}
