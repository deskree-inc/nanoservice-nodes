export class CollectionException extends Error {
    private readonly _msg: string;

    public get message(): string {
        return this._msg;
    }

    /* istanbul ignore next */
    constructor(msg: string) {
        super();
        Object.setPrototypeOf(this, new.target.prototype);
        this._msg = msg;
    }
}
