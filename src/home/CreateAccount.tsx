import React from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Image,
  Switch,
  ActivityIndicator,
} from 'react-native';
import {
  Container,
  Header,
  Body,
  Text,
  Button,
  Form,
  Item,
  Label,
  Input,
  Toast,
  Icon,
  DatePicker,
  Content,
  Radio,
  Left,
  Right,
  Root,
  Picker,
} from 'native-base';
import md5 from 'md5';
import ApiUtils from '../ApiUtils';
import moment from 'moment';
import Logo from '../assets/logo_header.png';
import ValidationComponent from 'react-native-form-validator';
import defaultMessages from './defaultMessages';
import {connect} from 'react-redux';
import {KeyboardAvoidingView} from 'react-native';
import GlobalStyles from '../styles';
import {Platform} from 'react-native';
import {Dimensions} from 'react-native';
const mapStateToProps = (state) => {
  return {
    userData: state,
    isRecording: state.isRecording,
    lives: state.lives,
    sports: state.sports,
    currentLive: state.currentLive,
  };
};

class CreateAccount extends ValidationComponent {
  constructor(props) {
    super(props);

    this.messages = defaultMessages;
    this.deviceLocale = 'fr';

    this.state = {
      nomUtilisateur: '',
      prenomUtilisateur: '',
      telUtilisateur: '',
      clubUtilisateur: '',
      villeUtilisateur: '',
      cpUtilisateur: '',
      adresseUtilisateur: '',
      newPassword: '',
      newPasswordConfirmation: '',
      emailUtilisateur: '',
      acceptChallengeUnss: false,
      clubEntreprise: '',
      clubFamille: '',
      clubUniversite: '',
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
      fetchClub: [],
      alertClub: false,
      alertEquipe: false,
      alertSexe: false,
      acceptChallengeNameUtilisateur: false,
      acceptChallengeUtilisateur: false,
      equipeUtilisateur: '',
      errorPickers: false,
      errorCNIL: false,
      dayDdn: '',
    };
  }

  componentDidMount() {
    let yearsAll = [];
    for (let i = 1930; i < 2021; i++) {
      yearsAll.push(i.toString());
    }
    this.setState({years: yearsAll});

    this.getClubs();
  }

  ongoHome() {
    this.props.navigation.navigate('Home');
  }

  onClickValidate() {
    var isValid = this.validate({
      nomUtilisateur: {required: true},
      prenomUtilisateur: {required: true},
      //telUtilisateur: {required: true},
      // newPassword: {required: true},
      // newPasswordConfirmation: {required: true},
      emailUtilisateur: {email: true, required: true},
      // newPassword: {
      //   required: true,
      //   equalPassword: this.state.newPasswordConfirmation,
      // },
      // newPasswordConfirmation: {
      //   required: true,
      //   equalPassword: this.state.newPassword,
      // },
    });

    if (isValid) {
      this.onSendRequest();
    }
  }

  onSendRequest() {
    this.setState({isLoading: true});
    let formData = new FormData();
    formData.append('method', 'createUtilisateur');
    formData.append('auth', ApiUtils.getAPIAuth());
    formData.append('idUtilisateur', this.state.idUtilisateur);

    formData.append('nomUtilisateur', this.state.nomUtilisateur);
    formData.append('prenomUtilisateur', this.state.prenomUtilisateur);

    // alert(finalDate)
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

    // formData.append('ddnUtilisateur', this.state.ddnUtilisateur);

    //alert(this.state.sexeUtilisateur);
    formData.append('sexeUtilisateur', this.state.sexeUtilisateur);

    let clubs = [];

    let nameClub = this.state.equipeUtilisateur;

    clubs.push({club: nameClub, type: 'RAID'});

    formData.append('clubUtilisateur', JSON.stringify(clubs));

    formData.append('emailUtilisateur', this.state.emailUtilisateur);

    formData.append('telUtilisateur', '');

    var acceptChallengeTelUtilisateur = 0;
    if (
      this.state.acceptChallengeTelUtilisateur ||
      this.state.acceptChallengeTelUtilisateur
    ) {
      acceptChallengeTelUtilisateur = 1;
    }

    formData.append(
      'acceptChallengeTelUtilisateur',
      acceptChallengeTelUtilisateur,
    );

    formData.append('adresseUtilisateur', this.state.adresseUtilisateur);
    formData.append('cpUtilisateur', this.state.cpUtilisateur);
    formData.append('villeUtilisateur', this.state.villeUtilisateur);
    formData.append('paysUtilisateur', this.state.paysUtilisateur);
    formData.append('organisation', ApiUtils.getOrganisation());
    var acceptChallengeNameUtilisateur = 0;
    if (this.state.acceptChallengeNameUtilisateur) {
      acceptChallengeNameUtilisateur = 1;
    }

    formData.append(
      'acceptChallengeNameUtilisateur',
      acceptChallengeNameUtilisateur,
    );

    var acceptChallengeUtilisateur = 0;
    if (this.state.acceptChallengeUtilisateur) {
      acceptChallengeUtilisateur = 1;
      this.setState({errorCNIL: false});
    } else {
      this.setState({errorCNIL: true});
      this.setState({isLoading: false});
      return false;
    }

    formData.append('acceptChallengeUtilisateur', acceptChallengeUtilisateur);

    fetch(ApiUtils.getAPIUrl(), {
      method: 'POST',
      headers: {},
      body: formData,
    })
      .then(ApiUtils.checkStatus)
      .then((response) => response.json())
      .then((responseJson) => {
        console.log('LOOOOG FOLOMI : ', responseJson);
        this.setState({isLoading: false});
        if (responseJson.codeErreur == 'SUCCESS') {
          var action = {type: 'LOGIN', data: responseJson};
          this.props.dispatch(action);

          this.onClickNavigate('Lives');
        } else {
          Toast.show({
            text: responseJson.message,
            buttonText: 'Ok',
            type: 'danger',
            position: 'top',
          });
        }
      })
      .catch((e) => {
        this.setState({isLoading: false});
        console.log(e);
        ApiUtils.logError('create account', JSON.stringify(e.message));
        // alert('Une erreur est survenue : ' + JSON.stringify(e.message));

        Toast.show({
          text: 'Une erreur est survenue, merci de réessayer',
          buttonText: 'Ok',
          type: 'danger',
          position: 'bottom',
          duration: 5000,
        });

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

  getClubs() {
    let formData = new FormData();
    formData.append('method', 'getClubs');
    formData.append('auth', ApiUtils.getAPIAuth());
    formData.append('organisation', ApiUtils.getOrganisation());

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
        this.setState({fetchClub: responseJson});
      })
      .catch((e) => {
        ApiUtils.logError('getCLUBS', e.message);
      });
  }

  goBack() {
    this.onClickNavigate('Home');
  }

  onClickNavigate(routeName) {
    this.props.navigation.navigate(routeName);
  }

  onValueDayddn(value) {
    this.setState({dayDdn: value});
    console.log(value);
  }

  onValueMonthddn(value) {
    this.setState({monthDdn: value});
    console.log(value);
  }

  onValueYearddn(value) {
    this.setState({yearDdn: value});
    console.log(value);
  }

  onChangeChoiceEquipe(value) {
    this.setState({equipeChoiceUtilisateur: value});
  }

  render() {
    return (
      <Root>
        <Container>
          <Header style={styles.header}>
            <Left>
              <Button
                style={styles.drawerButton}
                onPress={() => this.ongoHome()}>
                <Icon
                  style={styles.saveText}
                  name="chevron-left"
                  type="FontAwesome5"
                />
              </Button>
            </Left>
            <Body style={{flex: 0}} />
            <Right style={{flex: 1}}>
              <Image resizeMode="contain" source={Logo} style={styles.logo} />
            </Right>
          </Header>
          <Content>
            <KeyboardAvoidingView>
              <Form>
                <Item stackedLabel style={{marginBottom: 5}}>
                  <Label>Nom *</Label>
                  <Input
                    //  autoCapitalize="characters"
                    ref="nomUtilisateur"
                    returnKeyType="next"
                    textContentType="familyName"
                    clearButtonMode="always"
                    value={this.state.nomUtilisateur}
                    onChangeText={(value) =>
                      this.setState({nomUtilisateur: value})
                    }
                  />
                </Item>
                {this.isFieldInError('nomUtilisateur') &&
                  this.getErrorsInField(
                    'nomUtilisateur',
                  ).map((errorMessage) => (
                    <Text style={styles.error}>{errorMessage}</Text>
                  ))}

                {/* // <ErrorMessage value={this.state.nomUtilisateur} message="Le nom doit être renseigné" /> */}

                <Item stackedLabel style={{marginBottom: 5}}>
                  <Label>Prénom *</Label>
                  <Input
                    //  autoCapitalize="characters"
                    ref="prenomUtilisateur"
                    returnKeyType="next"
                    textContentType="name"
                    clearButtonMode="always"
                    value={this.state.prenomUtilisateur}
                    onChangeText={(value) =>
                      this.setState({prenomUtilisateur: value})
                    }
                  />
                </Item>
                {this.isFieldInError('prenomUtilisateur') &&
                  this.getErrorsInField(
                    'prenomUtilisateur',
                  ).map((errorMessage) => (
                    <Text style={styles.error}>{errorMessage}</Text>
                  ))}

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
                      width: '30%',
                      justifyContent: 'space-around',
                    }}
                    onPress={() => this.setState({sexeUtilisateur: 'F'})}>
                    <Text>Femme</Text>
                    <Radio
                      selected={this.state.sexeUtilisateur == 'F'}
                      onPress={() => this.setState({sexeUtilisateur: 'F'})}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={{
                      display: 'flex',
                      flexDirection: 'row',
                      width: '30%',
                      justifyContent: 'space-around',
                    }}
                    onPress={() => this.setState({sexeUtilisateur: 'H'})}>
                    <Text>Homme</Text>
                    <Radio
                      selected={this.state.sexeUtilisateur == 'H'}
                      onPress={() => this.setState({sexeUtilisateur: 'H'})}
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
                {this.state.alertSexe == true ? (
                  <Text
                    style={{
                      width: '100%',
                      textAlign: 'center',
                      fontSize: 18,
                      color: 'red',
                    }}>
                    Il vous faut choisir un sexe
                  </Text>
                ) : null}

                <Item stackedLabel style={{marginBottom: 5}}>
                  <Label>Date de naissance</Label>
                  <Label style={{fontSize: 12}}>
                    Important pour les classements par catégorie
                  </Label>
                  <View style={[GlobalStyles.row]}>
                    <Picker
                      style={{width: Dimensions.get('screen').width / 3 - 10}}
                      mode="dropdown"
                      accessibilityLabel={'Jour'}
                      iosHeader={'Jour'}
                      iosIcon={<Icon name="chevron-down" type="FontAwesome5" />}
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
                      style={{width: Dimensions.get('screen').width / 3 - 10}}
                      mode="dropdown"
                      accessibilityLabel={'Mois'}
                      iosHeader={'Mois'}
                      iosIcon={<Icon name="chevron-down" type="FontAwesome5" />}
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
                      {this.state.monthsString.map((month) => {
                        return <Picker.Item label={month} value={month} />;
                      })}
                    </Picker>
                    <Picker
                      style={{width: Dimensions.get('screen').width / 3 - 10}}
                      mode="dropdown"
                      accessibilityLabel={'Annee'}
                      iosHeader={'Année'}
                      iosIcon={<Icon name="chevron-down" type="FontAwesome5" />}
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
                        return <Picker.Item label={year} value={year} />;
                      })}
                    </Picker>
                  </View>
                </Item>

                <Item stackedLabel style={{marginBottom: 5}}>
                  <Label>Email *</Label>
                  <Input
                    ref="emailUtilisateur"
                    autoCompleteType="email"
                    returnKeyType="next"
                    textContentType="emailAddress"
                    keyboardType="email-address"
                    // autoCapitalize="characters"
                    clearButtonMode="always"
                    value={this.state.emailUtilisateur}
                    onChangeText={(value) =>
                      this.setState({
                        emailUtilisateur: value.replace(/\s+/g, ''),
                      })
                    }
                  />
                </Item>
                {this.isFieldInError('emailUtilisateur') &&
                  this.getErrorsInField(
                    'emailUtilisateur',
                  ).map((errorMessage) => (
                    <Text style={styles.error}>{errorMessage}</Text>
                  ))}

                <Item stackedLabel style={{marginBottom: 5}}>
                  <Label>Numéro de télephone * </Label>
                  <Input
                    returnKeyType="next"
                    ref="telUtilisateur"
                    keyboardType="phone-pad"
                    autoCompleteType="tel"
                    clearButtonMode="always"
                    value={this.state.telUtilisateur}
                    onChangeText={(phoneNumber) =>
                      this.setState({
                        telUtilisateur: phoneNumber,
                      })
                    }
                  />
                </Item>

                <Item stackedLabel style={{marginBottom: 5}}>
                  <Label>Ville</Label>
                  <Input
                    autoCapitalize="characters"
                    returnKeyType="next"
                    textContentType="addressCity"
                    clearButtonMode="always"
                    value={this.state.villeUtilisateur}
                    onChangeText={(value) =>
                      this.setState({villeUtilisateur: value})
                    }
                  />
                </Item>

                <Item stackedLabel style={{marginBottom: 20}}>
                  <Label>Entrez votre Club</Label>
                  <Input
                    ref="equipeUtilisateur"
                    autoCapitalize="characters"
                    returnKeyType="next"
                    textContentType="addressCity"
                    clearButtonMode="always"
                    placeholder="Entrez votre club"
                    value={this.state.equipeUtilisateur}
                    onChangeText={(value) =>
                      this.setState({equipeUtilisateur: value})
                    }
                  />
                </Item>

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
                      this.setState({acceptChallengeNameUtilisateur: text})
                    }
                    value={this.state.acceptChallengeNameUtilisateur}
                  />
                  <TouchableOpacity
                    onPress={() =>
                      this.setState({
                        acceptChallengeNameUtilisateur: !this.state
                          .acceptChallengeNameUtilisateur,
                      })
                    }>
                    <Text style={{marginLeft: 10}}>
                      Je souhaite voir mon nom apparaître dans le classement
                    </Text>
                  </TouchableOpacity>
                </View>

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
                      this.setState({acceptChallengeUtilisateur: text})
                    }
                    value={this.state.acceptChallengeUtilisateur}
                  />
                  <TouchableOpacity
                    onPress={() =>
                      this.setState({
                        acceptChallengeUtilisateur: !this.state
                          .acceptChallengeUtilisateur,
                      })
                    }>
                    <Text style={{marginLeft: 10}}>
                      J'accepte que mes données personnelles soient utilisées à
                      des fins d'informations
                    </Text>
                  </TouchableOpacity>
                </View>

                {this.state.errorCNIL ? (
                  <Text
                    style={{
                      width: '100%',
                      textAlign: 'center',
                      fontSize: 18,
                      color: 'red',
                    }}>
                    Vous devez acceptez que vos données soient utilisées à des
                    fins d'informations
                  </Text>
                ) : null}
              </Form>

              {this.state.isLoading ? (
                <View
                  style={{
                    marginTop: 20,
                    marginBottom: 20,
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'row',
                    display: 'flex',
                  }}>
                  <ActivityIndicator color="black" />
                  <Text style={{marginLeft: 5}}>Enregistrement en cours</Text>
                </View>
              ) : (
                <TouchableOpacity
                  style={[
                    GlobalStyles.button,
                    {
                      width: '80%',
                      alignSelf: 'center',
                      justifyContent: 'center',
                      marginTop: 20,
                    },
                  ]}
                  onPress={() => this.onClickValidate()}>
                  <Text
                    style={[
                      {textAlign: 'center', color: 1 == 1 ? 'black' : 'black'},
                    ]}>
                    ENREGISTRER
                  </Text>
                </TouchableOpacity>
              )}

              {ApiUtils.ISDEBUG() ? (
                <Text
                  style={{textAlign: 'center', fontSize: 12, marginTop: 30}}>
                  Debug version {ApiUtils.VersionNumber()}
                </Text>
              ) : ApiUtils.ISDEMO() ? (
                <Text
                  style={{textAlign: 'center', fontSize: 12, marginTop: 30}}>
                  Demo version {ApiUtils.VersionNumber()}
                </Text>
              ) : (
                <Text
                  style={{
                    textAlign: 'center',
                    fontSize: 12,
                    marginTop: 30,
                    marginBottom: 100,
                  }}>
                  Version V{ApiUtils.VersionNumber()}
                </Text>
              )}
            </KeyboardAvoidingView>
          </Content>
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
    width: '25%',
  },
  logo: {
    width: '100%',
    height: 50,
    marginRight: '20%',
  },
  saveButton: {
    backgroundColor: 'transparent',
    width: 130,
    marginTop: 0,
    paddingTop: 0,
    shadowOffset: {height: 0, width: 0},
    shadowOpacity: 0,
    elevation: 0,
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
    marginTop: 5,
    marginLeft: 10,
    fontSize: 15,
    color: 'gray',
  },
  p: {
    fontSize: 12,
    marginBottom: 5,
  },
  url: {
    fontSize: 12,
    //  textAlign: 'center'
  },
  error: {
    color: 'red',
    marginBottom: 10,
    marginLeft: 15,
  },
  button: {
    marginBottom: 10,
  },
  loginButtonSection: {
    width: '100%',
    marginTop: 5,
    height: '140%',
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

export default connect(mapStateToProps)(CreateAccount);
