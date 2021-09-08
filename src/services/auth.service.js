
import axios from "axios";
import {config} from '../config/client'
import authHeader from "./auth-header";
import {fetchWithRefresh} from '../util/util'

const API_URL = config.endpoint + "api/auth/";

const register = (fullname, username, email, password, role) => {
  localStorage.setItem("emailToBeRegistered", JSON.stringify(email));
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
  const res = await fetchWithRefresh(API_URL + "logout", {method:'DELETE', headers: authHeader()});

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

const reset_password_confirm = (data) => {
  return axios.post(API_URL+'reset', data);
};


const verify_otp = (otp, email, otp_purpose) => {
  console.log("s e",email)
  return axios.post(API_URL+'verify_otp', { otp, email, otp_purpose });
}

const resend_otp = (email, otp_purpose) => {
  console.log("s e",email)
  return axios.post(API_URL+'resend_otp', { email, otp_purpose });
}

export default {
  register,
  login,
  logout,
  forgot_password,
  reset_password_confirm,
  verify_otp,
  resend_otp
};