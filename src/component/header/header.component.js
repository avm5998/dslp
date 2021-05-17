import React, { useState, useEffect } from 'react';
import './header.styles.css'
import ProfileDropdown from '../profile-dropdown/profile-dropdown.component'
import { Route, Switch, Link } from 'react-router-dom';
import AuthService from "../../services/auth.service";

const Header = (props) => {
    let [userDetail, setCurrentUser] = useState({currentUser:undefined})
    const {currentUser} = userDetail;
    useEffect(() => {
        console.log("inside header use effect")
        const user = props.user;
        if (user) {
            setCurrentUser({currentUser: user})
        }

    }, [ props.user ])
    return (
        
            <section className="navigation">
                <div className="nav-container">
                    <div className="brand">
                    <a href="">Logo</a>
                    </div>
                    <nav>
                        <div className="nav-mobile"><a id="nav-toggle" href=""><span></span></a></div>
                    

                        {
                            currentUser?(
                                <ul className="nav-list">
                                    <li>
                                        <a href="">        
                                            <img src="src\assets\images\vivek_profile.jpg" className='profile-img'/>
                                        </a>
                                        <ul className="nav-dropdown">
                                            <li>
                                            <a href="">Signed in as {currentUser.id}</a>
                                            <div className='dropdown-divider'></div>
                                            </li>

                                            <li>
                                            <a href="/profile">Your Profile</a>
                                            </li>
                                            <li>
                                            <a href="">Settings</a>
                                            </li>
                                            <li>
                                            <div className='dropdown-divider'></div>
                                            <Link to={"/login"} className="nav-link">
                                                Sign out
                                            </Link>
                                            </li>
                                        </ul>       
                                    </li>
                                </ul>) :
                                (
                                <ul className="nav-list">
                                    <li>
                                        <Link to={"/login"} className="nav-link">
                                            Login
                                        </Link>
                        
                                    </li>
                                    <li>
                                    <Link to={"/register"} className="nav-link">
                                        Register
                                    </Link>
                                    </li>
                                </ul>
                                )
                                }
                    
                    </nav>
                </div>
                    
            </section>
        
		
    )

}


export default Header