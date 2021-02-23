import { combineReducers } from 'redux'
import { reducer as dataset } from './dataset'
import { connectRouter } from 'connected-react-router';
import auth from "./auth";
import message from "./message";

export default history => combineReducers({
    router: connectRouter(history),
    dataset,
    auth,
    message
})