import React from 'react';
import './sign-in-and-sign-up.styles.css'
import SignIn from '../../component/sign-in/sign-in.component';
import SignUp from '../../component/sign-up/sign-up.component';

const SignInAndSignUpPage = () => (
    // // <div className='flex bg-gray-100'>
    //     {/* <div className="pl-32 flex flex-col w-1/3 h-screen items-start justify-center"> */}

    //     {/* </div> */}
    // {/* </div> */}
    <div className='sign-in-and-sign-up bg-gray-100 h-screen'>
        <SignIn />
        <SignUp />
    </div>
)
export default SignInAndSignUpPage