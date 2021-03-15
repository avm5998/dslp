
import {
  REGISTER_SUCCESS,
  REGISTER_FAIL,
  LOGIN_SUCCESS,
  LOGIN_FAIL,
  LOGOUT,
  SET_MESSAGE,
  PASSWORD_RESET_SUCCESS,
  PASSWORD_RESET_FAIL,
  PASSWORD_RESET_CONFIRM_SUCCESS,
  PASSWORD_RESET_CONFIRM_FAIL,
} from "./types";

import axios from "axios";

const API_URL = "http://localhost:9000/api/auth/";
import AuthService from "../services/auth.service";
export const register = (username, email, password) => (dispatch) => {
  return AuthService.register(username, email, password).then(
    (response) => {
      dispatch({
        type: REGISTER_SUCCESS,
      });

      dispatch({
        type: SET_MESSAGE,
        payload: response.data.message,
      });

      return Promise.resolve();
    },
    (error) => {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();

      dispatch({
        type: REGISTER_FAIL,
      });

      dispatch({
        type: SET_MESSAGE,
        payload: message,
      });

      return Promise.reject();
    }
  );
};

export const login = (username, password) => (dispatch) => {
  return AuthService.login(username, password).then(
    (data) => {
      dispatch({
        type: LOGIN_SUCCESS,
        payload: { user: data },
      });

      return Promise.resolve();
    },
    (error) => {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();

      dispatch({
        type: LOGIN_FAIL,
      });

      dispatch({
        type: SET_MESSAGE,
        payload: message,
      });

      return Promise.reject();
    }
  );
};

export const logout = () => (dispatch) => {
  AuthService.logout();

  dispatch({
    type: LOGOUT,
  });
};

// export const reset_password = (email) => async dispatch => {
//   // const config = {
//   //     headers: {
//   //         'Content-Type': 'application/json'
//   //     }
//   // };

  

//   try {
//       await axios.post(API_URL+'forgot', { email });

//       dispatch({
//           type: PASSWORD_RESET_SUCCESS
//       });
//   } catch (err) {
//       dispatch({
//           type: PASSWORD_RESET_FAIL
//       });
//   }
// };

export const reset_password = ( email) =>  dispatch => {
  return AuthService.forgot_password(email).then(
    (response) => {
      dispatch({
        type: PASSWORD_RESET_SUCCESS,
      });

      dispatch({
        type: SET_MESSAGE,
        payload: response.data.message,
      });

      return Promise.resolve();
    },
    (error) => {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();

      dispatch({
        type: PASSWORD_RESET_FAIL,
      });

      dispatch({
        type: SET_MESSAGE,
        payload: message,
      });

      return Promise.reject();
    }
  );
};


export const reset_password_confirm = (  reset_token, new_password) => dispatch => {
  return AuthService.reset_password_confirm(reset_token, new_password).then(
    (response) => {
      dispatch({
        type: PASSWORD_RESET_CONFIRM_SUCCESS,
      });
      dispatch({
        type: SET_MESSAGE,
        payload: response.data.message,
      });
      
      return Promise.resolve();
    },
    (error) => {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();

      dispatch({
        type: PASSWORD_RESET_CONFIRM_FAIL,
      });

      dispatch({
        type: SET_MESSAGE,
        payload: message,
      });

      return Promise.reject();
    }
  );
};
// export const reset_password_confirm = ( reset_token, new_password, re_new_password) => dispatch => {
//   try {
//       const response = await axios.post(API_URL+'reset', { reset_token, new_password });
//       console.log(response);
//       dispatch({
//           type: PASSWORD_RESET_CONFIRM_SUCCESS
//       });
//       dispatch({
//         type: SET_MESSAGE,
//         payload: response.data.message,
//       });
//   } catch (error) {
//     const message =
//             (error.response &&
//               error.response.data &&
//               error.response.data.message) ||
//             error.message ||
//             error.toString();
//       dispatch({
//           type: PASSWORD_RESET_CONFIRM_FAIL
//       });
//       dispatch({
//         type: SET_MESSAGE,
//         payload: message,
//       });
//   }
// };