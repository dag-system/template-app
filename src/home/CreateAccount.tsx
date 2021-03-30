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
  Content,
  Radio,
  Left,
  Right,
  Root,
  Picker,
} from 'native-base';
import ApiUtils from '../ApiUtils';
import Logo from '../assets/logo_header.png';
import ValidationComponent from 'react-native-form-validator';
import defaultMessages from './defaultMessages';
import {connect} from 'react-redux';
import {KeyboardAvoidingView, Dimensions} from 'react-native';
import GlobalStyles from '../styles';

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
  TemplateIsPaying,
} from './../globalsModifs';

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
      dayDdn: '01',
      monthDdn: '01',
      yearDdn: '1980',
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
    let yearsAll = [];
    for (let i = 1930; i < 2021; i++) {
      yearsAll.push(i.toString());
    }
    this.setState({years: yearsAll});
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
    formData.append('organisation', ApiUtils.getOrganisation());

    if (this.state.isNameAsk) {
      formData.append('nomUtilisateur', this.state.nomUtilisateur);
    }

    if (this.state.isFirstNameAsk) {
      formData.append('prenomUtilisateur', this.state.prenomUtilisateur);
    }

    if (this.state.isSexeAsk) {
      formData.append('sexeUtilisateur', this.state.sexeUtilisateur);
    }

    if (this.state.isDdnAsk) {
      formData.append(
        'ddnUtilisateur',
        this.state.yearDdn +
          '-' +
          this.state.monthDdn +
          '-' +
          this.state.dayDdn,
      );
    }

    if (this.state.isMailAsk) {
      formData.append('emailUtilisateur', this.state.emailUtilisateur);
    }

    if (this.state.isTelAsk) {
      formData.append('telUtilisateur', '');
    }

    if (this.state.isAdressAsk) {
      formData.append('adresseUtilisateur', this.state.adresseUtilisateur);
    }

    if (this.state.isPostalAsk) {
      formData.append('cpUtilisateur', this.state.cpUtilisateur);
    }

    if (this.state.isCityAsk) {
      formData.append('villeUtilisateur', this.state.villeUtilisateur);
    }

    if (this.state.isCountryAsk) {
      formData.append('paysUtilisateur', this.state.paysUtilisateur);
    }

    let clubs = [];
    if (
      this.state.isChallengeEntrepriseAsk &&
      this.state.clubEntreprise != ''
    ) {
      clubs.push({
        club: this.state.clubEntreprise,
        type: 'ENTREPRISE',
      });
    }
    if (this.state.isChallengeClubAsk && this.state.clubClub != '') {
      clubs.push({
        club: this.state.clubClub,
        type: 'CLUB',
      });
    }
    if (this.state.isChallengeFamilleAsk && this.state.clubFamille != '') {
      clubs.push({
        club: this.state.clubFamille,
        type: 'FAMILLE',
      });
    }
    if (this.state.isChallengeAutreAsk && this.state.clubAutre != '') {
      clubs.push({
        name: this.state.clubAutre,
        type: 'AUTRE',
      });
    }
    formData.append('clubUtilisateur', JSON.stringify(clubs));

    if (this.state.acceptChallengeTelUtilisateur) {
      formData.append('acceptChallengeTelUtilisateur', 1);
    } else {
      formData.append('acceptChallengeTelUtilisateur', 0);
    }

    if (this.state.acceptChallengeNameUtilisateur) {
      formData.append('acceptChallengeNameUtilisateur', 1);
    } else {
      formData.append('acceptChallengeNameUtilisateur', 0);
    }

    if (this.state.acceptChallengeUtilisateur) {
      formData.append('acceptChallengeUtilisateur', 1);
    } else {
      formData.append('acceptChallengeUtilisateur', 0);
    }

    fetch(ApiUtils.getAPIUrl(), {
      method: 'POST',
      headers: {},
      body: formData,
    })
      .then((res) => ApiUtils.checkStatus(res))
      .then((response) => response.json())
      .then((responseJson) => {
        console.log('LOOOOG FOLOMI : ', responseJson);
        this.setState({isLoading: false});
        if (responseJson.codeErreur == 'SUCCESS') {
          var action = {type: 'LOGIN', data: responseJson};
          this.props.dispatch(action);

          if (TemplateIsPaying) {
            this.onClickNavigate('Paiement');
          } else {
            this.onClickNavigate('Lives');
          }
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
        console.log('Message :', JSON.stringify(e.message));
        // ApiUtils.logError('create account', JSON.stringify(e.message));
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

  goBack() {
    this.onClickNavigate('Home');
  }

  onClickNavigate(routeName) {
    this.props.navigation.navigate(routeName);
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
                {this.state.isNameAsk ? (
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
                ) : null}

                {this.isFieldInError('nomUtilisateur') &&
                  this.state.isNameAsk &&
                  this.getErrorsInField(
                    'nomUtilisateur',
                  ).map((errorMessage) => (
                    <Text style={styles.error}>{errorMessage}</Text>
                  ))}

                {this.state.isFirstNameAsk ? (
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
                ) : null}
                {this.isFieldInError('prenomUtilisateur') &&
                  this.state.isFirstNameAsk &&
                  this.getErrorsInField(
                    'prenomUtilisateur',
                  ).map((errorMessage) => (
                    <Text style={styles.error}>{errorMessage}</Text>
                  ))}

                {this.state.isMailAsk ? (
                  <Item stackedLabel style={{marginBottom: 5}}>
                    <Label>Email *</Label>
                    <Input
                      ref="emailUtilisateur"
                      autoCompleteType="email"
                      returnKeyType="next"
                      textContentType="emailAddress"
                      keyboardType="email-address"
                      clearButtonMode="always"
                      value={this.state.emailUtilisateur}
                      onChangeText={(value) =>
                        this.setState({
                          emailUtilisateur: value.replace(/\s+/g, ''),
                        })
                      }
                    />
                  </Item>
                ) : null}

                {this.isFieldInError('emailUtilisateur') &&
                  this.state.isMailAsk &&
                  this.getErrorsInField(
                    'emailUtilisateur',
                  ).map((errorMessage) => (
                    <Text style={styles.error}>{errorMessage}</Text>
                  ))}

                {this.state.isSexeAsk ? (
                  <View>
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
                  </View>
                ) : null}

                {this.state.isDdnAsk ? (
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
                        style={{width: Dimensions.get('screen').width / 3 - 10}}
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
                        {this.state.monthsString.map((month) => {
                          return <Picker.Item label={month} value={month} />;
                        })}
                      </Picker>

                      <Picker
                        style={{width: Dimensions.get('screen').width / 3 - 10}}
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
                          return <Picker.Item label={year} value={year} />;
                        })}
                      </Picker>
                    </View>
                  </Item>
                ) : null}

                {this.state.isTelAsk ? (
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
                ) : null}

                {this.state.isTelVerifAsk ? (
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
                        this.setState({acceptChallengeTelUtilisateur: text})
                      }
                      value={this.state.acceptChallengeTelUtilisateur == 1}
                    />
                    <Text style={{marginLeft: 10}}>
                      J’accepte l’utilisation de mon numéro de téléphone pour le
                      tirage au sort des lots
                    </Text>
                  </View>
                ) : null}

                {this.state.isAdressAsk ? (
                  <Item stackedLabel style={{marginBottom: 5}}>
                    <Label>Adresse</Label>
                    <Input
                      returnKeyType="next"
                      clearButtonMode="always"
                      textContentType="fullStreetAddress"
                      value={this.state.adresseUtilisateur}
                      onChangeText={(value) =>
                        this.setState({adresseUtilisateur: value})
                      }
                    />
                  </Item>
                ) : null}

                {this.state.isPostalAsk ? (
                  <Item stackedLabel style={{marginBottom: 5}}>
                    <Label>Code Postal</Label>
                    <Input
                      returnKeyType="next"
                      clearButtonMode="always"
                      textContentType="postalCode"
                      value={this.state.cpUtilisateur}
                      onChangeText={(value) =>
                        this.setState({cpUtilisateur: value})
                      }
                    />
                  </Item>
                ) : null}

                {this.state.isCityAsk ? (
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
                ) : null}

                {this.state.isCountyAsk ? (
                  <Item stackedLabel style={{marginBottom: 5}}>
                    <Label>Ville</Label>
                    <Input
                      autoCapitalize="characters"
                      returnKeyType="next"
                      textContentType="countryName"
                      clearButtonMode="always"
                      value={this.state.paysUtilisateur}
                      onChangeText={(value) =>
                        this.setState({paysUtilisateur: value})
                      }
                    />
                  </Item>
                ) : null}

                {this.state.isChallengeEntrepriseAsk ? (
                  <Item stackedLabel style={{marginBottom: 5}}>
                    <Label>Challenge Entreprise</Label>
                    <Input
                      autoCapitalize="characters"
                      returnKeyType="next"
                      textContentType="none"
                      clearButtonMode="always"
                      value={this.state.clubEntreprise}
                      onChangeText={(value) =>
                        this.setState({clubEntreprise: value})
                      }
                    />
                  </Item>
                ) : null}

                {this.state.isChallengeClubAsk ? (
                  <Item stackedLabel style={{marginBottom: 5}}>
                    <Label>Challenge Club</Label>
                    <Input
                      autoCapitalize="characters"
                      returnKeyType="next"
                      textContentType="none"
                      clearButtonMode="always"
                      value={this.state.clubClub}
                      onChangeText={(value) => this.setState({clubClub: value})}
                    />
                  </Item>
                ) : null}

                {this.state.isChallengeFamilleAsk ? (
                  <Item stackedLabel style={{marginBottom: 5}}>
                    <Label>Challenge Famille</Label>
                    <Input
                      autoCapitalize="characters"
                      returnKeyType="next"
                      textContentType="none"
                      clearButtonMode="always"
                      value={this.state.clubFamille}
                      onChangeText={(value) =>
                        this.setState({clubFamille: value})
                      }
                    />
                  </Item>
                ) : null}

                {this.state.isChallengeAutreAsk ? (
                  <Item stackedLabel style={{marginBottom: 5}}>
                    <Label>{TemplateChallengeAutreName}</Label>
                    <Input
                      autoCapitalize="characters"
                      returnKeyType="next"
                      textContentType="none"
                      clearButtonMode="always"
                      value={this.state.clubAutre}
                      onChangeText={(value) =>
                        this.setState({clubAutre: value})
                      }
                    />
                  </Item>
                ) : null}

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
    // backgroundColor: ApiUtils.getColor(),
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
    width: '100%',
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
