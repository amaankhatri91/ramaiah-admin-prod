import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import Checkbox from '@/components/ui/Checkbox'
import { FormItem, FormContainer } from '@/components/ui/Form'
import ActionLink from '@/components/shared/ActionLink'
import useAuth from '@/utils/hooks/useAuth'
import { Field, Form, Formik } from 'formik'
import * as Yup from 'yup'
import type { CommonProps } from '@/@types/common'
import { useState, createElement } from 'react'
import { FiEye, FiEyeOff, FiLock } from 'react-icons/fi'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'

interface SignInFormProps extends CommonProps {
    disableSubmit?: boolean
    forgotPasswordUrl?: string
    signUpUrl?: string
}

type SignInFormSchema = {
    username: string
    password: string
    rememberMe: boolean
}

const validationSchema = Yup.object().shape({
    username: Yup.string().required('Please enter your username'),
    password: Yup.string().required('Please enter your password'),
    rememberMe: Yup.bool(),
})

const SignInForm = (props: SignInFormProps) => {
    const {
        disableSubmit = false,
        className,
        forgotPasswordUrl = '/forgot-password',
        signUpUrl = '/sign-up',
    } = props

    const [showPassword, setShowPassword] = useState(false)

    const { signIn } = useAuth()

    const onSignIn = async (
        values: SignInFormSchema,
        setSubmitting: (isSubmitting: boolean) => void
    ) => {
        const { username, password } = values
        setSubmitting(true)

        const result = await signIn({ email: username, password })

        if (result?.status === 'failed') {
            // Show network error as toast message instead of in form
            toast.push(
                createElement(
                    Notification,
                    { type: 'danger', duration: 5000, title: 'Login Failed' },
                    result.message
                ),
                { placement: 'top-end' }
            )
        }

        setSubmitting(false)
    }

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword)
    }

    return (
        <div className={className}>
            {/* Modern Login Card */}
            <div className="bg-white rounded-2xl shadow-xl p-8 md:w-[423px] w-[360px] mx-auto relative">
                {/* Header Section with gradient background */}
                <div className="bg-[rgba(85,110,230,0.25)] rounded-t-2xl -m-8 mb-6 pl-[23px] relative overflow-hidden">
                    <div className="flex items-center justify-between">
                        <div className="text-white">
                            <h1 className="text-[#556EE6] font-medium text-[16px] leading-normal font-[Poppins] not-italic mb-[2px]">Welcome!</h1>
                            <p className="text-[#556EE6] font-normal text-[13px] leading-normal font-[Poppins] not-italic mb-[16px]">Sign in to Ramaiah Admin.</p>
                        </div>
                        <div className="flex items-center">
                            {/* Login header image */}
                            <img
                                src="/img/images/loginheaderimage.svg"
                                alt="Login illustration"
                                className=" object-contain"
                            />
                        </div>
                    </div>

                </div>

                <Formik
                    initialValues={{
                        username: '',
                        password: '',
                        rememberMe: false,
                    }}
                    validationSchema={validationSchema}
                    onSubmit={(values, { setSubmitting }) => {
                        if (!disableSubmit) {
                            onSignIn(values, setSubmitting)
                        } else {
                            setSubmitting(false)
                        }
                    }}
                >
                    {({ touched, errors, isSubmitting }) => (
                        <Form>
                            <div className='absolute top-[78px]'>
                                <img
                                    src="/img/images/loginheadericonlogo.svg"
                                    alt="Ramaiah Admin Logo"
                                    className=""
                                />
                            </div>
                            <FormContainer>
                                {/* Username Field */}
                                <FormItem
                                    className="mb-7 mt-[56px] "
                                    label="Username"
                                    labelClass="text-[#495057] font-[Poppins] not-italic text-[14px] !font-medium leading-normal"
                                    invalid={(errors.username && touched.username) as boolean}
                                    errorMessage={errors.username}
                                >
                                    <Field
                                        type="text"
                                        autoComplete="off"
                                        name="username"
                                        placeholder="Enter username"
                                        placeholderClass="text-[#495057] font-[Poppins] not-italic text-[13px] font-normal leading-normal"
                                        component={Input}
                                        className="rounded-lg border-gray-300 focus:border-purple-500 focus:ring-purple-500 "
                                    />
                                </FormItem>

                                {/* Password Field */}
                                <FormItem
                                    className="mb-7"
                                    label="Password"
                                     labelClass="text-[#495057] font-[Poppins] not-italic text-[14px] !font-medium leading-normal"
                                    invalid={(errors.password && touched.password) as boolean}
                                    errorMessage={errors.password}
                                >
                                    <div className="relative">
                                        <Field
                                            autoComplete="off"
                                            name="password"
                                            placeholder="Enter password"
                                             placeholderClass="text-[#495057] font-[Poppins] not-italic text-[13px] font-normal leading-normal"
                                            component={Input}
                                            type={showPassword ? "text" : "password"}
                                            className="rounded-lg border-gray-300 focus:border-purple-500 focus:ring-purple-500 pr-12"
                                        />
                                        <button
                                            type="button"
                                            onClick={togglePasswordVisibility}
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                                        >
                                            {showPassword ? (
                                                <FiEyeOff size={20} />
                                            ) : (
                                                <FiEye size={20} />
                                            )}
                                        </button>
                                    </div>
                                </FormItem>

                                {/* Remember Me Checkbox */}
                                <div className="flex items-center mb-6">
                                    <Field
                                        name="rememberMe"
                                        component={Checkbox}
                                        className="mr-2"
                                    />
                                    <label className="text-[#495057] font-[Poppins] not-italic text-[13px] font-medium leading-normal">Remember me</label>
                                </div>

                                {/* Login Button */}
                                <Button
                                    block
                                    loading={isSubmitting}
                                    variant="solid"
                                    type="submit"
                                    className="hover:bg-gradient-to-r from-pink-500 to-blue-500  bg-[linear-gradient(267deg,#00ADEF_-49.54%,#D60F8C_110.23%)] text-white rounded-lg py-3 text-base font-medium mb-4"
                                >
                                    {isSubmitting ? 'Logging in...' : 'Login'}
                                </Button>

                                {/* Forgot Password Link */}
                                <div className="flex items-center justify-center">
                                    <ActionLink
                                        to={forgotPasswordUrl}
                                        className="text-[#74788D] font-[Poppins] not-italic text-[13px] font-normal leading-normal flex items-center"
                                    >
                                        <img src="/img/images/passwordlock.svg" alt="Lock Icon" className="mr-1" />
                                        Forgot your password?
                                    </ActionLink>
                                </div>
                            </FormContainer>
                        </Form>
                    )}
                </Formik>
            </div>
        </div>
    )
}

export default SignInForm
