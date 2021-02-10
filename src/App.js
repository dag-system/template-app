import React, { Component } from 'react';
import 'react-native-gesture-handler';
// import { StackActions, NavigationActions } from 'react-navigation';
import { Root } from "native-base";

import Navigator from './Navigator';

import { PersistGate } from 'redux-persist/integration/react'
import { Provider } from 'react-redux'
import { persistor, store } from './store/configStore'
import Loading from './home/Loading';
import BackgroundGeolocation from "react-native-background-geolocation";

export default class App extends Component {


  componentDidMount() {

    var HeadlessTask = async (event) => {
      let params = event.params;

      switch (event.name) {
        case 'location':
          var location = params;
          var coordinate = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            timestamp: location.timestamp,
            speed : location.coords.speed
          };
      
          var action = { type: 'ADD_COORDINATE', data: coordinate }
          store.dispatch(action);
          break;
      }
    }

    // Register your HeadlessTask with BackgroundGeolocation
    BackgroundGeolocation.registerHeadlessTask(HeadlessTask);
  }


  /**
  * Helper method for resetting the router to Home screen
  */
  static goHome(navigation) {
    navigation.dispatch(StackActions.reset({
      index: 0,
      key: null,
      actions: [
        NavigationActions.navigate({ routeName: 'Home', params: navigation.state.params })
      ]
    }));
  }


  render() {

    return (
      <Root>
        <Provider store={store}>
          <PersistGate loading={<Loading />} persistor={persistor}></PersistGate>
          <Navigator />
        </Provider>
      </Root>
    );
  }



  // static API_AUTH = "aiovbZRUOGTzbrvZRUGB,??452";

  // static SHARE_URL = "http://reperret.fr/live/";





}
