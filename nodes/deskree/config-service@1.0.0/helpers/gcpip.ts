// GCPIP.ts
/**
 * This is the base class for the business logic for all GCP Identity Platform functions
 * including email send and Firebase Admin SDK methods
 * @module GCPIP
 */

import axios from "axios";
import * as sgMail from "@sendgrid/mail";
import CollectionService from "./collectionService";
import { BaseModel } from "../models/baseModel";
import { Logger } from "../../logger@1.0.0/logger";

export class GCPIP extends BaseModel {

    protected client;
    protected sendgrid;
    protected collectionService;
    protected logger;

    constructor() {

        super()

        this.logger = new Logger('config', process.env.PROJECT_ID || "")

        this.client = axios.create({
            baseURL: `${process.env.GCP_IP_BASE_URL}`,
        });

        /* istanbul ignore next */
        this.client.interceptors.request.use(config => {
            config.params = {
                key: process.env.GCP_IP_API_KEY,
                ...config
            }
            return config
        });

        if (process.env?.SEND_GRID_API_KEY) sgMail.setApiKey(process.env.SENDGRID_API_KEY || "");
        this.sendgrid = sgMail;
        this.collectionService = CollectionService;

    }
    public async emailSend(data: Record<string, string>, email: string, templateId: string) {
        const message: any = {
            personalizations: [
                {
                    to: [{ email: email }],
                    dynamic_template_data: data
                }
            ],
            from: {
                email: "hello@deskree.com",
                name: process.env.DESKREE_ID
            },
            replyTo: {
                email: "no-reply@deskree.com",
                name: process.env.DESKREE_ID
            },
            template_id: templateId,
            mailSettings: {
                bypassListManagement: {
                    enable: false
                },
                footer: {
                    enable: false
                },
                sandboxMode: {
                    enable: false
                }
            }
        };
        try {
            await this.sendgrid.send(message);
        } catch (e: any) {
            console.error(e.response.body)
            throw e
        }
    }
}
