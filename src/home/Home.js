import React, {Component} from 'react';
import {
  Platform,
  StyleSheet,
  Linking,
  View,
  TextInput,
  SafeAreaView,
  TouchableHighlight,
  TouchableOpacity,KeyboardAvoidingView, ActivityIndicator
} from 'react-native';
import {
  Container,
  Content,
  Text,
  Button,
  Header,
  Left,
  Right,
  Icon,
} from 'native-base';
import * as Animated from 'react-native-animatable';
import md5 from 'md5';
import BackgroundGeolocation from '../react-native-background-geolocation';
import {connect} from 'react-redux';

import ApiUtils from '../ApiUtils';
import Logo from '../assets/logo.png';
import Loading from './Loading';
import {Modal} from 'react-native';
import WebviewJetCode from './WebviewJetCode';
import GlobalStyles from '../styles';

const mapStateToProps = state => {
  return {
    userData: state.userData,
  };
};



class Home extends Component {
  constructor(props) {
    super(props);

    this.state = {
      // username: navigation.state.params.username,
      //   url: TRACKER_HOST + navigation.state.params.username,
      followCode: '',
      email: '',
      password: '',
      isLoading: false,
      isModalJetcodeVisible: false,
    };

    this._unsubscribe = this.props.navigation.addListener('focus', payload => {
      this.componentDidMount();
    });
  }

  componentDidMount() {

    // #stop BackroundGeolocation and remove-listeners when Home Screen is rendered.
    if (this.props.userData != null) {
      this.onClickNavigate('Lives');
    } else {
      BackgroundGeolocation.stop();
      BackgroundGeolocation.removeListeners();
    }

    setTimeout(() => this.checkIsConnected(), 200);
    this.getinformationStation();
  }
  checkIsConnected = () => {
    if (this.props.userData != null) {
      this.onClickNavigate('Lives');
    }
  }

  onClickNavigate(routeName) {
    this.props.navigation.navigate(routeName);
  }

  openLink(url) {
    Linking.canOpenURL(url).then(supported => {
      if (supported) {
        Linking.openURL(url);
      } else {
        ApiUtils.logError('Home openLink', 'Dont know how to open URI: ' + url);
      }
    });
  }

  onLogin() {
    this.setState({isLoading: true});
    let formData = new FormData();
    formData.append('method', 'getInformationsUtilisateur');
    formData.append('auth', ApiUtils.getAPIAuth());
    formData.append('emailUtilisateur', this.state.email);

    formData.append('passUtilisateur', md5(this.state.password));
    //fetch followCode API

    fetch(ApiUtils.getAPIUrl(), {
      method: 'POST',
      headers: {
        // Accept: 'application/json',
        // 'Content-Type': 'application/json',
      },
      body: formData,
    })
      .then(ApiUtils.checkStatus)
      .then(response => response.json())
      .then(responseJson => {
        //save values in cache
        if (responseJson.codeErreur == 'SUCCESS') {
          //SaveData
          this.setState({email: '', password: ''});

          var action = {type: 'LOGIN', data: responseJson};
          this.props.dispatch(action);
          this.setState({isLoading: false});
          this.onClickNavigate('Lives');

          // ApiUtils.setLogged().then(this.saveUserInfo(responseJson, false));
        } else {
          alert(responseJson.message);
          this.setState({isLoading: false});
        }
      })
      .catch(e => {
        this.setState({isLoading: false});
        alert(e.message);
      })
      .then
      // this.setState({isLoading : false})
      ();
  }

  onClickSendFollowCode() {
    if (this.state.followCode != '') {
      let formData = new FormData();
      formData.append('method', 'getInformationsUtilisateur');
      formData.append('auth', ApiUtils.getAPIAuth());
      formData.append('folocode', this.state.followCode);
      //fetch followCode API
      fetch(ApiUtils.getAPIUrl(), {
        method: 'POST',
        headers: {
          // Accept: 'application/json',
          // 'Content-Type': 'application/json',
        },
        body: formData,
      })
        .then(ApiUtils.checkStatus)
        .then(response => response.json())
        .then(responseJson => {
          // alert("success http");
          //save values in cache

          if (responseJson.codeErreur == 'SUCCESS') {
            //SaveData

            var action = {type: 'LOGIN', data: responseJson};
            this.props.dispatch(action);
            this.setState({isLoading: false});
            this.onClickNavigate('Lives');
          } else {
            alert("Votre folocode n'est pas valide");
          }
        })
        .catch(e => ApiUtils.logError('Home onClickSendFollowCode', e.message))
        .then

        //  this.onClickNavigate('SimpleMap'));
        //alert("error gettingData"+ e.message)
        ();
    }
  }

  createAccount() {
    this.setState({isModalJetcodeVisible: true});
    // this.onClickNavigate('CreateAccount');
  }

  createAccountOld() {
    this.onClickNavigate('CreateAccount');
  }

  oncloseModal() {
    this.setState({isModalJetcodeVisible: false});
  }

  forgotPassword() {
    this.onClickNavigate('ForgotPassword');
  }
  // scanQrCode() {
  //   this.onClickNavigate('ScanQrCode');
  // }

  getFolocode() {
    this.onClickNavigate('GetFolocode');
  }

  isErrorForm() {
    var isError = false;

    if (this.state.emailUtilisateur == '') {
      isError = true;
    }

    if (!this.validateEmail(this.state.email)) {
      isError = true;
    }
    return isError;
  }

  validateEmail(email) {
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
  }

  pressLogo() {
    this.logo.animate('bounce', 1000); // animate({ 0: { opacity: 0 }, 1: { opacity: 1 } });
  }

  getinformationStation() {
    const formData = new FormData();
    formData.append('method', 'getInformationStation');
    formData.append('auth', ApiUtils.getAPIAuth());
    formData.append('idStation', '36');
    //fetch followCode API

    fetch(ApiUtils.getAPIUrl(), {
      method: 'POST',
      headers: {
        // Accept: 'application/json',
        // 'Content-Type': 'application/json',
      },
      body: formData,
    })
      .then(ApiUtils.checkStatus)
      .then(response => response.json())
      .then(responseJson => {
        //save values in cache

        var result = responseJson;

        if (result.traces != null && result.traces.length != 0) {
          this.setState({nomStation: result.nomStation});

          this.setState({descriptionStation: result.descriptionStation});
          var tracesArray = Object.values(result.traces);

          var finalTraceArray = []; // new Object(this.props.polylines);
          if ((tracesArray != null) & (tracesArray.length != 0)) {
            tracesArray.forEach(trace => {
              var finalTrace = trace;

              var positionArray = Object.values(trace.positionsTrace);
              trace.positionsTrace = positionArray;

              var finalTrace = {
                positionsTrace: positionArray,
                couleurTrace: trace.couleurTrace,
                nomTrace: trace.nomTrace,
                isActive: true,
                sportTrace: trace.sportTrace,
                distanceTrace: trace.distanceTrace,
                dplusTrace: trace.dplusTrace,
              };
              finalTraceArray.push(finalTrace);
            });
          }

          var station = {
            nomStation: result.nomStation,
            descriptionStation: result.descriptionStation,
            polylines: finalTraceArray,
            // pointsInterets: finalinterestArray
          };

          var action = {type: 'UPDATE_STATION_DATA', data: station};
          this.props.dispatch(action);
        }
      })
      .catch(e => console.log(e.message))
      .then();
  }

  render() {
    if (this.props.userData != null) {
      return <Loading />;
    }

    return (
      <Container style={{backgroundColor: ApiUtils.getBackgroundColor()}}>
        <SafeAreaView
          style={{flex: 0, backgroundColor: ApiUtils.getBackgroundColor()}}
        />
        <Content style={styles.body} scrollEnabled={true}>
          <KeyboardAvoidingView style={styles.loginButtonSection}>
            <View
              style={{
                zIndex: 10,
                alignItems: 'center',
                backgroundColor: ApiUtils.getBackgroundColor(),
              }}>
              <TouchableHighlight
                underlayColor="transparent"
                onPress={() => this.pressLogo()}
                style={styles.logo}>
                <Animated.Image
                  ref={ref => {
                    this.logo = ref;
                  }}
                  animation="bounceInDown"
                  delay={300}
                  resizeMode="contain"
                  source={Logo}
                  style={styles.logo}
                />
              </TouchableHighlight>

          
              <TextInput style={[styles.inputCode, {borderBottomColor : 'white', color : 'white'}]} placeholder="Adresse mail" placeholderTextColor="white"
                value={this.state.email} onChangeText={(email) => this.setState({ email })}
                clearButtonMode='always' keyboardType='email-address'
              />

              <TextInput style={[styles.inputCode, {borderBottomColor : 'white', color : 'white'}]} placeholder="Mot de passe" placeholderTextColor="white"
                secureTextEntry={true} value={this.state.password}
                onChangeText={(password) => this.setState({ password })} />

              <View style={{ flexDirection: 'row', justifyContent: 'center', alignSelf: 'center', marginTop: 10 }}>
                <TouchableOpacity style={[GlobalStyles.button,{
                  width : '80%',
                  borderColor : 'white', padding : 10
                },
                this.isErrorForm() ?
                  { backgroundColor: 'transparent' } : { backgroundColor: 'white' }]}
                  onPress={() => this.onLogin()} disabled={this.state.email == '' || this.state.password == ''} >
                  {this.state.isLoading ? <ActivityIndicator color={ApiUtils.getBackgroundColor()}></ActivityIndicator>
                    : <Text style={{ textAlign: 'center', fontWeight: 'bold', color :  this.isErrorForm() ? 'white' : ApiUtils.getBackgroundColor() }}>CONNEXION</Text>}
                </TouchableOpacity>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-evenly', width : '80%', marginTop : 20 }}>
              <TouchableOpacity
                  style={[GlobalStyles.button, {marginTop: 10, borderColor : 'white', opacity : 0.5}]}
                  onPress={() => this.createAccountOld()}>
                  <Text style={{color : 'white', fontSize : 12}}>Créer un compte</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[GlobalStyles.button, {marginTop: 10, borderColor : 'white', opacity : 0.5}]}
                  onPress={() => this.forgotPassword()}>
                  <Text style={{color : 'white', fontSize : 12}}>Mot de passe oublié</Text>
                </TouchableOpacity>
         
              </View>

       

              {/* {ApiUtils.ISDEBUG() ? (
                <Text style={styles.versionInfo}>
                  Debug version {ApiUtils.VersionNumber()}
                </Text>
              ) : ApiUtils.ISDEMO() ? (
                <Text style={styles.versionInfo}>
                  Demo version {ApiUtils.VersionNumber()}
                </Text>
              ) : (
                <Text style={styles.versionInfo}>
                  V{ApiUtils.VersionNumber()}
                </Text>
              )} */}
            </View>

            {/* <Border animation="fadeInLeft" delay={200} position='left' mode="up"
              style={{ alignSelf: 'left', position: 'abolute', top: 0 }} /> */}
          </KeyboardAvoidingView>

          <KeyboardAvoidingView
            style={styles.followCodeLoginSection}>

              <Text>FOULEE CODE</Text>
          <TextInput
                style={styles.inputCode}
                placeholder="Entrez votre Foulée code"
                placeholderTextColor="black"
                value={this.state.followCode}
                onChangeText={followCode =>
                  this.setState({followCode: followCode})
                }
                clearButtonMode="always"
              />

              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'center',
                  alignSelf: 'center',
                }}>
                <TouchableOpacity
                  full
                  style={[
                    GlobalStyles.button,
                    {
                      width: '80%',
                      elevation: 0,
                      borderColor:   this.state.followCode == '' ? 'black' : ApiUtils.getBackgroundColor(),
                      borderWidth: 1,
                      padding: 10,
                    },

                    this.state.followCode == ''
                      ? {backgroundColor: 'transparent'}
                      : {backgroundColor: ApiUtils.getBackgroundColor()},
                  ]}
                  onPress={() => this.onClickSendFollowCode()}
                  disabled={this.state.followCode == ''}>
                  <Text
                    style={{
                      textAlign: 'center',
                      color:
                        this.state.followCode == ''
                          ? 'black'
                          : 'white',
                    }}>
                    CONNEXION
                  </Text>
                </TouchableOpacity>
              </View>


          </KeyboardAvoidingView>

          <Modal
            visible={this.state.isModalJetcodeVisible}
            onRequestClose={() => this.oncloseModal()}>
            <Header style={styles.header}>
              <Left>
                <Button
                  style={styles.drawerButton}
                  onPress={() => this.oncloseModal()}>
                  <Icon
                    style={styles.saveText}
                    name="chevron-left"
                    type="FontAwesome5"
                  />
                </Button>
              </Left>
              <Right />
            </Header>
            <WebviewJetCode uri={'https://google.com'} />
          </Modal>
        </Content>
        <SafeAreaView style={{flex: 0, backgroundColor: '#DADADA'}} />
      </Container>
    );
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
    marginTop: Platform.OS == 'ios' ? 20 : 20,
    marginBottom: 20,
  },
  loginButtonSection: {
    width: '100%',
    // justifyContent: 'center',

    paddingBottom: 30,
    borderBottomLeftRadius: 100,
  },
  followCodeLoginSection: {
    backgroundColor: 'white',
    width: '100%',
    height: '100%',
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
});

export default connect(mapStateToProps)(Home);
