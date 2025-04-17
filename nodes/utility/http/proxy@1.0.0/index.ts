import { BlueprintContext, BlueprintNode, ResponseContext } from "@deskree/blueprint-shared";
import axios, { AxiosRequestConfig, AxiosResponse } from "axios";

export default class Proxy extends BlueprintNode {
    async run(ctx: BlueprintContext): Promise<ResponseContext> {
        this.contentType = "application/json";
        let response: ResponseContext = { success: true, data: {}, error: null };
        let data = ctx.response.data || ctx.request.body;

        try {
            this.validate(ctx);
            let opts = ctx.config as any;
            opts = opts[this.name];

            const request = ctx.request;
            const reqPath = Object.assign({}, request.path.split("/"));
            opts = this.blueprintMapper(opts, ctx, { ...reqPath });

            const proxies = opts.inputs.properties.proxy || [];

            if (Array.isArray(proxies)) {
                await this.handleMultipleProxies(proxies, request, data, response, ctx);
            } else {
                await this.handleSingleProxy(proxies, request, data, response, ctx);
            }
        } catch (err: any) {
            response.error = this.setError({...err, code: 500});
            response.success = false;
        }

        return response;
    }

    async handleMultipleProxies(proxies: any[], request: any, data: any, result: any, ctx: BlueprintContext) {
        for (let proxy of proxies) {
            const response = await this.handleSingleProxy(proxy, request, data, result, ctx);
            if (response) break;
        }
    }

    async handleSingleProxy(proxy: any, request: any, data: any, result: any, ctx: BlueprintContext) {
        let { path, host, pathRewrite, options } = proxy;

        if (!path) throw new Error("Path is required");
        if (!host) throw new Error("URL is required");
        if (!this.validateRoute(path, request.path)) return false;

        if (pathRewrite) {
            const reqParams = this.handleDynamicRoute(path, request.path);
            pathRewrite = this.blueprintMapper(pathRewrite, {}, { ctx: { request: { params: reqParams } } });
        } else pathRewrite = request.path;

        if (Object.keys(request.query).length > 0) options.query = { ...request.query, ...options.query };
        const url = this.pathRewriter(`${host}${pathRewrite}`, options);
        const response = await this.proxyRequest(url, request.method, request.headers, data);

        result.data = response.data;
        ctx.response.contentType = response.headers["content-type"];

        return true;
    }

    proxyRequest = async (host: string, method: string, headers: any, body: any) => {
        delete headers.host;
        const targetRequestConfig: AxiosRequestConfig = {
            method,
            headers,
            url: host,
            data: method === "GET" ? undefined : body,
        };
        const targetResponse: AxiosResponse = await axios.request(targetRequestConfig);

        return targetResponse;
    };

    pathRewriter(
        requestUrl: string,
        options: {
            remove?: string[];
            replace?: { [key: string]: string };
            appendPath?: string;
            prependPath?: string;
            query?: { [key: string]: string | number | boolean };
            add?: boolean;
        }
    ): string {
        const url = new URL(requestUrl);

        // Function to remove parts of the path
        const removePathParts = (path: string, partsToRemove: string[]) => {
            const pathSegments = path.split("/").filter((segment) => segment !== "");
            const cleanedPathSegments = pathSegments.filter((segment) => !partsToRemove.includes(segment));
            return "/" + cleanedPathSegments.join("/");
        };

        // Function to replace path segments
        const replacePathSegment = (path: string, segmentToReplace: string, replacement: string) => {
            const pathSegments = path.split("/").filter((segment) => segment !== "");
            const replacedPathSegments = pathSegments.map((segment) =>
                segment === segmentToReplace ? replacement : segment
            );
            return "/" + replacedPathSegments.join("/");
        };

        // Apply the path manipulations based on options
        if (options.remove) {
            url.pathname = removePathParts(url.pathname, options.remove);
        }

        if (options.replace) {
            for (const [segmentToReplace, replacement] of Object.entries(options.replace)) {
                url.pathname = replacePathSegment(url.pathname, segmentToReplace, replacement);
            }
        }

        // Append and prepend path segments
        if (options.appendPath) {
            const appendPathSegments = options.appendPath.split("/").filter((segment) => segment !== "");
            url.pathname += "/" + appendPathSegments.join("/");
        }

        if (options.prependPath) {
            const prependPathSegments = options.prependPath.split("/").filter((segment) => segment !== "");
            url.pathname = "/" + prependPathSegments.join("/") + url.pathname;
        }

        // Apply query string manipulations
        if (options.query) {
            const params = new URLSearchParams(url.search);
            for (const [paramName, paramValue] of Object.entries(options.query)) {
                if (options.add && params.has(paramName)) {
                    params.append(paramName, paramValue.toString());
                } else if (paramValue === null || paramValue === undefined) {
                    params.delete(paramName);
                } else {
                    params.set(paramName, paramValue.toString());
                }
            }
            url.search = params.toString();
        }

        return url.toString();
    }

    validateRoute(dynamicRoute: string, actualRoute: string) {
        if (!dynamicRoute || !actualRoute) return false;
        // Custom modification: Replace /* with /.*
        dynamicRoute = dynamicRoute.replace(/\*/g, ".*");
        // Convert dynamicRoute to a regex pattern
        const regexPattern = dynamicRoute.replace(/\/:\w+/g, "/([^/]+)");
        // Create a new RegExp to match the dynamic route pattern
        const dynamicRouteRegExp = new RegExp(`^${regexPattern}$`);
        // Test the actual route against the dynamic route pattern
        return dynamicRouteRegExp.test(actualRoute);
    }

    handleDynamicRoute(dynamicRoute: any, reqPath: string) {
        let reqParams: any = {};
        // Extract the parameter names from the dynamic route pattern
        const paramNames = dynamicRoute.match(/:(\w+)/g)?.map((name: string) => name.substring(1));
        if (paramNames) {
            // Create a new RegExp to match the dynamic route pattern
            const dynamicRouteRegExp = new RegExp(`^${dynamicRoute.replace(/:\w+/g, "([^\\/]+)")}$`);
            // Test the actual route against the dynamic route pattern
            const match = reqPath.match(dynamicRouteRegExp);
            if (match) {
                // Extract the parameter values from the actual route
                const params: any = match.slice(1);
                // Add the parameter names and values to the request object
                paramNames.forEach((name: string | number, index: string | number) => {
                    reqParams[name] = params[index];
                });
            }
        }
        return reqParams;
    }

    validate(ctx: BlueprintContext) {
        if (ctx.config === undefined) throw new Error(`${this.name} node requires a config`);
        let opts = ctx.config as any;
        opts = opts[this.name];

        if (opts?.inputs?.properties.proxy === undefined)
            throw new Error(`${this.name} requires a valid proxy configuration`);
    }
}
