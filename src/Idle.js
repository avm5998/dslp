import React, { useState, useEffect, useRef } from "react";
import { Switch, Route } from 'react-router-dom'
import { useDispatch, useSelector } from "react-redux";
import { createBrowserHistory } from "history";
import IdleTimer from 'react-idle-timer';
import { useIdleTimer } from 'react-idle-timer'
// import Home from "./component/home";
import { IdleTimeOutModal } from './component/TimeoutModal/timeout_modal'
import PropTypes from 'prop-types';
import 'bootstrap/dist/css/bootstrap.min.css';
import { logout } from "./actions/auth";
// import { logout } from "./actions/auth";
// import './App.css'

const Idle = (props) => {  
      const idleTimerRef = useRef(null);
      const dispatch = useDispatch();
      const [timeout, setTimeout] = useState(1000 * 60 * 30)
      const [showModal, setShowModal] = useState(false)
      const [isTimedOut, setIsTimedOut] = useState(false)
      const { reset, getRemainingTime, getLastActiveTime, getElapsedTime } = useIdleTimer({
        timeout: timeout,
        onIdle: handleOnIdle,
        onActive: handleOnActive,
        onAction: handleOnAction,
        debounce: 250
      });

      const handleReset = () => { 
        idleTimerRef.current.reset(); 
      }
      const handleOnIdle = event => {     
        if (isTimedOut) {
          handleLogout();
        } else {
          setShowModal(true);   
          handleReset();
          setIsTimedOut(true);       
        }
      }
    
      const handleOnActive = event => {
        setIsTimedOut(false);
      }
    
      const handleOnAction = event => {
        setIsTimedOut(false);
      }
      const handleClose = (e) => {
        setShowModal(false);
      }
  
      const handleLogout = () => {
        setShowModal(false);
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
      }

      return(
        <>
          <IdleTimer
            ref={idleTimerRef}
            element={document}
            onActive={handleOnActive}
            onIdle={handleOnIdle}
            onAction={handleOnAction}
            debounce={250}
            timeout={timeout} />

            <div className="">
                <IdleTimeOutModal 
                    showModal={showModal} 
                    handleClose={handleClose}
                    handleLogout={handleLogout}
                />
            </div>
        </>
      )
}

export default Idle