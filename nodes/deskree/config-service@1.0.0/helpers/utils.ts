// utils.ts
/**
 * This is a collection of utility functions
 *
 * @module Utils
 */

export class Utils {


    public static checkForArray(array: Array<any>) {
        return array && Array.isArray(array);
    }

    public static checkForNonEmptyArray(array: Array<any>) {
        return array && Array.isArray(array) && array.length !== 0;
    }

    public static checkForNonEmptyObject(obj: Object) {
        return obj && Object.keys(obj).length !== 0 && obj.constructor === Object
    }

    public static checkForArrayOfStrings(array: Array<string>) {
        if (this.checkForNonEmptyArray(array)) {
            return array.every(item =>
                typeof item === 'string'
            )
        }
        return false
    }

    public static checkForAllMethods(obj: any) {
        if (this.checkForNonEmptyObject(obj)) {
            // const methods: Array<string> = ['get', 'post', 'put', 'delete', 'patch']
            const methodValues: Array<any> = ['private', 'public', 'author', 'admin'];
            // const hasAllKeys: Boolean = methods.every(item => obj.hasOwnProperty(item));
            const correctMethodValues: Boolean = Object.values(obj).every((val: any) => {
                if (typeof val === 'string') {
                    return methodValues.includes(val)
                } else {
                    return this.checkForArrayOfStrings(val)
                }
            });
            return this.checkForNonEmptyObject(obj) && correctMethodValues
        }
        return false
    }
}