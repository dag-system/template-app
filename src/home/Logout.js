import React, {Component} from 'react';
import {View, Text, Image, TouchableOpacity} from 'react-native';
import ApiUtils from '../ApiUtils';
import {connect} from 'react-redux';
import RNPusherPushNotifications from 'react-native-pusher-push-notifications';
import Logo from '../assets/logo.png';
import BackgroundGeolocation from 'react-native-background-geolocation';

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
    BackgroundGeolocation.stop();
    this.unSubscribe('debug-' + this.props.userData.idUtilisateur);
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
            Vous vous êtes déconnecté.
          </Text>
        </View>
        <View>
          <Text
            style={{
              fontSize: 17,
              textAlign: 'center',
            }}>
            Vous vous êtes bien déconnecté, vous pouvez vous reconnecter sur un
            autre compte si vous les souhaitez.
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => this.disconnect()}
          style={{
            width: '80%',
            height: 45,
            backgroundColor: ApiUtils.getColor(),
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
              color: ApiUtils.getSecondColor() ,
            }}>
            Retourner sur la page d'accueil
          </Text>
        </TouchableOpacity>
      </View>
    );
  }
}

export default connect(mapStateToProps)(Logout);
