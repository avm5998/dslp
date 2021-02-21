import React from 'react';
import './register.styles.css';

const Register = () => {
    return (
        <div>
            <form className="form-signin flex flex-col justifyy-center">
                <div className="text-center mb-4">
                    <h1 className="h3 mb-3 font-weight-normal">Create Account</h1>
                </div>
                <div className="grid grid-cols-2">
                    <div className="form-label-group col-start-1 mr-1">
                        <input type="text" id="inputFirstName" className="form-control" placeholder="First Name" required autofocus />
                        <label for="inputFirstName">First Name</label>
                    </div>
                    <div className="form-label-group col-start-2 ml-1">
                        <input type="text" id="inputLastName" className="form-control" placeholder="Last Name" required autofocus />
                        <label for="inputLastName">Last Name</label>
                    </div>
                    <div className="form-label-group col-span-2">
                        <input type="text" id="inputUser" className="form-control" placeholder="Username" required autofocus />
                        <label for="inputUser">Username</label>
                    </div>
                    <div className="form-label-group col-span-2">
                        <input type="email" id="inputEmail" className="form-control" placeholder="Email address" required autofocus />
                        <label for="inputEmail">Email address</label>
                    </div>

                    <div className="form-label-group col-span-2">
                        <input type="password" id="inputPassword" className="form-control" placeholder="Password" required />
                        <label for="inputPassword">Password</label>
                    </div>
                    
                    <div className="form-label-group col-span-2">
                        <input type="password" id="inputConPassword" className="form-control" placeholder="Confirm Password" required />
                        <label for="inputConPassword">Confirm Password</label>
                    </div>
                    <button className="btn btn-lg btn-primary btn-block col-span-2" type="submit">Register</button>
                    <p className="mt-5 mb-3 text-muted text-center col-span-2">Already have an account? <a href="" target="">Sign in</a></p>
                </div>
                
            </form>
        </div>
    )
}

export default Register