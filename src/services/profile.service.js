
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

  export default {
    change_profile_pic
  };