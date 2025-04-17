export interface FirestoreIndexesInterface {
    indexes: Array<FirestoreIndexInterface>;
}

export interface FirestoreIndexInterface {
    collectionGroup: string;
    queryScope: string;
    fields: Array<FirestoreIndexFieldInterface>;
}

export interface FirestoreIndexFieldInterface {
    fieldPath: string;
    arrayConfig?: string;
    order?: string;
}
