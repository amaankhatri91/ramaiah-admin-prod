export type SignInCredential = {
    email: string
    password: string
}

export type SignInResponse = {
    token: string
    user?: {
        id?: string | number
        _id?: string | number
        userName: string
        authority: string[]
        avatar: string
        email: string
        profile_image?: string
        first_name?: string
        last_name?: string
        phone?: string
    }
}

export type SignUpResponse = SignInResponse

export type SignUpCredential = {
    userName: string
    email: string
    password: string
}

export type ForgotPassword = {
    email: string
}

export type ResetPassword = {
    password: string
}
