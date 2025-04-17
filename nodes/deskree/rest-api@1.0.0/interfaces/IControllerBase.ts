interface IControllerBase {
    get?(req: any): any;
    create?(req: any): any;
    edit?(req: any): any;
    delete?(req: any): any;
    getByUUID?(req: any): any;
}

export default IControllerBase;
