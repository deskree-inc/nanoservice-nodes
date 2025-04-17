export class Utils {
    static isNullOrUndefined(value: any): boolean {
        return value === undefined || value === null;
    }

    static pagination(list: any, page = 1, limit = 15) {
        return list.slice((page - 1) * limit, page * limit);
    }
}
