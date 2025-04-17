import { describe, it, before, mock } from 'node:test';
import assert from 'node:assert';
import Node from '../index';
// @ts-ignore
import { google } from 'googleapis';

describe('GoogleCalendar', () => {
    let node: Node;
    let ctx: any;

    before(() => {
        node = new Node();
        node.name = "google-calendar";
        ctx = {
            request: {
                body: "country, iso\nPanama, PAN\nUnited States, USA"
            },
            config: {
                [node.name]: {
                    "inputs": {
                        "serviceAccountKey": {
                            "type": "service_account",
                            "project_id": "<project_id>",
                            "private_key_id": "<private_key_id>",
                            "private_key": "<private_key>",
                            "client_email": "<client_email>",
                            "client_id": "<client_id>",
                            "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                            "token_uri": "https://oauth2.googleapis.com/token",
                            "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
                            "client_x509_cert_url": "<client_x509_cert_url>",
                            "universe_domain": "googleapis.com"
                        },
                        "properties": {
                            "type": "events",
                            "action": "list",
                            "from": "example@email.com",
                            "configuration": {
                                "calendarId": "primary"
                            }
                        }
                    }
                }
            }
        };

        mock.method(google.auth.JWT.prototype, 'authorize').mock.mockImplementation(() => {
            return true;
        });
    });

    it('should return a json object', async () => {
        const result: any = await node.run(ctx);
        assert.ok(result);
    });

});