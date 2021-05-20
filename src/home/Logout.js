import React, {Component} from 'react';
import {View, Text, Image, TouchableOpacity} from 'react-native';
import ApiUtils from '../ApiUtils';
import {connect} from 'react-redux';
import RNPusherPushNotifications from 'react-native-pusher-push-notifications';
import Logo from '../assets/logo.png';
import BackgroundGeolocation from 'react-native-background-geolocation';

import {
  textAutoBackgroundColor,
  TemplateBackgroundColor,
} from './../globalsModifs';

const mapStateToProps = (state) => {
  return {
    userData: state.userData,
  };
};

class Logout extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    BackgroundGeolocation.stop();
  }

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
    this.props.navigation.navigate(routeName);
  }

  disconnect = () => {
    BackgroundGeolocation.stop();
    // this.unSubscribe('debug-' + this.props.userData.idUtilisateur);
    var action = {type: 'LOGOUT', data: null};
    this.props.dispatch(action);

    this.onClickNavigate('Home');
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
            Vous allez être déconnecté.
          </Text>
        </View>
        <View>
          <Text
            style={{
              fontSize: 17,
              textAlign: 'center',
            }}>
            Vous allez être déconnecté, si vous ne souhaitez pas vous
            deconnectez, cliquer sur le bouton de retour.
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => this.onClickNavigate('Lives')}
          style={{
            width: '80%',
            height: 45,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            marginTop: 50,
            marginBottom: 20,
            borderWidth: 1,
            borderColor: textAutoBackgroundColor,
            backgroundColor: TemplateBackgroundColor,
          }}>
          <Text
            style={{
              fontSize: 17,
              color: textAutoBackgroundColor,
            }}>
            Retourner à mes activités
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => this.disconnect()}
          style={{
            width: '80%',
            height: 35,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            borderWidth: 1,
            borderColor: 'red',
            backgroundColor: TemplateBackgroundColor,
          }}>
          <Text
            style={{
              fontSize: 17,
              color: 'red',
            }}>
            Se déconnecter
          </Text>
        </TouchableOpacity>
      </View>
    );
  }
}

export default connect(mapStateToProps)(Logout);
