import React, {Component} from 'react';
import {
  Platform,
  StyleSheet,
  Alert,
  Linking,
  View,
  TextInput,
  Image,
  ScrollView,
} from 'react-native';
import ApiUtils from '../ApiUtils';
import Logo from '../assets/logo.png';
import {connect} from 'react-redux';

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

  // static navigationOptions = {
  //   drawerLabel: 'Déconnexion',
  //   drawerIcon: ({ tintColor }) => (
  //     <Image
  //       source={require('../assets/deconnexion.png')}
  //       style={[styles.icon, { tintColor: tintColor }]}
  //     />
  //   ),
  // };

  componentDidMount() {
    var action = {type: 'LOGOUT', data: null};

    this.props.dispatch(action);

    this.onClickNavigate('Home');

    //   ApiUtils.setLoggedOut().then((res) => {
    //    // alert(res);
    //     this.onClickNavigate('Home');
    // });
  }

  onClickNavigate(routeName) {
    this.props.navigation.navigate('Home');
  }

  render() {
    return null;
  }
}

const styles = StyleSheet.create({
  header: {
    //Ò  backgroundColor: ApiUtils.getBackgroundColor()
    backgroundColor: '#2B3990',
  },
  title: {
    color: '#000',
    // fontFamily: 'roboto'
  },
  text: {
    fontFamily: 'Roboto',
  },
  body: {
    width: '100%',
    backgroundColor: '#DADADA',
    //  justifyContent: 'center',
  },
  logo: {
    width: '80%',
    height: 150,
    marginLeft: 25,
    marginRight: 25,
    marginTop: 50,
    marginBottom: 50,
  },
  loginButtonSection: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: ApiUtils.getBackgroundColor(),
    paddingBottom: 40,
  },

  followCodeLoginSection: {
    backgroundColor: '#DADADA',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 30,
  },

  inputCode: {
    borderBottomColor: 'black',
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
    color: '#5D8BE6',
    fontWeight: 'bold',
    fontSize: 11,
    marginTop: 20,
    marginRight: 10,
  },

  buttonok: {
    marginBottom: 10,
    width: 150,
    height: 30,
    borderRadius: 10,
    marginRight: 40,
  },
  container: {
    // flex: 1,
    //  justifyContent: 'center',
    //   alignItems: 'center',
    // backgroundColor: ApiUtils.getBackgroundColor(),
    backgroundColor: '#DADADA',
  },
  footer: {
    backgroundColor: 'transparent',
    height: 215,
  },
  userInfo: {
    padding: 10,
  },
  icon: {
    width: 24,
    height: 24,
  },
});

export default connect(mapStateToProps)(Logout);
