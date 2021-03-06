import React, {Component} from 'react';
import {
  StyleSheet,
  Image,
  TouchableOpacity,
  View,
  Dimensions,
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
import {Sponsors} from './Sponsors';
import IosReglages from '../assets/iosReglages.png';
import Ios2 from '../assets/ios2.png';

const mapStateToProps = (state) => {
  return {
    userData: state.userData,
  };
};

class Help extends Component {
  drawer: any;
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
  didMount() {}

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
      .then((response) => response.json())
      .then((responseJson) => {
        var action = {type: 'GET_CLUBS', data: responseJson};
        this.props.dispatch(action);

        this.setState({isLoading: false});
      })
      .catch((e) => {
        this.setState({isLoading: false});
        ApiUtils.logError('getCLUBS', e.message);
      })
      .then(() => this.setState({isLoading: false}));
  }

  onPopupOk() {
    var action = {type: 'VIEW_POPUPAIDE', data: null};
    this.props.dispatch(action);
  }

  openLink(url) {
    Linking.canOpenURL(url).then((supported) => {
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
        ref={(ref) => {
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
                <Right style={{flex: 1}} />
              </Header>
            )}

            <Content style={{padding: 10, paddingTop: 20}} scrollEnabled={true}>
              <View style={[GlobalStyles.row, {justifyContent: 'center'}]}>
                <Image resizeMode="contain" source={Logo} style={styles.logo} />
              </View>
              <Text
                style={{
                  textAlign: 'center',
                  fontWeight: 'bold',
                  color: ApiUtils.getBackgroundColor(),
                  marginTop: 30,
                }}>
              Bienvenue sur l???application officielle du "DIY TAC Run"
              </Text>

              <Text style={{marginTop: 10}}>Un semi marathon en mars ?? Tulle : une tradition.</Text>
              <Text style={{marginTop: 10}}>
                Malgr?? la crise sanitaire, le TAC vous propose une version
                originale du semi Tulliste Une version autonome, connect??e mais
                que vous pouvez parcourir entre amis
              </Text>
              <Text style={{marginTop: 10}}>
                Enfin un objectif dans votre calendrier et redonner du sens ??
                votre pr??paration.
              </Text>
              <Text style={{marginTop: 10}}>
                Et si vous ne vous sentez pas suffisamment pr??par?? pour un semi,
                lancez vous pour la boucle de 10km.
              </Text>
              <Text style={{marginTop: 10}}>
                Le d??part des 2 courses se fait au Stade Alexandre Cueille.
              </Text>
              <Text style={{marginTop: 10}}>
                <Text
                  style={{
                    fontWeight: 'bold',
                    color: ApiUtils.getBackgroundColor(),
                  }}>
                  C???EST GRATUIT, A LA CARTE, ILLIMITE  &nbsp;
                </Text>
                de quoi am??liorer votre r??sultat ?? chaque sortie !
              </Text>
              <Text
                style={{
                  marginTop: 10,
                  fontWeight: 'bold',
                  textAlign: 'center',
                }}>
                Venez battre vos propres records.
              </Text>
              <TouchableOpacity onPress={()=>{this.openLink("http://wordpress.tulleac.fr/")}}>
              <Text style={{marginTop: 10, fontWeight: 'bold', textAlign : 'center', textDecorationLine :'underline'}} >
                Pour les infos compl??tes rendez-vous sur notre http://wordpress.tulleac.fr/

              </Text></TouchableOpacity>
              <Text
                style={{
                  marginTop: 10,
                  fontWeight: 'bold',
                  color: ApiUtils.getBackgroundColor(),
                  textDecorationLine: 'underline',
                  textTransform: 'uppercase',
                }}>
                Manuel ?? lire avant de lancer une activit?? :
              </Text>
              <Text style={{marginTop: 10, fontWeight: 'bold'}}>
                1 - Enregistrer vos activit??s
              </Text>
              <Text style={{marginTop: 5}}>
                - Pour enregistrer une nouvelle activit?? cliquez sur le bouton ??
                + ??
              </Text>
              <Text style={{marginTop: 5}}>
                - D??s que vous ??tes pr??t cliquez sur ?? d??marrer ?? puis
                lancez-vous sur nos parcours.
              </Text>
              <Text style={{marginTop: 5}}>
                - R??alisez votre activit??, l???application enregistrera votre
                activit?? et calculera vos performances sur nos diff??rents
                parcours.
              </Text>
              <Text style={{marginTop: 5}}>
                - A votre arriv??e cliquez sur ?? stop ??.
              </Text>
              <Text style={{marginTop: 5}}>
                - Cliquez sur ?? enregistrer ?? votre parcours
              </Text>
              <Text style={{marginTop: 5}}>
                Pour voir la liste des parcours cliquez sur (petit logo carte)
              </Text>
              <Text style={{marginTop: 5}}>
                Retrouvez les classements sur notre site, mis ?? jour chaque soir
                :
              </Text>
              <Text style={{marginTop: 10, fontWeight: 'bold'}}>
                2 - Param??trez votre t??l??phone
              </Text>
              <Text style={{marginTop: 10}}>
                Pour un meilleur enregistrement de votre activit??, param??trez la
                gestion de la batterie de votre t??l??phone pour que l???app ne se
                stoppe pas pendant l???effort
              </Text>
              <Text style={{marginTop: 10}}>
                Vous retrouverez ces informations dans le menu aide. Bonne
                course.
              </Text>
              <Text style={{marginTop: 10}}>?? C???EST PARTI ??</Text>

              <Text style={{marginTop: 10, fontWeight: 'bold'}}>
                3 ??? Pour un fonctionnement optimal
              </Text>
              <Text style={{marginTop: 10}}>
                Pour ??tre s??r d???avoir un bon enregistrement de vos performances
                :
              </Text>
              <Text style={{marginTop: 10}}>
                - Mettre en route la fonction GPS lors de l???utilisation
              </Text>
              <Text style={{marginTop: 10}}>
                - D??sactivez sur le t??l??phone les fonctionnalit??s d?????conomie de
                batterie
              </Text>
              <Text style={{marginTop: 10}}>
                - Lancer l???activit?? dans une zone couverte par le r??seau
              </Text>
              <Text style={{marginTop: 10}}>
                - Faire strictement le parcours du d??part ?? l???arriv??e, ne pas
                changer de parcours.
              </Text>
              <Text style={{marginTop: 10}}>
                - Ne pas arr??ter l???activit?? sans avoir franchi la ligne
                d???arriv??e de quelques m??tres.
              </Text>
              <Text>
                - Enregistrer son activit?? lorsque nous sommes couverts par le
                r??seau afin que le classement soit mis ?? jour automatiquement
              </Text>

              {!this.props.noHeader ? (
                <View>
                  <Icon
                    type="FontAwesome5"
                    name="exclamation-triangle"
                    style={{
                      textAlign: 'center',
                      marginTop: 20,
                      marginBottom: 20,
                      fontSize: 40,
                    }}
                  />

                  <Text style={{marginTop: 10}}>
                    Avant de partir, assurez-vous d???avoir bien param??tr?? votre
                    t??l??phone pour avoir le meilleur enregistrement de votre
                    activit?? :
                  </Text>

                  <Text style={{marginTop: 10}}>
                    Les applications qui utilisent des syst??mes de messagerie,
                    type mails par exemple ont un besoin minime en ressources.
                    Ce n???est pas le cas de notre application qui pour
                    fonctionner efficacement a besoin de ressources.
                  </Text>
                  <Text style={{marginTop: 10}}>
                    Qui dit ???ressources???, dit ???batterie??? ! Et vous l???aurez
                    compris, l???utilisation de la batterie de votre t??l??phone est
                    fonction des donn??es transmises par l???application que l???on
                    utilise.
                  </Text>
                  <Text style={{marginTop: 10}}>
                    Selon certaines marques ou mod??les, les syst??mes d?????conomie
                    de batterie ferment intempestivement soit l???application,
                    soit certaines options comme le GPS. De ce fait,
                    l'application "plante", se met en pause automatiquement et
                    votre trac?? (parcours) est inexact ou inexistant dans votre
                    r??sum??.
                  </Text>

                  <Text
                    style={{
                      textAlign: 'center',
                      fontWeight: 'bold',
                      color: ApiUtils.getBackgroundColor(),
                      textDecorationLine: 'underline',
                      marginTop: 30,
                    }}>
                    Alors, comment faire ?
                  </Text>

                  <Text style={{marginTop: 10}}>
                    Il suffit donc de d??sactiver l?????conomiseur de batterie pour
                    profiter au maximum de votre application. Voici la liste des
                    mod??les les plus touch??s et les proc??dures pour chacun
                    d???entre eux. Allez ! C???est ?? vous !
                  </Text>

                  {Platform.OS == 'android' ? (
                    <View>
                      <Text style={{fontWeight: 'bold', marginTop: 10}}>
                        HUAWEI (Mate 20, P8 lite 2017, P10, ???)
                      </Text>
                      <Text style={{marginTop: 10}} />
                      <Text> 1. Aller dans "R??glages"</Text>
                      <Text> 2. Cliquer sur "Batterie"</Text>
                      <Text> 3. Cliquer sur "Lancement d'application"</Text>
                      <Text>
                        {' '}
                        4. Rechercher et d??sactiver notre application{' '}
                      </Text>
                      <Text>
                        5. Cliquer sur OK en v??rifiant que tout soit activ??
                      </Text>

                      <Text style={{fontWeight: 'bold', marginTop: 10}}>
                        SAMSUNG (Galaxy S8 et inf??rieur : Galaxy A5, Galaxy S7,
                        Galaxy J5, ...)
                      </Text>
                      <Text style={{marginTop: 10}} />
                      <Text> 1. Aller dans "Param??tres"</Text>
                      <Text> 2. Cliquer sur "Maintenance de l'appareil"</Text>
                      <Text> 3. Cliquer sur "Batterie"</Text>
                      <Text> 5. Cliquer sur "Ajouter des applications"</Text>
                      <Text>6.S??lectionner notre application</Text>
                      <Text>Cliquer sur "Termin??"</Text>

                      <Text style={{fontWeight: 'bold', marginTop: 10}}>
                        SAMSUNG (Galaxy S8 et inf??rieur : Galaxy A5, Galaxy S7,
                        Galaxy J5, ...)
                      </Text>
                      <Text style={{marginTop: 10}} />
                      <Text> 1. Aller dans "Param??tres"</Text>
                      <Text> 2. Cliquer sur "Maintenance de l'appareil"</Text>
                      <Text> 3. Cliquer sur "Batterie"</Text>
                      <Text> 5. Cliquer sur "Ajouter des applications"</Text>
                      <Text>6.S??lectionner notre application</Text>
                      <Text>Cliquer sur "Termin??"</Text>

                      <Text style={{fontWeight: 'bold', marginTop: 10}}>
                        SAMSUNG (Galaxy S10, Galaxy S9, ???){' '}
                      </Text>
                      <Text>1. Aller dans "Param??tres" </Text>
                      <Text>2. Cliquer sur "Maintenance de l'appareil" </Text>
                      <Text>3. Cliquer sur "Batterie" </Text>
                      <Text>
                        4. Cliquer sur les 3 petits points en haut ?? droite{' '}
                      </Text>
                      <Text>5. Cliquer sur "Param??tres" </Text>
                      <Text>
                        6. D??sactiver "Mise en veille applis inutilis??es"{' '}
                      </Text>
                      <Text>
                        7. D??sactiver "D??sactiver auto. applis inutilis."{' '}
                      </Text>
                      <Text>8. Cliquer sur "Applications en veille" </Text>
                      <Text>
                        9. V??rifier que l'application notre application ne soit
                        pas dans la liste, sinon supprimer-l?? ?? l'aide de la
                        corbeille en haut ?? droite{' '}
                      </Text>

                      <Text style={{fontWeight: 'bold', marginTop: 10}}>
                        {' '}
                        SAMSUNG ( Galaxy A3)
                      </Text>
                      <Text>
                        Par d??faut, sur ce mod??le, l?????conomiseur de batterie est
                        d??sactiv??. Sinon, voici la proc??dure !
                      </Text>
                      <Text>1. Aller dans ???Param??tres???</Text>
                      <Text>2. Cliquer sur ???Batterie???</Text>
                      <Text>3. Cliquer sur ???D??tails???</Text>
                      <Text>4. Cliquer sur notre application</Text>
                      <Text>5. D??sactiv?? notre application</Text>

                      <Text style={{fontWeight: 'bold', marginTop: 10}}>
                        HONOR (8, 9, 10, ???)
                      </Text>
                      <Text>1. Aller dans ???R??glages???</Text>
                      <Text>2. Cliquer sur ???Batterie???</Text>
                      <Text>3. Cliquer sur ???Lancement d'application???</Text>
                      <Text>4. Chercher notre application</Text>
                      <Text>5. D??s??lectionner la checkbox</Text>
                      <Text>
                        5. S??lectionner les 3 champs qui vont s'afficher en
                        popup
                      </Text>

                      <Text style={{fontWeight: 'bold', marginTop: 10}}>
                        {' '}
                        XIAOMI (Redmi note 7 et plus ???)
                      </Text>
                      <Text>1. Aller dans "Param??tres"</Text>
                      <Text>2. Cliquer sur "G??rer les applications"</Text>
                      <Text>
                        3. Rechercher et cliquer sur notre application
                      </Text>
                      <Text>4. Activer "D??marrage automatique"</Text>
                      <Text>5. Une fen??tre s'ouvre, cliquer sur "OK"</Text>
                      <Text>
                        6. Cliquer ensuite sur "??conomiseur de batterie"
                      </Text>
                      <Text>7. S??lectionner "Pas de restriction"</Text>

                      <Text style={{fontWeight: 'bold', marginTop: 10}}>
                        {' '}
                        ASUS (Zenfone 5 ???)
                      </Text>
                      <Text>
                        1. Aller dans l'application "Gestionnaire mobile"
                      </Text>
                      <Text>2. Cliquer sur "PowerMaster"</Text>
                      <Text>
                        3. Cliquer sur les 3 petits points en haut ?? droite
                      </Text>
                      <Text>4. Cliquer sur "R??glages"</Text>
                      <Text>
                        5. D??sactiver la case "Refuser automatiquement le
                        d??marrage"
                      </Text>
                      <Text>6. D??sactiver "Nettoyage suspendu"</Text>
                      <Text>
                        7. Retourner sur la page pr??c??dente (R??glages)
                      </Text>
                      <Text>8. Cliquer sur "Gestionnaire de d??marrage"</Text>
                      <Text>9. Activer notre application</Text>
                      <Text>10. Cliquer sur "Autoriser"</Text>

                      <Text style={{fontWeight: 'bold', marginTop: 10}}>
                        WIKO (Ufeel)
                      </Text>
                      <Text>1. Aller dans l'application "Phone Assist"</Text>
                      <Text>2. Cliquer sur "Eco. de batterie"</Text>
                      <Text>3. Cliquer sur "Mode ??co"</Text>
                      <Text>
                        4. D??sactiver "Activer automatiquement le mode ??co"
                      </Text>
                      <Text>5. Revenir en arri??re (Eco. de batterie)</Text>
                      <Text>6. Cliquer sur "Param??tres avanc??s & astuces"</Text>
                      <Text>
                        7. Cliquer sur l'ic??ne r??glage en haut ?? droite
                      </Text>
                      <Text>
                        8. Cliquer sur "White-list des apps en arri??re-plan"
                      </Text>
                      <Text>9. Activer notre application </Text>

                      <Text style={{fontWeight: 'bold', marginTop: 10}}>
                        ONEPLUS (6 et plus...)
                      </Text>
                      <Text>1. Aller dans "Param??tres"</Text>
                      <Text>2. Cliquer sur "Batterie"</Text>
                      <Text>3. Cliquer sur "Optimisation de la batterie"</Text>
                      <Text>4. S??lectionner notre application</Text>
                      <Text>5. S??lectionner "Ne pas optimiser"</Text>
                    </View>
                  ) : (
                    <View>
                      <Text style={{fontWeight: 'bold', marginTop: 10}}>
                        VOUS UTILISEZ IOS14 (OU UNE VERSION PLUS R??CENTE) ?
                      </Text>

                      <Text style={{fontWeight: 'bold', marginTop: 10}}>
                        Voici la proc??dure pour modifier les param??tres de
                        localisation :
                      </Text>
                      <Text>1. Ouvrez les param??tres de votre t??l??phone</Text>
                      <Text>2. Acc??dez ?? "DIY TAC Run {'>'} Position"</Text>
                      <Text>
                        3. S??lectionnez ???Lorsque l???app est active??? et r??glez
                        ???Position exacte??? sur ON (voir capture d'??cran
                        ci-dessous)
                      </Text>
                      <Text>4. Red??marrez l'application</Text>

                      <Image
                        style={{
                          marginTop: 20,
                          marginLeft: 'auto',
                          marginRight: 'auto',
                        }}
                        source={IosReglages}
                        width={(Dimensions.get('screen').width * 70) / 100}
                        resizeMode="contain"
                      />

                      <Text style={{fontWeight: 'bold', marginTop: 10}}>
                        VOUS UTILISEZ IOS 13 (OU UNE VERSION PLUS ANCIENNE) ?
                      </Text>

                      <Text style={{fontWeight: 'bold', marginTop: 10}}>
                        Voici la proc??dure pour modifier les param??tres de
                        localisation :
                      </Text>
                      <Text>1. Ouvrez les param??tres de votre t??l??phone</Text>
                      <Text>2. Acc??dez ?? "DIY TAC Run {'>'} Position"</Text>
                      <Text>
                        3. S??lectionnez ???Lorsque l???app est active??? (voir capture
                        d'??cran ci-dessous)
                      </Text>
                      <Text>4. Red??marrez l'application</Text>

                      <Image
                        style={{
                          marginTop: 10,
                          marginLeft: 'auto',
                          marginRight: 'auto',
                        }}
                        source={Ios2}
                        width={(Dimensions.get('screen').width * 90) / 100}
                        resizeMode="contain"
                      />
                    </View>
                  )}
                </View>
              ) : null}

              {this.props.noHeader ? (
                <Text style={{textAlign: 'center', marginTop: 10}}>
                  Vous retrouverez ces informations dans le menu d'aide
                </Text>
              ) : null}
              <Text style={{textAlign: 'center', marginTop: 10}}>
                Bonne course !
              </Text>
              {this.props.noHeader ? (
                <TouchableOpacity
                  onPress={() => this.onPopupOk()}
                  style={{
                    // paddingBottom: 200,
                    marginTop: 10,
                    justifyContent: 'center',
                    borderColor: ApiUtils.getBackgroundColor(),
                    backgroundColor: ApiUtils.getBackgroundColor(),
                    padding: 10,
                    borderWidth: 1,
                  }}>
                  <Text
                    style={{
                      textAlign: 'center',
                      textTransform: 'uppercase',
                      color: 'white',
                    }}>
                    C'est parti
                  </Text>
                </TouchableOpacity>
              ) : null}
              <View style={{marginBottom: 100}} />
            </Content>
            <Sponsors />
          </Root>
        </Container>
      </Drawer>
    );
  }
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: ApiUtils.getBackgroundColor(),
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
    width: '100%',
    marginTop: 0,
    paddingTop: 0,
    shadowOffset: {height: 0, width: 0},
    shadowOpacity: 0,
    elevation: 0,
  },
  saveText: {
    color: 'white',
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
