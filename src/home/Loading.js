import React, {Component} from 'react';
import {View, Image, ActivityIndicator} from 'react-native';
import {Container, Text} from 'native-base';
import ApiUtils from '../ApiUtils';
import Logo from '../assets/logo.png';
export default class Loading extends Component {
  constructor(props) {
    super(props);

    this.state = {};
  }

  render() {
    return (
      <Container>
        <View
          style={{
            backgroundColor: ApiUtils.getBackgroundColor(),
            height: '100%',
            paddingTop: '30%',
          }}>
          <Image
            resizeMode="contain"
            source={Logo}
            style={{
              width: '100%',
              height: 130,
              alignSelf: 'center',
            }}
          />
          <ActivityIndicator color="white" />
          <Text style={{color: 'black', textAlign: 'center'}}>Chargement</Text>
        </View>
      </Container>
    );
  }
}
