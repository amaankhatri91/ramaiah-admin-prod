import SignInForm from './SignInForm'

const SignIn = () => {
    console.log('SignIn component rendered')
    
    return (
        <SignInForm disableSubmit={false} />
    )
}

export default SignIn
