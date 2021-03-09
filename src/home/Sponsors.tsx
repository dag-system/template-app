import React, {Component} from 'react';
import {StyleSheet, Image, View, Dimensions} from 'react-native';

import Chartreuse from '../assets/chartreuse.jpg';
import Fondationinp from '../assets/fondationinp.png';
import Grenobleinp from '../assets/grenobleinp.png';
import Uga from '../assets/uga.png';

export class Sponsors extends Component {
  constructor(props) {
    super(props);

    this.state = {
      userdata: {
        nomUtilisateur: '',
        prenomUtilisateur: '',
        telUtilisateur: '',
        folocodeUtilisateur: '',
        idUtilisateur: '',
      },
      newPassword: '',
      newPasswordConfirmation: '',
      isErrorName: false,
      lives: [],
      isLoading: false,
      toasterMessage: '',
      showDefaultDdn: false,
    };
  }

  componentDidMount() {}

  render() {
    return (
      <View>
        <View
          style={{
            borderBottomWidth: 1,
            borderBottomColor: '#DDDDDD',
            width: Dimensions.get('screen').width - 30,
            marginLeft: 15,
            marginRight: 10,
            marginTop: 0,
          }}></View>
        <View
          style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginTop: 10,
            width: '100%',
            paddingHorizontal: 10,
            marginBottom: 20,
          }}>
          <View style={{width: '25%', height: 50}}>
            <Image
              source={Fondationinp}
              resizeMethod="resize"
              resizeMode="contain"
              style={{height: '100%', width: '100%'}}
            />
          </View>

          <View style={{width: '15%', height: 50}}>
            <Image
              source={Chartreuse}
              resizeMethod="resize"
              resizeMode="contain"
              style={{height: '100%', width: '100%'}}
            />
          </View>

          <View style={{width: '20%', height: 50}}>
            <Image
              source={Uga}
              resizeMethod="resize"
              resizeMode="contain"
              style={{height: '100%', width: '100%'}}
            />
          </View>

          <View style={{width: '30%', height: 50}}>
            <Image
              source={Grenobleinp}
              resizeMethod="resize"
              resizeMode="contain"
              style={{height: '100%', width: '100%'}}
            />
          </View>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({});
