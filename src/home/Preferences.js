import React, {Component} from 'react';
import {
  StyleSheet,
  View,
  TextInput,
  Image,
  ScrollView,
  Switch,
  TouchableOpacity,
} from 'react-native';
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
    };
  }

  componentDidMount() {
    setTimeout(() => this.didMount(), 300);

    // alert(this.props.userData.ddnUtilisateur)
    //   alert(new Date(this.props.userData.ddnUtilisateur))

    // setTimeout(() => this.setState({ userdata: { ...this.state.userdata, ddnUtilisateur: this.state.userdata.ddnUtilisateur) }} ), 100)
  }
  didMount() {
    let years = [];
    for (let i = 2021; i > 1930; i--) {
      years.push(i);
    }
    this.setState({years: years}, () => this.fillDate());

    //  this.getInformations();
    this.setState({userdata: this.props.userData});
    if (this.props.userData.clubUtilisateur == 'NULL') {
      this.props.userData.clubUtilisateur = '';
    }

    if (this.props.userData.villeUtilisateur == 'NULL') {
      this.props.userData.villeUtilisateur = '';
    }

    // this.setClubs(this.props.userClubs);

    //this.getClubs();
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

    // if (this.state.userdata.adresseUtilisateur == '') {
    //   isError = true;
    // }

    // if (this.state.userdata.cpUtilisateur == '') {
    //   isError = true;
    // }

    // if (this.state.userdata.villeUtilisateur == '') {
    //   isError = true;
    // }

    // if (!!this.state.newPassword && this.state.newPassword != '') {
    //   if (this.state.newPasswordConfirmation != this.state.newPassword) {
    //     isError = true;
    //   } else {
    //     withPassword = true;
    //   }
    // }

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

    formData.append('telUtilisateur', this.state.userdata.telUtilisateur);
    formData.append('organisation', ApiUtils.getOrganisation());

    var acceptChallengeTelUtilisateur = 0;
    if (
      this.state.userdata.acceptChallengeTelUtilisateur ||
      this.state.userdata.acceptChallengeTelUtilisateur
    ) {
      acceptChallengeTelUtilisateur = 1;
    }

    formData.append(
      'acceptChallengeTelUtilisateur',
      acceptChallengeTelUtilisateur,
    );

    if (Platform.OS == 'ios') {
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
      } else {
        formData.append('ddnUtilisateur', '');
      }
    } else {
      var finalDate = moment(this.state.ddnUtilisateur).format('YYYY-MM-DD');
      formData.append('ddnUtilisateur', finalDate);
    }
    formData.append('sexeUtilisateur', this.state.userdata.sexeUtilisateur);

    formData.append(
      'adresseUtilisateur',
      this.state.userdata.adresseUtilisateur,
    );
    formData.append('cpUtilisateur', this.state.userdata.cpUtilisateur);
    formData.append('villeUtilisateur', this.state.userdata.villeUtilisateur);
    formData.append('paysUtilisateur', this.state.userdata.paysUtilisateur);

    let clubs = [];

    formData.append('clubsUtilisateur', JSON.stringify(clubs));

    var acceptChallengeNameUtilisateur = 0;
    if (this.state.userdata.acceptChallengeNameUtilisateur) {
      acceptChallengeNameUtilisateur = 1;
    }

    formData.append(
      'acceptChallengeNameUtilisateur',
      acceptChallengeNameUtilisateur,
    );

    if (withPassword) {
      formData.append('passUtilisateur', md5(this.state.newPassword));
    }

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
            selected="Preferences"
          />
        }>
        <Container>
          <Root>
            <Header style={styles.header}>
              <Left>
                <Button
                  style={styles.drawerButton}
                  onPress={() => this.onDrawer()}>
                  <Icon
                    style={styles.saveText}
                    name="chevron-left"
                    type="FontAwesome5"
                  />
                </Button>
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
                    style={styles.saveButton}
                    onPress={() => this.onClickValidate()}
                    disabled={this.isErrorForm()}>
                    <Text
                      style={[
                        styles.saveText,
                        {color: this.isErrorForm() ? 'gray' : 'black'},
                      ]}>
                      ENREGISTRER
                    </Text>
                  </Button>
                )}
              </Right>
            </Header>
            <Content>
              <Form>
                <Item stackedLabel style={{marginBottom: 5}}>
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

                <Item stackedLabel style={{marginBottom: 5}}>
                  <Label>Numéro de télephone * </Label>
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

                <Text style={styles.label}>Sexe</Text>

                <View
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    width: '80%',
                    justifyContent: 'space-between',
                    alignSelf: 'center',
                  }}>
                  <TouchableOpacity
                    style={{
                      display: 'flex',
                      flexDirection: 'row',
                      width: '50%',
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
                      width: '50%',
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
                    onPress={() => this.setState({sexeUtilisateur: 'A'})}>
                    <Text>Autre</Text>
                    <Radio
                      selected={this.state.sexeUtilisateur == 'A'}
                      onPress={() => this.setState({sexeUtilisateur: 'A'})}
                    />
                  </TouchableOpacity>
                </View>

                {Platform.OS == 'ios' ? (
                  <View>
                    <Item stackedLabel style={{marginBottom: 5}}>
                      <Label>Date de naissance</Label>
                      <Label style={{fontSize: 12}}>
                        Important pour les classements par catégorie
                      </Label>
                      <View style={[GlobalStyles.row]}>
                        <Picker
                          style={{
                            width: Dimensions.get('screen').width / 3 - 10,
                          }}
                          mode="dropdown"
                          accessibilityLabel={'Jour'}
                          iosHeader={'Jour'}
                          iosIcon={
                            <Icon name="chevron-down" type="FontAwesome5" />
                          }
                          selectedValue={this.state.dayDdn}
                          onValueChange={(value) => this.onValueDayddn(value)}
                          placeholder={'Jour'}
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
                          {this.state.days.map((d) => {
                            return <Picker.Item label={d} value={d} />;
                          })}
                        </Picker>
                        <Picker
                          style={{
                            width: Dimensions.get('screen').width / 3 - 10,
                          }}
                          mode="dropdown"
                          accessibilityLabel={'Mois'}
                          iosHeader={'Mois'}
                          iosIcon={
                            <Icon name="chevron-down" type="FontAwesome5" />
                          }
                          selectedValue={this.state.monthDdn}
                          onValueChange={(value) => this.onValueMonthddn(value)}
                          placeholder={'Mois'}
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
                          {this.state.monthsString.map((month, index) => {
                            return <Picker.Item label={month} value={month} />;
                          })}
                        </Picker>

                        <Picker
                          style={{
                            width: Dimensions.get('screen').width / 3 - 10,
                          }}
                          mode="dropdown"
                          accessibilityLabel={''}
                          iosHeader={'Année'}
                          iosIcon={
                            <Icon name="chevron-down" type="FontAwesome5" />
                          }
                          selectedValue={this.state.yearDdn}
                          onValueChange={(value) => this.onValueYearddn(value)}
                          placeholder={'Année'}
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
                          {this.state.years.map((year) => {
                            return (
                              <Picker.Item
                                label={year}
                                value={year.toString()}
                              />
                            );
                          })}
                        </Picker>
                      </View>
                    </Item>
                  </View>
                ) : (
                  <View>
                    <Text style={styles.label}>Date de naissance</Text>
                    {this.state.userdata != null &&
                    !this.state.showDefaultDdn ? (
                      <DatePicker
                        style={{marginLeft: 20}}
                        date={new Date(this.state.userdata.ddnUtilisateur)}
                        defaultDate={
                          this.state.showDefaultDdn
                            ? new Date(this.props.userData.ddnUtilisateur)
                            : null
                        }
                        //  placeHolderText="Choisir une date de naissance"
                        //  placeHolderTextStyle={{ marginLeft: 30, fontSize: 14, color: "#d3d3d3", fontStyle: 'italic' }}
                        // format="YYYY-MM-DD"
                        // locale={"fr"}
                        confirmBtnText="Valider"
                        cancelBtnText="Annuler"
                        customStyles={{
                          dateIcon: {
                            position: 'absolute',
                            left: 0,
                            top: 4,
                            marginLeft: 15,
                          },
                          dateInput: {
                            marginLeft: 100,
                          },
                          // ... You can check the source to find the other keys.
                        }}
                        onDateChange={(date) => {
                          //  alert(date)
                          this.setState({
                            userdata: {
                              ...this.state.userdata,
                              ddnUtilisateur: date,
                            },
                          });
                        }}
                      />
                    ) : null}
                  </View>
                )}

                {this.state.userdata != null && this.state.showDefaultDdn ? (
                  <DatePicker
                    style={{marginLeft: 20}}
                    date={new Date(this.state.userdata.ddnUtilisateur)}
                    defaultDate={new Date(this.props.userData.ddnUtilisateur)}
                    //  placeHolderText="Choisir une date de naissance"
                    //  placeHolderTextStyle={{ marginLeft: 30, fontSize: 14, color: "#d3d3d3", fontStyle: 'italic' }}
                    // format="YYYY-MM-DD"
                    // locale={"fr"}
                    confirmBtnText="Valider"
                    cancelBtnText="Annuler"
                    customStyles={{
                      dateIcon: {
                        position: 'absolute',
                        left: 0,
                        top: 4,
                        marginLeft: 15,
                      },
                      dateInput: {
                        marginLeft: 100,
                      },
                      // ... You can check the source to find the other keys.
                    }}
                    onDateChange={(date) => {
                      //  alert(date)
                      this.setState({
                        userdata: {
                          ...this.state.userdata,
                          ddnUtilisateur: date,
                        },
                      });
                    }}
                  />
                ) : null}

                <Item stackedLabel style={{marginBottom: 5}}>
                  <Label>Adresse</Label>
                  <Input
                    returnKeyType="next"
                    clearButtonMode="always"
                    value={this.state.userdata.adresseUtilisateur}
                    onChangeText={(phoneNumber) =>
                      this.setState({
                        userdata: {
                          ...this.state.userdata,
                          adresseUtilisateur: phoneNumber,
                        },
                      })
                    }
                  />
                </Item>

                {/* <Text style={styles.label}>Adresse</Text>
                <TextInput style={styles.inputCode} clearButtonMode='always' placeholder="Adresse" value={this.state.userdata.adresseUtilisateur} onChangeText={(phoneNumber) => this.setState({ userdata: { ...this.state.userdata, adresseUtilisateur: phoneNumber } })} />
               */}

                <Item stackedLabel style={{marginBottom: 5}}>
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

                {/* <Text style={styles.label}>Code Postal</Text>
                <TextInput style={styles.inputCode} clearButtonMode='always' placeholder="Code postal" value={this.state.userdata.cpUtilisateur} onChangeText={(phoneNumber) => this.setState({ userdata: { ...this.state.userdata, cpUtilisateur: phoneNumber } })} /> */}

                <Item stackedLabel style={{marginBottom: 5}}>
                  <Label>Ville</Label>
                  <Input
                    returnKeyType="next"
                    clearButtonMode="always"
                    value={this.state.userdata.villeUtilisateur}
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
              </Form>
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
                  tyle={{paddingTop: 20}}
                  onValueChange={(text) =>
                    this.setState({
                      userdata: {
                        ...this.state.userdata,
                        acceptChallengeNameUtilisateur: text,
                      },
                    })
                  }
                  value={
                    this.state.userdata.acceptChallengeNameUtilisateur == 1
                  }
                />
                <Text style={{marginLeft: 10}}>
                  J'accepte que mon nom apparaisse dans le classement
                </Text>
              </View>

              {ApiUtils.ISDEBUG() ? (
                <Text
                  full
                  style={{textAlign: 'center', fontSize: 12, marginTop: 30}}>
                  Debug version {ApiUtils.VersionNumber()}
                </Text>
              ) : ApiUtils.ISDEMO() ? (
                <Text
                  full
                  style={{textAlign: 'center', fontSize: 12, marginTop: 30}}>
                  Demo version {ApiUtils.VersionNumber()}
                </Text>
              ) : (
                <Text
                  full
                  style={{
                    textAlign: 'center',
                    fontSize: 12,
                    marginTop: 30,
                    marginBottom: 100,
                  }}>
                  Version V{ApiUtils.VersionNumber()}
                </Text>
              )}
            </Content>
          </Root>
        </Container>
      </Drawer>
    );
  }
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: 'white',
    // width: '100%'
  },
  title: {
    width: '25%',
  },
  saveButton: {
    backgroundColor: 'transparent',
    // width: '100%',
    marginTop: 0,
    paddingTop: 0,
    shadowOffset: {height: 0, width: 0},
    shadowOpacity: 0,
    elevation: 0,
  },
  drawerButton: {
    backgroundColor: 'transparent',
    width : '100%',
    marginTop: 0,
    paddingTop: 0,
    shadowOffset: {height: 0, width: 0},
    shadowOpacity: 0,
    elevation: 0,
  },
  saveText: {
    color: 'black',
  },
  body: {
    width: '100%',
    backgroundColor: 'white',
  },
  inputCode: {
    borderBottomColor: 'black',
    borderBottomWidth: 1,
    fontStyle: 'italic',
    height: 20,
    padding: 0,
    marginLeft: 5,
    marginRight: 5,
    marginBottom: 5,
    marginTop: 5,
    fontSize: 12,
  },
  label: {
    padding: 5,
    paddingLeft: 15,
    marginTop: 10,
    marginBottom: 10,
    color: 'gray',
    fontSize: 16,
  },
  p: {
    fontSize: 12,
    marginBottom: 5,
  },
  url: {
    fontSize: 12,
    //  textAlign: 'center'
  },
  button: {
    marginBottom: 10,
  },
  loginButtonSection: {
    width: '100%',
    marginTop: 5,
    height: '200%',
  },
  scrollcontent: {
    height: '80%',
  },
  container: {
    width: '100%',
  },
  icon: {
    width: 24,
    height: 24,
  },
});

export default connect(mapStateToProps)(Preferences);
