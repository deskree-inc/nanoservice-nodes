import CollectionQueryObject from "./collectionQueryObject";
import CollectionSorted from "./collectionSorted";
import CollectionLimit from "./collectionLimit";

export default interface CollectionQuery {
    uid?: string;
    name: string;
    query?: CollectionQueryObject[];
    sorted?: CollectionSorted;
    limit?: CollectionLimit;
    includes?: Includes[];
}

interface Includes {
    key: string;
    table: string;
    type: string;
}
