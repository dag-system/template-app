import React, {Component} from 'react';
import {
  Platform,
  StyleSheet,
  View,
  PermissionsAndroid,
  Image,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import {
  Container,
  Header,
  Left,
  Body,
  Right,
  Text,
  Button,
  Icon,
  Content,
  Root,
  Toast,
  Picker,
  Switch,
  Spinner,
} from 'native-base';
import ApiUtils from '../ApiUtils';
import {connect} from 'react-redux';
import Logo from '../assets/logo_header.png';
import {Sponsors} from './Sponsors';
import Autrans from '../assets/autrans.svg';
import ErrorMessage from './ErrorMessage';
import {TextInput} from 'react-native-gesture-handler';
import DocumentPicker from 'react-native-document-picker';
import DefaultProps from '../models/DefaultProps';
const mapStateToProps = (state) => {
  return {
    userData: state.userData,
    currentLive: state.currentLive,
    currentMapStyle: state.currentMapStyle,
    sports: state.sports,
  };
};

interface Props extends DefaultProps {
  userData: any;
  currentLive: any;
  currentMapStyle: string;
  sports: any[];
}

interface State {
  selectedSport: number;
  libelleLive: string;
  comments: string;
  isLoading: boolean;
}

class UploadGpx extends Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      libelleLive: 'Nouvelle activité importée',
      selectedSport: '17',
      isLoading: false,
      comments: '',
    };
  }

  componentDidMount() {
    this.setState({
      acceptChallengeNameUtilisateur:
        this.props.userData.acceptChallengeNameUtilisateur == 1,
    });

    this.setState({
      acceptChallengeUtilisateur:
        this.props.userData.acceptChallengeUtilisateur == 1,
    });
  }

  onGoBack() {
    this.props.onclose();
  }

  onValueSportChange(value) {
    this.setState({
      selectedSport: value,
    });
  }

  requestStoragePermission = async () => {
    try {
      const granted = await PermissionsAndroid.requestMultiple(
        ['android.permission.READ_EXTERNAL_STORAGE'],
        {
          title: 'Accèder à vos fichiers',
          message: '',
          buttonNeutral: 'Plus tard',
          buttonNegative: 'Annuler',
          buttonPositive: 'OK',
        },
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
      } else {
      }
    } catch (err) {
      // console.warn(err);
    }
  };

  onChangeLiveName(name) {
    if (
      !this.state.libelleLiveIsModified &&
      this.state.libelleLive.length - 1 == name.length
    ) {
      this.setState({libelleLive: ''});
      this.setState({libelleLiveIsModified: true});
    } else {
      this.setState({libelleLive: name});
    }
  }

  isErrorFormStop() {
    var isError = false;
    if (this.state.libelleLive == '') {
      isError = true;
    }

    if (this.state.selectedSport == -1) {
      isError = true;
    }
    if (this.state.file == null) {
      isError = true;
    }

    return isError;
  }

  checkPermissions() {
    if (Platform.OS == 'android') {
      try {
        PermissionsAndroid.request(
          'android.permission.READ_EXTERNAL_STORAGE',
        ).then((res) => {
          console.warn(res);
          if (res == 'granted') {
          } else {
            // alert('error')
            this.requestStoragePermission();
          }
        });
      } catch (error) {
        console.warn('location set error:', error);
      }
    }
  }

  async onOpenGpx() {
    this.checkPermissions();

    // Pick a single file
    try {
      let config = {};
      const res = await DocumentPicker.pick(config);
      console.log(
        res.uri,
        res.type, // mime type
        res.name,
        res.size,
      );

      var uri = res.uri;

      if (res.name.toLowerCase().includes('.gpx')) {
        setTimeout(() => this.setState({file: res}), 100);
      } else {
        Toast.show({
          text: "Le fichier n'est pas un fichier gpx",
          buttonText: 'Ok',
          type: 'error',
          position: 'bottom',
        });
      }
    } catch (err) {
      // alert(err)
      if (DocumentPicker.isCancel(err)) {
        // User cancelled the picker, exit any dialogs or menus and move on
      } else {
        throw err;
      }
    }
  }

  async sendFile() {
    this.setState({isLoading: true});
    // var path = this.normalize(filePath);
    // const file = {
    //   uri  :path ,             // e.g. 'file:///path/to/file/image123.jpg'
    //   name : 'test',            // e.g. 'image123.jpg',
    //   type : 'gpx'             // e.g. 'image/jpg'
    // }

    let formData = new FormData();
    // body.append('file', file)
    formData.append('file_attachment', this.state.file);

    formData.append('method', 'createLive');
    formData.append('auth', ApiUtils.getAPIAuth());
    formData.append('idUtilisateur', this.props.userData.idUtilisateur);
    formData.append('idSport', this.state.selectedSport);
    formData.append('idVersion', ApiUtils.VersionNumber());
    formData.append('libelleActivite', this.state.libelleLive);
    formData.append('os', Platform.OS);

    var acceptChallengeUtilisateur = 0;
    if (
      this.state.acceptChallengeUtilisateur ||
      this.state.acceptChallengeUtilisateur == 1 ||
      this.state.acceptChallengeUtilisateur == 'true'
    ) {
      acceptChallengeUtilisateur = 1;
    }

    formData.append('acceptChallengeUtilisateur', acceptChallengeUtilisateur);

    var acceptChallengeNameUtilisateur = 0;
    if (
      this.state.acceptChallengeNameUtilisateur ||
      this.state.acceptChallengeNameUtilisateur == 1 ||
      this.state.acceptChallengeNameUtilisateur == 'true'
    ) {
      acceptChallengeNameUtilisateur = 1;
    }

    formData.append(
      'acceptChallengeNameUtilisateur',
      acceptChallengeNameUtilisateur,
    );

    try {
      let res = await fetch('https://folomi.fr/api/uploadgpx.php', {
        method: 'post',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data; ',
        },
      });

      let responseJson = await res.json();

      if (responseJson.status == 1) {
        this.setState({isLoading: false});
        var idLive = responseJson.idLive;
        var live = {
          idLive: idLive,
        };
        var action = {type: 'SAVE_CURRENT_LIVE', data: live};

        this.props.dispatch(action);

        Toast.show({
          text: 'Le fichier a bien été enregistré',
          buttonText: 'Ok',
          type: 'success',
          position: 'bottom',
        });

        this.props.finish();
      } else {
        this.setState({isLoading: false});
        console.log(responseJson);
      }
    } catch (e) {
      this.setState({isLoading: false});
      Toast.show({
        text: 'Une erreur est survenue. Merci de réessayer',
        buttonText: 'Ok',
        type: 'danger',
        position: 'bottom',
      });

      this.setState({file: null});
      ApiUtils.logError(
        'upload gpx ',
        JSON.stringify(e.message) +
          ' ' +
          Platform.OS +
          ' Version : ' +
          ApiUtils.VersionNumberInt(),
      );
    }
  }

  render() {
    return (
      <Root>
        <Container>
          <Header style={styles.header}>
            <Left style={{flex: 1}}>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'flex-start',
                  width: '100%',
                  paddingRight: 0,
                  paddingLeft: 0,
                  marginTop: 20,
                  marginBottom: 20,
                }}>
                <Button
                  style={styles.drawerButton}
                  onPress={() => this.onGoBack()}>
                  <Icon
                    style={styles.saveText}
                    name="chevron-left"
                    type="FontAwesome5"
                  />
                  {/* <Text style={styles.saveText}>Précedent</Text> */}
                </Button>
              </View>
            </Left>
            <Body style={{flex: 0}} />
            <Right style={{flex: 1}}>
              <Image resizeMode="contain" source={Logo} style={styles.logo} />
            </Right>
          </Header>
          <Content style={styles.body} scrollEnabled={true}>
            <ScrollView scrollEnabled={true}>
              <Text
                style={{
                  textAlign: 'center',
                  marginTop: 15,
                  marginBottom: 5,
                  fontWeight: 'bold',
                }}>
                Envoyer un fichier GPX{' '}
              </Text>
              <View style={styles.loginButtonSection}>
                <Button
                  style={{
                    marginTop: 10,
                    paddingHorizontal: 50,
                    elevation: 0,
                    alignSelf: 'center',
                    borderColor: ApiUtils.getBackgroundColor(),
                    borderWidth: 1,
                    backgroundColor: ApiUtils.getBackgroundColor(),
                  }}
                  onPress={() => this.onOpenGpx()}>
                  {this.state.file == null ? (
                    <Text
                      style={{
                        color: 'white',
                      }}>
                      Ajouter un fichier gpx
                    </Text>
                  ) : (
                    <Text
                      style={{
                        color: 'white',
                      }}>
                      Modifier le fichier gpx
                    </Text>
                  )}
                </Button>

                <TextInput
                  style={[styles.inputCode, {fontWeight: 'bold'}]}
                  clearButtonMode="always"
                  placeholder="Titre"
                  value={this.state.libelleLive}
                  onChangeText={(value) => this.onChangeLiveName(value)}
                />
                <ErrorMessage
                  style={styles.errorMessage}
                  value={this.state.libelleLive}
                  message="Le titre de la course doit être renseignée"
                />
                <View style={styles.picker}>
                  <Picker
                    mode="dropdown"
                    accessibilityLabel={'Choisissez votre sport'}
                    iosHeader={'Choisissez votre sport'}
                    iosIcon={<Icon name="chevron-down" type="FontAwesome5" />}
                    style={{marginTop: 0}}
                    selectedValue={this.state.selectedSport}
                    onValueChange={this.onValueSportChange.bind(this)}
                    placeholder={'Choisissez votre sport'}
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
                    <Picker.Item label="Choisissez votre sport" value="-1" />
                    <Picker.Item label={'CROSS'} value="17" />
                  </Picker>
                  {this.state.selectedSport == -1 ? (
                    <Text
                      style={{
                        marginTop: 10,
                        color: 'red',
                        fontSize: 14,
                        paddingLeft: 5,
                        fontStyle: 'italic',
                      }}>
                      Le type de sport doit être renseigné
                    </Text>
                  ) : null}
                  <View
                    style={{
                      backgroundColor: this.state.text,
                      borderBottomColor: '#000000',
                      borderBottomWidth: 1,
                      marginBottom: 0,
                      marginTop: 20,
                      paddingTop: 0,
                    }}>
                    <Text
                      style={{
                        fontWeight: 'bold',
                        paddingBottom: 8,
                        borderBottomWidth: 1,
                        borderBottomColor: '#DDDDDD',
                      }}>
                      Commentaire :
                    </Text>
                    <TextInput
                      style={{marginTop: 0, paddingBottom: 10}}
                      multiline={true}
                      numberOfLines={4}
                      onChangeText={(text) => this.setState({comments: text})}
                      value={this.state.comments}
                      placeholder="Commentaire"
                    />
                  </View>
                  <View
                    style={{
                      marginTop: 20,
                      width: '80%',
                      display: 'flex',
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                    }}>
                    <Switch
                      style={{paddingTop: 20}}
                      onValueChange={(text) => {
                        this.setState({
                          acceptChallengeNameUtilisateur: text,
                        });
                      }}
                      value={this.state.acceptChallengeNameUtilisateur}
                    />
                    <TouchableOpacity
                      onPress={() => {
                        this.setState({
                          acceptChallengeNameUtilisateur: !this.state
                            .acceptChallengeNameUtilisateur,
                        });
                      }}>
                      <Text style={{marginLeft: 10}}>
                        J'accepte que mon nom apparaisse dans le classement
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
                {this.state.isLoading ? (
                  <View
                    style={{
                      marginTop: 15,
                      width: '100%',
                    }}>
                    <Spinner color="black" />
                    <Text style={{textAlign: 'center', alignSelf: 'center'}}>
                      Enregistrement en cours
                    </Text>
                  </View>
                ) : (
                  <Button
                    style={{
                      marginTop: 10,
                      paddingHorizontal: 50,
                      elevation: 0,
                      alignSelf: 'center',
                      borderColor: this.isErrorFormStop()
                        ? 'black'
                        : ApiUtils.getBackgroundColor(),
                      borderWidth: 1,
                      backgroundColor: this.isErrorFormStop()
                        ? 'transparent'
                        : ApiUtils.getBackgroundColor(),
                    }}
                    onPress={() => this.sendFile()}
                    disabled={this.isErrorFormStop()}>
                    <Text
                      style={{
                        color: this.isErrorFormStop() ? 'black' : 'white',
                      }}>
                      ENREGISTRER
                    </Text>
                  </Button>
                )}
                <View style={{marginBottom: 300}} />
              </View>
            </ScrollView>
            <View
              style={{
                marginBottom: 0,
                position: 'absolute',
                bottom: Platform.OS == 'ios' ? 80 : 50,
                zIndex: 12,
                backgroundColor: 'white',
              }}>
              <Sponsors />
            </View>
          </Content>
        </Container>
      </Root>
    );
  }
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: 'white',
    width: '100%',
    borderBottomColor: '#D3D3D3',
    borderBottomWidth: 1,
  },
  title: {
    width: '25%',
  },
  map: {
    height: 200,
  },
  buttonok: {
    marginTop: 20,
    marginBottom: 0,
    alignSelf: 'center',
    // width: 150,
    height: 30,
    borderRadius: 10,
    // marginRight: 40,
    backgroundColor: 'black',
  },
  saveButton: {
    backgroundColor: 'transparent',
    width: '38%',
    marginTop: 0,
    paddingTop: 0,
  },
  logo: {
    width: '100%',
    height: 50,
    alignSelf: 'center',
  },
  bold: {
    fontWeight: 'bold',
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
  resultCol: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    width: '30%',
  },
  resultNumber: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  saveText: {
    color: 'black',
    paddingLeft: 0,
    marginLeft: 5,
    marginRight: -5,
  },
  inputCode: {
    borderBottomColor: '#DDDDDD',
    borderBottomWidth: 1,
    paddingTop: 10,
    paddingBottom: 10,
    marginLeft: 10,
    marginRight: 10,
    marginBottom: 0,
    marginTop: 5,
    fontSize: 16,
  },

  errorMessage: {
    marginLeft: 10,
    marginTop: 10,
    fontStyle: 'italic',
  },
  body: {
    width: '100%',
    backgroundColor: 'white',
    flex: 1,
    paddingBottom: 200,
  },
  loginButtonSection: {
    width: '100%',
    // height: '120%',
    flex: 1,
    padding: 10,
    paddingBottom: 100,

    // marginTop: 5,
  },
  centerLogo: {
    color: '#000',
  },
  container: {
    width: '100%',
  },
  textLink: {
    fontWeight: 'bold',
    fontSize: 15,
    marginTop: 16,
    marginRight: 10,
    alignContent: 'center',
    textAlign: 'center',
  },
  markerIcon: {
    borderWidth: 1,
    borderColor: ApiUtils.getBackgroundColor(),
    backgroundColor: ApiUtils.getBackgroundColor(),
    width: 10,
    height: 10,
    borderRadius: 5,
  },
});

export default connect(mapStateToProps)(UploadGpx);
