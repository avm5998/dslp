import cn from "classnames";

import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { connect } from "react-redux";

import { Route, Router, Switch, Link, Redirect } from "react-router-dom";
import { createBrowserHistory } from "history";
import Home from "./component/home";
import Summary from "./component/summary";
import Visualization from "./component/visualization_new";
import Query from "./component/query";
import Header from "./component/header/header.component";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { library } from "@fortawesome/fontawesome-svg-core";
import { fas } from "@fortawesome/free-solid-svg-icons";
import { far } from "@fortawesome/free-regular-svg-icons";
import Cleaning from "./component/cleaning";
import Sandbox from "./component/sandbox";
import FeatureEngineering from "./component/featureEngineering";
import Preprocessing from "./component/preprocessing";
import FeatureSelection from "./component/featureSelection";
import Analysis from "./component/analysis";
import Guide from "./component/guide";
// testing dummy
import { login } from "./actions/auth";

//Login imports
import Login from "./component/login/login.component";
import Register from "./component/register/register.component";
import Profile from "./component/profile/profile.component";
import ForgotPassword from "./component/forgot_password/forgot_password.component";
import ResetPasswordConfirm from "./component/reset_password/reset_password.component";
import PendingRequests from "./component/pending-requests/pending-requests.component";

import { logout } from "./actions/auth";
import { clearMessage } from "./actions/message";

import vivek_profile from "./assets/images/vivek_profile.jpg";
import avatar from "./assets/images/avatar.png";
import arrow from "./assets/images/arrow.svg";

import { history } from "./store";
import "./route.css";
import logo from './assets/images/logo.png'

//add all solid icon-fonts
library.add(fas);
library.add(far);

const Menu = {
  User: [{ text: "Profile", icon: "home", to: "/profile" }],
  Main: [
    { text: "Data", icon: "home", to: "/" },
    { text: "Guide", icon: "book-reader", to: "/guide" },
    { text: "Summary", icon: "chart-area", to: "/summary" },
    { text: "Visualization", icon: "chart-pie", to: "/visualization" },
    { text: 'Sandbox', icon: 'chart-area', to: '/sandbox' },
    { text: "Query", icon: "search", to: "/query" },
    { text: "Clean", icon: "broom", to: "/clean" },
    { text: "Feature Engineering", icon: "cog", to: "/featureEngineering" },
    { text: "Feature Selection", icon: "list", to: "/featureSelection" },
    { text: "Preprocessing", icon: "filter", to: "/preprocessing" },
    { text: "Analysis", icon: "microscope", to: "/analysis" },
  ],
};

const DATA_MINING_SVG = () => (
  <>
  {/* <img src={logo}/> */}
  </>
  // <svg
  //   fill="#ffffff"
  //   xmlns="http://www.w3.org/2000/svg"
  //   viewBox="0 0 50 50"
  //   width="25px"
  //   height="25px"
  // >
  //   <path d="M 7 2 C 4.199219 2 2 4.199219 2 7 L 2 34 C 2 36.800781 4.199219 39 7 39 L 34 39 C 36.800781 39 39 36.800781 39 34 L 39 7 C 39 4.199219 36.800781 2 34 2 Z M 7 4 L 34 4 C 35.699219 4 37 5.300781 37 7 L 37 34 C 37 35.699219 35.699219 37 34 37 L 7 37 C 5.300781 37 4 35.699219 4 34 L 4 7 C 4 5.300781 5.300781 4 7 4 Z M 41 11 L 41 13 L 43 13 C 44.699219 13 46 14.300781 46 16 L 46 43 C 46 44.699219 44.699219 46 43 46 L 16 46 C 14.300781 46 13 44.699219 13 43 L 13 41 L 11 41 L 11 43 C 11 45.800781 13.199219 48 16 48 L 43 48 C 45.800781 48 48 45.800781 48 43 L 48 16 C 48 13.199219 45.800781 11 43 11 Z" />
  // </svg>
);

const LogoutSVG = () => (
  <svg
    fill="#ffffff"
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
  >
    <path d="M16 9v-4l8 7-8 7v-4h-8v-6h8zm-16-7v20h14v-2h-12v-16h12v-2h-14z" />
  </svg>
);
const ArrowSVG = ({ directionDown = true }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="100%"
    height="100%"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={cn(
      directionDown ? "down" : "up",
      "cursor-pointer",
      "rounded-full",
      "w-4",
      "h-4",
      "ml-2",
      "m_transition"
    )}
  >
    <polyline points="18 15 12 9 6 15"></polyline>
  </svg>
);

const Routes = (props) => {
  const { userEnv } = process.env;
  const dispatch = useDispatch();
  const { user: currentUser } = useSelector((state) => state.auth);

  let dataset = useSelector((state) => state.dataset);
  let [menuData, setMenuData] = useState(Menu);
  let [toggle, setToggle] = useState(false);

  if (currentUser && currentUser.role === "admin") {
    const found = Menu["Main"].some((el) => el.text === "Requests");
    if (!found) {
      Menu["Main"].push({ text: "Requests", icon: "home", to: "/requests" });
    }
  }
  // if(userEnv === 'default'){
  //     useEffect(() => {
  //         dispatch(login("dummy_user", "dummy@123"))
  //         .then(() => {
  //           props.history.push("/home");
  //           window.location.reload();
  //         })
  //         .catch(() => {
  //           console.log("loginfailed")
  //         });
  //     }, [])
  // }
  const logOut = (e) => {
    e.preventDefault();
    dispatch(logout())
      .then((res) => {
        createBrowserHistory().push("/login");
        window.location.reload();
      })
      .catch((err) => {
        createBrowserHistory().push("/login");
        window.location.reload();
        console.log(err);
      });
  };

  useEffect(() => {
    setMenuData((data) => {
      data.Main[0].extraText = dataset.filename;
      return { ...data };
    });
  }, [dataset.filename]);
  useEffect(() => {
    history.listen((location) => {
      dispatch(clearMessage()); // clear message when changing location
    });
  }, [dispatch]);

  return (
    <Router history={history}>
      <div>
        {!currentUser && (
          <section className="navigation">
            <div className="nav-container">
              <div className="logo">
                <Link to={"/"}>
                  <div className="flex justify-center items-center">
                    <DATA_MINING_SVG />
                    <div className="pl-2">Data Science<br/>Learning Platform</div>
                  </div>
                </Link>
              </div>
              <nav>
                <div className="nav-mobile">
                  <a id="nav-toggle" href="">
                    <span></span>
                  </a>
                </div>

                <ul className="nav-list">
                  <li>
                    <Link to={"/login"}>Login</Link>
                  </li>
                  <li>
                    <Link to={"/register"}>Register</Link>
                  </li>
                </ul>
              </nav>
            </div>
          </section>
        )}
        <div>
          <div className="min-h-screen flex flex-col flex-auto flex-shrink-0 antialiased">
            {/* {     !currentUser &&
            <div className="login-page">
                <div className="overlay"></div>
                <div className="login-container">
                    <img className="login-img" src="src\assets\images\image4.jpg" alt="image1" />
                </div>

            </div>
            
            } */}
            {currentUser && (
              <div className="fixed flex flex-col left-0 w-2/12 h-full border-r">
                <div className="flex items-center justify-center h-20 heading">
                <DATA_MINING_SVG/>
                  <div className="ml-2">Data Science Learning Platform</div>
                </div>

                <div className="overflow-y-auto overflow-x-hidden flex-grow sidebar">
                  <div className="user flex">
                    <div className="user-details w-full">
                      <div className="profilepic" size="40">
                        <img
                          className="img"
                          src={"data:image/png;base64," + currentUser.avatar}
                        />
                      </div>
                      <div className="Id flex items-center justify-between flex-row w-full">
                        <div
                          onClick={() => setToggle(!toggle)}
                          className="flex justify-center items-center flex-row"
                        >
                          <div className="userId">{currentUser.username}</div>
                          <div
                            className="flex items-center"
                            style={{ marginTop: "5px", height: "28px" }}
                          >
                            <ArrowSVG directionDown={!toggle} />
                          </div>
                        </div>
                        <div
                          onClick={(e) => {
                            logOut(e);
                          }}
                        >
                          <LogoutSVG />
                        </div>
                      </div>
                      {/* <div className="arrow-span flex items-center pl-16">
                                            <div className="arrow-div">
                                                <img src={arrow} />
                                            </div>
                                        </div> */}
                    </div>
                    <div
                      className={
                        false ? "profile-dropdown" : "hidden invisible"
                      }
                    >
                      <ul className="dropdown-items">
                        <li>
                          <a href="" className="w-full">
                            Signed in as {currentUser.username}
                          </a>
                          {/* <div className=''></div> */}
                        </li>
                        <hr className="hor-row" />
                        <li>
                          <a href="/profile" className="w-full">
                            Your Profile
                          </a>
                        </li>
                        <li>
                          <a href="" className="w-full">
                            Settings
                          </a>
                        </li>
                        <hr className="hor-row" />
                        <li>
                          <a href="/login" className="w-full" onClick={logOut}>
                            Sign out
                          </a>
                        </li>
                      </ul>
                    </div>
                  </div>

                  <hr className="hor-row" />
                  <ul className="flex flex-col py-4 space-y-1 sidebar-hover">
                    {Object.keys(menuData).map((menu) => (
                      <React.Fragment key={menu}>
                        {menu != "User" && toggle ? (
                          <div
                            className="bg-gray-100 ml-3"
                            style={{ height: "1px", width: "80%" }}
                          ></div>
                        ) : null}
                        {/* <li className="px-5">
                                                <div className="flex flex-row items-center h-8">
                                                    <div className="text-sm font-light tracking-wide text-gray-500">{menu}</div>
                                                </div>
                                            </li> */}

                        {Menu[menu].map((item) => (
                          <div
                            className={`${
                              menu == "Main" || toggle
                                ? "menu-list-user-show"
                                : "menu-list-user-hidden"
                            } menu-list menu-list-transition`}
                            key={item.text}
                          >
                            <Link
                              to={item.to}
                              className="relative flex flex-row items-center h-11 focus:outline-none border-l-4 border-transparent hover-border pr-6"
                            >
                              <span className="inline-flex justify-center items-center ml-4">
                                <FontAwesomeIcon icon={item.icon} />
                              </span>
                              <span className="ml-2 text-sm tracking-wide truncate">
                                {item.text}
                              </span>
                              <span
                                style={{
                                  textOverflow: `ellipsis`,
                                  overflow: `hidden`,
                                  whiteSpace: `nowrap`,
                                }}
                                className={`${
                                  item.extraText ? "" : "hidden"
                                } px-2 py-0.5 ml-auto text-xs font-medium tracking-wide text-indigo-500 bg-indigo-50 rounded-full`}
                              >
                                {item.extraText}
                              </span>
                            </Link>
                          </div>
                        ))}
                      </React.Fragment>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            <div
              className={
                currentUser
                  ? "w-10/12 absolute right-0 h-screen content overflow-auto bg-gray-100"
                  : "flex h-screen flex-col justify-center"
              }
            >
              {/* <div className='block w-full h-16'>&nbsp;</div> */}
              <Switch>
                <Route path="/login" component={Login} />
                <Route path="/guide" component={Guide} />
                <Route path="/register" component={Register} />
                <Route path="/profile" component={Profile} />
                <Route exact path={["/home", "/"]} component={Home} />
                <Route path="/summary" component={Summary} />
                <Route path="/visualization" component={Visualization} />
                <Route path='/sandbox' component={Sandbox} />
                <Route path="/query" component={Query} />
                <Route path="/clean" component={Cleaning} />
                <Route
                  path="/featureEngineering"
                  component={FeatureEngineering}
                />
                <Route path="/preprocessing" component={Preprocessing} />
                <Route path="/featureSelection" component={FeatureSelection} />
                <Route path="/analysis" component={Analysis} />
                <Route exact path="/forgot" component={ForgotPassword} />
                <Route
                  exact
                  path="/reset/:token"
                  component={ResetPasswordConfirm}
                />
                <Route path="/requests" component={PendingRequests} />
              </Switch>
            </div>
          </div>
        </div>
      </div>
    </Router>
  );
};

export default Routes;
