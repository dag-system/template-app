
import React, { Component } from 'react';
import {
  Platform,
  StyleSheet,
  Alert,
  Linking,
  View,
  TextInput,
  Image, ScrollView,
  FlatList, TouchableHighlight
} from 'react-native';
import {
  Container, Header, Content, Footer,
  Left, Body, Right,
  Card, CardItem,
  Text, H1, Icon,
  Button, Toast, Root,
  Title, Spinner,
  Form, Item, Input, Label, H3
} from 'native-base';
import { Icon as IconElement } from 'react-native-elements';
// import { Icon } from 'react-native-elements';
import ApiUtils from '../ApiUtils';
import ErrorMessage from '../home/ErrorMessage';
import ImagePicker from 'react-native-image-picker';
import { connect } from 'react-redux'

export default class AddInterest extends Component {

  constructor(props) {
    super(props);

    let navigation = props.navigation;
    this.state = {
      coords: this.props.coord,
      idlive: this.props.idlive,
      libelleInteret: "",
      descriptionInteret: "",
      toasterMessage: null,
      lienInteret: "",
      isLoading: false,
      recordText: "ENREGISTRER"

    }
  }

  static navigationOptions = {
    drawerLabel: () => null
  };

  componentDidMount() {

    this.state.toasterMessage = null;
  }

  pickImage = () => {

    const options = {
      title: 'Choisir une photo',
      base64: true,
      takePhotoButtonTitle: 'Prendre une photo',
      chooseFromLibraryButtonTitle: 'Choisir dans la galerie',
      mediaType: 'photo',
      quality: 0.3,
      allowsEditing: false,
      storageOptions: {
        skipBackup: true,
        path: 'images',
      },
    };

    ImagePicker.showImagePicker(options, (response) => {
      console.log('Response = ', response);

      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.error) {
        alert('Une erreur est survenue : ' + response.error);
        ApiUtils.logError("showImagePicker", response.error);
        console.log('ImagePicker Error: ', response.error);
      } else if (response.customButton) {
        console.log('User tapped custom button: ', response.customButton);
      } else {
        this.setState({
          image: response,
          sourcePhoto: response
        });
      }
    });
  }

  close = () => {

    // Need to check to prevent null exception. 
    this.props.onclose && this.props.onclose();
  }


  closeSuccess = () => {

    // Need to check to prevent null exception. 
    this.props.onclosesuccess && this.props.onclosesuccess();
  }



  sendData() {

    var formData = new FormData();
    formData.append('method', 'createInteret');
    formData.append('auth', ApiUtils.getAPIAuth());

    formData.append("type", "INT");
    formData.append("idLive", this.state.idlive);
    formData.append("libelleInteret", this.state.libelleInteret);
    formData.append("descriptionInteret", this.state.descriptionInteret);

    formData.append("lienInteret", this.state.lienInteret);
    formData.append("telephoneInteret", this.state.telephoneInteret);

    formData.append("latitudeInteret", this.state.coords.coords.latitude);
    formData.append("longitudeInteret", this.state.coords.coords.longitude);
    formData.append("ext", this.state.sourcePhoto.type);
    // formData.append("base64","33");
    formData.append("base64", this.state.sourcePhoto.data);

    // name: photo.fileName,
    //   type: photo.type,
    //  alert(JSON.stringify(formData));

    // var uri = this.state.sourcePhoto.uri;
    // if (Platform.OS != "android") {
    //   uri = this.state.sourcePhoto.uri.replace("file://", "")
    // }

    // formdata.append("photoInteret", { uri: uri, name: this.state.sourcePhoto.name, type: this.state.sourcePhoto.type });

    //fetch followCode API

    this.setState({ recordText: "En cours d'enregistrement" });
    this.setState({ isLoading: true });

    fetch(ApiUtils.getAPIUrl(), {
      method: 'POST',
      headers: {
        // Accept: 'application/json',
        // 'Content-Type': 'application/json',
      },
      body: formData
    })
      .then(ApiUtils.checkStatus)
      .then(response => response.json())
      .then((responseJson) => {

        if (responseJson.codeErreur == "SUCCESS") {
          //clear all
          this.setState({ libelleInteret: "" });
          this.setState({ descriptionInteret: "" });
          this.setState({ lienInteret: "" });
          this.setState({ telephoneInteret: "" });
          this.setState({ sourcePhoto: null });
          this.setState({ image: null });




          this.closeSuccess();


        } else {


          Toast.show({
            text: responseJson.message,
            buttonText: "Ok",
            type: 'danger',
            duration: 3000,
            position: 'bottom'
          }
          );
        }
        this.setState({ recordText: "ENREGISTRER" });
        this.setState({ isLoading: false });

      })
      .catch(e => alert(e)).then(r => {
        this.setState({ recordText: "ENREGISTRER" });
        this.setState({ isLoading: false });
      }
      );

    // this.setState({ recordText: "ENREGISTRER" });
    // this.setState({ isLoading: false });

  }

  isErrorForm() {

    if (this.state.libelleInteret == '') {
      return true;
    }

    if (this.state.descriptionInteret == '') {
      return true;
    }

    // if (this.state.telephoneInteret == '') {
    //   return true;
    // }

    // if (this.state.lienInteret == '') {
    //   return true;
    // }

    if (this.state.sourcePhoto == null) {
      return true;
    }


    return false;
  }

  onClickValidateForm = () => {


    if (!this.isErrorForm()) {

      this.sendData();

    }
  }

  render() {

    return (

      <Root>
        <View style={styles.modal}>

          <Header style={styles.headerModal}>
            <Body>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', paddingRight: 0, paddingLeft: 0 }}>

                <Button style={styles.drawerButton} onPress={this.close}>
                  <Icon style={styles.goBackIcon} name="chevron-left" type="FontAwesome5" />
                  {/* <Text>Annuler</Text> */}
                </Button>


                <Button style={styles.saveButton} onPress={this.onClickValidateForm} disabled={this.isErrorForm()}>
                  <Text style={styles.goBackIcon}>{this.state.recordText}</Text>
                </Button>

              </View>
            </Body>
          </Header>

          <ScrollView contentContainerStyle={styles.loginButtonSection}>

            <Text style={styles.label}>Ajouter un point d'interêt</Text>

            <Form>
              <Item floatingLabel style={{ marginBottom: 5 }}>
                <Label>Nom *</Label>
                <Input clearButtonMode='always' value={this.state.libelleInteret} onChangeText={(phoneNumber) => this.setState({ libelleInteret: phoneNumber })} />
              </Item>
              <ErrorMessage style={{ marginLeft: 40, paddingLeft: 10 }} value={this.state.libelleInteret} message="Le nom doit être renseigné" />


              {/* <Text style={styles.label}>Nom *</Text>
              <TextInput style={styles.inputCode} clearButtonMode='always' placeholder="Nom" value={this.state.libelleInteret} onChangeText={(phoneNumber) => this.setState({ libelleInteret: phoneNumber })} />
              <ErrorMessage value={this.state.libelleInteret} message="Le nom doit être renseigné" /> */}

              <Item floatingLabel style={{ marginBottom: 5 }}>
                <Label>Description *</Label>
                <Input clearButtonMode='always' value={this.state.descriptionInteret} onChangeText={(phoneNumber) => this.setState({ descriptionInteret: phoneNumber })} />
              </Item>
              <ErrorMessage style={{ paddingLeft: 10 }} value={this.state.descriptionInteret} multiline numberOfLines={4} maxLength={40} message="La description doit être renseigné" />

              {/* <Text style={styles.label}>Description *</Text>
              <TextInput style={styles.inputCode} clearButtonMode='always' placeholder="Description" multiline numberOfLines={4} editable
                maxLength={40} value={this.state.descriptionInteret} onChangeText={(phoneNumber) => this.setState({ descriptionInteret: phoneNumber })} />
              */}
              <Item floatingLabel style={{ marginBottom: 5 }}>
                <Label>Site web </Label>
                <Input clearButtonMode='always' value={this.state.lienInteret} onChangeText={(phoneNumber) => this.setState({ lienInteret: phoneNumber })} />
              </Item>

              <Item floatingLabel style={{ marginBottom: 5 }}>
                <Label>Numéro de téléphone </Label>
                <Input clearButtonMode='always' value={this.state.telephoneInteret} onChangeText={(phoneNumber) => this.setState({ telephoneInteret: phoneNumber })} />
              </Item>


              <View style={{ marginTop: 20, alignItems: 'center', justifyContent: 'center' }}>


                <Text style={styles.label}>Photo *</Text>
                {
                  this.state.image == null ?
                    <Button onPress={this.pickImage} style={styles.addPictureBtn}>
                      <Text style={styles.saveText}>Ajouter une photo</Text>
                    </Button> : <Button onPress={this.pickImage} style={styles.addPictureBtn}>
                      <Text style={styles.saveText}>Modifier la photo</Text>
                    </Button>
                }

                <ErrorMessage style={{ paddingLeft: 10 }} value={this.state.image} message="L'image est obligatoire" />


                {this.state.isLoading ?

                  <View style={{ marginTop: 4, marginBottom: 20, alignItems: 'center', justifyContent: 'center' }}>
                    <Spinner color='black' />
                    {/* <IconElement active name="spinner" type='font-awesome' style={styles.plusButtonLogo} /> */}
                    <Text>Enregistrement en cours</Text>
                  </View>
                  : null}


                <Image source={this.state.image} style={styles.uploadAvatar} />
              </View>

            </Form>
          </ScrollView>

        </View>
      </Root>

    );
  }
}

const styles = StyleSheet.create({
  // header: {
  //   backgroundColor: ApiUtils.getBackgroundColor(),
  //   width: '100%',
  //   height: 100
  // },

  header: {
    backgroundColor: ApiUtils.getBackgroundColor(),
    paddingLeft: 10,
    paddingTop: 30,
    paddingBottom: 10,
    height: 80
  },
  headerModal: {
    backgroundColor: ApiUtils.getBackgroundColor(),
    paddingLeft: 10,
    paddingTop: 20,
    paddingBottom: 5,
    // height: 50
  },
  uploadAvatar: {
    height: 100,
    width: 100,
    marginBottom: 5
  },
  title: {
    width: '25%',
  },
  label: {
    marginTop: 10,
    marginBottom: 5,
    marginLeft: 15
  },
  inputCode: {
    marginTop: 5,
    marginBottom: 10,
    width: 200,
    borderWidth: 1,
    padding: 10
  },
  saveButton: {
    backgroundColor: 'transparent',
    // width: 300,
    marginTop: 0,
    paddingTop: 0,
    elevation: 0
  },
  drawerButton: {
    backgroundColor: 'transparent',
    // width: '15%',
    marginTop: 0,
    paddingTop: 0,
    shadowOffset: { height: 0, width: 0 },
    shadowOpacity: 0,
    elevation: 0
  },
  addPictureBtn: {
    backgroundColor: 'white',
    // width: '10%',
    marginTop: 4,
    paddingTop: 0,
    shadowOffset: { height: 0, width: 0 },
    shadowOpacity: 0,
    elevation: 0
  },
  saveText: {
    color: 'black',
    textDecorationLine: 'underline'
  },
  goBackIcon: {
    color: 'black'
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'stretch',
    height: 590,
  },
  rowContainer: {
    padding: 10,
    // height: 80,
    paddingTop: 10,
    backgroundColor: 'white',
    borderBottomWidth: 0.5,
    borderBottomColor: '#B9B9B9'
  },
  line: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingRight: 0,
    paddingLeft: 2,
    marginBottom: 3,
    marginTop: 3,
  },
  text: {
    fontFamily: 'Roboto'
  },
  body: {
    width: '100%',
    //  justifyContent: 'center',
    backgroundColor: 'white',
  },
  logo: {
    width: '80%',
    height: 50,
    marginLeft: -25,
    marginRight: 25,
    marginTop: 50,
    marginBottom: 50

  },
  p: {
    fontSize: 12,
    marginBottom: 5
  },
  url: {
    fontSize: 12,
    textAlign: 'center'
  },
  button: {
    marginBottom: 10,
  },
  loginButtonSection: {
    width: '100%',
    // justifyContent: 'center',
    // alignItems: 'center',
    marginTop: 20
  },

  buttonok: {
    width: 60,
    height: 60,
    backgroundColor: ApiUtils.getBackgroundColor(),
    borderRadius: 30,
    textAlign: "center",
    padding: 0,
    fontSize: 30,
    paddingLeft: 18,
    position: 'absolute',
    right: 20,
    bottom: 20
  },
  plusButtonLogo: {
    height: 120,
    width: 120,
    fontSize: 30,
  },
  container: {
    // flex: 1,
    //  justifyContent: 'center',
    //   alignItems: 'center',
    backgroundColor: ApiUtils.getBackgroundColor(),
  },
  footer: {
    backgroundColor: "transparent",
    height: 215
  },
  userInfo: {
    padding: 10
  },
  icon: {
    width: 24,
    height: 24,
  },
});
