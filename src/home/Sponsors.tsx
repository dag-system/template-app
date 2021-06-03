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
            // justifyContent: 'flex-start',
            marginTop: 10,
            width: '100%',
            paddingHorizontal: 10,
            marginBottom: 20,
          }}>
          {/* <View style={{width: '34%', height: 50}}>
            <Image
              source={Region}
              resizeMethod="resize"
              resizeMode="contain"
              style={{height: '100%', width: '100%'}}
            />
          </View>

          <View style={{width: '30%', height: 50}}>
            <Isere height={'80%'} style={{marginTop: 5}} />
          </View>

          <View
            style={{
              width: '10%',
              height: 50,
              flex: 1,
              justifyContent: 'center',
              paddingLeft: 0,
            }}>
            <Image
              source={Ccmv}
              resizeMethod="resize"
              resizeMode="contain"
              style={{height: '70%', width: '100%'}}
            />
          </View> */}

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
