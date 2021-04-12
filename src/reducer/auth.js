import {
  REGISTER_SUCCESS,
  REGISTER_FAIL,
  LOGIN_SUCCESS,
  LOGIN_FAIL,
  LOGOUT,
  PASSWORD_RESET_SUCCESS,
  PASSWORD_RESET_FAIL,
  PASSWORD_RESET_CONFIRM_SUCCESS,
  PASSWORD_RESET_CONFIRM_FAIL,
  CHANGE_PROFILE_PIC_SUCCESS,
  CHANGE_PROFILE_PIC_FAILURE
} from "../actions/types";

let user = JSON.parse(localStorage.getItem("user"));

const initialState = user
  ? { isLoggedIn: true, user}
  : { isLoggedIn: false, user: null };
  

export default function (state = initialState, action) {
  const { type, payload } = action;

  switch (type) {
    case REGISTER_SUCCESS:
      return {
        ...state,
        isLoggedIn: false
      };
    case REGISTER_FAIL:
      return {
        ...state,
        isLoggedIn: false
      };
    case LOGIN_SUCCESS:
      return {
        ...state,
        isLoggedIn: true,
        user: payload.user
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
    case PASSWORD_RESET_SUCCESS:
    case PASSWORD_RESET_FAIL:
    case PASSWORD_RESET_CONFIRM_FAIL:
    case PASSWORD_RESET_CONFIRM_SUCCESS:
    case CHANGE_PROFILE_PIC_FAILURE:
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
    default:
      return state;
  }
}