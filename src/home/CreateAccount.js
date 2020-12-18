import React, {Component} from 'react';
import {
  StyleSheet,
  View,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  Switch,
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
import AsyncStorage from '@react-native-community/async-storage';
import ValidationComponent from 'react-native-form-validator';
import defaultMessages from './defaultMessages';
import {connect} from 'react-redux';

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
      newPassword: {required: true},
      newPasswordConfirmation: {required: true},
      emailUtilisateur: {email: true, required: true},
      newPassword: {
        required: true,
        equalPassword: this.state.newPasswordConfirmation,
      },
      newPasswordConfirmation: {
        required: true,
        equalPassword: this.state.newPassword,
      },
    });

    // var isError = this.isErrorForm();

    // if (!!this.state.newPassword && this.state.newPassword != '') {
    //   if (this.state.newPasswordConfirmation != this.state.newPassword) {
    //     isError = true;
    //   }
    // } else {
    //   isError = true;
    // }

    if (isValid) {
      this.onSendRequest();
    }
  }

  onSendRequest() {
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

    formData.append('clubUtilisateur', this.state.clubUtilisateur);
    formData.append('emailUtilisateur', this.state.emailUtilisateur);
    formData.append('telUtilisateur', this.state.telUtilisateur);
    formData.append('adresseUtilisateur', this.state.adresseUtilisateur);
    formData.append('cpUtilisateur', this.state.cpUtilisateur);
    formData.append('villeUtilisateur', this.state.villeUtilisateur);
    formData.append('paysUtilisateur', this.state.paysUtilisateur);
    var acceptChallengeUtilisateur = 0;
    if(this.state.acceptChallengeUtilisateur || this.state.acceptChallengeUtilisateur )
    {
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
      .catch(e => ApiUtils.logError('CreateAccount onSendRequest', e.message));
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
                  onPress={() => this.onClickValidate()}>
                  <Text
                    style={[
                      styles.saveText,
                      {color: 1 == 1 ? 'black' : 'black'},
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
                  ref="nomUtilisateur"
                  returnKeyType="next"
                  clearButtonMode="always"
                  value={this.state.nomUtilisateur}
                  onChangeText={value => this.setState({nomUtilisateur: value})}
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
                this.getErrorsInField('prenomUtilisateur').map(errorMessage => (
                  <Text style={styles.error}>{errorMessage}</Text>
                ))}

              <Item stackedLabel style={{marginBottom: 5}}>
                <Label>Email *</Label>
                <Input
                  ref="emailUtilisateur"
                  returnKeyType="next"
                  clearButtonMode="always"
                  value={this.state.emailUtilisateur}
                  onChangeText={value =>
                    this.setState({ emailUtilisateur: value.replace(/\s+/g, '') })
                  }
                />
              </Item>
              {this.isFieldInError('emailUtilisateur') &&
                this.getErrorsInField('emailUtilisateur').map(errorMessage => (
                  <Text style={styles.error}>{errorMessage}</Text>
                ))}

              <Item stackedLabel style={{marginBottom: 5}}>
                <Label>Numéro de télephone </Label>
                <Input
                  returnKeyType="next"
                  clearButtonMode="always"
                  value={this.state.telUtilisateur}
                  onChangeText={value => this.setState({telUtilisateur: value})}
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
                    width: '50%',
                    justifyContent: 'space-around',
                  }}
                  onPress={() => this.setState({sexeUtilisateur: 'H'})}>
                  <Text>Homme</Text>
                  <Radio
                    selected={this.state.sexeUtilisateur == 'H'}
                    onPress={() => this.setState({sexeUtilisateur: 'H'})}
                  />
                </TouchableOpacity>
              </View>

              <Text style={styles.label}>Date de naissance</Text>
              {this.state != null && !this.state.showDefaultDdn ? (
                <DatePicker
                  style={{marginLeft: 20}}
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
                  returnKeyType="next"
                  clearButtonMode="always"
                  value={this.state.cpUtilisateur}
                  onChangeText={value => this.setState({cpUtilisateur: value})}
                />
              </Item>

              <Item stackedLabel style={{marginBottom: 5}}>
                <Label>Ville</Label>
                <Input
                  returnKeyType="next"
                  clearButtonMode="always"
                  value={this.state.villeUtilisateur}
                  onChangeText={value =>
                    this.setState({villeUtilisateur: value})
                  }
                />
              </Item>

              <Item stackedLabel style={{marginBottom: 5}}>
                <Label>Club</Label>
                <Input
                  returnKeyType="next"
                  clearButtonMode="always"
                  value={this.state.clubUtilisateur}
                  onChangeText={value =>
                    this.setState({clubUtilisateur: value})
                  }
                />
              </Item>

              <Item stackedLabel style={{marginBottom: 5}}>
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
                ))}

              <Item stackedLabel style={{marginBottom: 5}}>
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
              </Item>

              {this.isFieldInError('newPasswordConfirmation') &&
                this.getErrorsInField('newPasswordConfirmation').map(
                  errorMessage => (
                    <Text style={styles.error}>{errorMessage}</Text>
                  ),
                )}

              {/* {this.state.newPassword != '' && this.state.newPasswordConfirmation != this.state.newPassword ? 
            <ErrorMessage value={''} message="Les mots de passe ne correspondent pas" /> : null} */}
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
                onValueChange={text =>
                  this.setState({acceptChallengeUtilisateur: text})
                }
                value={this.state.acceptChallengeUtilisateur}
              />
              <Text style={{marginLeft: 10}}>
                J'accepte que mon nom apparaisse dans le classement des
                spéciales
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
        </Container>
      </Root>
    );
  }
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: ApiUtils.getBackgroundColor(),
    width: '100%',
  },
  title: {
    width: '25%',
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
