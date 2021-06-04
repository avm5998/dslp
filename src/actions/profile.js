
import {
CHANGE_PROFILE_PIC_SUCCESS,
CHANGE_PROFILE_PIC_FAILURE, 
CHANGE_INSTRUCTOR_SUCCESS,
CHANGE_INSTRUCTOR_FAILURE,
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