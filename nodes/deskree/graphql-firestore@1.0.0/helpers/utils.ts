// utils.ts
/**
 * This is a collection of utility functions
 *
 * @module Utils
 */

import { Error } from "../interfaces";

export default class Utils {
    /**
     * Capitalize first letter of a string
     * @param string string to manipulate
     * @return string output string with first letter capital
     */
    public static capitalizeFirstLetter(string: string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    /**
     * Check for array to exist and be non-empty
     * @param array array to check
     * @return boolean whether the array exists and is not empty
     */
    public static checkForArray(array: Array<any>) {
        return array && Array.isArray(array) && array.length !== 0;
    }

    /**
     * Check for Storage type in the model object
     * @param model config model of collection
     * @return string normalized type
     */
    public static checkStorageType(model: object) {
        const storageKeys: string[] = [];
        Object.entries(model).forEach((key) => {
            const type = key[1];
            if (type === "Storage" || type === "storage" || type === "Storage?" || type === "storage?") {
                storageKeys.push(key[0]);
            }
        });
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
     * @param file file as base64 or URL string
     * @return string either 'url' or 'base64'
     **/
    public static checkFileType(file: string) {
        /* istanbul ignore next */
        if (typeof file === "string" && file !== "") {
            if (Utils.stringIsAValidUrl(file)) {
                return "url";
            } else if (file.startsWith("data:") || (/^[A-Za-z0-9+/]+[=]{0,2}$/.test(file) && file.length % 4 === 0)) {
                return "base64";
            }
        }
        /* istanbul ignore next */
        throw new Error("Invalid file type. File must be download URL or base64 encoded string");
    }

    /**
     * Convert REST error message to a string for GraphQL error handling
     * @param e Error object containing code, title, and detail
     * @return string
     **/
    public static errorFormatter(e: Error): string {
        return `Request finished with status code ${e.code}: ${e.title}. Details: ${e.detail}`;
    }
}
