
import axios from "axios";
import {config} from '../config/client'
import authHeader from "./auth-header";

const API_URL = config.endpoint + "api/auth/";

const register = (fullname, username, email, password, role) => {
  return axios.post(API_URL + "signup", {
    fullname,
    username,
    email,
    password,
    roles : [role]
  });
};

const login = async (username, password, roles) => {
  const response = await axios
    .post(API_URL + "login", {
      username,
      password,
      roles
    });
  if (response.data.accessToken && response.data.refreshToken) {
    localStorage.setItem("user", JSON.stringify(response.data));
  }
  return response.data;
};




const logout = async () => {
  // localStorage.removeItem("user");

  // console.log(authHeader());
  const res = await fetch(API_URL + "logout", {method:'DELETE', headers: authHeader()});

  // if (response.msg==="Access token revoked"){
    // localStorage.removeItem("user");
  // }
  // return response
  // const js = await res.json()
  // console.log(res);
  if(res.ok){
    try{
      localStorage.removeItem('user');
      return Promise.resolve(js)
    }catch(err){
      throw err
    } 
  }
  return Promise.reject(js);
};

const forgot_password = (email) => {
  return axios.post(API_URL+'forgot', { email });
};

const reset_password_confirm = (reset_token, new_password) => {
  return axios.post(API_URL+'reset', { reset_token, new_password });
};


export default {
  register,
  login,
  logout,
  forgot_password,
  reset_password_confirm
};