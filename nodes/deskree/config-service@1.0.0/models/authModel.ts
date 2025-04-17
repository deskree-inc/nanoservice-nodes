// authModel.ts
/**
 * Class responsible for all internal AUTH functions
 *
 * @module AuthModel
 */

import {GCPIP} from "../helpers/gcpip";
import {AuthEmailAndPasswordRes, EmailBody} from "../interfaces/AuthEmailPassword";

export class AuthModel extends GCPIP {

    /**
     * Delete account
     * @param uid user uid
     * @return Promise
     */
    public async deleteAccount(uid: string): Promise<any> {
        try {
            return await this.collectionService.firebase.auth().deleteUser(uid);
        } catch (e) {
            throw e;
        }
    }

    /**
     * Update Email
     * @param body NewEmail
     * @param uid user uid
     * @return Promise
     */
    public async updateEmail(body: EmailBody, uid: string): Promise<any> {
        try {
            const currentUser = await this.collectionService.firebase.auth().getUser(uid);
            const result = await this.collectionService.firebase.auth().updateUser(uid, body);
            const data = {
                to: currentUser.email,
                subject: `${process.env.PROJECT_NAME}: Your email has been updated`,
                textData: `Your email has been changed to ${body.email}. If you have not requested this change, please reset your password or contact platform administration.`,
            } as any;
            await this.emailSend(data.text, data.to, `${process.env.GENERAL_TEMPLATE}`);
            return {
                uid: result.uid,
                email: result.email,
                emailVerified: result.emailVerified,
                disabled: result.disabled
            } as AuthEmailAndPasswordRes
        } catch (e) {
            throw e;
        }
    }
}
