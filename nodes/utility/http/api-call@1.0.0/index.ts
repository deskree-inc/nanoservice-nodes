import { BlueprintContext, BlueprintNode, ResponseContext } from "@deskree/blueprint-shared";
import _ from "lodash";

export default class ApiCall extends BlueprintNode {

  async run(ctx: BlueprintContext): Promise<ResponseContext> {
    this.contentType = "application/json";
    let response: ResponseContext = { success: true, data: {}, error: null };
    let data = ctx.response.data || ctx.request.body;

    try {
      this.validate(ctx);
      let opts = _.cloneDeep(ctx.config) as any;
      opts = opts[this.name];

      opts = this.blueprintMapper(opts, ctx, data);

      const method = opts.inputs.properties.method;
      let url = opts.inputs.properties.url;
      let headers = opts.inputs.properties.headers;
      let responseType = opts.inputs.properties.responseType;
      let body = opts.inputs.properties.body;
      let custom_var = opts.inputs.properties.var;

      if (!body) body = data;

      const result = await this.runApiCall(url, method, headers, body, responseType);
      if (custom_var && result.errors === undefined && result.error === undefined) {
        if (ctx.vars === undefined) ctx.vars = {};
        ctx.vars[custom_var] = result;
      }
      else {
        response.data = result;
      }

    } catch (error: any) {
      response.error = this.setError(error);
      response.success = false;
    }

    return response;
  }

  runApiCall = async (url: string, method: string, headers: any, body: any, responseType: string) => {
    let options: any = {
      method,
      headers,
      redirect: 'follow',
      responseType,
      body: typeof (body) === "string" ? body : JSON.stringify(body),
    }

    if (method === "GET") delete options.body;

    try {
        let response: Response = await fetch(url, options);
        let parsedResponse;
        if (response.headers.get("content-type")?.includes("application/json")) {
            parsedResponse = await response.json();
        } else {
            parsedResponse = await response.text();
        }
        if (!response.ok) throw parsedResponse;
        return parsedResponse;
    } catch (e) {
        throw e;
    }
  }

  validate(ctx: BlueprintContext) {
    if (ctx.config === undefined) throw new Error(`${this.name} node requires a config`);
    let opts = ctx.config as any;
    opts = opts[this.name];

    if (opts?.inputs?.properties?.url === undefined) throw new Error(`${this.name} requires a valid url`);
    if (opts?.inputs?.properties?.method === undefined) throw new Error(`${this.name} requires a valid method`);
  }
}