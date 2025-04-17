// baseModel.ts
/**
 * This is the base model class
 *
 * @module BaseModel
 */

//@ts-ignore
import { Logger } from "../../logger@1.0.0/logger";
export class BaseModel {
    protected logger;

    constructor() {
        this.logger = new Logger("rest", process.env.PROJECT_ID as string);
    }
}
