import React, {Component} from 'react';
import {
  StyleSheet,
  View,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
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
} from 'native-base';
import md5 from 'md5';
import ApiUtils from '../ApiUtils';
import ErrorMessage from './ErrorMessage';
import moment from 'moment';
import Logo from '../assets/logo_header.png';
import AsyncStorage from '@react-native-community/async-storage';
import ValidationComponent from 'react-native-form-validator';
import defaultMessages from './defaultMessages';
import {connect} from 'react-redux';
import {KeyboardAvoidingView} from 'react-native';
import GlobalStyles from '../styles';
const mapStateToProps = state => {
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
    };
  }

  componentDidMount() {}

  ongoHome() {
    this.props.navigation.navigate('Home');
  }

  onClickValidate() {
    var isValid = this.validate({
      nomUtilisateur: {required: true},
      prenomUtilisateur: {required: true},
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
    this.setState({isLoading : true});
    let formData = new FormData();
    formData.append('method', 'createUtilisateur');
    formData.append('auth', ApiUtils.getAPIAuth());
    formData.append('idUtilisateur', this.state.idUtilisateur);

    formData.append('nomUtilisateur', this.state.nomUtilisateur);
    formData.append('prenomUtilisateur', this.state.prenomUtilisateur);

    var finalDate = moment(this.state.ddnUtilisateur).format('YYYY-MM-DD');
    // alert(finalDate)
    formData.append('ddnUtilisateur', finalDate);

    // formData.append('ddnUtilisateur', this.state.ddnUtilisateur);

    //alert(this.state.sexeUtilisateur);
    formData.append('sexeUtilisateur', this.state.sexeUtilisateur);

    let clubs = [];

    if (this.state.acceptChallengeEntreprise) {
      clubs.push({club: this.state.clubEntreprise, type: 'Entreprise'});
    }

    if (this.state.acceptChallengeFamille) {
      clubs.push({club: this.state.clubFamille, type: 'Famille'});
    }

    if (this.state.acceptChallengeUniversite) {
      clubs.push({club: this.state.clubUniversite, type: 'Ecole'});
    }

    if (this.state.acceptChallengeUnss) {
      clubs.push({club: this.state.unss, type: 'Unss'});
    }

    formData.append('emailUtilisateur', this.state.emailUtilisateur);
    formData.append('clubUtilisateur', JSON.stringify(clubs));

    formData.append('telUtilisateur', this.state.telUtilisateur);
    formData.append('adresseUtilisateur', this.state.adresseUtilisateur);
    formData.append('cpUtilisateur', this.state.cpUtilisateur);
    formData.append('villeUtilisateur', this.state.villeUtilisateur);
    formData.append('paysUtilisateur', this.state.paysUtilisateur);
    var acceptChallengeUtilisateur = 0;
    if (
      this.state.acceptChallengeUtilisateur ||
      this.state.acceptChallengeUtilisateur
    ) {
      acceptChallengeUtilisateur = 1;
    }

    formData.append('acceptChallengeUtilisateur', acceptChallengeUtilisateur);

    formData.append('passUtilisateur', md5(this.state.newPassword));

    fetch(ApiUtils.getAPIUrl(), {
      method: 'POST',
      headers: {},
      body: formData,
    })
      .then(ApiUtils.checkStatus)
      .then(response => response.json())
      .then(responseJson => {
        this.setState({isLoading : false});
        if (responseJson.codeErreur == 'SUCCESS') {
          var action = {type: 'LOGIN', data: responseJson};
          this.props.dispatch(action);

          this.onClickNavigate('Lives');
        } else {
          Toast.show({
            text: responseJson.message,
            buttonText: 'Ok',
            type: 'error',
            position: 'top',
          });
        }
      })
      .catch(e => {
        this.setState({isLoading : false});
        console.log(e);
        ApiUtils.logError('create account', JSON.stringify(e.message));
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

  goBack() {
    this.onClickNavigate('Home');
  }

  onClickNavigate(routeName) {
    this.props.navigation.navigate(routeName);
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
                     autoCapitalize="characters"
                    ref="nomUtilisateur"
                    returnKeyType="next"
                    clearButtonMode="always"
                    value={this.state.nomUtilisateur}
                    onChangeText={value =>
                      this.setState({nomUtilisateur: value})
                    }
                  />
                </Item>
                {this.isFieldInError('nomUtilisateur') &&
                  this.getErrorsInField('nomUtilisateur').map(errorMessage => (
                    <Text style={styles.error}>{errorMessage}</Text>
                  ))}

                {/* // <ErrorMessage value={this.state.nomUtilisateur} message="Le nom doit être renseigné" /> */}

                <Item stackedLabel style={{marginBottom: 5}}>
                  <Label>Prénom *</Label>
                  <Input
                   autoCapitalize="characters"
                    ref="prenomUtilisateur"
                    returnKeyType="next"
                    clearButtonMode="always"
                    value={this.state.prenomUtilisateur}
                    onChangeText={value =>
                      this.setState({prenomUtilisateur: value})
                    }
                  />
                </Item>
                {this.isFieldInError('prenomUtilisateur') &&
                  this.getErrorsInField('prenomUtilisateur').map(
                    errorMessage => (
                      <Text style={styles.error}>{errorMessage}</Text>
                    ),
                  )}

                <Item stackedLabel style={{marginBottom: 5}}>
                  <Label>Email *</Label>
                  <Input
                    ref="emailUtilisateur"
                    autoCompleteType='email'
                    returnKeyType="next"
                    autoCapitalize="characters"
                    clearButtonMode="always"
                    value={this.state.emailUtilisateur}
                    onChangeText={value =>
                      this.setState({
                        emailUtilisateur: value.replace(/\s+/g, ''),
                      })
                    }
                  />
                </Item>
                {this.isFieldInError('emailUtilisateur') &&
                  this.getErrorsInField('emailUtilisateur').map(
                    errorMessage => (
                      <Text style={styles.error}>{errorMessage}</Text>
                    ),
                  )}

                {/* <Item stackedLabel style={{marginBottom: 5}}>
                  <Label>Numéro de télephone </Label>
                  <Input
                    returnKeyType="next"
                    clearButtonMode="always"
                    value={this.state.telUtilisateur}
                    onChangeText={value =>
                      this.setState({telUtilisateur: value})
                    }
                  />
                </Item> */}

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

                <Text style={styles.label}>Date de naissance</Text>
                <Text style={{paddingHorizontal : 10, fontSize :12, fontStyle : 'italic'}}>Important pour les classements par catégorie</Text>
                {this.state != null && !this.state.showDefaultDdn ? (
                  <DatePicker
                    // style={{marginLeft: 20}}
                    date={new Date(this.state.ddnUtilisateur)}
                    defaultDate={
                      this.state.showDefaultDdn
                        ? new Date(this.props.userData.ddnUtilisateur)
                        : null
                    }
                    placeHolderText="Choisir une date de naissance"
                    placeHolderTextStyle={{
                      marginLeft: 30,
                      fontSize: 17,
                      color: '#d3d3d3',
                      fontStyle: 'italic',
                    }}
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
                    onDateChange={date => {
                      //  alert(date)
                      this.setState({ddnUtilisateur: date});
                    }}
                  />
                ) : null}

                <Item stackedLabel style={{marginBottom: 5}}>
                  <Label>Adresse</Label>
                  <Input
                   autoCapitalize="characters"
                    returnKeyType="next"
                    clearButtonMode="always"
                    value={this.state.adresseUtilisateur}
                    onChangeText={value =>
                      this.setState({adresseUtilisateur: value})
                    }
                  />
                </Item>

                <Item stackedLabel style={{marginBottom: 5}}>
                  <Label>Code Postal</Label>
                  <Input
                   autoCapitalize="characters"
                    returnKeyType="next"
                    clearButtonMode="always"
                    value={this.state.cpUtilisateur}
                    onChangeText={value =>
                      this.setState({cpUtilisateur: value})
                    }
                  />
                </Item>

                <Item stackedLabel style={{marginBottom: 5}}>
                  <Label>Ville</Label>
                  <Input
                   autoCapitalize="characters"
                    returnKeyType="next"
                    clearButtonMode="always"
                    value={this.state.villeUtilisateur}
                    onChangeText={value =>
                      this.setState({villeUtilisateur: value})
                    }
                  />
                </Item>

                {/* <Item stackedLabel style={{marginBottom: 5}}>
                  <Label>Club</Label>
                  <Input
                    returnKeyType="next"
                    clearButtonMode="always"
                    value={this.state.clubUtilisateur}
                    onChangeText={value =>
                      this.setState({clubUtilisateur: value})
                    }
                  />
                </Item> */}

                {/* <Item stackedLabel style={{marginBottom: 5}}>
                  <Label>Mot de passe *</Label>
                  <Input
                    ref="newPassword"
                    returnKeyType="next"
                    secureTextEntry={true}
                    clearButtonMode="always"
                    value={this.state.newPassword}
                    onChangeText={newPassword => this.setState({newPassword})}
                  />
                </Item>

                {this.isFieldInError('newPassword') &&
                  this.getErrorsInField('newPassword').map(errorMessage => (
                    <Text style={styles.error}>{errorMessage}</Text>
                  ))} */}

                {/* <Item stackedLabel style={{marginBottom: 5}}>
                  <Label>Confirmation du mot de passe *</Label>
                  <Input
                    ref="newPasswordConfirmation"
                    returnKeyType="next"
                    secureTextEntry={true}
                    clearButtonMode="always"
                    value={this.state.newPasswordConfirmation}
                    onChangeText={newPasswordConfirmation =>
                      this.setState({newPasswordConfirmation})
                    }
                  />
                </Item> */}

                {/* {this.isFieldInError('newPasswordConfirmation') &&
                  this.getErrorsInField('newPasswordConfirmation').map(
                    errorMessage => (
                      <Text style={styles.error}>{errorMessage}</Text>
                    ),
                  )} */}

                {/* {this.state.newPassword != '' && this.state.newPasswordConfirmation != this.state.newPassword ? 
            <ErrorMessage value={''} message="Les mots de passe ne correspondent pas" /> : null} */}

                <Text
                  style={{textAlign: 'left', marginTop: 20, paddingLeft: 20}}>
                  Informations Complementaires
                </Text>

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
                    style={{marginTop: -5}}
                    onValueChange={text =>
                      this.setState({acceptChallengeEntreprise: text})
                    }
                    value={this.state.acceptChallengeEntreprise}
                  />
                  <TouchableOpacity
                    onPress={() =>
                      this.setState({
                        acceptChallengeEntreprise: !this.state
                          .acceptChallengeEntreprise,
                      })
                    }>
                    <Text style={{marginLeft: 10}}>
                      Je participe au challenge entreprise
                    </Text>
                  </TouchableOpacity>
                </View>

                {this.state.acceptChallengeEntreprise ? (
                  <Item stackedLabel style={{marginBottom: 5, marginTop: 10}}>
                    <Label>Nom de mon équipe entreprise</Label>
                    <Input
                     autoCapitalize="characters"
                      returnKeyType="next"
                      clearButtonMode="always"
                      value={this.state.clubEntreprise}
                      onChangeText={value =>
                        this.setState({clubEntreprise: value})
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
                    style={{marginTop: -5}}
                    onValueChange={text =>
                      this.setState({acceptChallengeFamille: text})
                    }
                    value={this.state.acceptChallengeFamille}
                  />
                  <TouchableOpacity
                    onPress={() =>
                      this.setState({
                        acceptChallengeFamille: !this.state
                          .acceptChallengeFamille,
                      })
                    }>
                    <Text style={{marginLeft: 10}}>
                      Je participe au challenge Famille/amis
                    </Text>
                  </TouchableOpacity>
                </View>

                {this.state.acceptChallengeFamille ? (
                  <Item stackedLabel style={{marginBottom: 5, marginTop: 10}}>
                    <Label>Nom de mon équipe Famille/Ami</Label>
                    <Input
                     autoCapitalize="characters"
                      returnKeyType="next"
                      clearButtonMode="always"
                      value={this.state.clubFamille}
                      onChangeText={value =>
                        this.setState({clubFamille: value})
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
                    style={{marginTop: -5}}
                    onValueChange={text =>
                      this.setState({acceptChallengeUniversite: text})
                    }
                    value={this.state.acceptChallengeUniversite}
                  />
                  <TouchableOpacity
                    onPress={() =>
                      this.setState({
                        acceptChallengeUniversite: !this.state
                          .acceptChallengeUniversite,
                      })
                    }>
                    <Text style={{marginLeft: 10}}>
                      Je participe au challenge Université
                    </Text>
                  </TouchableOpacity>
                </View>

                {this.state.acceptChallengeUniversite ? (
                  <Item stackedLabel style={{marginBottom: 5, marginTop: 10}}>
                    <Label>Nom de mon équipe Université</Label>
                    <Input
                     autoCapitalize="characters"
                      returnKeyType="next"
                      clearButtonMode="always"
                      value={this.state.clubUniversite}
                      onChangeText={value =>
                        this.setState({clubUniversite: value})
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
                    style={{marginTop: -5}}
                    onValueChange={text =>
                      this.setState({acceptChallengeUnss: text})
                    }
                    value={this.state.acceptChallengeUnss}
                  />
                  <TouchableOpacity
                    onPress={() =>
                      this.setState({
                        acceptChallengeUnss: !this.state
                          .acceptChallengeUnss,
                      })
                    }>
                    <Text style={{marginLeft: 10}}>
                    je participe à la foulée des jeunes
                    </Text>
                  </TouchableOpacity>
                </View>


                {this.state.acceptChallengeUnss ? (
                  <Item stackedLabel style={{marginBottom: 5, marginTop: 10}}>
                    <Label>AS UNSS</Label>
                    <Input
                     autoCapitalize="characters"
                      returnKeyType="next"
                      clearButtonMode="always"
                      value={this.state.unss}
                      onChangeText={value =>
                        this.setState({unss: value})
                      }
                    />
                  </Item>
                ) : null}

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
                  style={{paddingTop: 20}}
                  onValueChange={text =>
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
                    J'accepte que mon nom apparaisse dans le classement
                  </Text>
                </TouchableOpacity>
              </View>

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
    alignSelf: 'center',
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
