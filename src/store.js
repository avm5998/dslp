import { createStore, applyMiddleware,compose } from 'redux';
import { composeWithDevTools } from "redux-devtools-extension";
// import thunk from "redux-thunk";
import { routerMiddleware } from 'connected-react-router';
import createRootReducer from './reducer/index';
import { createBrowserHistory } from 'history';
import config from './config/client';
import thunk from "redux-thunk";
import logger from 'redux-logger';

const history = createBrowserHistory();
// const loggerMiddleware = createLogger();

let middlewares = [

  
  routerMiddleware(history),
  thunk
];

// add the freeze dev middleware
if (process.env.NODE_ENV !== 'production') {
//   middlewares.push(freeze)
  middlewares.push(logger)
}

// create the store
const store = createStore(
  createRootReducer(history),
  composeWithDevTools(
    applyMiddleware(...middlewares)
  )
);

export { store, history };