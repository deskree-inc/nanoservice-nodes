// resError.ts
/**
 * Class for centralized error response handling
 *
 * @module ResError
 */

// @ts-ignore
import {Logger} from "../../logger@1.0.0/logger";
import {Request} from 'express';
import {ZodError} from "zod";

export class ResError {
    private readonly fileName;
    private logger;

    constructor(fileName: string) {
        this.fileName = fileName;
        this.logger = new Logger('config', process.env.PROJECT_ID || "");
    }

    private getErrorLevel(code: number): string {
        if (code >= 500) {
            return this.logger.message.error
        } else if (code >= 400) {
            return this.logger.message.warning
        } else {
            return this.logger.message.notice
        }
    }

    /**
     * Function to process error requests
     * @param e: Http Error object
     * @param req: Express Request
     * @param res: Express Response
     * @param functionName: Name of the function that throws an error
     * @param line: Code line where the error originates
     */
    public catchError(e: Record<string, any> | Error | any, req: Request, functionName: string,
                       line: string) {
        if (e instanceof ZodError) {
            return this.sendErrorResponse(req, 422, functionName, line, true, e.message);
        } else if (Object.prototype.hasOwnProperty.call(e, "code") && Object.prototype.hasOwnProperty.call(e,
            "message")) {
            const code = typeof e.code !== "string" && parseInt(e.code) > 100 ? e.code : 500;
            return this.sendErrorResponse(req, code, functionName, line, false, e.message);
        } else if (Object.prototype.hasOwnProperty.call(e, 'response') && e.responsObject.prototype.hasOwnProperty.call(
            e, 'data') && Object.prototype.hasOwnProperty.call(e.response.data,
            'message') && Object.prototype.hasOwnProperty.call(e, 'code')) {
            const code = typeof e.code !== "string" && parseInt(e.code) > 100 ? e.code : 500;
            return this.sendErrorResponse(req, code, functionName, line, false, e.response.data.message);
        } else if (Object.prototype.hasOwnProperty.call(e, 'errorInfo') && Object.prototype.hasOwnProperty.call(
            e.errorInfo, 'message')) {
            return this.sendErrorResponse(req, 422, functionName, line, false, e.errorInfo.message);
        } else {
            return this.sendErrorResponse(req, 500, functionName, line, false, e.message);
        }
    }

    /**
     * Function to format and return error response and write appropriate logs
     * @param req: Express Request
     * @param res: Express Response
     * @param code: Response code
     * @param functionName: Name of the function that throws an error
     * @param line: Code line where the error originates
     * @param zod: Whether the error is produces by Zod or not
     * @param message: Error details
     */
    public sendErrorResponse(req: Request, code: number, functionName: string, line: string, zod: boolean, message?: any) {
        this.logger.log(this.getErrorLevel(code), {
            code: code,
            details: message ? message : this.logger.getStatusMessage(code).details
        }, {
            file: this.fileName,
            line: line,
            function: functionName
        }, req, undefined, []);
        return zod ? {errors: JSON.parse(message)} : {
            errors: [{
                code: code.toString(),
                title: this.logger.getStatusMessage(code).details,
                detail: message ? message : ""
            }]
        };
    }
}