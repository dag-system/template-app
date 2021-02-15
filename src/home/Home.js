import React, {Component} from 'react';
import {
  Platform,
  StyleSheet,
  Linking,
  View,
  TextInput,
  SafeAreaView,
  TouchableHighlight,
  TouchableOpacity,
  KeyboardAvoidingView,
  ActivityIndicator,
  Image,
  ImageBackground,
  StatusBar,
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
  Picker,
  Toast,
  Root,
  Body,
} from 'native-base';
import * as Animated from 'react-native-animatable';
import md5 from 'md5';
import BackgroundGeolocation from 'react-native-background-geolocation';
import {connect} from 'react-redux';

import ApiUtils from '../ApiUtils';
// import Logo from '../assets/logoHome.svg';
import Logo from '../assets/logoHome.svg';
import LogoHeader from '../assets/logo_header.png';
import skieur from '../assets/skieur.png';
import Titre from '../assets/titre.svg';
import Autrans from '../assets/autrans.svg';
import Loading from './Loading';
import {Modal} from 'react-native';
import WebviewJetCode from './WebviewJetCode';
import GlobalStyles from '../styles';
import {Sponsors} from './Sponsors';

const mapStateToProps = state => {
  return {
    userData: state.userData,
    folocodes: state.folocodes,
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
      selectedFolocode: -1,
      isVisibleModalLogin: false,
    };

    this._unsubscribe = this.props.navigation.addListener('focus', payload => {
      this.componentDidMount();
    });
  }

  componentDidMount() {
    // #stop BackroundGeolocation and remove-listeners when Home Screen is rendered.
    this.setState({selectedFolocode: -1});
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
  };

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
    formData.append('organisation', ApiUtils.getOrganisation());
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
        console.log(e);
        ApiUtils.logError('login', JSON.stringify(e.message));
        // alert('Une erreur est survenue : ' + JSON.stringify(e.message));

        if (e.message == 'Timeout' || e.message == 'Network request failed') {
          this.setState({noConnection: true});

          Toast.show({
            text: "Vous n'avez pas de connection internet, merci de réessayer",
            buttonText: 'Ok',
            type: 'danger',
            position: 'bottom',
            duration: 5000,
          });
        }
      });
  }

  onClickSendFollowCode() {
    if (this.state.followCode != '' || this.state.selectedFolocode != -1) {
      let formData = new FormData();
      formData.append('method', 'getInformationsUtilisateur');
      formData.append('auth', ApiUtils.getAPIAuth());

      if (this.state.selectedFolocode != -1) {
        formData.append('folocode', this.state.selectedFolocode);
      } else {
        formData.append('folocode', this.state.followCode);
      }

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
        .catch(e => {
          this.setState({isLoading: false});
          console.log(e);
          ApiUtils.logError('login', JSON.stringify(e.message));
          // alert('Une erreur est survenue : ' + JSON.stringify(e.message));

          if (e.message == 'Timeout' || e.message == 'Network request failed') {
            this.setState({noConnection: true});

            Toast.show({
              text:
                "Vous n'avez pas de connection internet, merci de réessayer",
              buttonText: 'Ok',
              type: 'danger',
              position: 'bottom',
              duration: 5000,
            });
          }
        });
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

  openModalLogin() {
    this.setState({isVisibleModalLogin: true});
  }

  oncloseModalLogin = () => {
    this.setState({isVisibleModalLogin: false});
  };

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

  onValueFolocodeChange(value) {
    this.setState({
      selectedFolocode: value,
    });
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

          if (
            result.pointsInterets != null &&
            result.pointsInterets.length != 0
          ) {
            var finalinterestArray = [];
            var interestArray = Object.values(result.pointsInterets);
            var count = 0;
            interestArray.forEach(interest => {
              var coordinate = {
                latitude: parseFloat(interest.latitudeInteret),
                longitude: parseFloat(interest.longitudeInteret),
              };

              var finalInterest = {
                id: 'interest' + count,
                idInteret: interest.idInteret,
                idStation: interest.idStation,
                coordinates: coordinate,
                libelleInteret: interest.libelleInteret,
                couleurTrace: interest.couleurTrace,
                descriptionInteret: interest.descriptionInteret,
                telephoneInteret: interest.telephoneInteret,
                lienInteret: interest.lienInteret,
                photoInteret: interest.photoInteret,
              };

              if (
                finalInterest.descriptionInteret == null &&
                interest.externalData != null
              ) {
                var extraData = JSON.parse(interest.externalData);
                if (
                  extraData.hasDescription.length > 0 &&
                  extraData.hasDescription[0] != null
                ) {
                  if (
                    extraData.hasDescription[0].shortDescription != null &&
                    extraData.hasDescription[0].shortDescription.length > 1
                  ) {
                    finalData.description =
                      extraData.hasDescription[0].shortDescription[1];
                  } else {
                    finalData.description =
                      extraData.hasDescription[0].shortDescription[0];
                  }
                }
              }
              if (interest.actifInteret == '1') {
                finalinterestArray.push(finalInterest);
                count++;
              }
            });
            this.setState({pointsInterets: finalinterestArray});
          }

          var station = {
            nomStation: result.nomStation,
            descriptionStation: result.descriptionStation,
            polylines: finalTraceArray,
            pointsInterets: finalinterestArray,
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
      <Root>
        <Container style={{backgroundColor: ApiUtils.getBackgroundColor()}}>
          <SafeAreaView
            style={{backgroundColor: ApiUtils.getBackgroundColor()}}
          />

          <Content style={[styles.body]} scrollEnabled={true}>
            <KeyboardAvoidingView style={styles.loginButtonSection}>
              <View
                style={{
                  zIndex: 10,
                  alignItems: 'center',
                  backgroundColor: ApiUtils.getBackgroundColor(),
                }}>
                <ImageBackground
                  source={skieur}
                  style={{width: '100%', minHeight: 10}}>
                  <TouchableHighlight
                    underlayColor="transparent"
                    onPress={() => this.pressLogo()}
                    style={styles.logo}>
                    <Animated.View
                      ref={ref => {
                        this.logo = ref;
                      }}
                      style={[GlobalStyles.row, {justifyContent: 'center'}]}
                      animation="bounceInDown"
                      delay={300}>
                      <View style={{width : '30%'}}></View>
                      <Logo
                        width={'70%'}
                        height={120}
                        style={{alignSelf: 'center'}}
                      />
                      <Autrans
                        width={'30%'}
                        height={70}
                        style={{alignSelf: 'center', opacity: 1}}
                      />
                    </Animated.View>
                  </TouchableHighlight>
                  <Animated.View animation="bounceInLeft" delay={200} style={{marginTop : 0}}>
                    <Titre
                      width={'55%'}
                      height={140}
                      style={{alignSelf: 'center'}}
                    />
                  </Animated.View>

                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-evenly',
                      width: '100%',
                      marginTop: 20,
                    }}>
                    <TouchableOpacity
                      style={[
                        GlobalStyles.button,
                        {
                          marginTop: 0,
                          borderColor: 'white',
                          opacity: 1,
                          width: '80%',
                          borderColor: 'white',
                          padding: 10,
                        },
                      ]}
                      onPress={() => this.createAccountOld()}>
                      <Text
                        style={{
                          textAlign: 'center',
                          fontWeight: 'bold',
                          color: 'white',
                          textTransform: 'uppercase',
                        }}>
                        Créer un compte
                      </Text>
                    </TouchableOpacity>
                  </View>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-evenly',
                      width: '100%',
                      marginTop: 20,
                    }}>
                    <TouchableOpacity
                      style={[
                        GlobalStyles.button,
                        {
                          marginTop: 10,
                          borderColor: 'white',
                          opacity: 1,
                          width: '80%',
                          borderColor: 'white',
                          padding: 10,
                          backgroundColor : 'white'
                        },
                      ]}
                      onPress={() => this.openModalLogin()}>
                      <Text
                        style={{
                          textAlign: 'center',
                          fontWeight: 'bold',
                          color: ApiUtils.getBackgroundColor(),
                          textTransform: 'uppercase',
                        }}>
                        J'ai déjà un compte
                      </Text>
                    </TouchableOpacity>
                  </View>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-evenly',
                      width: '100%',
                      marginTop: 2,
                    }}>
                    <TouchableOpacity
                      style={[
                        {
                          marginTop: 10,
                          borderColor: 'white',
                          opacity: 1,
                          width: '80%',
                          borderColor: 'white',
                          padding: 2,
                        },
                      ]}
                      onPress={() => this.forgotPassword()}>
                      <Text
                        style={{
                          textAlign: 'center',
                          textDecorationLine: 'underline',
                          color: 'white',
                          textTransform: 'uppercase',
                        }}>
                        J'ai oublié mon foulée code ?
                      </Text>
                    </TouchableOpacity>
                  </View>
                </ImageBackground>
              </View>
            </KeyboardAvoidingView>

            <Modal
              visible={this.state.isVisibleModalLogin}
              onRequestClose={() => this.oncloseModalLogin()}>
              <Header style={styles.header}>
                <Left>
                  <Button
                    style={styles.drawerButton}
                    onPress={() => this.oncloseModalLogin()}>
                    <Icon
                      style={styles.saveText}
                      name="chevron-left"
                      type="FontAwesome5"
                    />
                  </Button>
                </Left>
                <Body style={{flex: 0}} />
                <Right style={{flex: 1}}>
                  <Image
                    resizeMode="contain"
                    source={LogoHeader}
                    style={styles.logoHeader}
                  />
                </Right>
              </Header>

              <KeyboardAvoidingView style={styles.followCodeLoginSection}>
                <Text
                  style={{
                    fontWeight: 'bold',
                    textTransform: 'uppercase',
                    textAlign: 'center',
                    marginTop : 30,
                    color: ApiUtils.getBackgroundColor(),
                  }}>
                  Vous avez déjà un compte ?
                </Text>

                {this.props.folocodes?.length > 0 ? (
                  <View style={{flex: 1}}>
                    <Picker
                      style={{width: 300}}
                      mode="dropdown"
                      accessibilityLabel={'Choisir le Foulée Code'}
                      iosHeader={'Choisir le Foulée Code'}
                      iosIcon={<Icon name="chevron-down" type="FontAwesome5" />}
                      selectedValue={this.state.selectedFolocode}
                      onValueChange={this.onValueFolocodeChange.bind(this)}
                      placeholder={'Choisissez le Foulée Code'}
                      placeholderStyle={{
                        color: ApiUtils.getBackgroundColor(),
                      }}
                      placeholderIconColor={ApiUtils.getBackgroundColor()}
                      textStyle={{color: ApiUtils.getBackgroundColor()}}
                      itemStyle={{
                        color: ApiUtils.getBackgroundColor(),
                        marginLeft: 0,
                        paddingLeft: 10,
                        borderBottomColor: ApiUtils.getBackgroundColor(),
                        borderBottomWidth: 1,
                      }}
                      itemTextStyle={{
                        color: ApiUtils.getBackgroundColor(),
                        borderBottomColor: ApiUtils.getBackgroundColor(),
                        borderBottomWidth: 1,
                      }}>
                      <Picker.Item
                        label="Choisissez le Foulée Code"
                        value={-1}
                      />
                      {this.props.folocodes.map(folocode => {
                        return (
                          <Picker.Item
                            label={
                              folocode.folocode +
                              ' ' +
                              folocode.prenom +
                              ' ' +
                              folocode.nom
                            }
                            value={folocode.folocode}
                          />
                        );
                      })}
                    </Picker>
                  </View>
                ) : null}

                {this.props.folocodes?.length > 0 ? (
                  <Text style={{textAlign: 'center'}}>ou </Text>
                ) : null}

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
                        borderColor:
                          this.state.followCode == '' &&
                          this.state.selectedFolocode == -1
                            ? 'black'
                            : ApiUtils.getBackgroundColor(),
                        borderWidth: 1,
                        padding: 10,
                      },

                      this.state.followCode == '' &&
                      this.state.selectedFolocode == -1
                        ? {backgroundColor: 'transparent'}
                        : {backgroundColor: ApiUtils.getBackgroundColor()},
                    ]}
                    onPress={() => this.onClickSendFollowCode()}
                    disabled={
                      this.state.followCode == '' &&
                      this.state.selectedFolocode == -1
                    }>
                    <Text
                      style={{
                        fontWeight: 'bold',
                        textAlign: 'center',
                        color:
                          this.state.followCode == '' &&
                          this.state.selectedFolocode == -1
                            ? 'black'
                            : 'white',
                      }}>
                      CONNEXION
                    </Text>
                  </TouchableOpacity>
                </View>

                <View style={{marginBottom: 0}} />
              </KeyboardAvoidingView>
              <Sponsors />
            </Modal>

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
          <View style={{backgroundColor: 'white'}}>
            <Animated.View animation="bounceInUp" delay={200}>
              <Sponsors />
            </Animated.View>
          </View>

          {/* <SafeAreaView style={{flex: 0, backgroundColor: '#DADADA'}} /> */}
        </Container>
      </Root>
    );
  }
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: 'white',
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
    marginTop: 20,
    marginBottom: 30,
  },
  loginButtonSection: {
    width: '100%',
    // justifyContent: 'center',

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
    color: 'black',
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
    alignSelf: 'center',
  },
});

export default connect(mapStateToProps)(Home);
