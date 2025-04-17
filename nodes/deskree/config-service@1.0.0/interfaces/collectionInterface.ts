export interface CollectionInterface {
    name: string
    subCollections: Array<string>
    model: CollectionModelInterface
    order: number
    config: CollectionConfigInterface
}

interface CollectionModelInterface {
    [x: string]: string
}

interface CollectionConfigInterface {
    createdAt: boolean
    updatedAt: boolean
    timezone: string
}