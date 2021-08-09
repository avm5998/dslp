import React, { Component, useState  } from "react";
import { useDispatch, useSelector } from "react-redux";
import ReactDOM from "react-dom";
import {connect} from 'react-redux'
import OtpInput from "react-otp-input";
import { useHistory } from "react-router-dom";
// import OTPInput, { ResendOTP } from "otp-input-react";
// import CssBaseline from "@material-ui/core/CssBaseline";
import Typography from "@material-ui/core/Typography";
import Container from "@material-ui/core/Container";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import Grid from "@material-ui/core/Grid";
import LockOutlinedIcon from "@material-ui/icons/LockOutlined";
import Avatar from "@material-ui/core/Avatar";
import Button from "@material-ui/core/Button";
import CssBaseline from "@material-ui/core/CssBaseline";
import TextField from "@material-ui/core/TextField";
// import "./styles.css";


import { verify_otp, resend_otp } from "../../actions/auth";

const useStyles = makeStyles((theme) => ({
  grid: {
    backgroundColor: "grey",
    height: "50vh",
    textalign: "center"
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main
  },
  submit: {
    margin: theme.spacing(3, 0, 2)
  },
  paper: {
    marginTop: theme.spacing(8),
    display: "flex",
    flexDirection: "column",
    alignItems: "center"
  }
}));


const EnterOtp = ({props}) => {
  const classes = useStyles();
  const theme = useTheme();
  const [otp, setOtp] = useState("");
  const [successful, setSuccessful] = useState(false);
  const [resendOtpButtonEnable, setResendOtpButtonEnable] = useState(false);
  const [otpResent, setOtpResent] = useState(false);

  let history = useHistory();
  let { message } = useSelector(state => state.message);
  const dispatch = useDispatch();
  let emailToBeRegistered = useSelector(state => state.auth.emailToBeRegistered);
  console.log("otp e", emailToBeRegistered);
  const handleChange = (val) => {
    setOtp(val);
  } 

  const submitOtp = () => {
    setSuccessful(false);
    dispatch(verify_otp(otp, emailToBeRegistered)).then(() => {
        console.log("otp verified successfully")
        setSuccessful(true);
        setResendOtpButtonEnable(false);
        history.push("/login");
      })
      .catch(() => {
        setSuccessful(false);
        setResendOtpButtonEnable(true);
        setOtp("");
      });  
  };

const resendOtp = () => {
  setOtpResent(false);
  dispatch(resend_otp(emailToBeRegistered)).then(() => {
    setOtpResent(true);
    setOtp("");
    setResendOtpButtonEnable(false);
  })
  .catch(() => {
    setOtpResent(false);
    setResendOtpButtonEnable(true);
    setOtp("");
  }); 
}

  return (
    <Container component="main" maxWidth="sm">
      <CssBaseline />
      <div className={classes.paper}>
        <Grid
          container
          style={{ backgroundColor: "white" }}
          className={classes.grid}
          justifyContent="center"
          alignItems="center"
          spacing={3}
        >
          <Grid item container justifyContent="center">
            <Grid item container alignItems="center" direction="column">
              <Grid item>
                <Avatar className={classes.avatar}>
                  <LockOutlinedIcon />
                </Avatar>
              </Grid>
              <Grid item>
                <Typography component="h1" variant="h5">
                  Verification Code
                </Typography>
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={12} textalign="center">
            <Paper elevation={0}>
              <Typography variant="h6">
                Please enter the verification code sent to your mobile
              </Typography>
            </Paper>
          </Grid>
          <Grid
            item
            xs={12}
            container
            justifyContent="center"
            alignItems="center"
            direction="column"
          >
            <Grid item spacing={3} container justifyContent="center">
              <OtpInput
                separator={
                  <span>
                    <strong>.</strong>
                  </span>
                }
                inputStyle={{
                  width: "3rem",
                  height: "3rem",
                  margin: "0 1rem",
                  fontSize: "2rem",
                  borderRadius: 4,
                  border: "1px solid rgba(0,0,0,0.3)"
                }}
                value={otp}
                onChange={handleChange}
                numInputs={6}
              />
            </Grid>
            <Grid item>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                className={classes.submit}
                onClick = {() =>  {submitOtp()}}
              >
                Verify
              </Button>
              {
                resendOtpButtonEnable ?               
                <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                className={classes.submit}
                onClick = {() =>  {resendOtp()}}
              >
                Resend Otp
              </Button> : ""
              }
              {message && (
              
                  <div className={successful ? "register-info text-center register-tip" : "register-alert text-center register-tip"} role="alert">
                    {message}
                    <br />
                    {/* {successful && <span>Please click
                      <Link to="/login" className="underline"> here </Link> to login
                    </span> */}
                  </div>
              )}
            </Grid>
          </Grid>
        </Grid>
      </div>
    </Container>
  );
}

export default EnterOtp;