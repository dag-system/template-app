import React, {Component} from 'react';
import {StyleSheet, Image, View, Dimensions} from 'react-native';
import Autrans from '../assets/autrans.svg';
import Region from '../assets/region.jpg';
import Ccmv from '../assets/CCMV.png';
import Isere from '../assets/isere.svg';

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
      <View style={{   backgroundColor :'transparent'}}>
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
            marginTop: 10,
            width: '100%',
            paddingHorizontal: 10,
            marginBottom: 20,
          }}>

          <View style={{width: '30%', height: 50}}>
            <Autrans
              width={'80%'}
              height={50}
              style={{
                alignSelf: 'center',
                opacity: 1,
                marginLeft: 10,
                marginBottom: 5,
              }}
            />
          </View>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({});
