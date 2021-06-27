import React, { useMemo, useRef, useEffect, useCallback, useState } from 'react';
import { Redirect } from 'react-router-dom';
import { useDispatch, useSelector } from "react-redux";
import { elementIsVisibleInViewport } from '../../util/util';
import './profile.css'
import Form from "react-validation/build/form";
import { Button, DropDown } from '../../util/ui'
import CheckButton from "react-validation/build/button";
import Input from "react-validation/build/input";
import { reset_password_confirm } from '../../actions/auth';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {change_profile_pic, change_instructor} from '../../actions/profile';
import { LineChart, PieChart, AreaChart } from 'react-chartkick'
import 'chartkick/chart.js'
import authHeader from '../../services/auth-header';
import {  useJsonToCsv } from 'react-json-csv';
import axios from "axios";
import {config} from '../../config/client'

const ProfileSection = ({currentUser}) => {
    const { avatar } = currentUser;
    const { user_bio } = currentUser;
    const {report_to} = currentUser;
    const {role} = currentUser;
    const [profileImg, setProfileImg] = useState(avatar)
    const [bio, setBio] = useState(user_bio);
    const [editBio, setEditBio] = useState(false)
    const dispatch = useDispatch();
  
  const [instructors_list, setInstructorsList] = useState([])
  let [selectInstructor, setInstructor] = useState('Select your instructor')
    useEffect(() => {
      fetchInstructor();
      if(report_to !==''){
        setInstructor(report_to);
      }
    }, []);

    useEffect(async () => {
      
      setProfileImg('data:image/png;base64,' + avatar)
    }, [avatar]);
    const fetchInstructor = async () => {
      const response = await fetch(config.endpoint+"/instructors", {
        method: 'GET',
      headers: authHeader()
      });
      let json = await response.json();
      if (json.instructor_list) {
        setInstructorsList([...json.instructor_list])
      }
      // setJsonData(json);
      // console.log(json);
    };
    const handleChange = event => {
      const {name, value} = event.target;
      setBio(value)
    };

    const handleImageUpload = async e => {
      const form = document.forms.namedItem("uploadFileForm");
      const data = new FormData(form)
      
      const filename = document.querySelector('#file').files.item(0).name
      data.append('filename', filename);
      dispatch(change_profile_pic(data));
    };
    return (
      <div className="row mt-5 align-items-top">
          <div className="col-md-2 mt-16 text-center mb-5">
      
          <div className=" flex justify-center avatar avatar-xl">


            <img src={profileImg} alt="..." className="avatar-img rounded-circle" />
        </div>
        <label className="profile-button w-full p-1 mt-4 flex flex-col items-center rounded-sm shadow-md tracking-wide uppercase border  cursor-pointer">
          <span className="text-base leading-normal">Change profile photo</span>
          <input className="hidden" id="file" onChange={handleImageUpload} type="file" name="file" />
        </label>
            
          </div>
          <div className="col-md-5 p-8 mt-16">
              <div className="row align-items-center">
                  <div className="col-md-7">
                      <h4 className="mb-1 text-gray-900 text-4xl">{currentUser.name}</h4>
                  </div>
              </div>
              <div className="row mb-4">
                  <div className="col-md-7">
                    {
                      editBio?
                        <textarea name="bio" value={bio} onChange={handleChange} maxLength="200">
                          
                        </textarea>
                        :
                        <p>
                        {bio===""?"About yourself...":bio}
                        </p>
                    }
                        {/* <Input type="text" className={editBio? "":"text-muted"}
                                name="bio"
                                value={bio}
                                onChange={handleChange} /> */}
                         <div>
                        <label htmlFor="biography">Edit bio</label>
                        <FontAwesomeIcon icon="edit" onClick={()=>setEditBio(!editBio)}
                        />
                        </div>
                        
                  </div>
              </div>
          </div>
          {role === 'Student' && <div className="col md-3 p-8 mt-16">
                  <label> Your Instructor </label>
                  <DropDown className="fileSelect" disabled={!!instructors_list.length} customStyle='w-72' height='h-10' text={selectInstructor} items={instructors_list.map(name => ({
                    name,
                    onClick(e) {
                      // e.preventDefault();
                      setInstructor(name);
                      dispatch(change_instructor(name));
                    }
                  }))} />
          
              </div>}
      </div>
    )
}

const About = ({ tabpanelIndex, tabpanel, currentUser }) => {
  const { message } = useSelector(state => state.message);
  const parentRef = useRef();
  useEffect(() => {
    if (!elementIsVisibleInViewport(parentRef.current)) return
  }, [tabpanel]);

            return <div className={`container mx-auto pl-10 ${tabpanelIndex === tabpanel ? '' : 'hidden'}`} ref={parentRef}>
                <Form name="uploadFileForm" method="POST">
                      <ProfileSection currentUser={currentUser}/>

                      <hr className="my-16" />
                      <div className="form-row">
                          <div className="form-group my-2">
                              <label>Full name</label>
                              <input type="text" id="fullname" className="form-control-profile" placeholder={currentUser.name} disabled/>
                          </div>
                      </div>
                      <div className="form-group my-2">
                          <label >Email</label>
                          <input type="email" className="form-control-profile" id="inputEmail4" placeholder={currentUser.email} disabled/>
                      </div>
                      <hr className="my-16" /> 

                      <hr className="my-16" /> 

                      <Button text='Save Changes' customStyle='h-10 my-4 w-64 profile-button' hasPadding={false}/>
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

const csvFormatDataArr = (data) => {
  console.log('csv',data);
  let dataArr = []
  for(let key in data){
    dataArr.push({"days":key, "hours":data[key]})
  }

return dataArr;
};
const exportToCsv = (data) => {
  console.log('inside export');
  console.log('exp',data)
  const fields = {
    "days": "Days",
    "hours": "Hours"
  };

  let resultData = [];
  const style = { padding: "5px"};
  // useEffect(  () => {
  //   let dataArr = []
  //   for(let key in data){
  //     dataArr.push({"days":key, "hours":data[key]})
  //   }
  //   setResultData([...dataArr]);
  // }, [resultData])
  // const { saveAsCsv } = useJsonToCsv();
  

  let today = new Date();
  let date = today.getFullYear() + '_' + (today.getMonth() + 1) + '_' + today.getDate();
  const filename = 'activity_'+date;
  
  resultData = csvFormatDataArr(data)

  console.log('arr',resultData);
  return resultData
    // <JsonToCsv
    //   data={csvFormatDataArr(data)}
    //   filename={filename}
    //   fields={fields}
    //   style={style}
    //   // text={text}
    // />
    
    // <CsvDownload data={{"data":resultData}} />
  
}

const Activity = ({ tabpanelIndex, tabpanel, currentUser }) => {
  const { saveAsCsv } = useJsonToCsv();
  const { message } = useSelector(state => state.message);
  const { progress, last_logged } = currentUser;
  const {role} = currentUser;
  const [progressData, setProgressData] = useState(progress)
  const parentRef = useRef();
  const [option, setOption] = useState('days');
  const [studCount, setStudCount] = useState(0);
  const [instCount, setInstCount] = useState(0);
  const [studentDetails, setStudentDetails] = useState([]);
  const [instructorDetails, setInstructorDetails] = useState([]);
  const [dates, setDates] = useState({})
  const [allDates, setAllDates] = useState({})
  let [selectInstructor, setInstructor] = useState('See Instructor activity')
  let [selectStudent, setStudent] = useState('See Student activity')
  const [exportData, setExportData] = useState([])
  const [exportPersonalData, setExportPersonalData] = useState([])
   
  const fields = {
    "days": "Days",
    "hours": "Hours"
  };
  let today = new Date();
  let date = today.getFullYear() + '_' + (today.getMonth() + 1) + '_' + today.getDate();
  const filename = 'activity_'+date;
  
  useEffect(() => {
    if (!elementIsVisibleInViewport(parentRef.current)) return
  }, [tabpanel, exportData])
  useEffect(() => {
    console.log('fetching details');
    fetchDetails();
    setExportPersonalData([...exportToCsv(progress["days"])])
  }, []);
  const fetchDetails = async () => {
    const response = await fetch(config.endpoint+"/graph_details", {
      method: 'POST',
      body:JSON.stringify({'role':role}),
      headers: authHeader()
    });
    let json = await response.json();
    if (json.students) {
      setStudCount(json.students)
    }
    if (json.instructors) {
      setInstCount(json.instructors)
    }
    if(json.dates){
      setAllDates(json.dates);
      setDates(json.dates);
      setExportData([...exportToCsv(json.dates["days"])])
    }
    if(json.student_details){
      setStudentDetails([...json.student_details, "All"]);

      console.log(json.student_details);
    }
    if(json.instructor_details){
      setInstructorDetails([...json.instructor_details, "All"]);
      console.log(json.instructor_details);
    }
  };

  const fetchUserActivity = async (email) => {
    const response = await fetch(config.endpoint+"/get_user_activity", {
      method: 'POST',
      body:JSON.stringify({'email':email}),
      headers: authHeader()
    });
    let json = await response.json();
    if(json.progress){
      setDates(json.progress);
      setExportData([...exportToCsv(json.progress["days"])])
    }
  }

            return <div className={`container mx-auto pl-10 ${tabpanelIndex === tabpanel ? '' : 'hidden'}`} ref={parentRef}>
                <Form name="uploadFileForm" method="POST">
                      <ProfileSection currentUser={currentUser}/>
                      <hr className="my-4" />
                      <div className='w-full my-4'>
                      <div className="flex flex-row justify-start items-center">   
                        <h2 className="graph-heading p-5"> 
                          Last Logged In : {last_logged}
                        </h2>
                      </div>
                      </div>
                      <div className="flex flex-row justify-around  h-64 p-4 m-16">
                        {(role==='admin' || role==='Instructor') && <div className="count-box w-64 h-full">
                          <div className="top-box h-16">
                            <h1>Students</h1>
                          </div>
                          <div className="bottom-box h-48">
                          <h1>{studCount}</h1>
                          </div>
                        </div>}
                        {(role==='admin') && <div className="count-box w-64 h-full">
                          <div className="top-box h-16">
                          <h1>Instructors</h1>
                          </div>
                          <div className="bottom-box h-48">
                              <h1>{instCount}</h1>
                          </div>
                        </div>}
                      </div>
                      <div className="p-4 mr-16">
                        <div className="flex justify-end my-4">
                          <Button text='days' customStyle={` ${option==='days'? 'button-active':''} h-10 my-4 w-16 rounded-l`} hasPadding={false} isRounded={false} onClick={(e) => 
                          {e.preventDefault()
                          setOption(e.target.innerText)}}/>
                          <Button text='weeks' customStyle={` ${option==='weeks'? 'button-active':''} h-10 my-4 w-16`} hasPadding={false} isRounded={false} onClick={(e) => 
                          {e.preventDefault()
                          setOption(e.target.innerText)}}/>
                          <Button text='months' customStyle={` ${option==='months'? 'button-active':''} h-10 my-4 w-16 rounded-r`} hasPadding={false} isRounded={false} onClick={(e) => 
                          {e.preventDefault()
                          setOption(e.target.innerText)}}/>
                        </div>
                        <div className="flex flex-row justify-around">
                            <div>
                            {role==='admin' && 
                            <div className='flex flex-row items-center' >
                              <DropDown className="fileSelect" disabled={!!instructorDetails.length} customStyle='w-72' height='h-10' text={selectInstructor} items={instructorDetails.map((name) => ({
                                name,
                                onClick(e) {
                                  // e.preventDefault();
                                  setInstructor(name);
                                  
                                  setStudent('See Student activity')
                                  if(name==="All"){
                                    setDates(allDates);
                                  }else{
                                    fetchUserActivity(name)
                                  }
                                  
                                }
                              }))} />
                                
                            </div>
                            
                            }
                            </div>
                          <div>
                            {(role==='Instructor' || role ==='admin' )&& 
                            <div className='flex flex-row items-center'>

                                <DropDown className="fileSelect" disabled={!!studentDetails.length} customStyle='w-72' height='h-10' text={selectStudent} items={studentDetails.map((name) => ({
                                  name,
                                  onClick(e) {
                                    setStudent(name);
                                    if(role==='admin'){
                                      setInstructor('See Instructor activity')
                                    }
                                    if(name==="All"){
                                      setDates(allDates);
                                    }else{
                                      fetchUserActivity(name)
                                    }
                                    
                                  }
                                }))} />
                                
                            </div>}
                            
                            </div>
                            {exportData.length > 0?
                                <FontAwesomeIcon icon='download' className='p-3 profile-button' onClick={(e) => {
                                e.preventDefault();
                                saveAsCsv({ data:exportData, fields, filename })}} />
                              :''}
                        </div>
                        
                      </div>
                      <div className="w-4/5 flex align-center flex-col px-20">
                        {role==='admin' &&
                        <div className="flex flex-row justify-start items-center">   
                           <h2 className="graph-heading my-5">Total hours for {
                          (selectInstructor === "All")? 'all users':
                              selectInstructor !== 'See Instructor activity'?
                                  `${selectInstructor}` : 
                                      (selectStudent === "All")? 'all users': selectStudent !== 'See Student activity'?`${selectStudent}`:'all users'}
                        </h2> 
                        </div>}
                        {role==='Instructor' && 
                        <div className="flex flex-row justify-start items-center">                        
                          <h2 className="graph-heading my-5">Total hours for {selectStudent === "All"?'all students':`${selectStudent}`}</h2>
                        </div>}
                        <AreaChart xtitle={option} ytitle="Hours" data={dates[option]} />
                        <div className="flex flex-row justify-between items-center">
                        <h2 className="graph-heading my-5">Your activity</h2>
                        {exportPersonalData.length > 0?
                                <FontAwesomeIcon icon='download' className='p-3 profile-button' onClick={(e) => {
                                e.preventDefault();
                                saveAsCsv({ data:exportPersonalData, fields, filename })}} />
                              :''}
                        </div>
                        
                        
                        <div>
                          <LineChart xtitle={option} ytitle="Hours" data={progressData[option]} />
                        </div>
                        
                      </div>
                      

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
                      <Button text='Save Changes' customStyle='h-10 my-4 w-64 profile-button' hasPadding={false}/>

                      <CheckButton style={{ display: "none" }} ref={checkBtn} />
                  </Form>
  </div>
}



const Profile = () => {
  const { user: currentUser } = useSelector((state) => state.auth);
  const TabPanels = [
    { name: 'Edit Profile' },
    { name: 'Change password' },
    { name: 'Dashboard' }
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
            <button key={panel.name} onClick={() => setTabpanel(i)} className={`panel py-4 px-6 block focus:outline-none ${i === tabpanel ? 'panel-border' : 'text-gray-600'} font-medium`}>
              {panel.name}
            </button>
          )}
        </nav>
      </div>
        <>
          <About tabpanelIndex={0} tabpanel={tabpanel} currentUser={currentUser}/>
          <ChangePassword tabpanelIndex={1} tabpanel={tabpanel} currentUser={currentUser}/>
          <Activity tabpanelIndex={2} tabpanel={tabpanel} currentUser={currentUser}/>
        </>
    </div>)
 
};

export default Profile;