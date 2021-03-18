import {Component} from 'react';
import {StyleSheet} from 'react-native';
import ApiUtils from '../ApiUtils';
import {connect} from 'react-redux';
import RNPusherPushNotifications from 'react-native-pusher-push-notifications';

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

  componentDidMount() {
    this.unSubscribe('debug-' + this.props.userData.idUtilisateur);
    var action = {type: 'LOGOUT', data: null};

    this.props.dispatch(action);

    this.onClickNavigate('Home');
  }

  unSubscribe = (interest) => {
    console.log(`Subscribing to "${interest}"`);
    RNPusherPushNotifications.unsubscribe(
      interest,
      (statusCode, response) => {
        console.error(statusCode, response);
      },
      () => {
        console.log(`CALLBACK: unsubscribed to ${interest}`);
      },
    );
  };

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
    backgroundColor: '#DADADA',
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
