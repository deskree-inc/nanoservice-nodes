// resSuccess.ts
/**
 * Class for centralized response success
 *
 * @module ResSuccess
 */

// @ts-ignore
import {Logger} from "../../logger@1.0.0/logger";
import {Request} from 'express';

export class ResSuccess {
    private readonly fileName;
    private logger;

    constructor(fileName: string) {
        this.fileName = fileName;
        this.logger = new Logger('config', process.env.PROJECT_ID || "");
    }

    /**
     * Function to format and return error response and write appropriate logs
     * @param req: Express Request
     * @param res: Express Response
     * @param code: Response code
     * @param functionName: Name of the function that throws an error
     * @param line: Code line where the error originates
     * @param data: data to be sent in the response
     */
    public sendSuccessResponse(req: Request, code: number, functionName: string, line: string, data: any) {
        this.logger.log(this.logger.message.notice, this.logger.getStatusMessage(code), {
            file: this.fileName,
            line: line,
            function: functionName
        }, req, undefined, []);

        return data;
    }

    /**
     * Function to format and return error response and write appropriate logs
     * @param req: Express Request
     * @param res: Express Response
     * @param code: Response code
     * @param functionName: Name of the function that throws an error
     * @param line: Code line where the error originates
     * @param data: data to be sent in the response
     */
    public send(req: Request, code: number, functionName: string, line: string, data: any) {
        this.logger.log(this.logger.message.notice, this.logger.getStatusMessage(code), {
            file: this.fileName,
            line: line,
            function: functionName
        }, req, undefined, []);

        return data;
    }
}