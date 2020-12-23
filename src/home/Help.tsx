import React, {Component} from 'react';
import {
  StyleSheet,
  Image,
  TouchableOpacity,
  View,
  Linking,
  Platform,
} from 'react-native';
import {
  Container,
  Header,
  Body,
  Toast,
  Root,
  Drawer,
  Icon,
  Text,
  Content,
  Left,
  Right,
} from 'native-base';
import md5 from 'md5';
import ApiUtils from '../ApiUtils';
import {connect} from 'react-redux';
import Sidebar from './SideBar';
import moment from 'moment';
import Logo from '../assets/logo_header.png';
import GlobalStyles from '../styles';
import Autrans from '../assets/autrans.svg';
const mapStateToProps = state => {
  return {
    userData: state.userData,
  };
};

class Help extends Component {
  constructor(props) {
    super(props);

    this.state = {
      userdata: {
        nomUtilisateur: '',
        prenomUtilisateur: '',
        telUtilisateur: '',
        folocodeUtilisateur: '',
        idUtilisateur: '',
      },
      newPassword: '',
      newPasswordConfirmation: '',
      isErrorName: false,
      lives: [],
      isLoading: false,
      toasterMessage: '',
      showDefaultDdn: false,
    };
  }

  componentDidMount() {
    setTimeout(() => this.didMount(), 300);

    // alert(this.props.userData.ddnUtilisateur)
    //   alert(new Date(this.props.userData.ddnUtilisateur))

    // setTimeout(() => this.setState({ userdata: { ...this.state.userdata, ddnUtilisateur: this.state.userdata.ddnUtilisateur) }} ), 100)
  }
  didMount() {
    this.setState({userdata: this.props.userData});
    if (this.props.userData.clubUtilisateur == 'NULL') {
      this.props.userData.clubUtilisateur = '';
    }

    if (this.props.userData.villeUtilisateur == 'NULL') {
      this.props.userData.villeUtilisateur = '';
    }

    if (this.props.userData.ddnUtilisateur != '0000-00-00') {
      this.setState({showDefaultDdn: true});
      // alert(this.props.userData.ddnUtilisateur)
    } else {
      this.setState({showDefaultDdn: false});
    }

    this.getClubs();
  }

  closeDrawer = () => {
    this.drawer._root.close();
  };

  onDrawer() {
    this.drawer._root.open();
  }

  ongoHome() {
    this.props.navigation.navigate('Home');
  }

  getClubs() {
    this.setState({isLoading: true});
    let formData = new FormData();
    formData.append('method', 'getClubs');
    formData.append('auth', ApiUtils.getAPIAuth());

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
      .then(response => response.json())
      .then(responseJson => {
        var action = {type: 'GET_CLUBS', data: responseJson};
        this.props.dispatch(action);

        this.setState({isLoading: false});
      })
      .catch(e => {
        this.setState({isLoading: false});
        ApiUtils.logError('getCLUBS', e.message);
      })
      .then(() => this.setState({isLoading: false}));
  }

  isErrorForm() {
    var isError = false;
    var withPassword = false;
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

    // if (this.state.userdata.telUtilisateur == '') {
    //   isError = true;
    // }

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
      } else {
        withPassword = true;
      }
    }

    return isError;
  }

  onClickValidate() {
    var isError = this.isErrorForm();
    var withPassword = false;

    if (!!this.state.newPassword && this.state.newPassword != '') {
      if (this.state.newPasswordConfirmation != this.state.newPassword) {
        isError = true;
      } else {
        withPassword = true;
      }
    }

    if (!isError) {
      this.onSendRequest(withPassword);
    }
  }

  validateEmail(email) {
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
  }

  onPopupOk() {
    var action = {type: 'VIEW_POPUPAIDE', data: null};
    this.props.dispatch(action);
  }

  getInitialState() {
    if (this.state.userdata.sexeUtilisateur == 'H') {
      return 0;
    } else if (this.state.userdata.sexeUtilisateur == 'F') {
      return 1;
    } else {
      return '';
    }
  }

  onSendRequest(withPassword) {
    this.setState({isLoading: true});
    let formData = new FormData();
    formData.append('method', 'updateUtilisateur');
    formData.append('auth', ApiUtils.getAPIAuth());
    formData.append('idUtilisateur', this.state.userdata.idUtilisateur);

    formData.append('nomUtilisateur', this.state.userdata.nomUtilisateur);
    formData.append('prenomUtilisateur', this.state.userdata.prenomUtilisateur);
    formData.append('emailUtilisateur', this.state.userdata.emailUtilisateur);

    formData.append('telUtilisateur', this.state.userdata.telUtilisateur);

    var finalDate = moment(this.state.userdata.ddnUtilisateur).format(
      'YYYY-MM-DD',
    );
    // alert(finalDate)
    formData.append('ddnUtilisateur', finalDate);
    formData.append('sexeUtilisateur', this.state.userdata.sexeUtilisateur);

    formData.append(
      'adresseUtilisateur',
      this.state.userdata.adresseUtilisateur,
    );
    formData.append('cpUtilisateur', this.state.userdata.cpUtilisateur);
    formData.append('villeUtilisateur', this.state.userdata.villeUtilisateur);
    formData.append('paysUtilisateur', this.state.userdata.paysUtilisateur);

    formData.append('clubUtilisateur', this.state.userdata.clubUtilisateur);

    var acceptChallengeUtilisateur = 0;
    if (
      this.state.userdata.acceptChallengeUtilisateur ||
      this.state.userdata.acceptChallengeUtilisateur
    ) {
      acceptChallengeUtilisateur = 1;
    }

    formData.append('acceptChallengeUtilisateur', acceptChallengeUtilisateur);

    var acceptChallengeNameUtilisateur = 0;
    if (
      this.state.userdata.acceptChallengeNameUtilisateur ||
      this.state.userdata.acceptChallengeNameUtilisateur
    ) {
      acceptChallengeNameUtilisateur = 1;
    }

    formData.append(
      'acceptChallengeNameUtilisateur',
      acceptChallengeNameUtilisateur,
    );

    if (withPassword) {
      formData.append('passUtilisateur', md5(this.state.newPassword));
    }

    fetch(ApiUtils.getAPIUrl(), {
      method: 'POST',
      headers: {},
      body: formData,
    })
      .then(ApiUtils.checkStatus)
      .then(response => response.json())
      .then(responseJson => {
        if (responseJson.codeErreur == 'SUCCESS') {
          this.setState({isLoading: false});

          var action = {type: 'LOGIN', data: responseJson};
          this.props.dispatch(action);

          Toast.show({
            text: 'Les données sont bien sauvegardées !',
            buttonText: '',
            duration: 1500,
            type: 'success',
            position: 'top',
          });
        } else {
          Toast.show({
            text: responseJson.message,
            buttonText: '',
            duration: 1500,
            type: 'danger',
            position: 'top',
          });
        }
        this.setState({isLoading: false});
      })
      .catch(e => {
        Toast.show({
          text: e.message,
          buttonText: '',
          duration: 1500,
          type: 'danger',
          position: 'top',
        });
        this.setState({isLoading: false});
        ApiUtils.logError('Preferences onSendRequest', e.message);
      })
      .then();
  }

  openLink(url) {
    Linking.canOpenURL(url).then(supported => {
      if (supported) {
        Linking.openURL(url);
      } else {
        ApiUtils.logError('Home openLink', 'Dont know how to open URI: ' + url);
      }
    });
  }
  render() {
    return (
      <Drawer
        ref={ref => {
          this.drawer = ref;
        }}
        content={
          <Sidebar
            navigation={this.props.navigation}
            drawer={this.drawer}
            selected="Help"
          />
        }>
        <Container>
          <Root>
            {this.props.noHeader ? null : (
              <Header style={styles.header}>
                <Left style={{flex: 1}}>
                  <TouchableOpacity
                    style={styles.drawerButton}
                    onPress={() => this.onDrawer()}>
                    <Icon
                      style={styles.saveText}
                      name="bars"
                      type="FontAwesome5"
                    />
                  </TouchableOpacity>
                </Left>
                <Body style={{flex: 0}} />
                <Right style={{flex: 1}}>
             
                </Right>
              </Header>
            )}

            <Content style={{padding: 10, paddingTop: 20}} scrollEnabled={true}>
              <View style={[GlobalStyles.row,{justifyContent :'center'}]}>
              <Image
                animation="bounceInDown"
                delay={300}
                resizeMode="contain"
                source={Logo}
                style={styles.logo}
              />
                   <Autrans
                width={'25%'}
                height={50}
                style={{
                  opacity: 1,
                  marginLeft: 1,
                  marginBottom: 5,
                }}
              />
              </View>
           
              <Text
                style={{
                  textAlign: 'center',
                  fontWeight: 'bold',
                  color: ApiUtils.getBackgroundColor(),
                  marginTop: 30,
                }}>
                Bienvenue sur l'application de la foulée blanche 2021
              </Text>

              <Text style={{marginTop: 10}}>
                Application officielle de la Foulée Blanche 2021, venez skier et
                comparez vos temps avec ceux de vos amis ou famille !
              </Text>
              <Text style={{marginTop: 10}}>
                Faites la course contre des centaines de personne sans jamais
                vous croiser, et notamment des skieurs de renoms comme Robin
                Duvillard, Simon Fourcarde et bien d’autres !
              </Text>
              <Text style={{marginTop: 10}}>
                La foulée Blanche est le seul évènement nordique de l’année à
                vous proposer ce format de course, donc n’hésitez plus et venez
                skier à Autrans pour battre vos propres records
              </Text>

              <Text
                style={{
                  marginTop: 20,
                  marginBottom: 20,
                  textAlign: 'center',
                  fontWeight: 'bold',
                }}>
                Manuel à lire avant de lancer une activité
              </Text>
              <Text style={{marginTop: 20, marginBottom: 20}}>
                1 - Enregistrer vos activités
              </Text>
              <View style={[GlobalStyles.row, {flexWrap: 'wrap'}]}>
                <Text style={{width: '80%'}}>
                  Pour enregistrer une nouvelle activité cliquez sur le bouton :{' '}
                </Text>
                <View
                  style={{
                    backgroundColor: ApiUtils.getBackgroundColor(),
                    height: 60,
                    width: 60,
                    borderRadius: 30,
                    padding: 15,
                    marginTop: -15,
                    textAlign: 'center',
                  }}>
                  <Icon
                    active
                    name="plus"
                    type="AntDesign"
                    style={styles.plusButtonLogo}
                  />
                </View>
              </View>
              <Text style={{marginTop: 10}}>
                Dès que vous êtres prêts cliquez sur "Démarrer" puis lancer vous
                sur nos parcours
              </Text>
              <Text style={{textAlign: 'justify', marginTop: 10}}>
                L'application enregistrera votre activité et calculera vos
                performances sur nos differents parcours
              </Text>
              <View
                style={[GlobalStyles.row, {flexWrap: 'wrap', marginTop: 20}]}>
                <Text style={{width: '50%'}}>
                  Pour voir la liste des des parcours cliquez sur le bouton :
                </Text>
             
                  <Icon
                    type="Ionicons"
                    name="map-outline"
                    style={{fontSize: 20}}
                  />
              </View>

              <Text style={{textAlign: 'center', marginTop: 10}}>
                Retrouvez les classements sur notre site
              </Text>
              <TouchableOpacity
                onPress={() =>
                  this.openLink('https://www.lafouleeblanche.com/')
                }>
                <Text
                  style={{
                    textAlign: 'center',
                    marginTop: 10,
                    textDecorationLine: 'underline',
                  }}>
                  https://www.lafouleeblanche.com/
                </Text>
              </TouchableOpacity>
              <Text style={{marginTop: 20, marginBottom: 20}}>
                2 - Paramétrez votre téléphne
              </Text>
              <Text style={{textAlign: 'center', marginTop: 10}}>
                Pour un meilleur enregistrement de votre activité : paramétrez
                la gestion de la batterie de votre téléphone pour que l'app ne
                se stoppe pas pendant votre effort.
              </Text>
              <TouchableOpacity
                onPress={() =>
                  this.openLink('https://folomi.fr/api/helpBattery.php')
                }>
                <Text
                  style={{
                    textAlign: 'center',
                    marginTop: 10,
                    textDecorationLine: 'underline',
                  }}>
                  Suivez nos instructions ici
                </Text>
              </TouchableOpacity>

              <Text style={{marginTop: 20, marginBottom: 20}}>
                3 - Les challenges
              </Text>

              <Text>
                Skiez sur les parcours de la foulée blanche et vous apparaitrez
                sur le classement
              </Text>

              <Text style={{marginTop: 20, marginBottom: 20}}>
                Fonctionnement
              </Text>

              <Text>
                Pour vous être sûr d'avoir un bon enregistrement de vos
                performances :{' '}
              </Text>

              <Text style={{marginTop: 20, marginBottom: 0}}>
                1 - S’assurer que la fonction GPS soit en route lors de
                l’utilisation
              </Text>
              <Text>
                2 - S’assurer que les fonctionnalités d’économie de batterie
                soient désactivés sur le téléphone (voir la partie 2)
              </Text>
              <Text>
                3 - Lancer l’activité dans une zone couverte par le réseau (au
                départ de Gève)
              </Text>
              <Text>
                4 - Faire strictement le parcours du départ à l’arrivée, ne pas
                changer de trace.
              </Text>
              <Text>
                5 - Ne pas arrêter l’activité sans avoir franchi la ligne
                d’arrivée de quelques mètres.
              </Text>
              <Text>
                6 - Enregistrer son activité lorsque nous sommes couvert par le
                réseau afin que le classement soit mis à jour automatiquement
              </Text>

              {this.props.noHeader ? (
                <Text style={{textAlign: 'center', marginTop: 10}}>
                  Vous retrouverez ces informations dans le menu d'aide
                </Text>
              ) : null}

              <Text style={{textAlign: 'center', marginTop: 10}}>
                Bon ski !
              </Text>

              {this.props.noHeader ? (
                <TouchableOpacity
                  onPress={() => this.onPopupOk()}
                  style={{
                    // paddingBottom: 200,
                    textAlign: 'center',
                    marginTop: 10,
                    justifyContent: 'center',
                    borderColor: ApiUtils.getBackgroundColor(),
                    padding: 10,
                    borderWidth: 1,
                  }}>
                  <Text
                    style={{
                      textAlign: 'center',
                      textTransform: 'uppercase',
                      color: ApiUtils.getBackgroundColor(),
                    }}>
                    C'est parti
                  </Text>
                </TouchableOpacity>
              ) : null}

              <View style={{marginBottom: 100}} />
            </Content>
          </Root>
        </Container>
      </Drawer>
    );
  }
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: 'white',
    // width: '100%'
  },
  title: {
    width: '25%',
  },
  saveButton: {
    backgroundColor: 'transparent',
    // width: '100%',
    marginTop: 0,
    paddingTop: 0,
    shadowOffset: {height: 0, width: 0},
    shadowOpacity: 0,
    elevation: 0,
  },
  drawerButton: {
    backgroundColor: 'transparent',
    // width: 100,
    marginTop: 0,
    paddingTop: 0,
    shadowOffset: {height: 0, width: 0},
    shadowOpacity: 0,
    elevation: 0,
  },
  saveText: {
    color: 'black',
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
    paddingLeft: 15,
    marginTop: 10,
    marginBottom: 10,
    color: 'gray',
    fontSize: 16,
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
    marginTop: 5,
    height: '200%',
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
  plusButtonLogo: {
    height: 30,
    width: 30,
    fontSize: 30,
    color: 'white',
    // marginLeft: -3,
    alignSelf: 'center',
  },

  logo: {
    width: '60%',
    height: 50,
    alignSelf: 'center',
  },
});

export default connect(mapStateToProps)(Help);
