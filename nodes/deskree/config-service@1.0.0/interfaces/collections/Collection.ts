import {CollectionQuery} from "./CollectionQuery";
import {CollectionSorted} from "./CollectionSorted";
import {CollectionLimit} from "./CollectionLimit";

export interface Collection {
    uid?: string,
    name: string,
    query?: CollectionQuery[],
    sorted?: CollectionSorted,
    limit?: CollectionLimit
    includes?: object[]
}


