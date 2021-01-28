
import { createStore, combineReducers, applyMiddleware } from 'redux';
import OrderBookBidsReducer from './OrderBook/reducers/bids'
import OrderBookAsksReducer from './OrderBook/reducers/asks'
import { persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import autoMergeLevel2 from 'redux-persist/lib/stateReconciler/autoMergeLevel2';
import thunk from 'redux-thunk';
import { composeWithDevTools } from 'redux-devtools-extension';

const persistConfig = {
    key: 'root',
    storage,
    stateReconciler: autoMergeLevel2,
}

const rootReducer = combineReducers({
	orderBookBids: OrderBookBidsReducer,
	orderBookAsks: OrderBookAsksReducer,
});
const persistedReducer = persistReducer(persistConfig, rootReducer);

export const configureStore = () =>
    createStore(
        persistedReducer,
        composeWithDevTools(
            applyMiddleware(thunk)
        )
    );