import React, {Component} from 'react';
import {StyleSheet, View, Switch, TouchableOpacity} from 'react-native';
import {
  Container,
  Header,
  Body,
  Text,
  DatePicker,
  Button,
  Toast,
  Form,
  Item,
  Input,
  Label,
  Root,
  Spinner,
  Drawer,
  Content,
  Radio,
  Left,
  Right,
  Picker,
  Icon,
} from 'native-base';
import GlobalStyles from '../styles';
import md5 from 'md5';
import ApiUtils from '../ApiUtils';
import ErrorMessage from './ErrorMessage';
import {connect} from 'react-redux';
import Sidebar from './SideBar';
import moment from 'moment';
import {Platform} from 'react-native';
import {Dimensions} from 'react-native';
import VersionCheck from 'react-native-version-check';

import {
  TemplateNameAsk,
  TemplateFirstNameAsk,
  TemplateSexeAsk,
  TemplateDdnAsk,
  TemplateMailAsk,
  TemplateTelAsk,
  TemplateAdressAsk,
  TemplatePostalAsk,
  TemplateCityAsk,
  TemplateCountryAsk,
  TemplateTelVerifAsk,
  TemplateChallengeClub,
  TemplateChallengeFamille,
  TemplateChallengeAutre,
  TemplateChallengeEntreprise,
  TemplateChallengeAutreName,
  IsDemo,
  textAutoBackgroundColor,
} from './../globalsModifs';

const mapStateToProps = (state) => {
  return {
    userData: state.userData,
    userClubs: state.userClubs,
  };
};

class Preferences extends Component {
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
      clubUniversite: '',
      clubEntreprise: '',
      clubFamille: '',
      unss: '',
      days: [
        '01',
        '02',
        '03',
        '04',
        '05',
        '06',
        '07',
        '08',
        '09',
        '10',
        '11',
        '12',
        '13',
        '14',
        '15',
        '16',
        '17',
        '18',
        '19',
        '20',
        '21',
        '22',
        '23',
        '24',
        '25',
        '26',
        '27',
        '28',
        '29',
        '30',
        '31',
      ],
      months: [
        'Janvier',
        'Fevrier',
        'Mars',
        'Avril',
        'Mai',
        'Juin',
        'Juillet',
        'Août',
        'Septembre',
        'Octobre',
        'Novembre',
        'Décembre',
      ],
      monthsString: [
        '01',
        '02',
        '03',
        '04',
        '05',
        '06',
        '07',
        '08',
        '09',
        '10',
        '11',
        '12',
      ],
      years: [],
      errorCNIL: false,
      isNameAsk: TemplateNameAsk,
      nomUtilisateur: '',
      isFirstNameAsk: TemplateFirstNameAsk,
      prenomUtilisateur: '',
      isSexeAsk: TemplateSexeAsk,
      sexeUtilisateur: '',
      isDdnAsk: TemplateDdnAsk,
      dayDdn:
        this.props.userData.ddnUtilisateur !== null
          ? this.props.userData.ddnUtilisateur.split('-')[2]
          : 1,
      monthDdn:
        this.props.userData.ddnUtilisateur !== null
          ? this.props.userData.ddnUtilisateur.split('-')[1]
          : 1,
      yearDdn:
        this.props.userData.ddnUtilisateur !== null
          ? this.props.userData.ddnUtilisateur.split('-')[0]
          : 1980,
      isMailAsk: TemplateMailAsk,
      emailUtilisateur: '',
      isTelAsk: TemplateTelAsk,
      telUtilisateur: '',
      isAdressAsk: TemplateAdressAsk,
      adresseUtilisateur: '',
      isPostalAsk: TemplatePostalAsk,
      cpUtilisateur: '',
      isCityAsk: TemplateCityAsk,
      villeUtilisateur: '',
      isCountryAsk: TemplateCountryAsk,
      paysUtilisateur: '',
      isTelVerifAsked: TemplateTelVerifAsk,
      acceptChallengeTelUtilisateur: false,
      isChallengeEntrepriseAsk: TemplateChallengeEntreprise,
      clubEntreprise: '',
      isChallengeClubAsk: TemplateChallengeClub,
      clubClub: '',
      isChallengeFamilleAsk: TemplateChallengeFamille,
      clubFamille: '',
      isChallengeAutreAsk: TemplateChallengeAutre,
      clubAutre: '',
      acceptChallengeNameUtilisateur: false,
      acceptChallengeUtilisateur: false,
    };
  }

  componentDidMount() {
    setTimeout(() => this.didMount(), 300);

    console.log(this.props.userData);
  }

  didMount() {
    let yearsAll = [];
    for (let i = 1930; i <= new Date().getFullYear() - 3; i++) {
      yearsAll.push(i.toString());
    }
    this.setState({years: yearsAll});

    //  this.getInformations();
    this.setState({userdata: this.props.userData});
    if (this.props.userData.clubUtilisateur == 'NULL') {
      this.props.userData.clubUtilisateur = '';
    }

    if (this.props.userData.villeUtilisateur == 'NULL') {
      this.props.userData.villeUtilisateur = '';
    }
  }

  setClubs(clubs) {
    if (clubs != null) {
      clubs.forEach((c) => {
        if (c.typeClub == 'Entreprise') {
          this.setState({clubEntreprise: c.nom});
        }

        if (c.typeClub == 'Famille') {
          this.setState({clubFamille: c.nom});
        }

        if (c.typeClub == 'Ecole') {
          this.setState({clubUniversite: c.nom});
        }
      });
    }
  }

  fillDate() {
    if (this.props.userData.ddnUtilisateur != '0000-00-00') {
      this.setState({showDefaultDdn: true});

      console.log(this.props.userData.ddnUtilisateur);
      if (this.props.userData.ddnUtilisateur != null) {
        var day = moment(this.props.userData.ddnUtilisateur).format('DD');
        this.onValueDayddn(day);

        var month = moment(this.props.userData.ddnUtilisateur).format('MM');
        this.onValueMonthddn(month);

        var year = moment(this.props.userData.ddnUtilisateur).format('YYYY');
        this.onValueYearddn(year);
      }
    } else {
      this.setState({showDefaultDdn: false});
    }
  }

  closeDrawer = () => {
    this.drawer._root.close();
  };

  onDrawer() {
    this.drawer._root.open();
  }

  ongoHome() {
    this.props.navigation.navigate('Home');
  }

  getClubs() {
    this.setState({isLoading: true});
    let formData = new FormData();
    formData.append('method', 'getClubs');
    formData.append('auth', ApiUtils.getAPIAuth());

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
        var action = {type: 'GET_CLUBS', data: responseJson};
        this.props.dispatch(action);

        this.setState({isLoading: false});
      })
      .catch((e) => {
        this.setState({isLoading: false});
        ApiUtils.logError('getCLUBS', e.message);
      })
      .then(() => this.setState({isLoading: false}));
  }

  isErrorForm() {
    var isError = false;
    var withPassword = false;
    if (this.state.userdata.nomUtilisateur == '') {
      isError = true;
    }

    if (this.state.userdata.prenomUtilisateur == '') {
      isError = true;
    }

    if (this.state.userdata.emailUtilisateur == '') {
      isError = true;
    }

    if (!this.validateEmail(this.state.userdata.emailUtilisateur)) {
      isError = true;
    }

    if (this.state.userdata.telUtilisateur == '') {
      isError = true;
    }

    return isError;
  }

  onClickValidate() {
    var isError = this.isErrorForm();
    var withPassword = false;

    if (!!this.state.newPassword && this.state.newPassword != '') {
      if (this.state.newPasswordConfirmation != this.state.newPassword) {
        isError = true;
      } else {
        withPassword = true;
      }
    }

    if (!isError) {
      this.onSendRequest(withPassword);
    }
  }

  validateEmail(email) {
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
  }

  getInitialState() {
    if (this.state.userdata.sexeUtilisateur == 'H') {
      return 0;
    } else if (this.state.userdata.sexeUtilisateur == 'F') {
      return 1;
    } else {
      return '';
    }
  }

  getInformations() {
    // this.setState({isLoading: true});
    let formData = new FormData();
    formData.append('method', 'getInformationsUtilisateur');
    formData.append('organisation', ApiUtils.getOrganisation());
    formData.append('auth', ApiUtils.getAPIAuth());
    formData.append('idUtilisateur', this.props.userData.idUtilisateur);

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
        } else {
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

  onSendRequest(withPassword) {
    this.setState({isLoading: true});
    let formData = new FormData();
    formData.append('method', 'updateUtilisateur2');
    formData.append('auth', ApiUtils.getAPIAuth());
    formData.append('idUtilisateur', this.state.userdata.idUtilisateur);

    formData.append('nomUtilisateur', this.state.userdata.nomUtilisateur);
    formData.append('prenomUtilisateur', this.state.userdata.prenomUtilisateur);
    formData.append('emailUtilisateur', this.state.userdata.emailUtilisateur);
    formData.append('sexeUtilisateur', this.state.userdata.sexeUtilisateur);
    formData.append('telUtilisateur', this.state.userdata.telUtilisateur);
    formData.append('cpUtilisateur', this.state.userdata.cpUtilisateur);
    formData.append('villeUtilisateur', this.state.userdata.villeUtilisateur);
    formData.append('paysUtilisateur', this.state.userdata.paysUtilisateur);
    formData.append(
      'adresseUtilisateur',
      this.state.userdata.adresseUtilisateur,
    );
    formData.append('telUtilisateur', this.state.userdata.telUtilisateur);
    formData.append('organisation', ApiUtils.getOrganisation());

    if (
      this.state.yearDdn != undefined &&
      this.state.monthDdn != undefined &&
      this.state.dayDdn != undefined
    ) {
      formData.append(
        'ddnUtilisateur',
        this.state.yearDdn +
          '-' +
          this.state.monthDdn +
          '-' +
          this.state.dayDdn,
      );
    }

    var acceptChallengeTelUtilisateur = 0;
    if (this.state.userdata.acceptChallengeTelUtilisateur) {
      acceptChallengeTelUtilisateur = 1;
    }

    formData.append(
      'acceptChallengeTelUtilisateur',
      acceptChallengeTelUtilisateur,
    );
    var acceptChallengeNameUtilisateur = 0;
    if (this.state.userdata.acceptChallengeNameUtilisateur) {
      acceptChallengeNameUtilisateur = 1;
    }

    formData.append(
      'acceptChallengeNameUtilisateur',
      acceptChallengeNameUtilisateur,
    );

    fetch(ApiUtils.getAPIUrl(), {
      method: 'POST',
      headers: {},
      body: formData,
    })
      .then(ApiUtils.checkStatus)
      .then((response) => response.json())
      .then((responseJson) => {
        if (responseJson.codeErreur == 'SUCCESS') {
          this.setState({isLoading: false});

          var action = {type: 'LOGIN', data: responseJson};
          this.props.dispatch(action);

          Toast.show({
            text: 'Les données sont bien sauvegardées !',
            buttonText: '',
            duration: 1500,
            type: 'success',
            position: 'top',
          });
        } else {
          Toast.show({
            text: responseJson.message,
            buttonText: '',
            duration: 1500,
            type: 'danger',
            position: 'top',
          });
        }
        this.setState({isLoading: false});
      })

      .catch((e) => {
        this.setState({isLoading: false});
        ApiUtils.logError(
          'Preferences onSendRequest',
          JSON.stringify(e.message),
        );
        // alert('Une erreur est survenue : ' + JSON.stringify(e.message));
        console.log(e);
        if (e.message == 'Timeout' || e.message == 'Network request failed') {
          this.setState({noConnection: true});

          Toast.show({
            text: "Vous n'avez pas de connection internet, merci de réessayer",
            buttonText: 'Ok',
            type: 'danger',
            position: 'bottom',
            duration: 5000,
          });
        } else {
          Toast.show({
            text: e.message,
            buttonText: '',
            duration: 1500,
            type: 'danger',
            position: 'top',
          });
        }
      });
  }

  onValueDayddn(value) {
    this.setState({dayDdn: value});
  }

  onValueMonthddn(value) {
    this.setState({monthDdn: value});
  }

  onValueYearddn(value) {
    this.setState({yearDdn: value});
  }

  hasClub(type) {
    if (this.props.userClubs != null) {
      let values = this.props.userClubs.filter((c) => c.typeClub == type);
      if (values.length > 0) {
        if (type == 'Entreprise') {
          // this.setState({clubEntreprise : values[0].name});
        }

        return true;
      }
      return false;
    } else {
      return false;
    }
  }

  render() {
    return (
      <Drawer
        ref={(ref) => {
          this.drawer = ref;
        }}
        content={
          <Sidebar
            navigation={this.props.navigation}
            drawer={this.drawer}
            closeDrawer={this.closeDrawer}
            selected="Preferences"
          />
        }>
        <Container>
          <Header style={{backgroundColor: ApiUtils.getBackgroundColor()}}>
            <Left style={{flex: 1, width: '30%'}}>
              <TouchableOpacity
                style={{
                  backgroundColor: 'transparent',
                  width: '100%',
                  shadowOffset: {height: 0, width: 0},
                  shadowOpacity: 0,
                  elevation: 0,
                }}
                onPress={() => this.onDrawer()}>
                <Icon
                  style={{color: textAutoBackgroundColor}}
                  name="bars"
                  type="FontAwesome5"
                />
              </TouchableOpacity>
            </Left>
            <Right>
              {this.state.isLoading ? (
                <View
                  style={{
                    marginTop: 10,
                    marginBottom: 20,
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'row',
                    display: 'flex',
                  }}>
                  <Spinner color="black" />
                  <Text style={{marginLeft: 5}}>Enregistrement en cours</Text>
                </View>
              ) : (
                <Button
                  style={{
                    backgroundColor: 'transparent',
                    shadowOffset: {height: 0, width: 0},
                    shadowOpacity: 0,
                    elevation: 0,
                  }}
                  onPress={() => this.onClickValidate()}
                  disabled={this.isErrorForm()}>
                  <Text style={[{color: textAutoBackgroundColor}]}>
                    ENREGISTRER
                  </Text>
                </Button>
              )}
            </Right>
          </Header>
          <Content
            style={{
              padding: 10,
            }}>
            <Item stackedLabel>
              <Label>Nom *</Label>
              <Input
                returnKeyType="next"
                clearButtonMode="always"
                value={this.state.userdata.nomUtilisateur}
                onChangeText={(phoneNumber) =>
                  this.setState({
                    userdata: {
                      ...this.state.userdata,
                      nomUtilisateur: phoneNumber,
                    },
                  })
                }
              />
            </Item>
            <ErrorMessage
              value={this.state.userdata.nomUtilisateur}
              message="Le nom doit être renseigné"
            />

            <Item stackedLabel style={{marginBottom: 5}}>
              <Label>Prénom *</Label>
              <Input
                returnKeyType="next"
                clearButtonMode="always"
                value={this.state.userdata.prenomUtilisateur}
                onChangeText={(phoneNumber) =>
                  this.setState({
                    userdata: {
                      ...this.state.userdata,
                      prenomUtilisateur: phoneNumber,
                    },
                  })
                }
              />
            </Item>
            <ErrorMessage
              value={this.state.userdata.prenomUtilisateur}
              message="Le nom doit être renseigné"
            />

            <Item stackedLabel style={{marginBottom: 5}}>
              <Label>Email *</Label>
              <Input
                returnKeyType="next"
                clearButtonMode="always"
                textContentType="emailAddress"
                keyboardType="email-address"
                value={this.state.userdata.emailUtilisateur}
                onChangeText={(phoneNumber) =>
                  this.setState({
                    userdata: {
                      ...this.state.userdata,
                      emailUtilisateur: phoneNumber,
                    },
                  })
                }
              />
            </Item>
            <ErrorMessage
              value={this.state.userdata.emailUtilisateur}
              message="L'adresse email doit être renseignée"
            />
            {this.state.userdata.emailUtilisateur != '' &&
            !this.validateEmail(this.state.userdata.emailUtilisateur) ? (
              <ErrorMessage
                value={''}
                message="L'adresse email n'est pas valide"
              />
            ) : null}

            {this.state.isSexeAsk ? (
              <View style={{marginBottom: 15}}>
                <Text
                  style={{
                    marginTop: 5,
                    marginBottom: 10,
                    color: 'gray',
                    fontSize: 16,
                  }}>
                  Sexe
                </Text>

                <View
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    width: '100%',
                    justifyContent: 'space-between',
                    alignSelf: 'center',
                  }}>
                  <TouchableOpacity
                    style={{
                      display: 'flex',
                      flexDirection: 'row',
                      width: '30%',
                      justifyContent: 'space-around',
                    }}
                    onPress={() => {
                      this.setState({
                        userdata: {
                          ...this.state.userdata,
                          sexeUtilisateur: 'F',
                        },
                      });
                    }}>
                    <Text>Femme</Text>
                    <Radio
                      selected={this.state.userdata.sexeUtilisateur == 'F'}
                      onPress={() => {
                        this.setState({
                          userdata: {
                            ...this.state.userdata,
                            sexeUtilisateur: 'F',
                          },
                        });
                      }}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={{
                      display: 'flex',
                      flexDirection: 'row',
                      width: '30%',
                      justifyContent: 'space-around',
                    }}
                    onPress={() => {
                      this.setState({
                        userdata: {
                          ...this.state.userdata,
                          sexeUtilisateur: 'H',
                        },
                      });
                    }}>
                    <Text>Homme</Text>
                    <Radio
                      selected={this.state.userdata.sexeUtilisateur == 'H'}
                      onPress={() => {
                        this.setState({
                          userdata: {
                            ...this.state.userdata,
                            sexeUtilisateur: 'H',
                          },
                        });
                      }}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={{
                      display: 'flex',
                      flexDirection: 'row',
                      width: '30%',
                      justifyContent: 'space-around',
                    }}
                    onPress={() => {
                      this.setState({
                        userdata: {
                          ...this.state.userdata,
                          sexeUtilisateur: 'A',
                        },
                      });
                    }}>
                    <Text>Autre</Text>
                    <Radio
                      selected={this.state.userdata.sexeUtilisateur == 'A'}
                      onPress={() => {
                        this.setState({
                          userdata: {
                            ...this.state.userdata,
                            sexeUtilisateur: 'A',
                          },
                        });
                      }}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            ) : null}

            {this.state.isTelAsk ? (
              <Item stackedLabel style={{marginBottom: 15}}>
                <Label>Numéro de télephone</Label>
                <Input
                  returnKeyType="next"
                  keyboardType="phone-pad"
                  autoCompleteType="tel"
                  clearButtonMode="always"
                  value={this.state.userdata.telUtilisateur}
                  onChangeText={(phoneNumber) =>
                    this.setState({
                      userdata: {
                        ...this.state.userdata,
                        telUtilisateur: phoneNumber,
                      },
                    })
                  }
                />
              </Item>
            ) : null}

            {this.state.isDdnAsk ? (
              <Item stackedLabel style={{marginBottom: 15}}>
                <Label>Date de naissance</Label>
                <Label style={{fontSize: 12}}>
                  Important pour les résultats par catégorie
                </Label>
                <View
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                  }}>
                  <Picker
                    mode="dropdown"
                    accessibilityLabel={'Jour'}
                    iosHeader={'Jour'}
                    iosIcon={<Icon name="chevron-down" type="FontAwesome5" />}
                    selectedValue={this.state.dayDdn}
                    onValueChange={(value) => this.onValueDayddn(value)}
                    placeholder={'Jour'}
                    placeholderStyle={{
                      color: 'black',
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
                      color: 'black',
                      borderBottomColor: 'black',
                      borderBottomWidth: 1,
                    }}>
                    {this.state.days.map((d) => {
                      return <Picker.Item label={d} value={d} />;
                    })}
                  </Picker>
                  <Picker
                    mode="dropdown"
                    accessibilityLabel={'Mois'}
                    iosHeader={'Mois'}
                    iosIcon={<Icon name="chevron-down" type="FontAwesome5" />}
                    selectedValue={this.state.monthDdn}
                    onValueChange={(value) => this.onValueMonthddn(value)}
                    placeholder={'Mois'}
                    placeholderStyle={{
                      color: 'black',
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
                      color: 'black',
                      borderBottomColor: 'black',
                      borderBottomWidth: 1,
                    }}>
                    {this.state.monthsString.map((month) => {
                      return <Picker.Item label={month} value={month} />;
                    })}
                  </Picker>

                  <Picker
                    mode="dropdown"
                    accessibilityLabel={''}
                    iosHeader={'Année'}
                    iosIcon={<Icon name="chevron-down" type="FontAwesome5" />}
                    selectedValue={this.state.yearDdn}
                    onValueChange={(value) => this.onValueYearddn(value)}
                    placeholder={'Année'}
                    placeholderStyle={{
                      color: 'black',
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
                      color: 'black',
                      borderBottomColor: 'black',
                      borderBottomWidth: 1,
                    }}>
                    {this.state.years.map((year) => {
                      return <Picker.Item label={year} value={year} />;
                    })}
                  </Picker>
                </View>
              </Item>
            ) : null}

            {this.state.isAdressAsk ? (
              <Item stackedLabel style={{marginBottom: 15}}>
                <Label>Adresse</Label>
                <Input
                  returnKeyType="next"
                  clearButtonMode="always"
                  value={this.state.userdata.adresseUtilisateur}
                  onChangeText={(value) =>
                    this.setState({
                      userdata: {
                        ...this.state.userdata,
                        adresseUtilisateur: value,
                      },
                    })
                  }
                />
              </Item>
            ) : null}

            {this.state.isPostalAsk ? (
              <Item stackedLabel style={{marginBottom: 15}}>
                <Label>Code Postal</Label>
                <Input
                  returnKeyType="next"
                  clearButtonMode="always"
                  value={this.state.userdata.cpUtilisateur}
                  onChangeText={(phoneNumber) =>
                    this.setState({
                      userdata: {
                        ...this.state.userdata,
                        cpUtilisateur: phoneNumber,
                      },
                    })
                  }
                />
              </Item>
            ) : null}

            {this.state.isCityAsk ? (
              <Item stackedLabel style={{marginBottom: 15}}>
                <Label>Ville</Label>
                <Input
                  returnKeyType="next"
                  clearButtonMode="always"
                  value={
                    this.state.userdata.villeUtilisateur !== null
                      ? this.state.userdata.villeUtilisateur
                      : ''
                  }
                  onChangeText={(phoneNumber) =>
                    this.setState({
                      userdata: {
                        ...this.state.userdata,
                        villeUtilisateur: phoneNumber,
                      },
                    })
                  }
                />
              </Item>
            ) : null}

            {this.state.isCountyAsk ? (
              <Item stackedLabel style={{marginBottom: 5}}>
                <Label>Ville</Label>
                <Input
                  autoCapitalize="characters"
                  returnKeyType="next"
                  textContentType="countryName"
                  clearButtonMode="always"
                  value={this.state.userdata.paysUtilisateur}
                  onChangeText={(value) =>
                    this.setState({
                      userdata: {
                        ...this.state.userdata,
                        paysUtilisateur: value,
                      },
                    })
                  }
                />
              </Item>
            ) : null}

            {this.state.isTelVerifAsked ? (
              <View
                style={{
                  marginTop: 20,
                  paddingLeft: 10,
                  width: '80%',
                  display: 'flex',
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                }}>
                <Switch
                  style={{paddingTop: 20}}
                  onValueChange={(text) =>
                    this.setState({
                      userdata: {
                        ...this.state.userdata,
                        acceptChallengeTelUtilisateur: text,
                      },
                    })
                  }
                  value={this.state.userdata.acceptChallengeTelUtilisateur == 1}
                />
                <Text style={{marginLeft: 10}}>
                  J’accepte l’utilisation de mon numéro de téléphone à des fins
                  commerciales
                </Text>
              </View>
            ) : null}

            <View
              style={{
                marginTop: 10,
                marginBottom: 40,
                paddingLeft: 10,
                width: '80%',
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'space-between',
              }}>
              <Switch
                onValueChange={(text) =>
                  this.setState({
                    userdata: {
                      ...this.state.userdata,
                      acceptChallengeNameUtilisateur: text,
                    },
                  })
                }
                value={this.state.userdata.acceptChallengeNameUtilisateur == 1}
              />
              <Text style={{marginLeft: 10}}>
                J'accepte que mon nom apparaisse dans les résultats
              </Text>
            </View>
          </Content>
        </Container>
      </Drawer>
    );
  }
}

export default connect(mapStateToProps)(Preferences);
