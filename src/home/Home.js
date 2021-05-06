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
  Image,
  ImageBackground,
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
import DeviceInfo from 'react-native-device-info';
import Logobg from '../assets/logobg.png';
import ApiUtils from '../ApiUtils';
import Logo from '../assets/logo.png';
import Loading from './Loading';
import {Modal} from 'react-native';
import WebviewJetCode from './WebviewJetCode';
import GlobalStyles from '../styles';
import {Sponsors} from './Sponsors';
import VersionCheck from 'react-native-version-check';
import moment from 'moment';

import {
  TemplateBackgroundColor,
  TemplateExpirationDate,
  TemplateIdOrganisation,
  TemplateIsPaying,
  textAutoBackgroundColor,
  textAutoSecondColor,
} from '../globalsModifs';

const mapStateToProps = (state) => {
  return {
    userData: state.userData,
    folocodes: state.folocodes,
  };
};

class Home extends Component {
  constructor(props) {
    super(props);

    this.state = {
      followCode: '',
      email: '',
      password: '',
      isLoading: false,
      isModalJetcodeVisible: false,
      selectedFolocode: -1,
      isVisibleModalLogin: false,
    };

    this._unsubscribe = this.props.navigation.addListener(
      'focus',
      (payload) => {
        this.componentDidMount();
      },
    );
  }

  getPhoneData() {
    let brand = DeviceInfo.getBrand();

    let androidId = DeviceInfo.getAndroidIdSync();
    let systemVersion = DeviceInfo.getSystemVersion();
    let deviceId = DeviceInfo.getDeviceId();

    let device = DeviceInfo.getDeviceSync();

    let model = DeviceInfo.getModel();

    let manufacturer = DeviceInfo.getManufacturerSync();
    let hardware = DeviceInfo.getHardwareSync();
    let apiLevel = DeviceInfo.getApiLevelSync();

    let data = {
      brand: brand,
      androidId: androidId,
      systemVersion: systemVersion,
      deviceId: deviceId,
      device: device,
      model: model,
      manufacturer: manufacturer,
      hardware: hardware,
      apiLevel: apiLevel,
    };

    var action = {type: 'UPDATE_PHONE_DATA', data: data};
    this.props.dispatch(action);
  }

  componentDidMount() {
    this.getPhoneData();

    // #stop BackroundGeolocation and remove-listeners when Home Screen is rendered.
    this.setState({selectedFolocode: -1});
    if (ApiUtils.isExpired()) {
      this.onClickNavigate('IsExpired');
      return;
    }
    if (this.props.userData != null) {
      if (TemplateIsPaying) {
        if (ApiUtils.hasPaid(this.props.userData)) {
          this.onClickNavigate('SimpleMap');
        } else {
          this.onClickNavigate('Paiement');
        }
      } else {
        this.onClickNavigate('SimpleMap');
      }
    } else {
      BackgroundGeolocation.stop();
      BackgroundGeolocation.removeListeners();
    }

    setTimeout(() => this.checkIsConnected(), 200);
    this.getinformationStation();
  }

  checkIsConnected = () => {
    if (this.props.userData != null) {
      if (TemplateIsPaying) {
        if (ApiUtils.hasPaid(this.props.userData)) {
          this.onClickNavigate('SimpleMap');
        } else {
          this.onClickNavigate('Paiement');
        }
      } else {
        this.onClickNavigate('SimpleMap');
      }
    }
  };

  onClickNavigate(routeName) {
    this.props.navigation.navigate(routeName);
  }

  openLink(url) {
    Linking.canOpenURL(url).then((supported) => {
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
      .then((response) => response.json())
      .then((responseJson) => {
        //save values in cache
        if (responseJson.codeErreur == 'SUCCESS') {
          //SaveData
          this.setState({email: '', password: ''});

          var action = {type: 'LOGIN', data: responseJson};
          this.props.dispatch(action);
          this.setState({isLoading: false});

          if (TemplateIsPaying) {
            if (ApiUtils.hasPaid(responseJson)) {
              this.onClickNavigate('Introduction');
            } else {
              this.onClickNavigate('Paiement');
            }
          } else {
            this.onClickNavigate('Introduction');
          }

          // ApiUtils.setLogged().then(this.saveUserInfo(responseJson, false));
        } else {
          alert(responseJson.message);
          this.setState({isLoading: false});
        }
      })
      .catch((e) => {
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
      formData.append('organisation', ApiUtils.getOrganisation());

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
        .then((response) => response.json())
        .then((responseJson) => {
          // alert("success http");
          //save values in cache

          if (responseJson.codeErreur == 'SUCCESS') {
            //SaveData

            var action = {type: 'LOGIN', data: responseJson};

            this.props.dispatch(action);
            this.setState({isLoading: false});

            if (TemplateIsPaying) {
              if (ApiUtils.hasPaid(responseJson)) {
                this.onClickNavigate('Introduction');
              } else {
                this.onClickNavigate('Paiement');
              }
            } else {
              this.onClickNavigate('Introduction');
            }
          } else {
            alert("Votre folocode n'est pas valide");
          }
        })
        .catch((e) => {
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
    this.logo.animate('bounce', 1000);
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
    formData.append('idStation', TemplateIdOrganisation);
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
      .then((response) => response.json())
      .then((responseJson) => {
        //save values in cache

        var result = responseJson;

        if (result.traces != null && result.traces.length != 0) {
          this.setState({nomStation: result.nomStation});

          this.setState({descriptionStation: result.descriptionStation});
          var tracesArray = Object.values(result.traces);

          var finalTraceArray = []; // new Object(this.props.polylines);
          if ((tracesArray != null) & (tracesArray.length != 0)) {
            tracesArray.forEach((trace) => {
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

          //challenges

          var challengesArray = Object.values(result.challenges);

          var finalChallengesArray = []; // new Object(this.props.polylines);

          if (challengesArray != null && challengesArray.length != 0) {
            challengesArray.forEach((challenge) => {
              var finalChallenge = challenge;

              var positionArray = Object.values(challenge.positionsTrace);
              challenge.positionsTrace = positionArray;

              finalChallenge = {
                isActive : true,
                positionsTrace: positionArray,
                idChallenge: finalChallenge.idChallenge,
                libelleChallenge: finalChallenge.libelleChallenge,
                distanceChallenge: finalChallenge.distanceChallenge,
                gpxChallenge: finalChallenge.gpxChallenge,
                dateDebutChallenge: finalChallenge.dateDebutChallenge,
                dateFinChallenge: finalChallenge.dateFinChallenge,
              };

              finalChallengesArray.push(finalChallenge);
            });
          }

          if (
            result.pointsInterets != null &&
            result.pointsInterets.length != 0
          ) {
            var finalinterestArray = [];
            var interestArray = Object.values(result.pointsInterets);
            var count = 0;
            interestArray.forEach((interest) => {
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
            challenges: finalChallengesArray,
          };

          var action = {type: 'UPDATE_STATION_DATA', data: station};
          this.props.dispatch(action);
        }
      })
      .catch((e) => console.log(e.message))
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
                <ImageBackground style={{width: '100%', minHeight: 10}}    source={Logobg}>
                  <TouchableHighlight
                    underlayColor="transparent"
                    onPress={() => this.pressLogo()}
                    style={styles.logo}>
                    <Animated.View
                      ref={(ref) => {
                        this.logo = ref;
                      }}
                      style={[GlobalStyles.row, {justifyContent: 'center'}]}
                      animation="bounceInDown"
                      delay={300}>
                      <Image
                        resizeMode="contain"
                        source={Logo}
                        style={{
                          height: 200,
                          width: 200,
                        }}
                      />
                    </Animated.View>
                  </TouchableHighlight>
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
                          borderColor: textAutoBackgroundColor,
                          opacity: 1,
                          width: '80%',
                          padding: 10,
                        },
                      ]}
                      onPress={() => this.createAccountOld()}>
                      <Text
                        style={{
                          textAlign: 'center',
                          fontWeight: 'bold',
                          color: textAutoBackgroundColor,
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
                          borderColor: textAutoBackgroundColor,
                          opacity: 1,
                          width: '80%',
                          padding: 10,
                          backgroundColor: textAutoBackgroundColor,
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
                        Je me connecte
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
                          borderColor: textAutoBackgroundColor,
                          opacity: 1,
                          width: '80%',
                          borderColor: textAutoBackgroundColor,
                          padding: 2,
                        },
                      ]}
                      onPress={() => this.forgotPassword()}>
                      <Text
                        style={{
                          textAlign: 'center',
                          textDecorationLine: 'underline',
                          color: textAutoBackgroundColor,
                          textTransform: 'uppercase',
                        }}>
                        J'ai oublié mon code ?
                      </Text>
                    </TouchableOpacity>
                  </View>

                  <Text
                    style={[
                      {
                        color: textAutoBackgroundColor,
                        textAlign: 'center',
                        fontSize: 13,
                        marginTop: 30,
                      },
                    ]}>
                    Version V {VersionCheck.getCurrentVersion()}
                  </Text>
                  {/* <Text
                    style={[
                      {
                        color: textAutoBackgroundColor,
                        textAlign: 'center',
                        fontSize: 13,
                        marginTop: 5,
                      },
                    ]}>
                    Expiration le{' '}
                    {moment(TemplateExpirationDate.toISOString()).format(
                      'DD/MM/YYYY',
                    )}
                  </Text> */}
                  <View style={{paddingBottom : 100}}></View>
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
                <Body>
                  <Image
                    resizeMode="contain"
                    source={Logo}
                    style={styles.logoHeader}
                  />
                </Body>
                <Right></Right>
              </Header>

              <KeyboardAvoidingView style={styles.followCodeLoginSection}>
                <Text
                  style={{
                    fontWeight: 'bold',
                    textTransform: 'uppercase',
                    textAlign: 'center',
                    marginTop: 30,
                    color: 'black',
                  }}>
                  Vous avez déjà un compte ?
                </Text>

                {this.props.folocodes?.length > 0 ? (
                  <View>
                    <Picker
                      style={{width: 300, height: 100}}
                      mode="dropdown"
                      accessibilityLabel={'Choisir le Code'}
                      iosHeader={'Choisir le Code'}
                      iosIcon={<Icon name="chevron-down" type="FontAwesome5" />}
                      selectedValue={this.state.selectedFolocode}
                      onValueChange={this.onValueFolocodeChange.bind(this)}
                      placeholder={'Choisissez le Code'}
                      placeholderStyle={{
                        color: 'black'
                      }}
                      placeholderIconColor={'black'}
                      textStyle={{color: 'black'}}
                      itemStyle={{
                        color: 'black',
                        marginLeft: 0,
                        paddingLeft: 10,
                        borderBottomColor: 'black',
                        borderBottomWidth: 1,
                      }}
                      itemTextStyle={{
                        color:'black',
                        borderBottomColor: 'black',
                        borderBottomWidth: 1,
                      }}>
                      <Picker.Item label="Choisissez le Code" value={-1} />
                      {this.props.folocodes.map((folocode) => {
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

                <View
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'center',
                  }}>
                  <TextInput
                    style={styles.inputCode}
                    placeholder="Entrez votre code"
                    placeholderTextColor="black"
                    value={this.state.followCode}
                    onChangeText={(followCode) =>
                      this.setState({followCode: followCode})
                    }
                    clearButtonMode="always"
                  />
                </View>

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
                        borderColor: 'black',
                        borderWidth: 1,
                        padding: 10,
                      },

                      this.state.followCode == '' &&
                      this.state.selectedFolocode == -1
                        ? {backgroundColor: 'transparent'}
                        : {backgroundColor: TemplateBackgroundColor},
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
                            : textAutoSecondColor == '#000000' ? 'white' : textAutoSecondColor,
                      }}>
                      CONNEXION
                    </Text>
                  </TouchableOpacity>
                </View>

                <View style={{marginBottom: 0}} />
              </KeyboardAvoidingView>

              <View style={{position: 'absolute', bottom: 0}}>
                <Sponsors />
              </View>
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
        </Container>
      </Root>
    );
  }
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: 'white',
    //backgroundColor: ApiUtils.getBackgroundColor(),
    width: '100%',
  },
  title: {
    color: '#000',
  },
  text: {
    fontFamily: 'Roboto',
  },
  logo: {
    width: '70%',
    height: 100,
    alignSelf: 'center',
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
    // flex: 1,
    backgroundColor: 'white',
    width: '100%',
    // height: '100%',
    //alignItems: 'center',
    paddingTop: 30,
    // paddingBottom: 200,
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

export default connect(mapStateToProps)(Home);
