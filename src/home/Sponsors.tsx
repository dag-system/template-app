import React, {Component} from 'react';
import {
  StyleSheet,
  Image,
  TouchableOpacity,
  View,
  Linking,
  Platform,Text,
  Dimensions,
} from 'react-native';
import {
  Container,
  Header,
  Body,
  Toast,
  Root,
  Drawer,
  Icon,
  Content,
  Left,
  Right,
} from 'native-base';
import md5 from 'md5';
import ApiUtils from '../ApiUtils';
import {connect} from 'react-redux';
import Sidebar from './SideBar';
import moment from 'moment';
import Logo from '../assets/logo_header.png';
import GlobalStyles from '../styles';

import Rhonealpes from '../assets/rhonealpes.svg';
import Region from '../assets/region.jpg';
import Ccmv from '../assets/CCMV.png';
import Alpesisere from '../assets/alpesisere.svg';
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
      <View >
      <View style={{borderBottomWidth : 1, borderBottomColor : '#DDDDDD', width : Dimensions.get('screen').width-30, marginLeft : 15, marginRight : 10,  marginTop : 0}}></View>
      <View
        style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-evenly',
          marginTop : 10, 
          width : '100%',
          paddingHorizontal : 20,
          marginBottom : 20
        }}>
        <View style={{width : '10%', height : 50, flex : 1}}>
          <Image
            source={Region}
            resizeMethod="resize"
            resizeMode="contain"
            style={{height: '100%', width :'90%'}}
          />
        </View>
       
        <View style={{width : '10%', height : 50, flex : 1, justifyContent :'center', paddingLeft :10}}>
          <Image
            source={Ccmv}
            resizeMethod="resize"
            resizeMode="contain"
            style={{height: '90%', width :'90%'}}
          />
        </View>

    
        <View style={{width : '10%', height : 50, flex : 1}}>
          <Isere height={'70%'} style={{marginTop : 7}}/>
        </View>

        <View style={{width : '10%', height : 50, flex : 1}}>
          <Alpesisere height={'80%'}/>
        </View>
     
      </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  
});
