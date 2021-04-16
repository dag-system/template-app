import React, {Component} from 'react';
import {View, Text, Image, TouchableOpacity} from 'react-native';
import ApiUtils from '../ApiUtils';
import {connect} from 'react-redux';
import RNPusherPushNotifications from 'react-native-pusher-push-notifications';
import Logo from '../assets/logo.png';
import RNExitApp from 'react-native-exit-app';

import {textAutoBackgroundColor, textAutoSecondColor} from './../globalsModifs';

const mapStateToProps = (state) => {
  return {
    userData: state.userData,
  };
};

class IsExpired extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {}

  unSubscribe = (interest) => {
    console.log(`Subscribing to "${interest}"`);
    RNPusherPushNotifications.unsubscribe(
      interest,
      (statusCode, response) => {
        console.error(statusCode, response);
      },
      () => {
        console.log(`CALLBACK: unsubscribed to ${interest}`);
      },
    );
  };

  onClickNavigate(routeName) {
    this.props.navigation.navigate('Home');
  }

  disconnect = () => {
    RNExitApp.exitApp();
  };

  render() {
    return (
      <View
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          flex: 1,
          padding: 15,
          backgroundColor: 'white',
        }}>
        <Image
          style={{
            height: 150,
            marginBottom: 100,
          }}
          source={Logo}
          resizeMode="contain"
        />
        <View>
          <Text
            style={{
              width: '100%',
              fontSize: 21,
              marginBottom: 15,
            }}>
            License d'utilisation perimée
          </Text>
        </View>
        <View>
          <Text
            style={{
              fontSize: 17,
              textAlign: 'center',
            }}>
            La license d'utilisation de cette application est terminée. Merci de
            renouvelez votre abonement.
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => this.disconnect()}
          style={{
            width: '80%',
            height: 45,
            backgroundColor: ApiUtils.getSecondColor(),
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            marginTop: 50,
            marginBottom: 150,
            borderColor: 'black',
            borderWidth: 1,
          }}>
          <Text
            style={{
              fontSize: 17,
              color: textAutoSecondColor,
            }}>
            Quitter
          </Text>
        </TouchableOpacity>
      </View>
    );
  }
}

export default connect(mapStateToProps)(IsExpired);
