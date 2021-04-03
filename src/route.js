import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from "react-redux";
import { connect } from "react-redux";

import { Route, Router, Switch, Link, Redirect } from 'react-router-dom';
import Home from './component/home';
import Summary from './component/summary';
import Visualization from './component/visualization_new';
import Query from './component/query'
import Header from './component/header/header.component'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { library } from '@fortawesome/fontawesome-svg-core'
import { fas } from '@fortawesome/free-solid-svg-icons'
import { far } from '@fortawesome/free-regular-svg-icons'
import Cleaning from './component/cleaning'
import Sandbox from './component/sandbox'
import FeatureEngineering from './component/featureEngineering';
import Preprocessing from './component/preprocessing';
import FeatureSelection from './component/featureSelection';
import Analysis from './component/analysis';
// testing dummy
import { login } from "./actions/auth";

//Login imports
import Login from './component/login/login.component'
import Register from './component/register/register.component'
import Profile from './component/profile/profile.component'
import ForgotPassword from './component/forgot_password/forgot_password.component'
import ResetPasswordConfirm from './component/reset_password/reset_password.component'

import { logout } from "./actions/auth";
import { clearMessage } from "./actions/message";

import { history } from './store';
//add all solid icon-fonts
library.add(fas)
library.add(far)

const Menu = {
    'Main': [
        { text: 'Upload Data', icon: 'home', to: '/' },
        { text: 'Summary', icon: 'chart-area', to: '/summary' },
        { text: 'Visualization', icon: 'chart-area', to: '/visualization' },
        { text: 'Sandbox', icon: 'chart-area', to: '/sandbox' },
        { text: 'Query', icon: 'search', to: '/query' },
        { text: 'Clean', icon: 'search', to: '/clean' },
        { text: 'Feature Engineering', icon: 'search', to: '/featureEngineering' },
        { text: 'Feature Selection', icon: 'search', to: '/featureSelection' },
        { text: 'Preprocessing', icon: 'search', to: '/preprocessing' },
        { text: 'Sign In', icon: 'sign-in-alt', to: '/signin' },
        { text: 'Analysis', icon: 'sign-in-alt', to: '/analysis' },
    ],
}

const Routes = (props) => {
    const {userEnv} = process.env
    const dispatch = useDispatch();
    if(userEnv === 'default'){
        useEffect(() => {    
            dispatch(login("dummy_user", "dummy@123"))
            .then(() => {
              props.history.push("/home");
              window.location.reload();
            })
            .catch(() => {
              console.log("loginfailed")
            });
        }, [])
    }

    const { user: currentUser } = useSelector((state) => state.auth);
    
    let dataset = useSelector(state => state.dataset)
    let [menuData, setMenuData] = useState(Menu)

    useEffect(() => {
        setMenuData(data => {
            data.Main[0].extraText = dataset.filename
            return {...data}
        }
        )
    }, [dataset.filename])
    useEffect(() => {
        history.listen((location) => {
          dispatch(clearMessage()); // clear message when changing location
        });
      }, [dispatch]);
    
    const logOut = () => {
        dispatch(logout());
      };
    return (
        <Router history={history} >
        <div>
            <section class="navigation">
                <div class="nav-container">
                    <div class="brand">
                    <Link to={"/"}>
                        LOGO
                    </Link>
                    </div>
                    <nav>
                        <div class="nav-mobile"><a id="nav-toggle" href=""><span></span></a></div>
            
                    {currentUser ? (
                        <ul class="nav-list">
                                    <li>
                                        <a href="/login" onClick={logOut}>
                                                Sign out
                                        </a>
                                    </li>
                                    <li>
                                        {/* <a>        
                                            <img src="src\assets\images\vivek_profile.jpg" className='profile-img'/>
                                        </a> */}


                                        <ul class="nav-dropdown">
                                            <li>
                                            <a href="">Signed in as {currentUser.username}</a>
                                            <div className='dropdown-divider'></div>
                                            </li>

                                            <li>
                                            <a href="/profile">Your Profile</a>
                                            </li>
                                            <li>
                                            <a href="">Settings</a>
                                            </li>

                                        </ul>       
                                    </li>
                                </ul>
                    ):
                    (
                        <ul class="nav-list">
                                    <li>
                                        <Link to={"/login"} >
                                            Login
                                        </Link>
                        
                                    </li>
                                    <li>
                                    <Link to={"/register"} >
                                        Register
                                    </Link>
                                    </li>
                            </ul>
                    )
                    }
                 </nav>
                </div>
                    
            </section>

            <div>
                <div className='min-h-screen flex flex-col flex-auto flex-shrink-0 antialiased bg-gray-50 text-gray-80'>
                {
                
                    currentUser &&(
                        <div className='fixed flex flex-col left-0 w-2/12 bg-white h-full border-r'>

                            <div className="flex items-center justify-center h-14 border-b">
                                <div>Awesome data mining</div>
                            </div>

                            <div className="overflow-y-auto overflow-x-hidden flex-grow">
                                <ul className="flex flex-col py-4 space-y-1">
                                    {Object.keys(menuData).map(menu =>
                                        <React.Fragment key={menu}>
                                            <li className="px-5">
                                                <div className="flex flex-row items-center h-8">
                                                    <div className="text-sm font-light tracking-wide text-gray-500">{menu}</div>
                                                </div>
                                            </li>

                                            {Menu[menu].map(item =>
                                                <li key={item.text}>
                                                    <Link to={item.to} className="relative flex flex-row items-center h-11 focus:outline-none hover:bg-gray-50 text-gray-600 hover:text-gray-800 border-l-4 border-transparent hover:border-indigo-500 pr-6">
                                                        <span className="inline-flex justify-center items-center ml-4">
                                                            <FontAwesomeIcon icon={item.icon} />
                                                        </span>
                                                        <span className="ml-2 text-sm tracking-wide truncate">{item.text}</span>
                                                        <span style={{
                                                            textOverflow: `ellipsis`,
                                                            overflow: `hidden`,
                                                            whiteSpace: `nowrap`
                                                        }} className={`${item.extraText?'':'hidden'} px-2 py-0.5 ml-auto text-xs font-medium tracking-wide text-indigo-500 bg-indigo-50 rounded-full`}>{item.extraText}</span>
                                                    </Link>
                                                </li>
                                            )}
                                        </React.Fragment>
                                    )}

                                </ul>
                            </div>
                        </div>
                    )
                }

                    <div    
                    className={currentUser? 'w-10/12 absolute right-0 h-screen': "flex h-screen flex-col justify-center" }
                    >
                        <div className='block w-full h-16'>&nbsp;</div>
                        <Switch>
                            <Route path="/login" component={Login}/>
                            <Route path="/register" component={Register}/>
                            <Route path="/profile" component={Profile}/>
                            <Route exact path={['/home', '/']} component={Home} />
                            <Route path='/summary' component={Summary} />
                            <Route path='/visualization' component={Visualization} />
                            <Route path='/sandbox' component={Sandbox} />
                            <Route path='/query' component={Query} />
                            <Route path='/clean' component={Cleaning} />
                            <Route path='/featureEngineering' component={FeatureEngineering} />
                            <Route path='/preprocessing' component={Preprocessing} />
                            <Route path='/featureSelection' component={FeatureSelection} />
                            <Route path='/analysis' component={Analysis} />
                            <Route exact path='/forgot' component={ForgotPassword} />
                            <Route exact path='/reset/:token' component={ResetPasswordConfirm} />
                            
                        </Switch>
                    </div>
                </div>
            </div>
            

        </div>
    </Router>
    )
}

export default Routes;
