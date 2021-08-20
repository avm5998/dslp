import {
  REGISTER_SUCCESS,
  REGISTER_FAIL,
  LOGIN_SUCCESS,
  LOGIN_FAIL,
  LOGOUT,
  LOGOUT_FAIL,
  PASSWORD_RESET_SUCCESS,
  PASSWORD_RESET_FAIL,
  PASSWORD_RESET_CONFIRM_SUCCESS,
  PASSWORD_RESET_CONFIRM_FAIL,
  CHANGE_PROFILE_PIC_SUCCESS,
  CHANGE_PROFILE_PIC_FAILURE,
  CHANGE_INSTRUCTOR_SUCCESS,
  CHANGE_INSTRUCTOR_FAILURE,
  CHANGE_EMAIL_SUCCESS,
  CHANGE_FULLNAME_SUCCESS,
  CHANGE_EMAIL_FAILURE,
  CHANGE_FULLNAME_FAILURE,
  CHANGE_USER_BIO_SUCCESS,
  CHANGE_USER_BIO_FAILURE,
  VERIFY_OTP_SUCCESS,
  VERIFY_OTP_FAILURE,
  RESEND_OTP_SUCCESS,
  RESEND_OTP_FAILURE
} from "../actions/types";

let user = JSON.parse(localStorage.getItem("user"));
let emailToBeRegistered = localStorage.getItem("emailToBeRegistered");
const initialState = user
  ? { isLoggedIn: true, user, emailToBeRegistered: "", otp:"", otp_purpose:""}
  : { isLoggedIn: false, user: null, emailToBeRegistered:emailToBeRegistered, otp:"", otp_purpose:""};
  

export default function (state = initialState, action) {
  const { type, payload } = action;

  switch (type) {
    case PASSWORD_RESET_SUCCESS:
    case REGISTER_SUCCESS:
      return {
        ...state,
        isLoggedIn: false,
        emailToBeRegistered : payload.email,
        otp_purpose : payload.otp_purpose
      };
    case REGISTER_FAIL:
    case VERIFY_OTP_SUCCESS:
    case PASSWORD_RESET_CONFIRM_SUCCESS:
      return {
        ...state,
        isLoggedIn: false,
        emailToBeRegistered : payload.email,
        otp: payload.otp,
        otp_purpose:payload.otp_purpose
      };
    case LOGIN_SUCCESS:
      return {
        ...state,
        isLoggedIn: true,
        user: payload.user,
        emailToBeRegistered : "",
        otp_purpose : "",
        otp:""
      };
    case LOGIN_FAIL:
      return {
        ...state,
        isLoggedIn: false,
        user: null
      };
    case LOGOUT:
      return {
        ...state,
        isLoggedIn: false,
        user: null,
      };
    case PASSWORD_RESET_FAIL:
    case PASSWORD_RESET_CONFIRM_FAIL:
    case CHANGE_PROFILE_PIC_FAILURE:
    case LOGOUT_FAIL:
    case CHANGE_INSTRUCTOR_FAILURE:
    case CHANGE_EMAIL_FAILURE:
    case CHANGE_USER_BIO_FAILURE:
    case CHANGE_FULLNAME_FAILURE:
    case VERIFY_OTP_FAILURE:
    case RESEND_OTP_SUCCESS:
    case RESEND_OTP_FAILURE:
        return {
            ...state
        };
    case CHANGE_PROFILE_PIC_SUCCESS:
      return {
        ...state,
        user:{
          ...state.user,
          avatar : payload.base64
        }
      }
    case CHANGE_INSTRUCTOR_SUCCESS:
        return {
          ...state,
          user:{
            ...state.user,
            report_to : payload.email
          }
        }
    case CHANGE_EMAIL_SUCCESS:
      return {
        ...state,
        user:{
          ...state.user,
          email:payload.email
        }
      }
      case CHANGE_USER_BIO_SUCCESS:
        return {
          ...state,
          user:{
            ...state.user,
            user_bio:payload.user_bio
          }
        }
      case CHANGE_FULLNAME_SUCCESS:
        return {
          ...state,
          user:{
            ...state.user,
            fullname:payload.fullname,
          }
        }
    default:
      return state;
  }
}