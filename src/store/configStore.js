import {createStore} from 'redux';
import {persistStore, persistReducer} from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import reducer from './reducers';
import * as Sentry from '@sentry/react';

const sentryReduxEnhancer = Sentry.createReduxEnhancer({
  // Optionally pass options listed below
});

const persistConfig = {
  key: 'fouleeblanche',
  storage: AsyncStorage,
  debug: false,
};

const persistedReducer = persistReducer(persistConfig, reducer);

export const store = createStore(persistedReducer, sentryReduxEnhancer);
export const persistor = persistStore(store);
