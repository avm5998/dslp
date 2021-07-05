
import axios from "axios";
import {config} from '../config/client'

const API_URL = config.endpoint + "change_profile_pic";
import authHeader from './auth-header'

const change_profile_pic = async (data) => {
    let response = await fetch(API_URL, {
        method: 'PATCH',
        body: data,
        headers: authHeader()
      });
    console.log('inside service');
    let json = await response.json()
    if (json.base64) {
        
      
      let user = JSON.parse(localStorage.getItem("user"));
      user.avatar = json.base64;
      // console.log(user.avatar);
      localStorage.setItem("user", JSON.stringify(user));
    }
    return json;
  };

  const change_instructor = async (email)  => {
    let res = await fetch(config.endpoint+'/set_instructor', {
      method: 'PATCH',
      body:JSON.stringify({"email":email}),
      headers: authHeader()
    })
    let json = await res.json()

    if (json.success) {
      // console.log('inside success')
      let user = JSON.parse(localStorage.getItem("user"));
      user.report_to = email;
      // console.log(user.avatar);
      localStorage.setItem("user", JSON.stringify(user));
      return true;
    }
    return false;
  }
  const change_user_fields = async(fields) => {
    let res = await fetch(config.endpoint+'/change_user_fields', {
      method: 'PATCH',
      body:JSON.stringify(fields),
      headers: authHeader()
    })
    let json = await res.json()

    if (json.success) {
      let user = JSON.parse(localStorage.getItem("user"));
      for(let field in fields){
        user[field] = fields[field];
      }
      // user.report_to = email;
      // // console.log(user.avatar);
      localStorage.setItem("user", JSON.stringify(user));
      return true;
    }
    return false;
  }
  // const getInstructorsList = async () => {
  //   return await fetch(config.endpoint + 'instructors')
  //     .then(data => data.json())
  // }
  export default {
    change_profile_pic,
    change_instructor,
    change_user_fields
  };

  