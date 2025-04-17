import { BlueprintContext, BlueprintNode, ResponseContext } from "@deskree/blueprint-shared";
import axios from "axios";

export default class Remote extends BlueprintNode {
    async run(ctx: BlueprintContext) {
        this.contentType = "application/json";
        let data = ctx.response.data || ctx.request.body;
        let response: ResponseContext = { success: true, data: {}, error: null };

        try {
            this.validate(ctx);
            let opts = ctx.config as any;
            opts = opts[this.name];

            let options: any = {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    blueprint_vars: Buffer.from(JSON.stringify(ctx.vars || {})).toString("base64"),
                    blueprint_env: Buffer.from(JSON.stringify(ctx.env || {})).toString("base64"),
                    blueprint_node_config: Buffer.from(JSON.stringify(opts.config)).toString("base64"),
                    blueprint_node_name: opts.node.name,
                    blueprint_node: opts.node.node,
                    blueprint_secret_key: opts.request.secret,
                },
                redirect: "follow",
                data,
            };

            response.data = await axios(opts.request.url, options);
        } catch (e: any) {
            let error: any = e.response ? e.response.data : e;
            response.error = this.setError(error);
            if (typeof error === "object") response.error.setJson(error);
            response.success = false;
        }

        return response;
    }

    validate(ctx: BlueprintContext) {
        if (ctx.config === undefined) throw new Error(`${this.name} node requires a config`);
        let opts = ctx.config as any;
        opts = opts[this.name];

        if (!opts.node || !opts.node.name || !opts.node.node)
            throw new Error(`${this.name} node requires a node name and node`);
        if (!opts.config) throw new Error(`${this.name} node requires a config`);
        if (!opts.request || !opts.request.url || !opts.request.type)
            throw new Error(`${this.name} node requires a remote url and type`);
    }
}
