
import axios from "axios";
import {config} from '../config/client'

const API_URL = config.endpoint + "api/auth/";

const register = (fullname, username, email, password) => {
  return axios.post(API_URL + "signup", {
    fullname,
    username,
    email,
    password,
  });
};

const login = async (username, password) => {
  const response = await axios
    .post(API_URL + "login", {
      username,
      password,
    });
  if (response.data.accessToken) {
    localStorage.setItem("user", JSON.stringify(response.data));
  }
  return response.data;
};




const logout = () => {
  localStorage.removeItem("user");
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