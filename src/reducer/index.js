import { combineReducers } from 'redux'
import { reducer as dataset } from './dataset'
import { reducer as option } from './option'
import { reducer as preset } from './preset'
import { connectRouter } from 'connected-react-router';
import auth from "./auth";
import message from "./message";

export default history => combineReducers({
    router: connectRouter(history),
    dataset,
    option,
    preset,
    auth,
    message
})