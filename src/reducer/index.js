import { combineReducers } from 'redux'
import { reducer as dataset } from './dataset'
import { connectRouter } from 'connected-react-router';

export default history => combineReducers({
    router: connectRouter(history),
    dataset
})