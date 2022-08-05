import React, { useMemo, useRef, useEffect, useCallback, useState } from 'react';
import { Redirect } from 'react-router-dom';
import { useDispatch, useSelector } from "react-redux";
import { elementIsVisibleInViewport } from '../../util/util';
import './profile.css'
import Form from "react-validation/build/form";
import { Button, Checkbox } from '../../util/ui'
import {DropDown} from '../../util/ui_components'
import CheckButton from "react-validation/build/button";
import Input from "react-validation/build/input";
import { reset_password_confirm } from '../../actions/auth';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {change_profile_pic, change_instructor, change_user_fields} from '../../actions/profile';
import { LineChart, PieChart, AreaChart } from 'react-chartkick'
import 'chartkick/chart.js'
import authHeader from '../../services/auth-header';
import {  useJsonToCsv } from 'react-json-csv';
import axios from "axios";
import {config} from '../../config/client'

const ProfileSection = ({currentUser, parentCallback}) => {
    const { avatar } = currentUser;
    const { user_bio } = currentUser;
    const {report_to} = currentUser;
    const {role} = currentUser;
    const [profileImg, setProfileImg] = useState(avatar)
    const [bio, setBio] = useState(user_bio);
    const [editBio, setEditBio] = useState(false)
    const dispatch = useDispatch();
    const [instructors_list, setInstructorsList] = useState([]);
    
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
    const handleSubmit = (e) => {
      e.preventDefault();
      let fields = {};
      if(bio !== user_bio){
        fields['user_bio'] = bio
      }
      dispatch(change_user_fields(fields))
      .then(() => {
        console.log("fields change successful")
      })
      .catch((err) => {
        console.log(err)
      });
      setEditBio(false);
    };

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
      setBio(value);
      parentCallback(value);
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
                      <h4 className="mb-1 text-gray-900 text-4xl">{currentUser.fullname}</h4>
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
                        <FontAwesomeIcon className="cursor-pointer" icon="edit" onClick={()=>setEditBio(!editBio)}
                        />
                        </div>
                        
                  </div>
              </div>
          </div>
          {role === 'Student' && <div className="col md-3 p-8 mt-16">
                  <label> Your Instructor </label>
                  <DropDown className="fileSelect" /*disabled={!!instructors_list.length} customStyle='w-72'*/ height='h-10' text={selectInstructor} items={instructors_list.map(name => ({
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
  const [bio, setBio] = useState(currentUser.user_bio);
  const { message } = useSelector(state => state.message);
  const parentRef = useRef();
  const [isEditName, setIsEditName] = useState(false);
  const [isEditEmail, setIsEditEmail] = useState(false);
  const [fullname, setFullname] = useState(currentUser.fullname)
  const [email, setEmail] = useState(currentUser.email)
  const form = useRef();
  const dispatch = useDispatch();

 const eventhandler = data => {
    setBio(data);
 }

  const handleChange = event => {
    const {name, value} = event.target;
    if(name==='fullname')
      setFullname( value);
    else
      setEmail(value);
  };

  const handleSubmit = (e) => {
        e.preventDefault();
        let fields = {};
        if(fullname !== currentUser.fullname){
          fields['fullname'] = fullname
        }
        if(email !== currentUser.email){
          fields['email'] = email
        }
        if(bio !== currentUser.user_bio){
          fields['user_bio'] = bio
        }
        dispatch(change_user_fields(fields))
        .then(() => {
          console.log("fields change successful")
        })
        .catch((err) => {
          console.log(err)
        });
        setIsEditEmail(false);
        setIsEditName(false);
  };

  useEffect(() => {
    if (!elementIsVisibleInViewport(parentRef.current)) return
  }, [tabpanel]);

            return <div className={`container mx-auto pl-10 ${tabpanelIndex === tabpanel ? '' : 'hidden'}`} ref={parentRef}>
                <Form name="uploadFileForm" method="POST" ref={form} onSubmit={handleSubmit}>
                      <ProfileSection currentUser={currentUser} parentCallback={eventhandler}/>

                      <hr className="my-16" />
                      <div className="form-row">
                          <div className="form-group my-2">
                              <label>Full name</label>
                              <div className="flex flex-row items-center">

                                {isEditName?
                                  <input type="text" name='fullname' id="fullname" className="form-control-profile"  onChange={handleChange} />:
                                  <input type="text" id="fullname" className="form-control-profile" placeholder={fullname} disabled />
                                }
                                
                                <FontAwesomeIcon className="cursor-pointer" icon="edit" onClick={()=>setIsEditName(!isEditName)} />
                              </div>
                          </div>
                      </div>
                      <div className="form-group my-2">
                          <label >Email</label>
                          <div className="flex flex-row items-center">
                            {isEditEmail?
                              <input type="email" name='email' className="form-control-profile" id="inputEmail4" onChange={handleChange}/>:
                              <input type="email" className="form-control-profile" id="inputEmail4" placeholder={email} disabled/>
                                }
                            <FontAwesomeIcon className="cursor-pointer" icon="edit" onClick={()=>setIsEditEmail(!isEditEmail)} />
                          </div>
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
    dataArr.push({"days":key, "total":data[key]})
  }

return dataArr;
};
const exportToCsv = (data, sepProgress) => {
  console.log('inside export');
  console.log('exp',data)

  let resultData = [];
  const style = { padding: "5px"};
  
  // console.log("separation progress:", sepProgress)
  for (let key in data) {
    let entry = {"days":key, "total":data[key]}
    sepProgress.forEach(i=>entry[i['name']] = "days" in i["data"]?
      key in i["data"]["days"]?
        i["data"]["days"][key]:
        0
      : 0)
    resultData.push(entry)
  }

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
  const { email: currentEmail } = useSelector(state => state.auth.user)
  const { progress, last_logged } = currentUser;
  const {role} = currentUser;
  const [progressData, setProgressData] = useState(progress)
  // 12 booleans from Checkbox to track wheather display a separate time series
  const [displayQuery, setDisplayQuery] = useState(false)
  const [displayClean, setDisplayClean] = useState(false)
  const [displayPrepro, setDisplayPrepro] = useState(false)
  const [displayFeaeng, setDisplayFeaeng] = useState(false)
  const [displayFeaslc, setDisplayFeaslc] = useState(false)
  const [displayAnalysis, setDisplayAnalysis] = useState(false)
  const [displayStudentQuery, setDisplayStudentQuery] = useState(false)
  const [displayStudentClean, setDisplayStudentClean] = useState(false)
  const [displayStudentPrepro, setDisplayStudentPrepro] = useState(false)
  const [displayStudentFeaeng, setDisplayStudentFeaeng] = useState(false)
  const [displayStudentFeaslc, setDisplayStudentFeaslc] = useState(false)
  const [displayStudentAnalysis, setDisplayStudentAnalysis] = useState(false)
  // xxxProgress store entire array of activity objects, xxxActivities for chart component
  const [personalProgress, setPersonalProgress] = useState([])
  const [personalActivities, setPersonalActivities] = useState([])
  const [studentProgress, setStudentProgress] = useState([])
  const [studentActivities, setStudentActivities] = useState([])

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
    "total": "Total",
    "query": "Query",
    "cleaning": "Cleaning",
    "preprocessing": "Preprocessing",
    "feature engineering": "Feature Engineering",
    "feature selection": "Feature Selection",
    "analysis": "Analysis"
  };
  let today = new Date();
  let date = today.getFullYear() + '_' + (today.getMonth() + 1) + '_' + today.getDate();
  const filename = 'activity_'+date;
  
  useEffect(() => {
    if (!elementIsVisibleInViewport(parentRef.current)) return
  }, [tabpanel, exportData])
  useEffect(() => {
    fetchDetails();
    fetchPersonalActivities(currentEmail)
  }, []);
  const fetchDetails = async () => {
    const response = await fetch(config.endpoint+"/graph_details", {
      method: 'POST',
      body:JSON.stringify({'role':role}),
      headers: authHeader()
    });
    let json = await response.json();
    // console.log("details:", json)
    if (json.students) {
      setStudCount(json.students)
    }
    if (json.instructors) {
      setInstCount(json.instructors)
    }
    if(json.dates){
      setAllDates(json.dates);
      // setDates(json.dates);
      // setExportData([...exportToCsv(json.dates["days"], studentProgress)])
    }
    if(json.student_details){
      setStudentDetails([...json.student_details, "All"]);

      console.log(json.student_details);
    }
    if(json.instructor_details){
      setInstructorDetails([...json.instructor_details, "All"]);
      console.log(json.instructor_details);
    }

    // const restest = await fetch(config.endpoint+'/get_activities', {method: 'GET', headers: authHeader()});
    // let jsontest = await restest.json();
    // console.log("jsontest", jsontest);
  };

  const fetchPersonalActivities = async (email) => {
    const res = await fetch(config.endpoint+"/get_activities", {
      method: 'POST',
      body: JSON.stringify({'email':email}),
      headers: authHeader()
    })
    let json = await res.json()
    let pro = [
      {
        "name": "query",
        "data": json.query_progress,
        "display": false,
      },
      {
        "name": "cleaning",
        "data": json.clean_progress,
        "display": false,
      },
      {
        "name": "preprocessing",
        "data": json.prepro_progress,
        "display": false,
      },
      {
        "name": "feature engineering",
        "data": json.feaeng_progress,
        "display": false,
      },
      {
        "name": "feature selection",
        "data": json.feaslc_progress,
        "display": false,
      },
      {
        "name": "analysis",
        "data": json.analysis_progress,
        "display": false,
      }
    ]
    setPersonalProgress(pro)
    setExportPersonalData([...exportToCsv(progress["days"], pro)])
  }

  const updatePersonalProgress = (name, modify) => {
    const newProgress = personalProgress.map(item => {
      if (item.name == name) {
        return {...item, display: modify};
      }
      return item
    })
    setPersonalProgress(newProgress)
  }

  useEffect(()=>{
    let newActivities = personalProgress.filter(item=>item.display)
    setPersonalActivities(newActivities)
  }, [displayQuery, displayClean, displayPrepro, displayFeaeng, displayFeaslc, displayAnalysis])

  const updateStudentProgress = (name, modify) => {
    const newProgress = studentProgress.map(item => {
      if (item.name == name) {
        return {...item, display: modify};
      }
      return item
    })
    setStudentProgress(newProgress)
  }

  useEffect(()=>{
    let newActivities = studentProgress.filter(item=>item.display)
    setStudentActivities(newActivities)
  }, [displayStudentQuery, displayStudentClean, displayStudentPrepro, displayStudentFeaeng, displayStudentFeaslc, displayStudentAnalysis])

  const fetchUserActivity = async (email) => {
    const response = await fetch(config.endpoint+"/get_user_activity", {
      method: 'POST',
      body:JSON.stringify({'email':email}),
      headers: authHeader()
    });
    let json = await response.json();
    if(json.progress){
      setDates(json.progress);
    }

    const res2 = await fetch(config.endpoint+"/get_activities", {
      method: 'POST',
      body: JSON.stringify({'email':email}),
      headers: authHeader()
    })
    let json2 = await res2.json()
    let pro = [
      {
        "name": "query",
        "data": json2.query_progress,
        "display": false,
      },
      {
        "name": "cleaning",
        "data": json2.clean_progress,
        "display": false,
      },
      {
        "name": "preprocessing",
        "data": json2.prepro_progress,
        "display": false,
      },
      {
        "name": "feature engineering",
        "data": json2.feaeng_progress,
        "display": false,
      },
      {
        "name": "feature selection",
        "data": json2.feaslc_progress,
        "display": false,
      },
      {
        "name": "analysis",
        "data": json2.analysis_progress,
        "display": false,
      }
    ]
    setStudentProgress(pro)
    setExportData([...exportToCsv(json.progress["days"], pro)])
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
                              <DropDown className="fileSelect" /*disabled={!!instructorDetails.length} customStyle='w-72'*/ height='h-10' text={selectInstructor} items={instructorDetails.map((name) => ({
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

                                <DropDown className="fileSelect" /*disabled={!!studentDetails.length} customStyle='w-72'*/ height='h-10' text={selectStudent} items={studentDetails.map((name) => ({
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
                        <>
                          <div className="flex flex-row justify-between items-center">                        
                            <h2 className="graph-heading my-5">Activity of {selectStudent === "All"?'all students':`${selectStudent}`}</h2>
                            <div title='click icon to download activity as a csv file'>Download Activity
                              {exportData.length > 0?
                                  <FontAwesomeIcon className="cursor-pointer" icon='download' /*className='p-3 profile-button'*/ onClick={(e) => {
                                  e.preventDefault();
                                  saveAsCsv({ data:exportData, fields, filename })}} />
                                :''}</div>
                          </div>

                          <div className='flex flex-row gap-4'>
                            <div className='flex items-center'>
                              <Checkbox defaultChecked={false} onChange={e=>{
                                updateStudentProgress("query", e.target.checked)
                                setDisplayStudentQuery(e.target.checked)
                              }}/>
                              <p>Query</p>
                            </div>
                            <div className='flex items-center'>
                              <Checkbox defaultChecked={false} onChange={e=>{
                                updateStudentProgress("cleaning", e.target.checked)
                                setDisplayStudentClean(e.target.checked)
                              }}/>
                              <p>Cleaning</p>
                            </div>
                            <div className='flex items-center'>
                              <Checkbox defaultChecked={false} onChange={e=>{
                                updateStudentProgress("preprocessing", e.target.checked)
                                setDisplayStudentPrepro(e.target.checked)
                              }}/>
                              <p>Preprocessing</p>
                            </div>
                            <div className='flex items-center'>
                              <Checkbox defaultChecked={false} onChange={e=>{
                                updateStudentProgress("feature engineering", e.target.checked)
                                setDisplayStudentFeaeng(e.target.checked)
                              }}/>
                              <p>Feature Engineering</p>
                            </div>
                            <div className='flex items-center'>
                              <Checkbox defaultChecked={false} onChange={e=>{
                                updateStudentProgress("feature selection", e.target.checked)
                                setDisplayStudentFeaslc(e.target.checked)
                              }}/>
                              <p>Feature Selection</p>
                            </div>
                            <div className='flex items-center'>
                              <Checkbox defaultChecked={false} onChange={e=>{
                                updateStudentProgress("analysis", e.target.checked)
                                setDisplayStudentAnalysis(e.target.checked)
                              }}/>
                              <p>Analysis</p>
                            </div>
                          </div>

                          <AreaChart xtitle={option} ytitle="Hours" /*data={dates[option]}*/ data={[{"name":"total", "data":dates[option]}, ...studentActivities.map(item=>({"name": item.name, "data":item.data[option]}))]} />
                        </>}
                        
                        <div className="flex flex-row justify-between items-center">
                        <h2 className="graph-heading my-5">Your activity</h2>
                        <div title='click icon to download activity as a csv file'>Download Activity
                        {exportPersonalData.length > 0?
                              <button className="cursor-pointer">
                                <FontAwesomeIcon icon='download' /*className='p-3 profile-button'*/ onClick={(e) => {
                                e.preventDefault();
                                saveAsCsv({ data:exportPersonalData, fields, filename })}} />
                              </button>
                              :''}</div>
                        </div>
                        
                        <div className='flex flex-row gap-4'>
                          <div className='flex items-center'>
                            <Checkbox defaultChecked={false} onChange={e=>{
                              updatePersonalProgress("query", e.target.checked)
                              setDisplayQuery(e.target.checked)
                            }}/>
                            <p>Query</p>
                          </div>
                          <div className='flex items-center'>
                            <Checkbox defaultChecked={false} onChange={e=>{
                              updatePersonalProgress("cleaning", e.target.checked)
                              setDisplayClean(e.target.checked)
                            }}/>
                            <p>Cleaning</p>
                          </div>
                          <div className='flex items-center'>
                            <Checkbox defaultChecked={false} onChange={e=>{
                              updatePersonalProgress("preprocessing", e.target.checked)
                              setDisplayPrepro(e.target.checked)
                            }}/>
                            <p>Preprocessing</p>
                          </div>
                          <div className='flex items-center'>
                            <Checkbox defaultChecked={false} onChange={e=>{
                              updatePersonalProgress("feature engineering", e.target.checked)
                              setDisplayFeaeng(e.target.checked)
                            }}/>
                            <p>Feature Engineering</p>
                          </div>
                          <div className='flex items-center'>
                            <Checkbox defaultChecked={false} onChange={e=>{
                              updatePersonalProgress("feature selection", e.target.checked)
                              setDisplayFeaslc(e.target.checked)
                            }}/>
                            <p>Feature Selection</p>
                          </div>
                          <div className='flex items-center'>
                            <Checkbox defaultChecked={false} onChange={e=>{
                              updatePersonalProgress("analysis", e.target.checked)
                              setDisplayAnalysis(e.target.checked)
                            }}/>
                            <p>Analysis</p>
                          </div>
                        </div>
                        
                        <div>
                          <LineChart xtitle={option} ytitle="Hours" /*data={progressData[option]}*/ /*data={[
                            {"name": "total", "data": progressData[option]},
                            {"name": "query", "data": queryProgress[option]},
                          ]}*/ data={[{"name": "total", "data": progressData[option]}, ...personalActivities.map(item=>({"name": item.name, "data":item.data[option]}))]} />
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
        let token = currentUser.accessToken;
        token = token.replaceAll("$", ".")
        dispatch(reset_password_confirm({"reset_token":token, "new_password":newPassword}))
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