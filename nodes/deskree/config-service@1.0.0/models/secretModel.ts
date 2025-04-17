// secretModel.ts
/**
 * This is the business logic for managing secrets configurations
 *
 * @module SecretModel
 */

import { BaseModel } from "./baseModel";
import { SecretManagerServiceClient } from '@google-cloud/secret-manager';

export class SecretModel extends BaseModel {

    private readonly service: SecretManagerServiceClient;

    constructor(options?: any) {
        super();
        this.service = new SecretManagerServiceClient(options);
    }

    /**
     * Create new secret object
     * @param body configuration body
     * @return Object of configuration
     */
    public async create(body: any) {
        try {
            const project = `projects/${process.env.PROJECT_NUMBER}`;

            const [secret] = await this.service.createSecret({
                parent: project,
                secretId: body.name,
                secret: {
                    replication: {
                        automatic: {},
                    },
                },
            });

            const [version] = await this.service.addSecretVersion({
                parent: secret.name,
                payload: {
                    data: Buffer.from(body.value, 'utf8'),
                },
            });

            return {
                secret,
                version
            };
        } catch (e: any) {
            this.logger.log(this.logger.message.error, e.message, {
                file: 'secretModel.ts',
                line: '34-37',
                function: 'create'
            });
            throw e;
        }
    }

    /**
     * Get secret object by ID
     * @param uid UID of configuration
     * @return array of configurations
     */
    public async getById(uid: string) {
        try {
            return {};
        } catch (e: any) {
            this.logger.log(this.logger.message.error, e.message, {
                file: 'secretModel.ts',
                line: '59',
                function: 'getById'
            });
            throw e;
        }
    }

    /**
     * Get list of secrets
     * @return array of secrets
     */
    public async getAll() {
        try {
            return {
                data: []
            };
        } catch (e: any) {
            this.logger.log(this.logger.message.error, e.message, {
                file: 'secretModel.ts',
                line: '83',
                function: 'getAll'
            });
            throw e;
        }
    }

    /**
     * Update secret by ID
     * @param uid UID of secret
     * @param body secret object
     * @return array of secrets
     */
    public async update(body: any) {
        try {
            const project = `projects/${process.env.PROJECT_NUMBER}/secrets/${body.name}`;
            const payload = Buffer.from(body.value, 'utf8');

            const [version] = await this.service.addSecretVersion({
                parent: project,
                payload: {
                    data: payload,
                },
            });

            return {
                version
            };
        } catch (e: any) {
            this.logger.log(this.logger.message.error, e.message, {
                file: 'secretModel.ts',
                line: '107-109',
                function: 'update'
            });
            throw e;
        }
    }

    /**
     * Delete secret by ID
     * @param uid UID of secret object
     * @return string confirmation message
     */
    public async delete(uid: string) {
        try {
            try {
                const secret_path = `projects/${process.env.PROJECT_NUMBER}/secrets/${uid}`;

                await this.service.deleteSecret({
                    name: secret_path
                });

                return {
                    deleted: true
                };
            } catch (e: any) {
                this.logger.log(this.logger.message.error, e.message, {
                    file: 'secretModel.ts',
                    line: '34-37',
                    function: 'create'
                });
                throw e;
            }
        } catch (e: any) {
            this.logger.log(this.logger.message.error, e.message, {
                file: 'secretModel.ts',
                line: '131',
                function: 'delete'
            });
            throw e;
        }
    }
}