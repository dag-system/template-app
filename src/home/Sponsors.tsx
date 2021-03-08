import React, {Component} from 'react';
import {
  StyleSheet,
  Image,
  TouchableOpacity,
  View,
  Linking,
  Platform,
  Text,
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

import Cnr from '../assets/CNR.png';
import Fondation from '../assets/Logo-FONDATION.png';

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
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-around',
            marginTop: 10,
            width: '100%',
            paddingHorizontal: 10,
            marginBottom: 20,
          }}>
          <View style={{width: '34%', height: 50}}>
            <Image
              source={Cnr}
              resizeMethod="resize"
              resizeMode="contain"
              style={{height: '100%', width: '100%'}}
            />
          </View>
          <View style={{width: '34%', height: 50}}>
            <Image
              source={Fondation}
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
