// resolversErrors.ts
/**
 * Class for centralized error response handling
 *
 * @module ResolversErrors
 */

import { Logger } from "../../logger@1.0.0/logger";

export default class ResolversErrors {
    private readonly fileName;
    private logger;

    constructor(fileName: string) {
        this.fileName = fileName;
        this.logger = new Logger("graphql-service", process.env.PROJECT_ID as string);
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
     * @param e: Error object
     * @param context: GraphQL context
     * @param functionName: Name of the function that throws an error
     * @param line: Code line where the error originates
     * @param billable: Whether the error affects the client's APIs limit
     */
    public throwError(e: any, context: any, functionName: string, line: string, billable: boolean) {
        const code = typeof e.code === "number" ? e.code : parseInt(e.code);
        this.logger.log(
            this.getErrorLevel(code),
            {
                code: code,
                details: e.hasOwnProperty("detail") ? e.detail : this.logger.getStatusMessage(code).details,
            },
            {
                file: this.fileName,
                line: line,
                function: functionName,
            },
            context,
            {
                processed: this.logger.getDuration(context),
                statusCode: code,
            },
            billable ? [{ billable: "billable" }] : []
        );
        return e;
    }
}
