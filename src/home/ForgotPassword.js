
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
  Text,Toast,
  Button,Item,Label,Input,Root,
  Icon,
} from 'native-base';
import { Button as ButtonElement } from 'react-native-elements';
import md5 from 'md5';
import { connect } from 'react-redux'
import ApiUtils from '../ApiUtils';
import defaultMessages from './defaultMessages';
import ErrorMessage from './ErrorMessage';

import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import ValidationComponent from 'react-native-form-validator';

export default class ForgotPassword extends ValidationComponent {
  constructor(props) {
    super(props);

    this.messages = defaultMessages;
    this.deviceLocale = 'fr';


    this.state = {
      emailUtilisateur: "",
    }
  }

  componentDidMount() {

  }


  ongoHome() {
    this.props.navigation.navigate('Home');
  }

  onClickValidate() {

    var isValid = this.validate({
      emailUtilisateur: { email: true, required: true }
    });

    if (isValid) {
      this.onSendRequest();
    }

  }
  onSendRequest() {

    let formData = new FormData();
    formData.append('method', 'resetMdp');
    formData.append('auth', ApiUtils.getAPIAuth());
    formData.append('emailUtilisateur', this.state.emailUtilisateur);


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
        
          Toast.show({
            text: "Votre mot de passe vous a été envoyé par email à l'instant",
            buttonText: 'Ok',
            type: 'success',
            position: 'bottom',

          });
        } else {
        
          Toast.show({
            text: responseJson.message,
            buttonText: 'Ok',
            type: 'error',
            position: 'bottom',

          });

        }
      })
      .catch(e => 
        
        {
          Toast.show({
            text: "Une erreur est survenur. Merci de réessayer",
            buttonText: 'Ok',
            type: 'error',
            position: 'bottom',

          });
          ApiUtils.logError('FORGOT Password onSendRequest', e.message)
        }
        
       ).then(

      );

  }

  goBack() {
    this.onClickNavigate('Home');
  }

  onClickNavigate(routeName) {
    this.props.navigation.navigate(routeName);
  }

  static navigationOptions = {
    drawerLabel: () => null,
    drawerLockMode: () => "locked-closed",
  };


  render() {
    return (
<Root>
      <Container>


          <Header style={styles.header}>
            <Body>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', paddingRight: 0, paddingLeft: 5 }}>
                <Button style={styles.drawerButton} onPress={() => this.goBack()}>
                  <Icon style={styles.saveText} name="chevron-left" type="FontAwesome5" />
                  <Text style={styles.saveText}>Précedent</Text>
                </Button>


              </View>

            </Body>
          </Header>
          <View style={styles.loginButtonSection}>

            <Text style={{textAlign : 'justify'}}>
                Entrez votre email ci-dessous afin de recevoir les instructions pour réinitialiser votre mot de passe.
            </Text>



            <Item stackedLabel style={{ marginBottom: 5, marginTop : 20 }}>
              <Label>Email  *</Label>
              <Input ref="emailUtilisateur" returnKeyType="next" clearButtonMode='always'
                value={this.state.emailUtilisateur}
                onChangeText={(value) =>
                  this.setState({ emailUtilisateur: value })}
              />
            </Item>
            {this.isFieldInError('emailUtilisateur') && this.getErrorsInField('emailUtilisateur').map(errorMessage =>
              <Text style={styles.error}>{errorMessage}</Text>)}


            <View style={{marginTop : 40}}>

              <ButtonElement style={styles.saveButton}
                onPress={() => this.onClickValidate()} title='Envoyer'
              />
              {/* //</View><Text style={styles.saveText}>Envoyer</Text>
              // </Button> */}
            </View>

            <Text style={{ marginTop : 40, textAlign : 'center', textDecorationLine : 'underline'}} onPress={() => this.goBack()} >Se connecter</Text>

          </View>


      </Container >
      </Root>
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
  saveButton: {
    marginTop: 60,
    elevation : 0
  //  backgroundColor : '#827909'
  },
  label: {
    padding: 5,
    marginTop: 30,
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
});
