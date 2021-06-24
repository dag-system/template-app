import React, {Component} from 'react';
import {View, Text, Image, TouchableOpacity} from 'react-native';
import ApiUtils from '../ApiUtils';
import {connect} from 'react-redux';
import Logo from '../assets/logo.png';
import RNExitApp from 'react-native-exit-app';
import {
  TemplateBackgroundColor,
  textAutoBackgroundColor,
} from '../globalsModifs';

import tradRes from './../lang/traduction.json';

const mapStateToProps = (state) => {
  return {
    userData: state.userData,
    lang: state.lang,
  };
};

class IsExpired extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {}

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
            {tradRes[this.props.lang].isExpired.licenceExpired}
          </Text>
        </View>
        <View>
          <Text
            style={{
              fontSize: 17,
              textAlign: 'center',
            }}>
            {tradRes[this.props.lang].isExpired.licenceRenew}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => this.disconnect()}
          style={{
            width: '80%',
            height: 45,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            marginTop: 50,
            marginBottom: 150,
            borderWidth: 1,
            borderColor: textAutoBackgroundColor,
            backgroundColor: TemplateBackgroundColor,
          }}>
          <Text
            style={{
              fontSize: 17,
              color: textAutoBackgroundColor,
            }}>
            {tradRes[this.props.lang].utils.leave}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }
}

export default connect(mapStateToProps)(IsExpired);
