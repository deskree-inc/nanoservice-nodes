interface IControllerBase {
    initRoutes(req: any): any
    get?(req: any, res: any, next: any): any
    create?(req: any, res: any, next: any): any
    edit?(req: any, res: any, next: any): any
    delete?(req: any, res: any, next: any): any
    getByUUID?(req: any, res: any, next: any): any
}

export default IControllerBase
