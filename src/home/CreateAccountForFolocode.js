
import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  TextInput,
  Image,
  ScrollView
} from 'react-native';
import {
  Container, Header,
  Body,
  Text,
  Button,
  Icon, DatePicker,
} from 'native-base';
import md5 from 'md5';
import Toaster, { ToastStyles } from 'react-native-toaster';
import ApiUtils from '../ApiUtils';
import ErrorMessage from './ErrorMessage';
import AsyncStorage from '@react-native-community/async-storage';
import { connect } from 'react-redux'
var radio_props = [
  { label: 'Homme', value: 'H' },
  { label: 'Femme', value: 'F' }
];

const errorToast = { text: 'Une erreur est survenue!', styles: ToastStyles.error, duration: 700 }
const successToast = { text: 'Votre compte est crée !', styles: ToastStyles.success, duration: 700 };

const mapStateToProps = (state) => {
  return {
    userData: state.userData
  }
}

class CreateAccount extends Component {
  constructor(props) {
    super(props);

    this.state = {
      userdata: {
        nomUtilisateur: "",
        prenomUtilisateur: "",
        folocodeUtilisateur: "",
        idUtilisateur: "",
        telUtilisateur: "",
        clubUtilisateur: "",
        villeUtilisateur: "",
        cpUtilisateur: "",
        adresseUtilisateur: "",
        newPassword: '',
        newPasswordConfirmation: '',

      },
      toasterMessage: '',
      isErrorName: false,
      lives: [],



    }
  }

  componentDidMount() {

    this.setState({ userdata: this.props.userData });
  }

  onDrawer() {
    this.props.navigation.openDrawer();
  }


  ongoHome() {
    this.props.navigation.navigate('Home');
  }

  isErrorForm() {
    var isError = false;
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

    // if (this.state.userdata.adresseUtilisateur == '') {
    //   isError = true;
    // }

    // if (this.state.userdata.cpUtilisateur == '') {
    //   isError = true;
    // }

    // if (this.state.userdata.villeUtilisateur == '') {
    //   isError = true;
    // }

    if (!!this.state.newPassword && this.state.newPassword != '') {

      if (this.state.newPasswordConfirmation != this.state.newPassword) {
        isError = true;
      }
    } else {
      isError = true;
    }

    return isError;
  }


  onClickValidate() {

    var isError = this.isErrorForm();

    if (!!this.state.newPassword && this.state.newPassword != '') {
      if (this.state.newPasswordConfirmation != this.state.newPassword) {
        isError = true;
      }
    } else {
      isError = true;
    }

    if (!isError) {
      this.onSendRequest();
    }

  }

  validateEmail(email) {
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
  }

  onSendRequest() {

    let formData = new FormData();
    formData.append('method', 'updateUtilisateur');
    formData.append('auth', ApiUtils.getAPIAuth());
    formData.append('idUtilisateur', this.state.userdata.idUtilisateur);

    formData.append('nomUtilisateur', this.state.userdata.nomUtilisateur);
    formData.append('prenomUtilisateur', this.state.userdata.prenomUtilisateur);
    formData.append('ddnUtilisateur', this.state.userdata.ddnUtilisateur);

    formData.append('sexeUtilisateur', this.state.userdata.sexeUtilisateur);


    formData.append('clubUtilisateur', this.state.userdata.clubUtilisateur);
    formData.append('emailUtilisateur', this.state.userdata.emailUtilisateur);
    formData.append('telUtilisateur', this.state.userdata.telUtilisateur);
    formData.append('adresseUtilisateur', this.state.userdata.adresseUtilisateur);
    formData.append('cpUtilisateur', this.state.userdata.cpUtilisateur);
    formData.append('villeUtilisateur', this.state.userdata.villeUtilisateur);
    formData.append('paysUtilisateur', this.state.userdata.paysUtilisateur);
    formData.append('passUtilisateur', md5(this.state.newPassword));


    fetch(ApiUtils.getAPIUrl(), {
      method: 'POST',
      headers: {
      },
      body: formData
    })
      .then(ApiUtils.checkStatus)
      .then(response => response.json())
      .then((responseJson) => {
        if (responseJson.codeErreur == "SUCCESS") {

          this.setState({ toasterMessage: successToast });
          this.setState({ toasterMessage: '' });
          this.saveUserInfo(responseJson).then(this.onClickNavigate('Lives'));
        } else {
          errorToast.text = responseJson.message;
          this.setState({ toasterMessage: errorToast });
          this.setState({ toasterMessage: '' });
        }
      })
      .catch(e => ApiUtils.logError('CreateAccount onSendRequest', e.message)).then(

      );

  }

  goBack() {
    this.onClickNavigate('Home');
  }

  onClickNavigate(routeName) {
    this.props.navigation.navigate(routeName);
  }




  saveUserInfo(userdata) {
    try {
      return AsyncStorage.setItem('@followme:userdata', JSON.stringify(userdata));
    } catch (error) {
      ApiUtils.logError('create account saveUserInfo', error.message)
    }
  }

  static navigationOptions = {
    drawerLabel: () => null,
    drawerLockMode: () => "locked-closed",
  };


  render() {
    return (

      <Container>
        <Body style={styles.body}>

          <Header style={styles.header}>
            <Body>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', paddingRight: 0, paddingLeft: 5 }}>
                <Button style={styles.drawerButton} >

                </Button>
                {/* <Text style={styles.title}>Préferences</Text> */}
                <Button style={styles.saveButton}
                  onPress={() => this.onClickValidate()} disabled={this.isErrorForm()} ><Text style={styles.saveText}>ENREGISTRER</Text>
                </Button>

              </View>

            </Body>
          </Header>
          <View style={styles.loginButtonSection}>
            <ScrollView contentContainerStyle={styles.loginButtonSection}>


              <Text style={styles.label}>Nom *</Text>
              <TextInput style={styles.inputCode} placeholder="Nom" value={this.state.userdata.nomUtilisateur} onChangeText={(phoneNumber) => this.setState({ userdata: { ...this.state.userdata, nomUtilisateur: phoneNumber } })} />
              <ErrorMessage value={this.state.userdata.nomUtilisateur} message="Le nom doit être renseigné" />

              <Text style={styles.label}>Prénom *</Text>
              <TextInput style={styles.inputCode} placeholder="Prénom" value={this.state.userdata.prenomUtilisateur} onChangeText={(phoneNumber) => this.setState({ userdata: { ...this.state.userdata, prenomUtilisateur: phoneNumber } })} />
              <ErrorMessage value={this.state.userdata.prenomUtilisateur} message="Le nom doit être renseigné" />

              <Text style={styles.label}>Email *</Text>
              <TextInput keyboardType='email-address' style={styles.inputCode} placeholder="Adresse email" value={this.state.userdata.emailUtilisateur} onChangeText={(phoneNumber) => this.setState({ userdata: { ...this.state.userdata, emailUtilisateur: phoneNumber } })} />
              <ErrorMessage value={this.state.userdata.emailUtilisateur} message="L'adresse email doit être renseignée" />
              {this.state.userdata.emailUtilisateur != '' && !this.validateEmail(this.state.userdata.emailUtilisateur) ? <ErrorMessage value={''} message="L'adresse email n'est pas valide" />
                : null}

              <Text style={styles.label}>Mot de passe *</Text>
              <TextInput secureTextEntry={true} style={styles.inputCode} placeholder="Mot de passe" value={this.state.newPassword} onChangeText={(newPassword) => this.setState({ newPassword })} />
              <ErrorMessage value={this.state.newPassword} message="Le mot de passe doit être renseigné" />

              <Text style={styles.label}>Confirmation du mot de passe *</Text>
              <TextInput secureTextEntry={true} style={styles.inputCode} placeholder="Confirmez votre mot de passe" value={this.state.newPasswordConfirmation} onChangeText={(newPasswordConfirmation) => this.setState({ newPasswordConfirmation })} />
              {this.state.newPassword != '' && this.state.newPasswordConfirmation != this.state.newPassword ? <ErrorMessage value={''} message="Les mots de passe ne correspondent pas" /> : null}

              <Text style={styles.label}>Numéro de télephone</Text>
              {/* <Text style={styles.inputCode} >{this.state.userdata.telUtilisateur}</Text> */}
              <TextInput keyboardType='numeric' style={styles.inputCode} placeholder="Numero de télephone" value={this.state.userdata.telUtilisateur} onChangeText={(phoneNumber) => this.setState({ userdata: { ...this.state.userdata, telUtilisateur: phoneNumber } })} />

              <Text style={styles.label}>Sexe</Text>

              <TouchableOpacity style={{ display: 'flex', flexDirection: 'row', width: '50%', justifyContent: 'space-around' }}
                onPress={() => { this.setState({ userdata: { ...this.state.userdata, sexeUtilisateur: 'F' } }) }}
              >

                <Text>Femme</Text>
                <Radio selected={this.state.userdata.sexeUtilisateur == 'F'}
                  onPress={() => { this.setState({ userdata: { ...this.state.userdata, sexeUtilisateur: 'F' } }) }}
                />
              </TouchableOpacity>
              <TouchableOpacity style={{ display: 'flex', flexDirection: 'row', width: '50%', justifyContent: 'space-around' }}
                onPress={() => { this.setState({ userdata: { ...this.state.userdata, sexeUtilisateur: 'H' } }) }}
              >
                <Text>Homme</Text>
                <Radio selected={this.state.userdata.sexeUtilisateur == 'H'}
                  onPress={() => { this.setState({ userdata: { ...this.state.userdata, sexeUtilisateur: 'H' } }) }} />
              </TouchableOpacity>


              <Text style={styles.label}>Date de naissance</Text>
              <DatePicker
                style={{ width: 200 }}
                date={this.state.userdata.ddnUtilisateur}
                mode="date"

                format="YYYY-MM-DD"
                confirmBtnText="Valider"
                cancelBtnText="Annuler"
                customStyles={{
                  dateIcon: {
                    position: 'absolute',
                    left: 0,
                    top: 4,
                    marginLeft: 0
                  },
                  dateInput: {
                    marginLeft: 36
                  }
                  // ... You can check the source to find the other keys.
                }}
                onDateChange={(date) => { this.setState({ userdata: { ...this.state.userdata, ddnUtilisateur: date } }) }}
              />

              <Text style={styles.label}>Adresse</Text>
              <TextInput style={styles.inputCode} placeholder="Adresse" value={this.state.userdata.adresseUtilisateur} onChangeText={(phoneNumber) => this.setState({ userdata: { ...this.state.userdata, adresseUtilisateur: phoneNumber } })} />
              {/* <ErrorMessage value={this.state.userdata.adresseUtilisateur} message="L'adresse doit être renseignée" /> */}

              <Text style={styles.label}>Code Postal</Text>
              <TextInput keyboardType='numeric' style={styles.inputCode} placeholder="Code postal" value={this.state.userdata.cpUtilisateur} onChangeText={(phoneNumber) => this.setState({ userdata: { ...this.state.userdata, cpUtilisateur: phoneNumber } })} />
              {/* <ErrorMessage value={this.state.userdata.cpUtilisateur} message="Le code postal doit être renseigné" /> */}

              <Text style={styles.label}>Ville</Text>
              <TextInput style={styles.inputCode} placeholder="Ville" value={this.state.userdata.villeUtilisateur} onChangeText={(phoneNumber) => this.setState({ userdata: { ...this.state.userdata, villeUtilisateur: phoneNumber } })} />
              {/* <ErrorMessage value={this.state.userdata.villeUtilisateur} message="La ville doit être renseignée" /> */}

              <Text style={styles.label} >Club</Text>
              <TextInput style={styles.inputCode} placeholder="Club" value={this.state.userdata.clubUtilisateur} onChangeText={(phoneNumber) => this.setState({ userdata: { ...this.state.userdata, clubUtilisateur: phoneNumber } })} />


            </ScrollView>

            <Toaster message={this.state.toasterMessage} />
          </View>
        </Body>


      </Container>
    );
  }
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: ApiUtils.getBackgroundColor(),
    width: '100%'
  },
  title: {

    width: '25%',
  },
  saveButton: {
    backgroundColor: 'transparent',
    width: 130,
    marginTop: 0,
    paddingTop: 0,
    shadowOffset: { height: 0, width: 0 },
    shadowOpacity: 0,
    elevation: 0
  },
  drawerButton: {
    backgroundColor: 'transparent',
    width: 120,
    marginTop: 0,
    paddingTop: 10,
    shadowOffset: { height: 0, width: 0 },
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
    fontSize: 12
  },
  label: {
    padding: 5,
    marginTop: 5,
  },
  p: {
    fontSize: 12,
    marginBottom: 5
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