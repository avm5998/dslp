
import React, { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from 'react-router-dom';
import Form from "react-validation/build/form";
import Input from "react-validation/build/input";
import CheckButton from "react-validation/build/button";
import { isEmail } from "validator";

import { register } from "../../actions/auth";

import './register.styles.css'

const required = (value) => {
  if (!value) {
    return (
      <div className="register-alert" role="alert">
        This field is required!
      </div>
    );
  }
};

const validEmail = (value) => {
  if (!isEmail(value)) {
    return (
      <div className="register-alert" role="alert">
        This is not a valid email.
      </div>
    );
  }
};

const vusername = (value) => {
  if (value.length < 3 || value.length > 20) {
    return (
      <div className="register-alert" role="alert">
        The username must be between 3 and 20 characters.
      </div>
    );
  }
};

const vfullname = (value) => {
  if (value.length < 1 || value.length > 50) {
    return (
      <div className="register-alert" role="alert">
        The name must be between 3 and  50 characters.
      </div>
    );
  }
};

const vpassword = (value) => {
  if (value.length < 6 || value.length > 40) {
    return (
      <div className="register-alert" role="alert">
        The password must be between 6 and 40 characters.
      </div>
    );
  }
};

const Register = (props) => {
  const form = useRef();
  const checkBtn = useRef();

  const [username, setUsername] = useState("");
  const [fullname, setFullname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [successful, setSuccessful] = useState(false);
  const [selectedOption, setSelectedOption] = useState('Student');
  const [fullnameLabelShow, setFullnameLabelShow] = useState(1)
  const [emailLabelShow, setEmailLabelShow] = useState(1)
  const [passwordLabelShow, setPasswordLabelShow] = useState(1)
  const [usernameLabelShow, setUsernameLabelShow] = useState(1)

  let { message } = useSelector(state => state.message);
  const dispatch = useDispatch();

  const onChangeUsername = (e) => {
    const username = e.target.value;
    setUsername(username);
  };
  const onChangeFullname = (e) => {
    const fullname = e.target.value;
    setFullname(fullname);
  };

  const onChangeEmail = (e) => {
    const email = e.target.value;
    setEmail(email);
  };

  const onChangePassword = (e) => {
    const password = e.target.value;
    setPassword(password);
  };

  const onChangeRole = (e) => {
    const role = e.target.value;
    setSelectedOption(role);
  }

  const handleRegister = (e) => {
    e.preventDefault();

    setSuccessful(false);

    form.current.validateAll();

    if (checkBtn.current.context._errors.length === 0) {
      dispatch(register(fullname, username, email, password, selectedOption))
        .then(() => {
          props.history.push("/login");
          setSuccessful(true);
        })
        .catch(() => {
          setSuccessful(false);
        });
    }
  };


  // message = "213";
  // useEffect(()=>{
  //   setTimeout(()=>{ setSuccessful(true)},1000)
  // },[])

  return (
    <div className="form-signin flex flex-col justifyy-center">

      {!successful &&
        <h1 className="cursor-default mb-6 text-2xl font-semibold tracking-tighter text-gray-300 sm:text-3xl title-font text-center">
          Do not have an account?
          <br />Please register
        </h1>}
      <div className="card card-container">
        <img
          src="//ssl.gstatic.com/accounts/ui/avatar_2x.png"
          alt="profile-img"
          className="profile-img-card"
        />

        <Form onSubmit={handleRegister} ref={form}>
          {!successful && (
            <div className="grid grid-cols-2">

              <div className="form-label-group col-span-2">
                <label style={{ position: 'absolute', display: fullnameLabelShow ? 'inherit' : 'none' }} htmlFor="fullname">Full name</label>
                <Input
                  type="text"
                  className="form-control"
                  name="fullname"
                  value={fullname}
                  onChange={onChangeFullname}
                  validations={[required, vfullname]}
                  onInput={e => { if (!e.target.value ^ fullnameLabelShow) setFullnameLabelShow(e.target.value ? 0 : 1) }}
                />
              </div>
              <div className="form-label-group col-span-2">
                <label style={{ position: 'absolute', display: usernameLabelShow ? 'inherit' : 'none' }} htmlFor="username">Username</label>
                <Input
                  type="text"
                  className="form-control"
                  name="username"
                  value={username}
                  onChange={onChangeUsername}
                  validations={[required, vusername]}
                  onInput={e => { if (!e.target.value ^ usernameLabelShow) setUsernameLabelShow(e.target.value ? 0 : 1) }}
                />
              </div>

              <div className="form-label-group col-span-2">
                <label style={{ position: 'absolute', display: emailLabelShow ? 'inherit' : 'none' }} htmlFor="email">Email</label>
                <Input
                  type="text"
                  className="form-control"
                  name="email"
                  value={email}
                  onChange={onChangeEmail}
                  validations={[required, validEmail]}
                  onInput={e => { if (!e.target.value ^ emailLabelShow) setEmailLabelShow(e.target.value ? 0 : 1) }}
                />
              </div>

              <div className="form-label-group col-span-2">
                <label style={{ position: 'absolute', display: passwordLabelShow ? 'inherit' : 'none' }} htmlFor="password">Password</label>
                <Input
                  type="password"
                  className="form-control"
                  name="password"
                  value={password}
                  onChange={onChangePassword}
                  validations={[required, vpassword]}
                  onInput={e => { if (!e.target.value ^ passwordLabelShow) setPasswordLabelShow(e.target.value ? 0 : 1) }}
                />

              </div>
              <div className="flex flex-row justify-center col-span-2  py-4">
                <div>
                  <input onChange={onChangeRole} type="radio" name="role" id="Student_radio" defaultChecked={true} />
                  <label className="login-label" htmlFor="Student_radio">Student</label>
                </div>
                <div>
                  <input onChange={onChangeRole} type="radio" name="role" id="Instructor_radio" defaultChecked={true} />
                  <label className="login-label" htmlFor="Instructor_radio">Instructor</label>
                </div>
              </div>
              <div className="col-span-2 flex justify-center">
                <button className="py-2 px-12 w-auto register-button">
                  <span>Sign up</span>
                </button>
              </div>

              {/* <button className="w-auto register-button col-span-2">Sign Up</button> */}

            </div>
          )}

          {message && (
            <div className="form-group">
              <div className={successful ? "register-info text-center register-tip" : "register-alert text-center register-tip"} role="alert">
                {message}
                <br />

                {/* {successful && <span>Please click
                  <Link to="/login" className="underline"> here </Link> to login
                </span> */}
              </div>
            </div>
          )}
          <CheckButton style={{ display: "none" }} ref={checkBtn} />
        </Form>
      </div>
    </div>
  );
};

export default Register;
