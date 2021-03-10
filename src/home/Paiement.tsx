import React, {Component} from 'react';
import {
  StyleSheet,
  Image,
  TouchableOpacity,
  View,
  Linking,
  Platform,
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
  Text,
  Content,
  Left,
  Right,
} from 'native-base';
import md5 from 'md5';
import ApiUtils from '../ApiUtils';
import {connect} from 'react-redux';
import WebviewJetCode from './WebviewJetCode';

const mapStateToProps = (state) => {
  return {
    userData: state.userData,
  };
};
class Partenaires extends Component {
  constructor(props) {
    super(props);

    this.state = {};
  }

  componentDidMount() {
    this.setState({newPassword: true});
  }

  render() {
    return (
      <View
        style={{
          height: '100%',
        }}>
        <WebviewJetCode
          uri={
            'http://dag-system.com/externalcontent/inpgrenoble/jetcode_inp.html'
          }
        />
      </View>
    );
  }
}

export default connect(mapStateToProps)(Partenaires);
