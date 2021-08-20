

import React, { useState, useRef } from "react";
import { Redirect, Link, useHistory } from 'react-router-dom';
import { reset_password_confirm } from '../../actions/auth';
import { useDispatch, useSelector } from "react-redux";
import { connect } from 'react-redux';
import Form from "react-validation/build/form";
import Input from "react-validation/build/input";
import CheckButton from "react-validation/build/button";

import './reset_password.styles.css'

const required = (value, props, components) => {
  console.log(components);
    if (!value) {

      return (
        <div className="alert alert-danger" role="alert">
          This field is required!
        </div>
      );
    }
  };
  
  const passwordCheck = (value, props, components) => {
    // NOTE: Tricky place. The 'value' argument is always current component's value.
    // So in case we're 'changing' let's say 'password' component - we'll compare it's value with 'confirm' value.
    // But if we're changing 'confirm' component - the condition will always be true
    // If we need to always compare own values - replace 'value' with components.password[0].value and make some magic with error rendering.
    if (value !== components['password'][0].value) { // components['password'][0].value !== components['confirm'][0].value
      // 'confirm' - name of input
      // components['confirm'] - array of same-name components because of checkboxes and radios
      return (<div className="alert alert-danger" role="alert">
      Passwords don't match
    </div>)
    }
  };

const ResetPasswordConfirm = ({ match, reset_password_confirm }) => {
    const form = useRef();
    const checkBtn = useRef();
  
    const [confirmPassword, setConfirmPassword] = useState("");
    const [password, setPassword] = useState("");
    const [successful, setSuccessful] = useState(false);
    const { message } = useSelector(state => state.message);
    let history = useHistory();
    let emailToBeRegistered = useSelector(state => state.auth.emailToBeRegistered);
    let otp = useSelector(state => state.auth.otp);
  
    const dispatch = useDispatch();

    const onChangePassword = (e) => {
        const password = e.target.value;
        setPassword(password);
      };

      
    const onChangeConfirmPassword = (e) => {
        const confirmPassword = e.target.value;
        setConfirmPassword(confirmPassword);
      };
    
  const handleSubmit = (e) => {
    e.preventDefault();

    setSuccessful(false);

    form.current.validateAll();
    console.log(form.current);
    console.log(checkBtn)
    if (checkBtn.current.context._errors.length === 0) {
      let data = {}
      if(otp == ""){
        let token = match.params.token;
        token = token.replaceAll("$", ".");
        data["token"] = token
      }
      else{
        data["otp"] = otp;
        data["email"] = emailToBeRegistered
      }
      data["new_password"] = password
      reset_password_confirm(data)
      .then(() => {
        setSuccessful(true);
        setConfirmPassword("");
        setPassword("");
        history.push("/login")
      })
      .catch(() => {
        setSuccessful(false);
      });
    }
  };


  return (
    <div className="form-signin flex flex-col justifyy-center">

      <div className="card card-container">

        <h1 className="cursor-default mb-6 text-2xl font-semibold tracking-tighter text-gray-300 sm:text-3xl title-font text-center">
                Reset password
        </h1>
        <Form onSubmit={handleSubmit} ref={form}>
          <div className="grid grid-cols-2">
            <div className="form-label-group col-span-2">
              <label htmlFor="password">Password</label>
              <Input
                type="password"
                className="form-control"
                name="password"
                value={password}
                onChange={onChangePassword}
                required
              />
            </div>
            <div className="form-label-group col-span-2">
              <label htmlFor="password">Re-enter Password</label>
              <Input
                type="password"
                className="form-control"
                name="confirmPassword"
                value={confirmPassword}
                onChange={onChangeConfirmPassword}
                validations={[passwordCheck]}
                required
              />
            </div>
            {/* <button className="btn btn-lg btn-primary btn-block col-span-2" disabled={loading}>
                {loading && (
                  <span className="spinner-border spinner-border-sm"></span>
                )}
                <span>Reset password</span>
            </button> */}
            <button className="w-auto btn btn-lg btn-primary btn-block col-span-2">Reset password</button>
            
            
            </div>
            {message && (
            <div className="form-group">
              <div className={ successful ? "alert alert-success text-center" : "alert alert-danger text-center" } role="alert">
                {message}
                <br />

                { successful && <span>Please
                  <Link to="/login" className="underline">  login  </Link> to continue
                </span>}
              </div>
            </div>
          )}
          <CheckButton style={{ display: "none" }} ref={checkBtn} />
        </Form>
        
      </div>
    </div>
  );
};

export default connect(null, { reset_password_confirm })(ResetPasswordConfirm);
