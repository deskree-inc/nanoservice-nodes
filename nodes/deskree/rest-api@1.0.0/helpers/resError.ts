// eesError.ts
/**
 * Class for centralized error response handling
 *
 * @module ResError
 */

//@ts-ignore
import { Logger } from "../../logger@1.0.0/logger";

export default class ResError {
    private readonly fileName;
    private logger;

    constructor(fileName: string) {
        this.fileName = fileName;
        this.logger = new Logger("rest", process.env.PROJECT_ID as string);
    }

    private getErrorLevel(code: number): string {
        if (code >= 500) {
            return this.logger.message.error;
        } else if (code >= 400) {
            return this.logger.message.warning;
        } else {
            return this.logger.message.notice;
        }
    }

    /**
     * Function to format and return error response and write appropriate logs
     * @param req: Express Request
     * @param code: Response code
     * @param functionName: Name of the function that throws an error
     * @param line: Code line where the error originates
     * @param billable: Whether the error affects the client's APIs limit
     * @param message: Error details
     * @param title: Error title
     */
    public sendErrorResponse(
        req: any,
        code: number,
        functionName: string,
        line: string,
        billable: boolean,
        message?: string,
        title?: string
    ): { errors: any[]; code: number } {
        this.logger.log(
            this.getErrorLevel(code),
            {
                code: code,
                details: message ? message : this.logger.getStatusMessage(code).details,
            },
            {
                file: this.fileName,
                line: line,
                function: functionName,
            },
            req,
            undefined,
            billable ? [{ billable: "billable" }] : []
        );
        return {
            errors: [
                {
                    code: code.toString(),
                    title: title ? title : this.logger.getStatusMessage(code).details,
                    detail: message ? message : "",
                },
            ],
            code: code,
        };
    }
}
