import React, { Component } from 'react';
import OrderBook from './containers/OrderBook';
import { Provider } from 'react-redux';
import {configureStore} from './store/store';
import { persistStore } from 'redux-persist';
import { PersistGate } from 'redux-persist/lib/integration/react';

import './App.css';

const store = configureStore();
const persistor = persistStore(store);

class App extends Component {
  render() {
    return (
      <Provider store={store}>
        <PersistGate loading={<div>Loading...</div>} persistor={persistor}>
          <div className="App">
            <OrderBook/>
          </div>
        </PersistGate>
      </Provider>
    );
  }
}

export default App;
