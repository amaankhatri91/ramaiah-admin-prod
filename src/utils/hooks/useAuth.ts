import { apiSignOut, apiSignUp } from '@/services/AuthService'
import {
    setUser,
    signInSuccess,
    signOutSuccess,
    useAppSelector,
    useAppDispatch,
} from '@/store'
import { useLoginMutation } from '@/store/slices/auth/authApiSlice'
import { useNavigate } from 'react-router-dom'
import type { SignInCredential, SignUpCredential } from '@/@types/auth'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'
import { createElement } from 'react'

type Status = 'success' | 'failed'

function useAuth() {
    const dispatch = useAppDispatch()
    const navigate = useNavigate()
    const [loginMutation] = useLoginMutation()

    const { token, signedIn } = useAppSelector((state) => state.auth.session)

    const signIn = async (
        values: SignInCredential
    ): Promise<
        | {
              status: Status
              message: string
          }
        | undefined
    > => {
        try {
            const result = await loginMutation(values).unwrap()
            
            if (result.token) {
                dispatch(signInSuccess(result.token))
                
                if (result.user) {
                    // Normalize API user fields into our UserState
                    const apiUser = result.user as any
                    const normalizedUser = {
                        id: apiUser?.id ?? apiUser?._id ?? '',
                        avatar: apiUser?.avatar || apiUser?.profile_image || '',
                        userName: apiUser?.userName || apiUser?.first_name || '',
                        email: apiUser?.email || '',
                        authority: apiUser?.authority || ['USER'],
                        first_name: apiUser?.first_name || '',
                        last_name: apiUser?.last_name || '',
                        phone: apiUser?.phone || '',
                    }
                    dispatch(setUser(normalizedUser))
                } else {
                    // Set default user if no user data from API
                    const defaultUser = {
                        id: '1',
                        avatar: '',
                        userName: values.email || 'User',
                        email: values.email || '',
                        authority: ['USER'],
                        first_name: 'User',
                        last_name: '',
                        phone: '',
                    }
                    dispatch(setUser(defaultUser))
                }

                const loginMessage = 'Logged in successfully'

                // Show toast with success message
                toast.push(
                    createElement(
                        Notification,
                        { type: 'success', duration: 2500, title: 'Login' },
                        loginMessage
                    ),
                    { placement: 'top-end' }
                )

                // Navigate to /home as requested
                navigate('/home')
                return {
                    status: 'success',
                    message: loginMessage,
                }
            }
        } catch (error: any) {
            const errorMessage = error?.data?.message || error?.message || 'Login failed'
            return {
                status: 'failed',
                message: errorMessage,
            }
        }
    }

    const signUp = async (values: SignUpCredential) => {
        try {
            const resp = await apiSignUp(values)
            if (resp.data) {
                const { token } = resp.data
                console.log(token,"tokentoken");
                
                dispatch(signInSuccess(token))
                if (resp.data.user) {
                    dispatch(
                        setUser(
                            resp.data.user || {
                                avatar: '',
                                userName: 'Anonymous',
                                authority: ['USER'],
                                email: '',
                            }
                        )
                    )
                }
                navigate('/dashboard')
                return {
                    status: 'success',
                    message: '',
                }
            }
            // eslint-disable-next-line  @typescript-eslint/no-explicit-any
        } catch (errors: any) {
            return {
                status: 'failed',
                message: errors?.response?.data?.message || errors.toString(),
            }
        }
    }

    const handleSignOut = () => {
        dispatch(signOutSuccess())
        dispatch(
            setUser({
                avatar: '',
                userName: '',
                email: '',
                authority: [],
            })
        )
        toast.push(
            createElement(
                Notification,
                { type: 'success', duration: 2000, title: 'Signed out' },
                'You have been signed out'
            ),
            { placement: 'top-end' }
        )
        navigate('/sign-in')
    }

    const signOut = async () => {
        try {
            await apiSignOut()
        } catch {
            // Ignore sign out API errors and proceed to clear local session
        } finally {
            handleSignOut()
        }
    }

    return {
        authenticated: token && signedIn,
        signIn,
        signUp,
        signOut,
    }
}

export default useAuth
