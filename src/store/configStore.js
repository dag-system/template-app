// configureStore.js

import { createStore } from 'redux'
import { persistStore, persistReducer } from 'redux-persist'
// import storage from 'redux-persist/lib/storage' // defaults to localStorage for web
import AsyncStorage from '@react-native-community/async-storage';
import reducer from './reducers'
import * as Sentry from "@sentry/react";

const sentryReduxEnhancer = Sentry.createReduxEnhancer({
  // Optionally pass options listed below
});


const persistConfig = {
  key: 'fouleeblanche',
  storage: AsyncStorage,
  debug : true,
  
}

const persistedReducer = persistReducer(persistConfig, reducer)

export const store = createStore(persistedReducer,sentryReduxEnhancer);
export const persistor = persistStore(store);

// export const store;
// export const persistor;
// export default () => {
//   let store 
//   let persistor = persistStore(store)
//   return { store, persistor }
// }