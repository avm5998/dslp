
import {
  REGISTER_SUCCESS,
  REGISTER_FAIL,
  LOGIN_SUCCESS,
  LOGIN_FAIL,
  LOGOUT,
  LOGOUT_FAIL,
  SET_MESSAGE,
  PASSWORD_RESET_SUCCESS,
  PASSWORD_RESET_FAIL,
  PASSWORD_RESET_CONFIRM_SUCCESS,
  PASSWORD_RESET_CONFIRM_FAIL,
  VERIFY_OTP_SUCCESS,
  VERIFY_OTP_FAILURE
} from "./types";

import axios from "axios";

const API_URL = "http://localhost:9000/api/auth/";
import AuthService from "../services/auth.service";
import authHeader from "../services/auth-header";
export const register = (fullname, username, email, password, role) => (dispatch) => {
  return AuthService.register(fullname, username, email, password, role).then(
    (response) => {
      console.log("reg em", email);
      dispatch({
        type: REGISTER_SUCCESS,
        payload:{email:email, otp_purpose : "register"}
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
        payload:{email:"", otp_purpose : "register"}
      });

      dispatch({
        type: SET_MESSAGE,
        payload: message,
      });

      return Promise.reject();
    }
  );
};

export const login = (username, password, role) => (dispatch) => {
  return AuthService.login(username, password, role).then(
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
  return AuthService.logout().then(
  (response) => {
    // console.log("receive response");
    // dispatch({
    //   type: LOGOUT,
    // });

    // dispatch({
    //   type: SET_MESSAGE,
    //   payload: response.data.message,
    // });
    // console.log('returning')
    return Promise.resolve(response);
  },
  (error) => {
    // console.log(error)
    // const message =
    //   // (error.response
    //   //   ) ||
    //   // error.message ||
    //   error.toString();

    // dispatch({
    //   type: LOGOUT_FAIL,
    // });

    // dispatch({
    //   type: SET_MESSAGE,
    //   payload: message,
    // });

    return Promise.reject(error);
  }
);
}
export const reset_password = ( email) =>  dispatch => {
  return AuthService.forgot_password(email).then(
    (response) => {
      dispatch({
        type: PASSWORD_RESET_SUCCESS,
        payload:{email:email, otp_purpose: "change_password"}
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
        payload: {otp_purpose:""}
      });

      dispatch({
        type: SET_MESSAGE,
        payload: message,
      });

      return Promise.reject();
    }
  );
};


export const reset_password_confirm = ( data ) => dispatch => {
  return AuthService.reset_password_confirm(data).then(
    (response) => {
      dispatch({
        type: PASSWORD_RESET_CONFIRM_SUCCESS,
        payload : {otp: "", email : "", otp_purpose : ""}
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

export const verify_otp = (  otp, email, otp_purpose) => dispatch => {
  return AuthService.verify_otp(otp, email, otp_purpose).then(
    (response) => {
      if(otp_purpose === 'change_password'){
        dispatch({
          type: VERIFY_OTP_SUCCESS,
          payload: {otp: otp, email : email, otp_purpose : otp_purpose}
        });
      }
      else{
        dispatch({
          type: VERIFY_OTP_SUCCESS,
          payload : {otp: "", email : "", otp_purpose : ""}
        });
      }

      dispatch({
        type: SET_MESSAGE,
        payload: response.data.message,
      });  
      localStorage.setItem("emailToBeRegistered", JSON.stringify(""));  
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
        type: VERIFY_OTP_FAILURE
      });

      dispatch({
        type: SET_MESSAGE,
        payload: message,
      });

      return Promise.reject();
    }
  );
};

export const resend_otp = (email, otp_purpose) => dispatch => {
  console.log("a e",email)
  return AuthService.resend_otp(email, otp_purpose).then(
    (response) => {
      dispatch({
        type: RESEND_OTP_SUCCESS
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
        type: RESEND_OTP_FAILURE
      });

      dispatch({
        type: SET_MESSAGE,
        payload: message,
      });

      return Promise.reject();
    }
  );
};