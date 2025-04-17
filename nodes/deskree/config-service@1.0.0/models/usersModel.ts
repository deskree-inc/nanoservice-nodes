// userModel.ts
/**
 * Main class for managing users data
 *
 * @module UserModel
 */

import {BaseModel} from "./baseModel";
import {Collection} from "../interfaces/collections/Collection";
// import collectionService from "../helpers/collectionService";

export class UsersModel extends BaseModel {
    private readonly collectionService!: any;
    /**
     * Method to get a user.
     * @param query express req query
     * @return Promise
     */
    constructor(collectionService: any) {
        super();
        this.collectionService = collectionService;
    }
    public async get(query: any): Promise<any> {
        try {
            const collection: any = {
                name: 'users',
                query: query.where !== undefined ? JSON.parse(query.where): undefined,
                includes: query.includes !== undefined ? JSON.parse(query.includes) : [],
                sorted: query.sorted !== undefined ? JSON.parse(query.sorted): undefined,
                limit: {
                    page: query.page !== undefined ? JSON.parse(query.page): undefined,
                    limit: query.limit !== undefined ? JSON.parse(query.limit): undefined
                }
            } as Collection
            return await this.collectionService.getAll(collection);
        } catch (e) {
            throw e;
        }
    }

    /**
     * Method to create a user.
     * @param body body payload
     * @param uid user UID
     * @return Promise
     */
    public async create(body: object, uid: string): Promise<any> {
        /* istanbul ignore next */
        try {
            const collection: any = {
                name: 'users',
                uid: uid,
                body: body,
                query: undefined,
                includes: undefined,
                sorted: undefined,
                limit: {
                    page: 1,
                    limit: 1
                }
            } as Collection
            return await this.collectionService.create(collection, null, true, true, '');
            /* istanbul ignore next */
        } catch (e) {
            throw e;
        }
    }

    /**
     * Method to delete a user
     * @param uid user UID
     * @return Promise
     */
    public async delete(uid: string): Promise<any> {
        try {
            const collection: any = {
                name: 'users',
                uid: uid,
                query: undefined,
                includes: undefined,
                sorted: undefined,
                limit: {
                    page: 1,
                    limit: 1
                }
            } as Collection
            return await this.collectionService.delete(collection);
        } catch (e) {
            throw e;
        }
    }
}
