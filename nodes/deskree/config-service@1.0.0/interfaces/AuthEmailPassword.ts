export interface AuthEmailAndPasswordRes {
    uid: string,
    email: string,
    emailVerified: boolean,
    disabled: boolean,
    idToken?: string,
    refreshToken?: string,
    expiresIn?: string
}

export interface AuthEmailAndPasswordReq {
    email: string,
    password: string,
    returnSecureToken: boolean,
    tenantId?: string
}

export interface NewPassword {
    oobCode: string,
    newPassword: string
    uid?: string
}

export interface EmailVerify {
    oobCode: string
    uid: string
}

export interface EmailBody {
    email: string
}

