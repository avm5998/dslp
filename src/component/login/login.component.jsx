import React from 'react';
import './login.styles.css';

const Login = () => {
    return (
        <div>
            <form className="form-signin flex flex-col justifyy-center">
                <div className="text-center mb-4">
                    <img className="mb-4" src="" alt="logo" width="72" height="72" />
                    <h1 className="h3 mb-3 font-weight-normal">Sign in to Awesome Data Mining</h1>
                </div>
                <div className="flex flex-col justifyy-center">
                    <div className="form-label-group">
                        <input type="email" id="inputEmail" className="form-control" placeholder="Email address" required autofocus />
                        <label for="inputEmail">Email address</label>
                    </div>

                    <div className="form-label-group">
                        <input type="password" id="inputPassword" className="form-control" placeholder="Password" required />
                        <label for="inputPassword">Password</label>
                    </div>

                    <div className="checkbox mb-3">
                        <label>
                        <input type="checkbox" value="remember-me" /> Remember me
                        </label>
                    </div>
                    <button className="btn btn-lg btn-primary btn-block" type="submit">Sign in</button>
                </div>
                
            </form>
        </div>
    )
}

export default Login