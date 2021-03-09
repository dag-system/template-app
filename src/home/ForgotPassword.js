import React from 'react';
import {
  StyleSheet,
  View,
  Image,
  TouchableOpacity,
  Keyboard,
} from 'react-native';
import {
  Container,
  Header,
  Body,
  Text,
  Toast,
  Button,
  Item,
  Label,
  Input,
  Root,
  Icon,
  Left,
  Right,
  Picker,
} from 'native-base';
import Logo from '../assets/logo_header.png';
import {Button as ButtonElement} from 'react-native-elements';
import {connect} from 'react-redux';
import ApiUtils from '../ApiUtils';
import defaultMessages from './defaultMessages';
import GlobalStyles from '../styles';
import ValidationComponent from 'react-native-form-validator';

const mapStateToProps = (state) => {
  return {
    userData: state.userData,
    folocodes: state.folocodes,
  };
};

class ForgotPassword extends ValidationComponent {
  constructor(props) {
    super(props);
    this.input = React.createRef();
    this.messages = defaultMessages;
    this.deviceLocale = 'fr';

    this.state = {
      emailUtilisateur: '',
      folocodes: [],
      selectedFolocode: -1,
    };
  }

  componentDidMount() {}

  ongoHome() {
    this.props.navigation.navigate('Home');
  }

  onClickValidate() {
    // this.emailInput?.blur();
    var isValid = this.validate({
      emailUtilisateur: {email: true, required: true},
    });
    Keyboard.dismiss();

    this.setState({folocodes: [], selectedFolocode: -1});

    if (isValid) {
      this.onSendRequest();
    }
  }
  onClickSendFollowCode() {
    if (this.state.selectedFolocode != -1) {
      let formData = new FormData();
      formData.append('method', 'getInformationsUtilisateur');
      formData.append('organisation', ApiUtils.getOrganisation());
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
        .then((response) => response.json())
        .then((responseJson) => {

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
        .catch((e) => {
          this.setState({isLoading: false});
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

  onSendRequest() {
    let formData = new FormData();
    formData.append('method', 'getFolocode');
    formData.append('auth', ApiUtils.getAPIAuth());
    formData.append('emailUtilisateur', this.state.emailUtilisateur);
    formData.append('organisation', ApiUtils.getOrganisation());

    fetch(ApiUtils.getAPIUrl(), {
      method: 'POST',
      headers: {},
      body: formData,
    })
      .then(ApiUtils.checkStatus)
      .then((response) => response.json())
      .then((responseJson) => {
        if (responseJson.codeErreur == 'SUCCESS') {
          console.log('test');
          console.log(responseJson);
          var folocodes = Object.values(responseJson);
          this.setState({folocodes: folocodes});
          // Toast.show({
          //   text: "Votre mot de passe vous a été envoyé par email à l'instant",
          //   buttonText: 'Ok',
          //   type: 'success',
          //   position: 'bottom',

          // });
        } else {
          console.log(responseJson.message);
          Toast.show({
            text: responseJson.message,
            buttonText: 'Ok',
            type: 'error',
            position: 'bottom',
          });
        }
      })
      .catch((e) => {
        console.log(e);
        this.setState({spinner: false});

        ApiUtils.logError('create live', JSON.stringify(e.message));
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

  static navigationOptions = {
    drawerLabel: () => null,
    drawerLockMode: () => 'locked-closed',
  };

  onValueFolocodeChange(value) {
    this.setState({
      selectedFolocode: value,
    });
  }

  render() {
    return (
      <Root>
        <Container>
          {/* <Header style={styles.header}>
            <Body>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', paddingRight: 0, paddingLeft: 5 }}>
                <Button style={styles.drawerButton} onPress={() => this.goBack()}>
                  <Icon style={styles.saveText} name="chevron-left" type="FontAwesome5" />
                  <Text style={styles.saveText}>Précedent</Text>
                </Button>


              </View>

            </Body>
          </Header> */}

          <Header style={styles.header}>
            <Left>
              <Button style={styles.drawerButton} onPress={() => this.goBack()}>
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

          <View style={styles.loginButtonSection}>
            <Text style={{textAlign: 'justify'}}>
              Entrez votre email ci-dessous pour récuperer votre code
            </Text>

            <Item stackedLabel style={{marginBottom: 5, marginTop: 20}}>
              <Label>Email *</Label>
              <Input
                ref={(c) => (this.input = c)}
                //  ref={this.input}
                // ref={(c) => {
                //   this.emailInput = c;
                // }}

                returnKeyType="next"
                clearButtonMode="always"
                value={this.state.emailUtilisateur}
                onChangeText={(value) =>
                  this.setState({emailUtilisateur: value})
                }
              />
            </Item>
            {this.isFieldInError('emailUtilisateur') &&
              this.getErrorsInField('emailUtilisateur').map((errorMessage) => (
                <Text style={styles.error}>{errorMessage}</Text>
              ))}

            <View style={{marginTop: 40}}>
              <TouchableOpacity
                
                style={[
                  GlobalStyles.button,
                  {
                    width: '100%',
                    elevation: 0,
                    borderColor:
                    this.isFieldInError('emailUtilisateur') || this.state.emailUtilisateur == ''
                        ? 'black'
                        : ApiUtils.getBackgroundColor(),
                    borderWidth: 1,
                    padding: 10,
                  },

                  this.isFieldInError('emailUtilisateur') || this.state.emailUtilisateur == ''
                    ? {backgroundColor: 'transparent'}
                    : {backgroundColor: ApiUtils.getBackgroundColor()},
                ]}
                onPress={() => this.onClickSendFollowCode()}
                disabled={
                  this.isFieldInError('emailUtilisateur') || this.state.emailUtilisateur == ''
                }
                // style={[
                //   styles.saveButton,
                //   {
                //     backgroundColor:
                //     this.isFieldInError('emailUtilisateur') || this.state.emailUtilisateur == ''
                //         ? 'transparent'
                //         : ApiUtils.getBackgroundColor(),
                //   },
                // ]}
                onPress={() => this.onClickValidate()}>
                   <Text
                        style={{
                          fontWeight: 'bold',
                          textAlign: 'center',
                          color:
                          this.isFieldInError('emailUtilisateur') || this.state.emailUtilisateur == ''
                              ? 'black'
                              : 'white',
                        }}>
                        Envoyer
                      </Text>
              </TouchableOpacity>
            </View>

            {this.state.folocodes.length > 0 ? (
              <View>
                <Text style={{textAlign: 'center', marginTop: 10}}>
                  Vos codes
                </Text>

                {/* {this.state.folocodes.map()} */}

                <Picker
                  style={{width: 300}}
                  mode="dropdown"
                  accessibilityLabel={'Choisir le Code'}
                  iosHeader={'Choisir le Code'}
                  iosIcon={<Icon name="chevron-down" type="FontAwesome5" />}
                  selectedValue={this.state.selectedFolocode}
                  onValueChange={this.onValueFolocodeChange.bind(this)}
                  placeholder={'Choisissez le Code'}
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
                  <Picker.Item label="Choisissez le Code" value={-1} />
                  {this.state.folocodes
                    .filter((f) => f.folocodeUtilisateur != undefined)
                    .map((folocode) => {
                      return (
                        <Picker.Item
                          label={
                            folocode.folocodeUtilisateur +
                            ' ' +
                            folocode.prenomUtilisateur +
                            ' ' +
                            folocode.nomUtilisateur
                          }
                          value={folocode.folocodeUtilisateur}
                        />
                      );
                    })}
                </Picker>

                {this.state.selectedFolocode != -1 ? (
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
                ) : null}
              </View>
            ) : null}
          </View>
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
  saveButton: {
    marginTop: 60,
    elevation: 0,
    //  backgroundColor : '#827909'
  },
  label: {
    padding: 5,
    marginTop: 30,
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
    marginTop: 30,
    padding: 25,
    height: '80%',
  },
  scrollcontent: {
    height: '80%',
  },
  error: {
    color: 'red',
    marginBottom: 5,
  },
  container: {
    width: '100%',
  },
  icon: {
    width: 24,
    height: 24,
  },
  logo: {
    width: '100%',
    height: 50,
    alignSelf: 'center',
  },
});

export default connect(mapStateToProps)(ForgotPassword);
