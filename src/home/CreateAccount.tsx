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
      anneeUser: '',
      departementUser: '',
      groupeUser: '',
      sportUser: '',
      asUser: '',
      enseignantUser: '',
      errorPickers: false,
      errorCNIL: false,
      acceptChallengeNameUtilisateur: false,
      acceptChallengeUtilisateur: false,
    };
  }

  componentDidMount() {
    let years = [];
    for (let i = 2021; i > 1930; i--) {
      years.push(i);
    }
    this.setState({years: years});
  }

  ongoHome() {
    this.props.navigation.navigate('Home');
  }

  onChangeAnneeUser(value) {
    if (value == '0') {
      this.setState({anneeUser: '0'});
      this.setState({departementUser: '0'});
      this.setState({groupeUser: '0'});
      this.setState({sportUser: '0'});
      this.setState({asUser: '0'});
      this.setState({enseignantUser: '0'});
    } else {
      this.setState({anneeUser: value});
    }
  }

  onChangeDepartementUser(value) {
    if (value == '0' || value =="CNR") {
      this.setState({anneeUser: '0'});
      this.setState({departementUser: '0'});
      this.setState({groupeUser: '0'});
      this.setState({sportUser: '0'});
      this.setState({asUser: '0'});
      this.setState({enseignantUser: '0'});
    } else {
      this.setState({departementUser: value});
    }
  }

  onChangeGroupeUser(value) {
    if (value == '0') {
      this.setState({anneeUser: '0'});
      this.setState({departementUser: '0'});
      this.setState({groupeUser: '0'});
      this.setState({sportUser: '0'});
      this.setState({asUser: '0'});
      this.setState({enseignantUser: '0'});
    } else {
      this.setState({groupeUser: value});
    }
  }

  onChangeSportUser(value) {
    if (value == '0') {
      this.setState({anneeUser: '0'});
      this.setState({departementUser: '0'});
      this.setState({groupeUser: '0'});
      this.setState({sportUser: '0'});
      this.setState({asUser: '0'});
      this.setState({enseignantUser: '0'});
    } else {
      this.setState({sportUser: value});
    }
  }

  onChangeAsUser(value) {
    if (value == '0') {
      this.setState({anneeUser: '0'});
      this.setState({departementUser: '0'});
      this.setState({groupeUser: '0'});
      this.setState({sportUser: '0'});
      this.setState({asUser: '0'});
      this.setState({enseignantUser: '0'});
    } else {
      this.setState({asUser: value});
    }
  }

  onChangeEnseignantUser(value) {
    if (value == '0') {
      this.setState({anneeUser: '0'});
      this.setState({departementUser: '0'});
      this.setState({groupeUser: '0'});
      this.setState({sportUser: '0'});
      this.setState({asUser: '0'});
      this.setState({enseignantUser: '0'});
    } else {
      this.setState({enseignantUser: value});
    }
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

    formData.append('nomUtilisateur', this.state.nomUtilisateur);
    formData.append('prenomUtilisateur', this.state.prenomUtilisateur);

    if (
      this.state.anneeUser == '' ||
      this.state.departementUser == '' ||
      this.state.groupeUser == '' ||
      this.state.sportUser == '' ||
      this.state.asUser == '' ||
      this.state.enseignantUser == ''
    ) {
      this.setState({errorPickers: true});
      this.setState({isLoading: false});
      return false;
    } else {
      let extraInfoUser = {
        challenge: {
          anneeUser: this.state.anneeUser,
          departementUser: ApiUtils.removeAccents(this.state.departementUser),
          groupeUser: ApiUtils.removeAccents(this.state.groupeUser),
          sportUser: ApiUtils.removeAccents(this.state.sportUser),
          asUser: ApiUtils.removeAccents(this.state.asUser),
          enseignantUser: ApiUtils.removeAccents(this.state.enseignantUser),
        },
      };

      this.setState({errorPickers: false});
      formData.append('extraInfo', JSON.stringify(extraInfoUser));
    }

    // alert(finalDate)
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

    // formData.append('ddnUtilisateur', this.state.ddnUtilisateur);

    //alert(this.state.sexeUtilisateur);
    formData.append('sexeUtilisateur', this.state.sexeUtilisateur);

    let clubs = [];

    formData.append('clubUtilisateur', JSON.stringify(clubs));

    formData.append('emailUtilisateur', this.state.emailUtilisateur);

    formData.append('telUtilisateur', '');

    var acceptChallengeTelUtilisateur = 0;
    if (this.state.acceptChallengeTelUtilisateur) {
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

                <View>
                  <Picker
                    mode="dropdown"
                    accessibilityLabel={'Choisissez votre année'}
                    iosHeader={'Choisissez votre année'}
                    iosIcon={<Icon name="chevron-down" type="FontAwesome5" />}
                    style={{marginTop: 0}}
                    selectedValue={this.state.anneeUser}
                    onValueChange={this.onChangeAnneeUser.bind(this)}
                    placeholder={'Choisissez votre année'}
                    placeholderStyle={{
                      color: ApiUtils.getColor(),
                    }}
                    placeholderIconColor={ApiUtils.getColor()}
                    textStyle={{color: ApiUtils.getColor()}}
                    itemStyle={{
                      color: ApiUtils.getColor(),
                      marginLeft: 0,
                      paddingLeft: 10,
                      borderBottomColor: ApiUtils.getColor(),
                      borderBottomWidth: 1,
                    }}
                    itemTextStyle={{
                      color: ApiUtils.getColor(),
                      borderBottomColor: ApiUtils.getColor(),
                      borderBottomWidth: 1,
                    }}>
                    <Picker.Item label="Choisissez votre année" value="-1" />
                    <Picker.Item label="Pas concerné" value="0" />
                    <Picker.Item label="1" value="1" />
                    <Picker.Item label="2" value="2" />
                    <Picker.Item label="3" value="3" />
                    <Picker.Item label="4" value="4" />
                    <Picker.Item label="5" value="5" />
                    <Picker.Item label="5+" value="5+" />
                  </Picker>
                </View>

                <View>
                  <Picker
                    mode="dropdown"
                    accessibilityLabel={'Choisissez votre département'}
                    iosHeader={'Choisissez votre département'}
                    iosIcon={<Icon name="chevron-down" type="FontAwesome5" />}
                    style={{marginTop: 0}}
                    selectedValue={this.state.departementUser}
                    onValueChange={this.onChangeDepartementUser.bind(this)}
                    placeholder={'Choisissez votre département'}
                    placeholderStyle={{
                      color: ApiUtils.getColor(),
                    }}
                    placeholderIconColor={ApiUtils.getColor()}
                    textStyle={{color: ApiUtils.getColor()}}
                    itemStyle={{
                      color: ApiUtils.getColor(),
                      marginLeft: 0,
                      paddingLeft: 10,
                      borderBottomColor: ApiUtils.getColor(),
                      borderBottomWidth: 1,
                    }}
                    itemTextStyle={{
                      color: ApiUtils.getColor(),
                      borderBottomColor: ApiUtils.getColor(),
                      borderBottomWidth: 1,
                    }}>
                    <Picker.Item
                      label="Choisissez votre département"
                      value="-1"
                    />
                    <Picker.Item label="Personnel INSA" value="0" />
                    <Picker.Item label="CNR" value="CNR" />
                    <Picker.Item label="FIMI" value="FIMI" />
                    <Picker.Item label="BIOSCIENCES" value="BIOSCIENCES" />
                    <Picker.Item
                      label="GÉNIE ÉLECTRIQUE"
                      value="GÉNIE ÉLECTRIQUE"
                    />
                    <Picker.Item
                      label="GÉNIE INDUSTRIEL"
                      value="GÉNIE INDUSTRIEL"
                    />
                    <Picker.Item
                      label="GÉNIE CIVIL ET URBANISME"
                      value="GÉNIE CIVIL ET URBANISME"
                    />
                    <Picker.Item
                      label="GÉNIE ÉNERGÉTIQUE ET ENVIRONNEMENT"
                      value="GÉNIE ÉNERGÉTIQUE ET ENVIRONNEMENT"
                    />
                    <Picker.Item label="INFORMATIQUE" value="INFORMATIQUE" />
                    <Picker.Item
                      label="GÉNIE MÉCANIQUE"
                      value="GÉNIE MÉCANIQUE"
                    />
                    <Picker.Item
                      label="SCIENCE ET GÉNIE DES MATÉRIAUX"
                      value="SCIENCE ET GÉNIE DES MATÉRIAUX"
                    />
                    <Picker.Item
                      label="TÉLÉCOMMUNICATIONS, SERVICES, USAGES"
                      value="TÉLÉCOMMUNICATIONS, SERVICES, USAGES"
                    />
                  </Picker>
                </View>

                <View>
                  <Picker
                    mode="dropdown"
                    accessibilityLabel={'Choisissez votre Groupe'}
                    iosHeader={'Choisissez votre Groupe'}
                    iosIcon={<Icon name="chevron-down" type="FontAwesome5" />}
                    style={{marginTop: 0}}
                    selectedValue={this.state.groupeUser}
                    onValueChange={this.onChangeGroupeUser.bind(this)}
                    placeholder={'Choisissez votre Groupe'}
                    placeholderStyle={{
                      color: ApiUtils.getColor(),
                    }}
                    placeholderIconColor={ApiUtils.getColor()}
                    textStyle={{color: ApiUtils.getColor()}}
                    itemStyle={{
                      color: ApiUtils.getColor(),
                      marginLeft: 0,
                      paddingLeft: 10,
                      borderBottomColor: ApiUtils.getColor(),
                      borderBottomWidth: 1,
                    }}
                    itemTextStyle={{
                      color: ApiUtils.getColor(),
                      borderBottomColor: ApiUtils.getColor(),
                      borderBottomWidth: 1,
                    }}>
                    <Picker.Item label="Choisissez votre Groupe" value="-1" />
                    <Picker.Item label="Pas concerné" value="0" />
                    <Picker.Item label="1" value="1" />
                    <Picker.Item label="2" value="2" />
                    <Picker.Item label="3" value="3" />
                    <Picker.Item label="4" value="4" />
                    <Picker.Item label="5" value="5" />
                    <Picker.Item label="6" value="6" />
                    <Picker.Item label="7" value="7" />
                    <Picker.Item label="8" value="8" />
                    <Picker.Item label="10" value="10" />
                    <Picker.Item label="11" value="11" />
                    <Picker.Item label="12" value="12" />
                    <Picker.Item label="13" value="13" />
                    <Picker.Item label="14" value="14" />
                    <Picker.Item label="15" value="15" />
                    <Picker.Item label="16" value="16" />
                    <Picker.Item label="17" value="17" />
                    <Picker.Item label="18" value="18" />
                    <Picker.Item label="16" value="16" />
                    <Picker.Item label="17" value="17" />
                    <Picker.Item label="18" value="18" />
                    <Picker.Item label="19" value="19" />
                    <Picker.Item label="20" value="20" />
                    <Picker.Item label="21" value="21" />
                    <Picker.Item label="22" value="22" />
                    <Picker.Item label="23" value="23" />
                    <Picker.Item label="24" value="24" />
                  </Picker>
                </View>

                <View>
                  <Picker
                    mode="dropdown"
                    accessibilityLabel={'Choisissez votre Créneau Sport'}
                    iosHeader={'Choisissez votre Créneau Sport'}
                    iosIcon={<Icon name="chevron-down" type="FontAwesome5" />}
                    style={{marginTop: 0}}
                    selectedValue={this.state.sportUser}
                    onValueChange={this.onChangeSportUser.bind(this)}
                    placeholder={'Choisissez votre Créneau Sport'}
                    placeholderStyle={{
                      color: ApiUtils.getColor(),
                    }}
                    placeholderIconColor={ApiUtils.getColor()}
                    textStyle={{color: ApiUtils.getColor()}}
                    itemStyle={{
                      color: ApiUtils.getColor(),
                      marginLeft: 0,
                      paddingLeft: 10,
                      borderBottomColor: ApiUtils.getColor(),
                      borderBottomWidth: 1,
                    }}
                    itemTextStyle={{
                      color: ApiUtils.getColor(),
                      borderBottomColor: ApiUtils.getColor(),
                      borderBottomWidth: 1,
                    }}>
                    <Picker.Item
                      label="Choisissez votre Créneau Sport"
                      value="-1"
                    />
                    <Picker.Item label="Pas concerné" value="0" />
                    <Picker.Item label="L8" value="L8" />
                    <Picker.Item label="L10" value="L10" />
                    <Picker.Item label="L14" value="L14" />
                    <Picker.Item label="L16" value="L16" />
                    <Picker.Item label="M8" value="M8" />
                    <Picker.Item label="M10" value="M10" />
                    <Picker.Item label="M14" value="M14" />
                    <Picker.Item label="M16" value="M16" />
                    <Picker.Item label="Me8" value="Me8" />
                    <Picker.Item label="Me10" value="Me10" />
                    <Picker.Item label="Me14" value="Me14" />
                    <Picker.Item label="Me16" value="Me16" />
                    <Picker.Item label="J8" value="J8" />
                    <Picker.Item label="V8" value="V8" />
                    <Picker.Item label="V10" value="V10" />
                    <Picker.Item label="V14" value="V14" />
                    <Picker.Item label="V16" value="V16" />
                  </Picker>
                </View>

                <View>
                  <Picker
                    mode="dropdown"
                    accessibilityLabel={'Choisissez votre AS'}
                    iosHeader={'Choisissez votre AS'}
                    iosIcon={<Icon name="chevron-down" type="FontAwesome5" />}
                    style={{marginTop: 0}}
                    selectedValue={this.state.asUser}
                    onValueChange={this.onChangeAsUser.bind(this)}
                    placeholder={'Choisissez votre AS'}
                    placeholderStyle={{
                      color: ApiUtils.getColor(),
                    }}
                    placeholderIconColor={ApiUtils.getColor()}
                    textStyle={{color: ApiUtils.getColor()}}
                    itemStyle={{
                      color: ApiUtils.getColor(),
                      marginLeft: 0,
                      paddingLeft: 10,
                      borderBottomColor: ApiUtils.getColor(),
                      borderBottomWidth: 1,
                    }}
                    itemTextStyle={{
                      color: ApiUtils.getColor(),
                      borderBottomColor: ApiUtils.getColor(),
                      borderBottomWidth: 1,
                    }}>
                    <Picker.Item label="Choisissez votre AS" value="-1" />
                    <Picker.Item label="Pas concerné" value="0" />
                    <Picker.Item label="Athlétisme" value="Athlétisme" />
                    <Picker.Item label="Aviron" value="Aviron" />
                    <Picker.Item label="Badminton" value="Badminton" />
                    <Picker.Item label="Basket" value="Basket" />
                    <Picker.Item
                      label="Boxe Francaise"
                      value="Boxe Francaise"
                    />
                    <Picker.Item label="Danse" value="Danse" />
                    <Picker.Item label="Equitation" value="Equitation" />
                    <Picker.Item label="Escalade" value="Escalade" />
                    <Picker.Item label="Foot" value="Foot" />
                    <Picker.Item label="Gymnastique" value="Gymnastique" />
                    <Picker.Item label="Hand-Ball" value="Hand-Ball" />
                    <Picker.Item label="Judo" value="Judo" />
                    <Picker.Item label="Natation" value="Natation" />
                    <Picker.Item label="Rugby" value="Rugby" />
                    <Picker.Item label="Squash" value="Squash" />
                    <Picker.Item label="Tennis" value="Tennis" />
                    <Picker.Item
                      label="Tennis de Table"
                      value="Tennis de Table"
                    />
                    <Picker.Item label="Tir à l'arc" value="Tir à l'arc" />
                    <Picker.Item label="Volley-Ball" value="Volley-Ball" />
                    <Picker.Item label="Water-Polo" value="Water-Polo" />
                  </Picker>
                </View>

                <View>
                  <Picker
                    mode="dropdown"
                    accessibilityLabel={'Choisissez votre Enseignant'}
                    iosHeader={'Choisissez votre Enseignant'}
                    iosIcon={<Icon name="chevron-down" type="FontAwesome5" />}
                    style={{marginTop: 0}}
                    selectedValue={this.state.enseignantUser}
                    onValueChange={this.onChangeEnseignantUser.bind(this)}
                    placeholder={'Choisissez votre Enseignant'}
                    placeholderStyle={{
                      color: ApiUtils.getColor(),
                    }}
                    placeholderIconColor={ApiUtils.getColor()}
                    textStyle={{color: ApiUtils.getColor()}}
                    itemStyle={{
                      color: ApiUtils.getColor(),
                      marginLeft: 0,
                      paddingLeft: 10,
                      borderBottomColor: ApiUtils.getColor(),
                      borderBottomWidth: 1,
                    }}
                    itemTextStyle={{
                      color: ApiUtils.getColor(),
                      borderBottomColor: ApiUtils.getColor(),
                      borderBottomWidth: 1,
                    }}>
                    <Picker.Item
                      label="Choisissez votre Enseignant"
                      value="-1"
                    />
                    <Picker.Item label="Pas concerné" value="0" />
                    <Picker.Item label="Agneray" value="Agneray" />
                    <Picker.Item label="Barraud" value="Barraud" />
                    <Picker.Item label="Bessac" value="Bessac" />
                    <Picker.Item label="Bizzoto" value="Bizzoto" />
                    <Picker.Item label="Cornuau" value="Cornuau" />
                    <Picker.Item label="Chazallet" value="Chazallet" />
                    <Picker.Item label="Comte" value="Comte" />
                    <Picker.Item label="Dumont" value="Dumont" />
                    <Picker.Item label="Delay" value="Delay" />
                    <Picker.Item label="Fleuret" value="Fleuret" />
                    <Picker.Item label="Fronton" value="Fronton" />
                    <Picker.Item label="Jars" value="Jars" />
                    <Picker.Item label="Jaussaud" value="Jaussaud" />
                    <Picker.Item label="Jellef" value="Jellef" />
                    <Picker.Item label="Jal" value="Jal" />
                    <Picker.Item label="Maillet" value="Maillet" />
                    <Picker.Item label="Pelegrin" value="Pelegrin" />
                    <Picker.Item label="Mignard" value="Mignard" />
                    <Picker.Item label="Perrier" value="Perrier" />
                    <Picker.Item label="Regis" value="Regis" />
                    <Picker.Item label="Savel" value="Savel" />
                    <Picker.Item label="Thomas" value="Thomas" />
                    <Picker.Item label="Roig-Pons" value="Roig-Pons" />
                    <Picker.Item label="Villeminot" value="Villeminot" />
                  </Picker>

                  {this.state.errorPickers ? (
                    <Text
                      style={{
                        width: '100%',
                        textAlign: 'center',
                        fontSize: 18,
                        color: 'red',
                      }}>
                      Vous n'avez pas rempli tous les champs !
                    </Text>
                  ) : null}
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
