import React, { useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import { connect } from 'react-redux';
import Form from "react-validation/build/form";
import Input from "react-validation/build/input";
import CheckButton from "react-validation/build/button";
import { isEmail } from "validator";

import { reset_password } from "../../actions/auth";

import './forgot_password.styles.css'

const required = (value) => {
  if (!value) {
    return (
      <div className="alert alert-danger" role="alert">
        This field is required!
      </div>
    );
  }
};

const validEmail = (value) => {
    if (!isEmail(value)) {
      return (
        <div className="alert alert-danger" role="alert">
          This is not a valid email.
        </div>
      );
    }
  };

const ForgotPassword = (props) => {
  const form = useRef();
  const checkBtn = useRef();
  let history = useHistory();
  const [email, setEmail] = useState("");
  const [successful, setSuccessful] = useState(false);
  const { message } = useSelector(state => state.message);
  const dispatch = useDispatch();



  const onChangeEmail = (e) => {
    const email = e.target.value;
    setEmail(email);
  };

  const handleSubmit = e => {
    e.preventDefault();

    form.current.validateAll();
    console.log(email);
    if (checkBtn.current.context._errors.length === 0) {
        dispatch(reset_password(email))
          .then(() => {
            setSuccessful(true);
            history.push("/enterOtp")
          })
          .catch(() => {
            setSuccessful(false);
          });
      }
}
    
  return (
    <div className="form-signin flex flex-col justifyy-center">

      <div className="card card-container">

        <h1 className="cursor-default mb-6 text-2xl font-semibold tracking-tighter text-gray-300 sm:text-3xl title-font text-center">
                Reset password
        </h1>
        <Form onSubmit={handleSubmit} ref={form}>
          <div className="grid grid-cols-2">
            <div className="form-label-group col-span-2">
                <label htmlFor="email">Email</label>
                <Input
                  type="text"
                  className="form-control"
                  name="email"
                  value={email}
                  onChange={onChangeEmail}
                  validations={[required, validEmail]}
                />
              </div>
              <button className="w-auto btn btn-lg btn-primary btn-block col-span-2">Send otp to email </button>
            
            </div>
            {message && (
            <div className="form-group">
              <div className={ successful ? "alert alert-success text-center" : "alert alert-danger text-center" } role="alert">
                {message}
                <br />
              </div>
            </div>
          )}
          <CheckButton style={{ display: "none" }} ref={checkBtn} />
        </Form>
        
      </div>
    </div>
  );
};

export default connect(null, { reset_password })(ForgotPassword);

/////////////////////////

// const ForgotPassword = ({ reset_password }) => {
//     const [requestSent, setRequestSent] = useState(false);
//     const [formData, setFormData] = useState({
//         email: ''
//     });

//     const { email } = formData;

//     const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

//     const onSubmit = e => {
//         e.preventDefault();
//         console.log(email);
//         reset_password(email);
//         setRequestSent(true);
//     };

//     // if (requestSent) {
//     //     return <Redirect to='/' />
//     // }

//     return (
//     <div className="form-signin flex flex-col justifyy-center">

//       <div className="card card-container">

//         <h1 className="cursor-default mb-6 text-2xl font-semibold tracking-tighter text-gray-300 sm:text-3xl title-font text-center">
//                 Reset password
//         </h1>
//             <form onSubmit={e => onSubmit(e)}>
//                 <div className='form-group'>
//                     <input
//                         className='form-control'
//                         type='email'
//                         placeholder='Email'
//                         name='email'
//                         value={email}
//                         onChange={e => onChange(e)}
//                         required
//                     />
//                 </div>
//                 <button className='btn btn-primary' type='submit'>Reset Password</button>
//             </form>
//         </div>
//     </div>
//     );
// };

// export default connect(null, { reset_password })(ForgotPassword);