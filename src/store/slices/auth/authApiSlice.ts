import RtkQueryService from '@/services/RtkQueryService'
import type { SignInCredential, SignInResponse } from '@/@types/auth'

export const authApiSlice = RtkQueryService.injectEndpoints({
    endpoints: (builder) => ({
        login: builder.mutation<SignInResponse, SignInCredential>({
            query: (credentials) => ({
                url: '/login',
                method: 'POST',
                data: credentials,
            }),
            transformResponse: (response: any) => {
                // Handle the response structure from your API
                return {
                    token: response.data?.token || response.token,
                    user: response.data?.user || response.user,
                }
            },
        }),
    }),
    overrideExisting: false,
})

export const { useLoginMutation } = authApiSlice
