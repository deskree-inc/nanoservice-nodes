// utils.ts
/**
 * This is a collection of utility functions
 *
 * @module Utils
 */

export default class Utils {
    public static capitalizeFirstLetter(string: string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    public static checkForArray(array: Array<any>) {
        return array && Array.isArray(array) && array.length !== 0;
    }

    public static objectContainsKey(object: object, key: string) {
        return (
            object !== undefined &&
            object !== null &&
            typeof object === "object" &&
            key !== undefined &&
            key !== null &&
            Object.prototype.hasOwnProperty.call(object, key)
        );
    }

    public static objectIsNotEmpty(object: object) {
        return (
            object !== undefined && object !== null && typeof object === "object" && Object.keys(object).length !== 0
        );
    }

    /**
     * Normalize configuration model types
     * @param type type of configuration model
     * @return string normalized type
     */
    public static normalizeTypes(type: String) {
        if (type.toLowerCase().startsWith("array") || type.toLowerCase().includes("<array")) {
            return "array";
        } else if (type.toLowerCase().includes("<string>") || type.toLowerCase() === "storage") {
            return "string";
        } else if (type.toLowerCase() === "float" || type.toLowerCase() === "integer") {
            return "number";
        } else {
            return type.toLowerCase();
        }
    }

    /**
     * Check for Storage type in the model object
     * @param model config model of collection
     * @return string normalized type
     */
    public static checkStorageType(model: Record<string, any>) {
        const storageKeys = [];
        for (const key in model) {
            if (model[key].toLowerCase().replace("?", "") === "storage") {
                storageKeys.push(key);
            }
        }
        return storageKeys;
    }

    /**
     * Check if a string is valid URL string
     * @param url URL string
     * @return boolean when the string is URL or not
     **/
    public static stringIsAValidUrl(url: string) {
        try {
            new URL(url);
            return true;
        } catch (err) {
            return false;
        }
    }

    /**
     * Check whether the file is base64 or url type
     * @param file file as base64, URL string, or buffer
     * @param key field name
     * @return string either base64, url, buffer, or object
     **/
    public static checkFileType(file: any, key: string) {
        if (typeof file === "string") {
            if (file.startsWith("data:") || (/^[A-Za-z0-9+/]+[=]{0,2}$/.test(file) && file.length % 4 === 0)) {
                return "base64";
            } else if (Utils.stringIsAValidUrl(file)) {
                return "url";
            } else {
                throw new Error(
                    `Invalid file type for the ${key} field. File must be public resource URL, base64 string, buffer, or object with data property containing base64 string or a valid download URL.`
                );
            }
        } else if (Buffer.isBuffer(file)) {
            return "buffer";
        } else if (typeof file === "object") {
            if (!Object.prototype.hasOwnProperty.call(file, "data") || typeof file.data !== "string") {
                throw new Error(
                    `Invalid file data for the ${key} field. File object must contain a data property with base64 string or a valid download URL.`
                );
            }
            if (Object.prototype.hasOwnProperty.call(file, "ext")) {
                if (typeof file.ext !== "string") {
                    throw new Error(`Invalid file extension for the ${key} field. File extension must be a string.`);
                }
            }
            if (Object.prototype.hasOwnProperty.call(file, "name")) {
                if (typeof file.name !== "string" && !Utils.validateFileName(file.name)) {
                    throw new Error(
                        `Invalid file name for the ${key} field. File name must not start with .well-known/acme-challenge/ or end with a period, space, or any of the following characters: <>:"/\|?*.`
                    );
                }
            }
            return "object";
        }
        throw new Error(
            `Invalid file type for the ${key} field. File must be public resource URL, base64 string, buffer, or object with data property containing base64 string or a valid download URL.`
        );
    }

    /**
     * Validate file name for GCP storage
     * @param name file name
     * @return boolean when the file name is valid or not
     **/
    private static validateFileName(name: string): boolean {
        const regex = /^(con|prn|aux|nul|((com|lpt)[0-9]))$|([<>:"\/\\|?*])|(\.|\s)$/gi;
        const wsRegex = /\s/g;
        return !(
            name.startsWith(".well-known/acme-challenge/") ||
            name === "." ||
            name === ".." ||
            regex.test(name) ||
            wsRegex.test(name)
        );
    }

    /**
     * Converts string to boolean
     * @param string URL string
     * @return boolean | undefined
     **/
    public static stringToBoolean(string: string): boolean | undefined {
        try {
            if (typeof string === "boolean") {
                return string;
            }
            if (string === "true") {
                return true;
            } else if (string === "false") {
                return false;
            } else {
                return undefined;
            }
        } catch (err) {
            return false;
        }
    }
}
