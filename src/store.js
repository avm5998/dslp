import { createStore, applyMiddleware,compose } from 'redux';
import { routerMiddleware } from 'connected-react-router';
import createRootReducer from './reducer/index';
import { createBrowserHistory } from 'history';
import config from './config/client';

const history = createBrowserHistory();
// const loggerMiddleware = createLogger();

let middlewares = [
//   thunkMiddleware,
  routerMiddleware(history)
];

// add the freeze dev middleware
if (process.env.NODE_ENV !== 'production') {
//   middlewares.push(freeze)
//   middlewares.push(loggerMiddleware)
}

// create the store
const store = createStore(
  createRootReducer(history),
  compose(
    applyMiddleware(...middlewares)
  )
);

export { store, history };