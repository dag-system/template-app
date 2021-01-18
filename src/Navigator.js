/**
 * This is the Application's root navigator which automatically routes to the currently
 * selected example app.
 * - HelloWorld
 * - SimpleMap
 * - Advanced
 *
 * The default route is home/Home
 *
 * This file contains nothing related to Background Geolocation plugin.  This is just
 * boilerplate routing stuff.
 */
import React, {Component} from 'react';
import {AsyncStorage, View, Text, StyleSheet} from 'react-native';

// import { StackNavigator, DrawerNavigator, StackActions, NavigationActions, createAppContainer } from 'react-navigation';

import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';

import Home from './home/Home';
import Lives from './home/Lives';
import SimpleMap from './simple-map/SimpleMap';
import LiveSummary from './home/LiveSummary';
import CreateNewLive from './home/CreateNewLive';
import Preferences from './home/Preferences';
import Logout from './home/Logout';
import LiveSummaryMap from './home/LiveSummaryMap';
import LiveSummaryFromSegment from './home/LiveSummaryFromSegment';
// import Lives from './home/Lives';
// import HelloWorld from './hello-world/HelloWorld';
// import SimpleMap from './simple-map/SimpleMap';
// import ScanQrCode from './home/ScanQrCode';
import CreateAccount from './home/CreateAccount';
import ForgotPassword from './home/ForgotPassword';
import GetFolocode from './home/GetFolocode';
import SegmentSummary from './home/SegmentSummary';
import Help from './home/Help';
import Partenaires from './home/Partenaires';
import Classement from './home/Classement';
import Replay from './home/Replay';

// import CreateAccountForFolocode from './home/CreateAccountForFolocode';

export default class Navigator extends Component {
  componentDidMount() {
    let navigation = this.props.navigation;

    // Fetch current routeName (ie: HelloWorld, SimpleMap, Advanced)
    AsyncStorage.getItem('@transistorsoft:initialRouteName', (err, page) => {
      let params = {username: undefined};
      if (!page) {
        // Default route:  Home
        page = 'Home';
        AsyncStorage.setItem('@transistorsoft:initialRouteName', page);
      }
      // Append username to route params.
      AsyncStorage.getItem('@transistorsoft:username', (err, username) => {
        // Append username to route-params
        //  if (username) { params.username = username; }
        // navigation.navigate(page);
        // navigation.dispatch(StackActions.reset({
        //   index: 0,
        //   key: null,
        //   actions: [
        //     NavigationActions.navigate({ routeName: page, params: params })
        //   ]
        // }));
      });
    });
  }
  render() {
    return (
      <NavigationContainer>
        <Stack.Navigator
          headerMode="none"
          options={{
            animationEnabled: false,
          }}>


          <Stack.Screen name="Home" component={Home} headerMode="none" />

          < Stack.Screen name="Replay" component={Replay} headerMode="none" />


          <Stack.Screen
            name="SimpleMap"
            component={SimpleMap}
            options={{
              animationEnabled: false,
            }}
          />
          <Stack.Screen
            name="Lives"
            component={Lives}
            headerMode="none"
            options={{
              animationEnabled: false,
            }}
          />

          <Stack.Screen
            name="Help"
            component={Help}
            headerMode="none"
            options={{
              animationEnabled: false,
            }}
          />

          <Stack.Screen
            name="Partenaires"
            component={Partenaires}
            headerMode="none"
            options={{
              animationEnabled: false,
            }}
          />

          <Stack.Screen
            name="Classement"
            component={Classement}
            headerMode="none"
            options={{
              animationEnabled: false,
            }}
          />

          <Stack.Screen
            name="LiveSummary"
            component={LiveSummary}
            options={{
              animationEnabled: false,
            }}
          />
          <Stack.Screen
            name="LiveSummaryMap"
            component={LiveSummaryMap}
            options={{
              animationEnabled: false,
            }}
          />
          <Stack.Screen
            name="LiveSummaryFromSegment"
            component={LiveSummaryFromSegment}
          />
          <Stack.Screen
            name="CreateNewLive"
            component={CreateNewLive}
            options={{
              animationEnabled: false,
            }}
          />
          <Stack.Screen
            name="Preferences"
            component={Preferences}
            options={{
              animationEnabled: false,
            }}
          />
          <Stack.Screen name="Logout" component={Logout} />
          <Stack.Screen name="CreateAccount" component={CreateAccount} />
          <Stack.Screen name="SegmentSummary" component={SegmentSummary} />
          <Stack.Screen name="GetFolocode" component={GetFolocode} />
          <Stack.Screen name="ForgotPassword" component={ForgotPassword} />

          {/* <Stack.Screen name="CreateAccountForFolocode" component={CreateAccountForFolocode} /> */}
        </Stack.Navigator>
      </NavigationContainer>
    );
    return <View />;
  }
}

const Stack = createStackNavigator();

// const StackNavigatorData = createStackNavigator({
//   Home: {
//     screen: Home
//   },
//   // HelloWorld: {
//   //   screen: HelloWorld
//   // },
//   // SimpleMap: {
//   //   screen: SimpleMap
//   // },
//   // Lives: {
//   //   screen: App2,
//   // },
//   // CreateAccount: {
//   //   screen: CreateAccount
//   // },
//   // ForgotPassword: {
//   //   screen: ForgotPassword
//   // },
//   // GetFolocode: {
//   //   screen: GetFolocode
//   // },
//   // CreateAccountForFolocode: {
//   //   screen: CreateAccountForFolocode
//   // }
// }, {
//   initialRouteName: 'Home',
//   headerMode: 'none',
//   title: 'toto',
//   headerStyle: {
//     Background: 'black'
//   },
//   onTransitionStart: (transition) => {
//     // Store the current page route as the initialRouteName so that app boots immediately
//     // into the currently selected SampleApp
//     // - HelloWorld
//     // - SimpleMap
//     // - Advanced
//     let routeName = transition.scene.route.routeName;
//     AsyncStorage.setItem("@transistorsoft:initialRouteName", routeName);
//   }

// });

// export default Navigator = createAppContainer(StackNavigatorData);
