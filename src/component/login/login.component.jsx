// import 'bootstrap/dist/css/bootstrap.min.css';
import React, { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Redirect } from 'react-router-dom';
import { Link } from 'react-router-dom';
import Form from "react-validation/build/form";
import Input from "react-validation/build/input";
import CheckButton from "react-validation/build/button";

import { login } from "../../actions/auth";

import './login.styles.css'

const required = (value) => {
  if (!value) {
    return (
      <div className="login-alert" role="alert">
        This field is required!
      </div>
    );
  }
};

const Login = (props) => {
  const form = useRef();
  const checkBtn = useRef();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedOption, setSelectedOption] = useState('Student');
  const { isLoggedIn } = useSelector(state => state.auth);
  const { message } = useSelector(state => state.message);
  const [usernameLabelShow, setUsernameLabelShow] = useState(1)
  const [passwordLabelShow, setPasswordLabelShow] = useState(1)

  const dispatch = useDispatch();

  const onChangeUsername = (e) => {
    const username = e.target.value;
    setUsername(username);
  };

  const onChangePassword = (e) => {
    const password = e.target.value;
    setPassword(password);
  };

  const onChangeRole = (e) => {
    const role = e.target.value;
    console.log("role")
    setSelectedOption(role);
  }
  const handleLogin = (e) => {
    e.preventDefault();

    setLoading(true);

    form.current.validateAll();

    if (checkBtn.current.context._errors.length === 0) {
      dispatch(login(username, password, selectedOption))
        .then(() => {
          props.history.push("/home");
          window.location.reload();
        })
        .catch(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  };

  if (isLoggedIn) {
    return <Redirect to="/home" />;
  }

  return (
    <div className="form-signin flex flex-col justify-center">

      <div className="card card-container" id="formParent" tabIndex={0}>
        <img
          src="//ssl.gstatic.com/accounts/ui/avatar_2x.png"
          alt="profile-img"
          className="profile-img-card"
        />

        <h1 className="cursor-default mb-6 text-2xl font-semibold tracking-tighter text-gray-300 sm:text-3xl title-font text-center">
          Sign in with username and password
        </h1>
        <Form onSubmit={handleLogin} ref={form}>
          <div className="grid grid-cols-2" >
            <div className="form-label-group col-span-2">
              <label style={{ position: 'absolute', display: usernameLabelShow ? 'inherit' : 'none' }} htmlFor="username" id="userNameLabel">Username</label>
              <Input
                type="text"
                name="username"
                className="form-control"
                value={username}
                id={`userNameInput`}
                onChange={onChangeUsername}
                onInput={e => { if (!e.target.value ^ usernameLabelShow) setUsernameLabelShow(e.target.value ? 0 : 1) }}
                validations={[required]}
              />
            </div>

            <div className="form-label-group col-span-2">
              <label style={{ position: 'absolute', display: passwordLabelShow ? 'inherit' : 'none' }} htmlFor="password" id="userNameLabel">Password</label>
              <Input
                id="passwordInput"
                type="password"
                className="form-control"
                name="password"
                onInput={e => {
                  if (!e.target.value ^ passwordLabelShow) setPasswordLabelShow(e.target.value ? 0 : 1)
                }}
                value={password}
                onChange={onChangePassword}
                validations={[required]}
              />
            </div>

            <div className="flex flex-row justify-center col-span-2  py-4">
              {/* <div>
                <input onChange={onChangeRole} type="radio" name="role" id="Student_radio" checked={selectedOption === "Student"} />
                <label className="login-label" htmlFor="Student_radio">Student</label>
              </div>
              <div>
                <input onChange={onChangeRole} type="radio" name="role" id="Instructor_radio" checked={selectedOption === "Instructor"} />
                <label className="login-label" htmlFor="Instructor_radio">Instructor</label>
              </div> */}
              <Input type="radio" value="Student" name="role" id="Student" onChange={onChangeRole} checked={selectedOption === "Student"} />
              <label htmlFor="Student" className='login-label'>Student</label>

              <Input type="radio" value="Instructor" name="role" id="Instructor" onChange={onChangeRole} checked={selectedOption === "Instructor"} />  
              <label htmlFor="Instructor" className='login-label'>Instructor</label>
            </div>
            <div className="col-span-2 flex justify-center">
              <button className="py-2 px-12 w-auto login-button" disabled={loading}>
                {loading && (
                  <span className="spinner-border spinner-border-sm"></span>
                )}
                <span>Login</span>
              </button>
            </div>



            <div className="form-label-group col-span-2 text-end flex justify-end text-gray-400">
              <Link to="/forgot" className="underline"> forgot password? </Link>
            </div>

            {message && (
              <div className="form-group col-span-2">
                <div className={!isLoggedIn ? "alert alert-danger" : ""} role="alert">
                  {message}
                </div>
              </div>
            )}
            <CheckButton style={{ display: "none" }} ref={checkBtn} />
          </div>
        </Form>

      </div>
    </div>
  );
};

export default Login;

{/* <div className="flex flex-row justify-between col-span-2  py-4">
<Input
type="radio"
value="Student"
name="role"
id="Student"
onChange={onChangeRole}
checked={selectedOption === "Student"}
/>
<label htmlFor="Student">Student</label>

<Input
type="radio"
value="Instructor"
name="role"
id="Instructor"
onChange={onChangeRole}
checked={selectedOption === "Instructor"}
/>
<label htmlFor="Instructor">Instructor</label> */}
