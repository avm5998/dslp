import 'babel-polyfill';
import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { store, history } from './store';
import Route from './route';
import { ConnectedRouter } from 'connected-react-router';
import './assets/styles/style';

// render the main component
ReactDOM.render(
  <Provider store={store}>
    <ConnectedRouter history={history}>
      <Route/>
    </ConnectedRouter>
  </Provider>,
  document.getElementById('app')
);