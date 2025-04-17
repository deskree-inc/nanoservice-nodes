import { BlueprintContext, BlueprintNode } from "@deskree/blueprint-shared";

export default class IfElse extends BlueprintNode {
    constructor() {
        super();
        this.flow = true;
        this.contentType = "";
    }

    async run(ctx: BlueprintContext): Promise<any> {
        let steps: BlueprintNode[] = [];

        
        try {
            if (ctx.config === undefined) throw new Error("If-else node requires a config");
            let opts = ctx.config as any;
            opts = opts[this.name];
    
            if (opts === undefined) throw new Error("If-else node requires a config");
            if (opts.conditions === undefined) throw new Error("If-else node requires conditions");
            if (opts.conditions.length === 0) throw new Error("If-else node requires at least 1 conditions");
            
            let firstCondition = opts.conditions[0];
            if(firstCondition.type !== "if") throw new Error("First condition must be an if");

            if (opts.conditions.length > 1) {
                let lastCondition = opts.conditions[opts.conditions.length - 1];
                if(lastCondition.type !== "else") throw new Error("Last condition must be an else");
            }
            
            for(let i = 0; i < opts.conditions.length; i++) {
                const condition = opts.conditions[i];

                if(condition.condition !== undefined && condition.condition.trim() !== "") {
                    const result = this.runJs(condition.condition, ctx, ctx.response.data, {}, ctx.vars);
                    
                    if (result) {
                        steps = condition.steps;
                        break;
                    }
                }
                else {
                    steps = condition.steps;
                    break;
                }
            }
        }
        catch (error) {
            throw error;
        }

        return steps;
    }
}