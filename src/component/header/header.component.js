import React from 'react'
import './header.styles.css'
import ProfileDropdown from '../profile-dropdown/profile-dropdown.component'

const Header = () => {
    return (
        
        <section class="navigation">
            <div class="nav-container">
                <div class="brand">
                <a href="#!">Logo</a>
                </div>
                <nav>
                <div class="nav-mobile"><a id="nav-toggle" href="#!"><span></span></a></div>
                <ul class="nav-list">
                    <li>
                    <a href="#!">About</a>
                    </li>
                    <li>
                    <a href="#!">Docs</a>
                    </li>
                    <li>
                    <a href="#!">        
                        <img src="src\assets\images\vivek_profile.jpg" className='profile-img'/>
                    </a>
                    <ul class="nav-dropdown">
                        <li>
                        <a href="#!">Signed in as Vivek</a>
                        <div className='dropdown-divider'></div>
                        </li>

                        <li>
                        <a href="#!">Your Profile</a>
                        </li>
                        <li>
                        <a href="#!">Settings</a>
                        </li>
                        <li>
                        <div className='dropdown-divider'></div>
                        <a href="#!">Sign out</a>
                        </li>
                    </ul>
                    </li>
                </ul>
                </nav>
            </div>
        </section>
        
		
    )

}

export default Header