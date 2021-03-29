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
  Button,
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
    setTimeout(() => this.checkIsConnected(), 200);
  }

  checkIsConnected = () => {
    if (this.props.userData != null && ApiUtils.hasPaid(this.props.userData)) {
      console.log('test')
      this.onClickNavigate('Lives');
    } else {
      console.log('ici')
    }
  };

  onClickNavigate(routeName) {
    this.props.navigation.navigate(routeName);
  }

  render() {
    return (
      <View
        style={{
          height: '100%',
        }}>
              <Header style={styles.header}>
                <Left>
                  <Button
                    style={styles.drawerButton}
                    onPress={() => this.onClickNavigate("Home")}>
                    <Icon
                      style={styles.saveText}
                      name="chevron-left"
                      type="FontAwesome5"
                    />
                  </Button>
                </Left>
                <Right />
              </Header>
        <WebviewJetCode
        navigation={this.props.navigation}
          uri={
            'http://dag-system.com/externalcontent/inpgrenoble/jetcode_inp.html'
          }
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#2B3990',
    // backgroundColor: ApiUtils.getBackgroundColor(),
    width: '100%',
  },
  title: {
    color: '#000',
    // fontFamily: 'roboto'
  },
  text: {
    fontFamily: 'Roboto',
  },
  body: {
    // paddingBottom : 300
    // width: '100%',
    // // backgroundColor: '#DADADA',
    // height: '140%',
    //  justifyContent: 'center',
  },
  logo: {
    width: '70%',
    height: 100,
    alignSelf: 'center',
    // marginLeft: 25,
    // marginRight: 25,
    marginTop: Platform.OS == 'ios' ? 20 : 25,
    marginTop: 75,
    marginBottom: 100,
  },
  loginButtonSection: {
    width: '100%',

    paddingBottom: 30,
    borderBottomLeftRadius: 100,
  },
  followCodeLoginSection: {
    flex: 1,
    backgroundColor: 'white',
    width: '100%',
    height: '140%',
    // justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 30,
    paddingBottom: 200,
  },
  inputCode: {
    borderBottomWidth: 1,
    width: '80%',
    height: 30,
    padding: 0,
    marginBottom: 20,
    marginTop: 20,
  },
  p: {
    fontSize: 12,
    marginBottom: 5,
  },
  url: {
    fontSize: 12,
    textAlign: 'center',
  },
  textLink: {
    // color: '#5D8BE6',
    color: '#7f8c8d',
    fontWeight: 'bold',
    fontSize: 12,
    marginTop: 16,
    marginRight: 10,
    marginBottom: 30,
  },
  versionInfo: {
    fontSize: 11,
    marginBottom: 4,
    textAlign: 'center',
    alignSelf: 'center',
  },
  drawerButton: {
    backgroundColor: 'transparent',
    width: 120,
    marginTop: 0,
    paddingTop: 10,
    shadowOffset: {height: 0, width: 0},
    shadowOpacity: 0,
    elevation: 0,
    paddingLeft: 0,
  },

  saveText: {
    color: 'white',
    paddingLeft: 0,
    marginLeft: 5,
    marginRight: -5,
  },
  buttonok: {
    marginBottom: 10,
    width: '80%',
    // width: 150,
    // height: 40,
    borderRadius: 30,
    marginRight: 0,
    justifyContent: 'center',
  },
  container: {
    backgroundColor: '#DADADA',
  },
  footer: {
    backgroundColor: 'transparent',
    height: 400,
  },
  userInfo: {
    padding: 10,
  },
  icon: {
    width: 24,
    height: 24,
  },
  logoHeader: {
    width: '100%',
    height: 50,
    marginRight: '20%',
  },
});

export default connect(mapStateToProps)(Partenaires);
