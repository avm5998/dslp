import React, {useState} from 'react'
import CustomButton from '../custom-button/custom-button.component'
import FormInput from '../form-input/form-input.component'
import './sign-in.styles.css'


const SignIn = () => {
    const [userCredentials, setCredentials] = useState({email:'', password:''})
    const {email, password} = userCredentials;
    const handleSubmit = async e => {
        e.preventDefault();
        console.log('submitted');   
    };
    const handleChange = event => {
        const {name, value} = event.target;
        setCredentials( {...userCredentials, [name]:value} )
    };
    return (
        <div className='flex bg-gray-100'>
            <div className="pl-32 flex flex-col w-1/3 h-screen items-start justify-center">
                <div className='sign-in'>
                    <h1 class="cursor-default mb-6 text-2xl font-semibold tracking-tighter text-gray-300 sm:text-3xl title-font">
                        Sign in with username and password
                    </h1>
                    <form onSubmit={handleSubmit}>
                        <FormInput name='email' type='email' value={email} label= 'email' onChange={handleChange} required />
                        <FormInput type='password' name='password' value={password} label="password" onChange={handleChange} required />
                        <div className='buttons'>
                            <CustomButton type='submit'>Sign In</CustomButton>
                            <CustomButton type='button' isGoogleSignIn>Sign In With Google</CustomButton>
                        </div>
                    </form>
                </div>
            </div>
            
        </div>     
    );
}

export default SignIn