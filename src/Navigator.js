import React, {Component} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';

import Home from './home/Home';
import Lives from './home/Lives';
import LiveSummary from './home/LiveSummary';
import CreateNewLive from './home/CreateNewLive';
import Preferences from './home/Preferences';
import Logout from './home/Logout';
import LiveSummaryMap from './home/LiveSummaryMap';
import LiveSummaryFromSegment from './home/LiveSummaryFromSegment';
import CreateAccount from './home/CreateAccount';
import ForgotPassword from './home/ForgotPassword';
import GetFolocode from './home/GetFolocode';
import SegmentSummary from './home/SegmentSummary';
import Help from './home/Help';
import Partenaires from './home/Partenaires';
import Classement from './home/Classement';
import Replay from './home/Replay';
import MapContainer from './simple-map/MapContainer';
import AskGpsModal from './home/AskGpsModal';

export default class Navigator extends Component {
  componentDidMount() {}
  render() {
    return (
      <NavigationContainer>
        <Stack.Navigator
          headerMode="none"
          options={{
            animationEnabled: false,
          }}>
          <Stack.Screen name="Home" component={Home} headerMode="none" />

          <Stack.Screen name="Replay" component={Replay} headerMode="none" />

          <Stack.Screen
            name="AskGpsModal"
            component={AskGpsModal}
            options={{
              animationEnabled: false,
            }}
          />
          <Stack.Screen
            name="SimpleMap"
            component={MapContainer}
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
          <Stack.Screen name="Help" component={Help} />
          <Stack.Screen name="Logout" component={Logout} />
          <Stack.Screen name="CreateAccount" component={CreateAccount} />
          <Stack.Screen name="SegmentSummary" component={SegmentSummary} />
          <Stack.Screen name="GetFolocode" component={GetFolocode} />
          <Stack.Screen name="ForgotPassword" component={ForgotPassword} />

          {/* <Stack.Screen name="CreateAccountForFolocode" component={CreateAccountForFolocode} /> */}
        </Stack.Navigator>
      </NavigationContainer>
    );
  }
}

const Stack = createStackNavigator();
