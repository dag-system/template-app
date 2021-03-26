import {createStore} from 'redux';
import {persistStore, persistReducer} from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import reducer from './reducers';

import {TemplateAppName} from './../globalsModifs';

const persistConfig = {
  key: TemplateAppName,
  storage: AsyncStorage,
  debug: false,
};

const persistedReducer = persistReducer(persistConfig, reducer);

export const store = createStore(persistedReducer);
export const persistor = persistStore(store);
