// import axios from "axios";

// const API_URL = "http://localhost:9000/api/auth/";

// class AuthService {
//   async login(email, password) {
//     const response = await axios
//       .post(API_URL + "login", {
//         email,
//         password
//       });
    
//     if (response.data.accessToken) {
//       console.log(response.data.accessToken)
//       localStorage.setItem("user", JSON.stringify(response.data));
//     }
//     return response.data;
//   }

//   logout() {
//     localStorage.removeItem("user");
//   }

//   register(username, email, password) {
//     return axios.post(API_URL + "signup", {
//       username,
//       email,
//       password
//     });
//   }

//   getCurrentUser() {
//     return JSON.parse(localStorage.getItem('user'));;
//   }
// }

// export default new AuthService();

import axios from "axios";

const API_URL = "http://localhost:9000/api/auth/";

const register = (username, email, password) => {
  return axios.post(API_URL + "signup", {
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