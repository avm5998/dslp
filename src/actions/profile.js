
import {
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


SET_MESSAGE
  } from "./types";

  import ProfileService from "../services/profile.service";

  export const change_profile_pic = (data) => (dispatch) => {
    return ProfileService.change_profile_pic(data).then(
        (response) => {
            console.log(response)
            dispatch({
              type: CHANGE_PROFILE_PIC_SUCCESS,
              payload: {base64 : response.base64}
            });
      
            dispatch({
              type: SET_MESSAGE,
              payload: response.message,
            });
      
            return Promise.resolve();
          },
          (error) => {
            const message = error.message;

      
            dispatch({
              type: CHANGE_PROFILE_PIC_FAILURE,
            });
      
            dispatch({
              type: SET_MESSAGE,
              payload: message,
            });
      
            return Promise.reject();
          }
        );
  };

  export const change_instructor = (email) => (dispatch) => {
    return ProfileService.change_instructor(email).then(
        (response) => {
            dispatch({
              type: CHANGE_INSTRUCTOR_SUCCESS,
              payload:{email}
            });
            return Promise.resolve();
          },
          (error) => {
            const message = error.message;  
            dispatch({
              type: CHANGE_INSTRUCTOR_FAILURE,
            });
            return Promise.reject();
          }
        );
  };

  export const change_user_fields = (fields) => (dispatch) => {
    return ProfileService.change_user_fields(fields).then(
      (response) => {
        console.log("fields",fields);
          if("fullname" in fields){
            console.log(fields["fullname"])
            dispatch({
              type: CHANGE_FULLNAME_SUCCESS,
              payload:{"fullname":fields["fullname"]}
            });
          }
          if("email" in fields){
            dispatch({
              type: CHANGE_EMAIL_SUCCESS,
              payload:{"email":fields["email"]}
            });
          }
          if("user_bio" in fields){
            dispatch({
              type: CHANGE_USER_BIO_SUCCESS,
              payload:{"user_bio":fields["user_bio"]}
            });
          }
          
          return Promise.resolve();
        },
        (error) => {
          const message = error.message;  
          if("fullname" in fields){
            console.log(fields["fullname"])
            dispatch({
              type: CHANGE_FULLNAME_FAILURE
            });
          }
          if("email" in fields){
            dispatch({
              type: CHANGE_EMAIL_FAILURE
            });
          }
          if("user_bio" in fields){
            dispatch({
              type: CHANGE_USER_BIO_FAILURE
            });
          }
          return Promise.reject();
        }
      );
  }