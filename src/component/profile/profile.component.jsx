import React, { useMemo, useRef, useEffect, useCallback, useState } from 'react';
import { Redirect } from 'react-router-dom';
import { useDispatch, useSelector } from "react-redux";
import { elementIsVisibleInViewport } from '../../util/util';
import './profile.css'
import Form from "react-validation/build/form";
import { Button } from '../../util/ui'
import CheckButton from "react-validation/build/button";
import Input from "react-validation/build/input";
import { reset_password_confirm } from '../../actions/auth';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {change_profile_pic} from '../../actions/profile';
    
const ProfileSection = ({currentUser}) => {
    const { avatar } = currentUser;
    const [profileImg, setProfileImg] = useState(avatar)
    const dispatch = useDispatch();

    useEffect(async () => {
      
      setProfileImg('data:image/png;base64,' + avatar)
    }, [avatar]);
  

    const handleImageUpload = async e => {
      const form = document.forms.namedItem("uploadFileForm");
      const data = new FormData(form)
      
      const filename = document.querySelector('#file').files.item(0).name
      data.append('filename', filename);
      dispatch(change_profile_pic(data));
    };
    return (
      <div className="row mt-5 align-items-top">
          <div className="col-md-2 text-center mb-5">
      
          <div className=" flex justify-center avatar avatar-xl">


            <img src={profileImg} alt="..." className="avatar-img rounded-circle" />
        </div>
        <label className="w-full p-1 mt-4 flex flex-col items-center text-blue-500 rounded-sm shadow-md tracking-wide uppercase border border-blue cursor-pointer hover:bg-blue-500 hover:text-white">
          <span className="text-base leading-normal">Change profile photo</span>
          <input className="hidden" id="file" onChange={handleImageUpload} type="file" name="file" />
        </label>
            
          </div>
          <div className="col">
              <div className="row align-items-center">
                  <div className="col-md-7">
                      <h4 className="mb-1 text-gray-900 text-4xl">{currentUser.name}</h4>
                  </div>
              </div>
              <div className="row mb-4">
                  <div className="col-md-7">
                      <p className="text-muted">
                          Student at Rochester Institue of Technology
                      </p>
                  </div>
              </div>
          </div>
      </div>
    )
}

const About = ({ tabpanelIndex, tabpanel, currentUser }) => {
  const { message } = useSelector(state => state.message);
  const parentRef = useRef();
  useEffect(() => {
    if (!elementIsVisibleInViewport(parentRef.current)) return

  }, [tabpanel])
            return <div className={`container mx-auto pl-10 ${tabpanelIndex === tabpanel ? '' : 'hidden'}`} ref={parentRef}>
                <Form name="uploadFileForm" method="POST">
                      <ProfileSection currentUser={currentUser}/>

                      <hr className="my-4" />
                      <div className="form-row">
                          <div className="form-group my-2">
                              <label>Full name</label>
                              <input type="text" id="fullname" className="form-control-profile" placeholder={currentUser.name} disabled/>
                          </div>
                      </div>
                      <div className="form-group my-2">
                          <label >Email</label>
                          <input type="email" className="form-control-profile" id="inputEmail4" placeholder={currentUser.email} />
                      </div>
                      <hr className="my-4" />  
                      <Button text='Save Changes' customStyle='h-10 my-4 w-64' hasPadding={false}/>
                      {message && (
                            <div className="form-group">
                            <div className="alert alert-danger text-center w-1/3" role="alert">
                                {message}
                                <br />
                            </div>
                            </div>
                        )}
                  </Form>
  </div>
}

const vpassword = (value) => {
  if (value.length < 8 || value.length > 40 || !/\d/.test(value) || !/[\s~`!@#$%\^&*+=\-\[\]\\';,/{}|\\":<>\?()\._]/g.test(value)) {
    return (
      <div className="alert alert-danger" role="alert">
        The password must be between 8 and 40 characters and atleast have one digit and special character.
      </div>
    );
  }
};
const passwordCheck = (value, props, components) => {
  console.log("components")
  console.log(components)
  if (value !== components['newPassword'][0].value) { // components['password'][0].value !== components['confirm'][0].value
    // 'confirm' - name of input
    // components['confirm'] - array of same-name components because of checkboxes and radios
    return (<div className="alert alert-danger" role="alert">
    Passwords don't match
  </div>)
  }
};

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

const ChangePassword = ({ tabpanelIndex, tabpanel, currentUser }) => {
  const parentRef = useRef();
  const [userCredentials, setCredentials] = useState({
        oldPassword:'',
        newPassword:'',
        confirmPassword:''
    })
  const {oldPassword, newPassword, confirmPassword} = userCredentials;
  const form = useRef();
  const checkBtn = useRef();
  const [successful, setSuccessful] = useState(false);
  const { message } = useSelector(state => state.message);
  const dispatch = useDispatch();
  const handleChange = event => {
    const {name, value} = event.target;
    setCredentials( {...userCredentials, [name]:value} )
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    setSuccessful(false);

    form.current.validateAll();
    if (checkBtn.current.context._errors.length === 0) {
        console.log(userCredentials);
        let token = currentUser.accessToken;
        token = token.replaceAll("$", ".")
        dispatch(reset_password_confirm(token, newPassword))
        .then(() => {
          setSuccessful(true);
        })
        .catch(() => {
          setSuccessful(false);
        });
    }
    setCredentials({
      oldPassword:'',
      newPassword:'',
      confirmPassword:''
  })
  };

  useEffect(() => {
    if (!elementIsVisibleInViewport(parentRef.current)) return

  }, [tabpanel])
  return <div className={`container mx-auto pl-10 ${tabpanelIndex === tabpanel ? '' : 'hidden'}`} ref={parentRef}>
                <Form ref={form} onSubmit={handleSubmit}>
                      <ProfileSection currentUser={currentUser} />
                      <hr className="my-4" />
                      <div className="row mb-4">
                          <div className="col-md-6">
                              <div className="form-group my-2">
                                  <label htmlFor="inputPassword4">Old Password</label>
                                  <Input type="password" className="form-control-profile" id="inputPassword4" 
                                    name="oldPassword"
                                    value={oldPassword}
                                    onChange={handleChange}
                                    validations={[required]}
                                    />
                              </div>
                              <div className="form-group my-2">
                                  <label htmlFor="inputPassword5">New Password</label>
                                  <Input type="password" className="form-control-profile" id="inputPassword5" 
                                    name="newPassword"
                                    value={newPassword}
                                    onChange={handleChange}
                                    validations={[required, vpassword]}/>
                              </div>
                              <div className="form-group my-2">
                                  <label htmlFor="inputPassword6">Confirm Password</label>
                                  <Input type="password" className="form-control-profile" id="inputPassword6" 
                                    name="confirmPassword"
                                    value={confirmPassword}
                                    onChange={handleChange}
                                    validations={[required, passwordCheck, vpassword]}/>
                              </div>
                          </div>
                          {message && (
                            <div className="form-group">
                            <div className={ successful ? "alert alert-success text-center" : "alert alert-danger text-center" } role="alert">
                                {message}
                                <br />
                            </div>
                            </div>
                        )}
                          <div className="col-md-6">
                              <p className="mb-2">Password requirements</p>
                              <p className="small text-muted mb-2">To create a new password, you have to meet all of the following requirements:</p>
                              <ul className="small text-muted pl-4 mb-0">
                                  <li>Minimum 8 character</li>
                                  <li>At least one special character</li>
                                  <li>At least one number</li>
                                  <li>Can’t be the same as a previous password</li>
                              </ul>
                          </div>
                      </div>
                      <hr className="my-4" />
                      <Button text='Save Changes' customStyle='h-10 my-4 w-64' hasPadding={false}/>

                      <CheckButton style={{ display: "none" }} ref={checkBtn} />
                  </Form>
  </div>
}



const Profile = () => {
  const { user: currentUser } = useSelector((state) => state.auth);
  const TabPanels = [
    { name: 'Edit Profile' },
    { name: 'Change password' },
  ]
  let [tabpanel, setTabpanel] = useState(0)
  if (!currentUser) {
    return <Redirect to="/login" />;
  }
  return (

    <div className="bg-gray-100 h-full">
      <div className="">
        <nav className="flex flex-col w-full sm:flex-row justify-end">
          {TabPanels.map((panel, i) =>
            <button key={panel.name} onClick={() => setTabpanel(i)} className={`py-4 px-6 block hover:text-blue-500 focus:outline-none ${i === tabpanel ? 'border-b-2 text-blue-500' : 'text-gray-600'} font-medium border-blue-500`}>
              {panel.name}
            </button>
          )}
        </nav>
      </div>
        <>
          <About tabpanelIndex={0} tabpanel={tabpanel} currentUser={currentUser}/>
          <ChangePassword tabpanelIndex={1} tabpanel={tabpanel} currentUser={currentUser}/>
        </>
    </div>)
 
};

export default Profile;