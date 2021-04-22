import React, {Component} from 'react';
import {Image, TouchableOpacity, View, Linking, Platform} from 'react-native';
import {Icon, Text, H2} from 'native-base';
import ApiUtils from '../ApiUtils';
import IosReglages from '../assets/iosReglages.png';
import Ios2 from '../assets/ios2.png';
import BackgroundGeolocation, {
  DeviceSettingsRequest,
} from 'react-native-background-geolocation';
import {Dimensions} from 'react-native';
import {connect} from 'react-redux';
// import * as Sentry from '@sentry/react-native';

const mapStateToProps = (state) => {
  return {
    userData: state.userData,
  };
};

class BatteryModalContent extends Component {
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
    this.checkPowerManager();
    this.checkBatteryOptimisation();
  }

  async openBatteryOptimisation() {
    // Is Android device ignoring battery optimizations?
    let isIgnoring = await BackgroundGeolocation.deviceSettings.isIgnoringBatteryOptimizations();
    this.setState({isStep2Validated: isIgnoring});
    if (!isIgnoring) {
      BackgroundGeolocation.deviceSettings
        .showIgnoreBatteryOptimizations()
        .then((request: DeviceSettingsRequest) => {
          console.log(
            `- Device: ${request.manufacturer} ${request.model} ${request.version}`,
          );

          BackgroundGeolocation.deviceSettings.show(request);
          // If we've already shown this screen to the user, we don't want to annoy them.
          if (request.seen) {
            console.log('seen');
            return;
          }
        })
        .catch((error) => {
          // Depending on Manufacturer/Model/OS Version, a Device may not implement
          // a particular Settings screen.
          console.warn(error);
        });
    } else {
      console.log('not ignoring');
    }
  }

  async checkBatteryOptimisation() {
    // Is Android device ignoring battery optimizations?
    let isIgnoring = await BackgroundGeolocation.deviceSettings.isIgnoringBatteryOptimizations();
    this.setState({isStep2Validated: isIgnoring});
  }
  checkPowerManager() {
    BackgroundGeolocation.deviceSettings
      .showPowerManager()
      .then((request: DeviceSettingsRequest) => {
        this.setState({hasDeviceSettingsAvailable: true});
      })
      .catch((error) => {
        // Sentry.captureMessage(JSON.stringify(error));
        this.setState({hasDeviceSettingsAvailable: false});
      });
  }

  openPowerManager() {
    BackgroundGeolocation.deviceSettings
      .showPowerManager()
      .then((request: DeviceSettingsRequest) => {
        console.log(`- Screen seen? ${request.seen} ${request.lastSeenAt}`);
        console.log(
          `- Device: ${request.manufacturer} ${request.model} ${request.version}`,
        );

        // If we've already shown this screen to the user, we don't want to annoy them.
        // if (request.seen) {
        //   return;
        // }
        this.setState({hasDeviceSettingsAvailable: true});
        BackgroundGeolocation.deviceSettings.show(request);
        // User clicked [Confirm] button.  Execute the redirect to settings screen:
      })
      .catch((error) => {
     
        // Depending on Manufacturer/Model/OS Version, a Device may not implement
        // a particular Settings screen.
        console.log(error);
      });
  }

  closeDrawer = () => {
    this.drawer._root.close();
  };

  ongoHome() {
    this.props.navigation.navigate('Home');
  }

  toggleStep1() {
    this.setState({isVisibleStep1: !this.state.isVisibleStep1});
  }

  toggleStep2() {
    this.setState({isVisibleStep2: !this.state.isVisibleStep2});
  }

  onPopupOk = () => {
    var action = {type: 'VIEW_POPUPBATTERY', data: null};
    this.props.dispatch(action);


    if(this.props.onValidate)
    {    
      this.props.onValidate();
    }
  };

  openLink(url) {
    Linking.canOpenURL(url).then((supported) => {
      if (supported) {
        Linking.openURL(url);
      } else {
        ApiUtils.logError('Home openLink', 'Dont know how to open URI: ' + url);
      }
    });
  }

  onClose = () => {
    this.props.onclose && this.props.onclose();
  };

  render() {
    return (
      <View>
        <H2
          style={{
            textAlign: 'center',
            fontWeight: 'bold',
            color: ApiUtils.getColor(),
            textDecorationLine: 'underline',
            marginTop: 30,
          }}>
          Réglages Batterie - Important avant de faitre votre activité
        </H2>

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
          Avant de partir, assurez-vous d’avoir bien paramétré votre téléphone
          pour avoir le meilleur enregistrement de votre activité :
        </Text>

        <Text style={{marginTop: 10}}>
          Selon certaines marques ou modèles, les systèmes d’économie de
          batterie ferment intempestivement soit l’application, soit certaines
          options comme le GPS. De ce fait, l'application "plante", se met en
          pause automatiquement et votre tracé (parcours) est inexact ou
          inexistant dans votre résumé.
        </Text>

        <Text
          style={{
            textAlign: 'center',
            fontWeight: 'bold',
            color: ApiUtils.getColor(),
            textDecorationLine: 'underline',
            marginTop: 30,
          }}>
          Alors, comment faire ?
        </Text>

        <Text style={{marginTop: 10}}>
          Il suffit donc de désactiver l’économiseur de batterie pour profiter
          au maximum de votre application. Voici la liste des modèles les plus
          touchés et les procédures pour chacun d’entre eux. Allez ! C’est à
          vous !
        </Text>

        {Platform.OS == 'android' ? (
          <View>
            <TouchableOpacity onPress={() => this.toggleStep1()}>
              <View
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                }}>
                <H2 style={{marginTop : 5}}>Etape 1</H2>
                <Icon
                  name={
                    this.state.isVisibleStep1 ? 'chevron-up' : 'chevron-down'
                  }></Icon>
              </View>
            </TouchableOpacity>

            {this.state.isVisibleStep1 ? (
              <View>
                <Text>
                  Lisez les instructions pour votre modèle de téléphone
                  {this.state.hasDeviceSettingsAvailable
                    ? 'puis cliquez sur le bouton suivant  : '
                    : ''}
                </Text>
                {this.state.showPowerManager ? (
                  <View>
                    <TouchableOpacity
                      style={{
                        // paddingBottom: 200,
                        marginTop: 10,
                        justifyContent: 'center',
                        borderColor: ApiUtils.getColor(),
                        backgroundColor: ApiUtils.getColor(),
                        padding: 10,
                        borderWidth: 1,
                      }}
                      onPress={() => this.openPowerManager()}>
                      <Text
                        style={{
                          textAlign: 'center',
                          textTransform: 'uppercase',
                          color: 'white',
                        }}>
                        Ouvrir les paramètres
                      </Text>
                    </TouchableOpacity>
                  </View>
                ) : null}
                <Text style={{fontWeight: 'bold', marginTop: 10}}>
                  HUAWEI (Mate 20, P8 lite 2017, P10, …)
                </Text>
                <Text style={{marginTop: 10}} />
                <Text> 1. Aller dans "Réglages"</Text>
                <Text> 2. Cliquer sur "Batterie"</Text>
                <Text> 3. Cliquer sur "Lancement d'application"</Text>
                <Text>4. Rechercher et désactiver l’appli « My Cross »</Text>
                <Text>5. Cliquer sur OK en vérifiant que tout soit activé</Text>
                <Text>6. Retourner dans les reglages batterie et désactiver l'économiseur de batterie</Text>

                <Text style={{fontWeight: 'bold', marginTop: 10}}>
                  SAMSUNG (Galaxy S8 et inférieur : Galaxy A5, Galaxy S7, Galaxy
                  J5, ...)
                </Text>
                <Text style={{marginTop: 10}} />
                <Text> 1. Aller dans "Paramètres"</Text>
                <Text> 2. Cliquer sur "Maintenance de l'appareil"</Text>
                <Text> 3. Cliquer sur "Batterie"</Text>
                <Text> 5. Cliquer sur "Ajouter des applications"</Text>
                <Text>6.Sélectionner l’appli « My Cross »</Text>
                <Text>Cliquer sur "Terminé"</Text>

                <Text style={{fontWeight: 'bold', marginTop: 10}}>
                  SAMSUNG (Galaxy S10, Galaxy S9, …){' '}
                </Text>
                <Text>1. Aller dans "Paramètres" </Text>
                <Text>2. Cliquer sur "Maintenance de l'appareil" </Text>
                <Text>3. Cliquer sur "Batterie" </Text>
                <Text>
                  4. Cliquer sur les 3 petits points en haut à droite{' '}
                </Text>
                <Text>5. Cliquer sur "Paramètres" </Text>
                <Text>6. Désactiver "Mise en veille applis inutilisées" </Text>
                <Text>7. Désactiver "Désactiver auto. applis inutilis." </Text>
                <Text>8. Cliquer sur "Applications en veille" </Text>
                <Text>
                  9. Vérifier que l'application l’appli « My Cross » ne soit pas
                  dans la liste, sinon supprimer-là à l'aide de la corbeille en
                  haut à droite{' '}
                </Text>

                <Text style={{fontWeight: 'bold', marginTop: 10}}>
                  {' '}
                  SAMSUNG ( Galaxy A3)
                </Text>
                <Text>
                  Par défaut, sur ce modèle, l’économiseur de batterie est
                  désactivé. Sinon, voici la procédure !
                </Text>
                <Text>1. Aller dans “Paramètres”</Text>
                <Text>2. Cliquer sur “Batterie”</Text>
                <Text>3. Cliquer sur “Détails”</Text>
                <Text>4. Cliquer sur l’appli « My Cross »</Text>
                <Text>5. Désactivé l’appli « My Cross »</Text>

                <Text style={{fontWeight: 'bold', marginTop: 10}}>
                  HONOR (8, 9, 10, …)
                </Text>

                <Text>1. Aller dans “Réglages”</Text>
                <Text>2. Cliquer sur “Batterie”</Text>
                <Text>3. Cliquer sur “Lancement d'application”</Text>
                <Text>4. Chercher "My Cross"</Text>
                <Text>5. Désélectionner la checkbox</Text>
                <Text>
                  5. Sélectionner les 3 champs qui vont s'afficher en popup
                </Text>
                <Text>6. Retourner dans les reglages batterie et désactiver l'économiseur de batterie</Text>

                <Text style={{fontWeight: 'bold', marginTop: 10}}>
                  {' '}
                  XIAOMI (Redmi note 7 et plus …)
                </Text>
                <Text>1. Aller dans "Paramètres"</Text>
                <Text>2. Cliquer sur "Gérer les applications"</Text>
                <Text>3. Rechercher et cliquer sur l’appli « My Cross »</Text>
                <Text>4. Activer "Démarrage automatique"</Text>
                <Text>5. Une fenêtre s'ouvre, cliquer sur "OK"</Text>
                <Text>6. Cliquer ensuite sur "Économiseur de batterie"</Text>
                <Text>7. Sélectionner "Pas de restriction"</Text>

                <Text style={{fontWeight: 'bold', marginTop: 10}}>
                  {' '}
                  ASUS (Zenfone 5 …)
                </Text>
                <Text>1. Aller dans l'application "Gestionnaire mobile"</Text>
                <Text>2. Cliquer sur "PowerMaster"</Text>
                <Text>3. Cliquer sur les 3 petits points en haut à droite</Text>
                <Text>4. Cliquer sur "Réglages"</Text>
                <Text>
                  5. Désactiver la case "Refuser automatiquement le démarrage"
                </Text>
                <Text>6. Désactiver "Nettoyage suspendu"</Text>
                <Text>7. Retourner sur la page précédente (Réglages)</Text>
                <Text>8. Cliquer sur "Gestionnaire de démarrage"</Text>
                <Text>9. Activer l’appli « My Cross »</Text>
                <Text>10. Cliquer sur "Autoriser"</Text>

                <Text style={{fontWeight: 'bold', marginTop: 10}}>
                  WIKO (Ufeel)
                </Text>
                <Text>1. Aller dans l'application "Phone Assist"</Text>
                <Text>2. Cliquer sur "Eco. de batterie"</Text>
                <Text>3. Cliquer sur "Mode éco"</Text>
                <Text>4. Désactiver "Activer automatiquement le mode éco"</Text>
                <Text>5. Revenir en arrière (Eco. de batterie)</Text>
                <Text>6. Cliquer sur "Paramètres avancés & astuces"</Text>
                <Text>7. Cliquer sur l'icône réglage en haut à droite</Text>
                <Text>
                  8. Cliquer sur "White-list des apps en arrière-plan"
                </Text>
                <Text>9. Activer l’appli « My Cross » </Text>

                <Text style={{fontWeight: 'bold', marginTop: 10}}>
                  ONEPLUS (6 et plus...)
                </Text>
                <Text>1. Aller dans "Paramètres"</Text>
                <Text>2. Cliquer sur "Batterie"</Text>
                <Text>3. Cliquer sur "Optimisation de la batterie"</Text>
                <Text>4. Sélectionner l’appli « My Cross »</Text>
                <Text>5. Sélectionner "Ne pas optimiser"</Text>
              </View>
            ) : null}
            <TouchableOpacity onPress={() => this.toggleStep2()}>
              <View
                style={{
                  marginTop: 10,
                  display: 'flex',
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                }}>
                <H2>Etape 2</H2>
                <Icon
                  name={
                    this.state.isVisibleStep2 ? 'chevron-up' : 'chevron-down'
                  }></Icon>
              </View>
            </TouchableOpacity>

            {this.state.isVisibleStep2 ? (
              <View>
                <Text style={{marginBottom: 10}}>
                  Pour suivre votre position nous avons besoin d'ignorer les
                  optimisations de la batterie.
                </Text>
                <Text style={{marginBottom: 10}}>
                  Pour le faire : cliquez sur le bouton suivant et chercher
                  l'app puis cliquez sur "Ne pas optimiser"
                </Text>

                {!this.state.isStep2Validated ? (
                  <TouchableOpacity
                    onPress={() => this.openBatteryOptimisation()}
                    style={{
                      // paddingBottom: 200,
                      marginTop: 10,
                      justifyContent: 'center',
                      borderColor: ApiUtils.getColor(),
                      backgroundColor: ApiUtils.getColor(),
                      padding: 10,
                      borderWidth: 1,
                    }}>
                    <Text
                      style={{
                        textAlign: 'center',
                        textTransform: 'uppercase',
                        color: 'white',
                      }}>
                      Désactiver l'optimisation de la batterie
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <Text style={{color: 'green'}}>
                    L'optimisation de la batterie est bien désactivée  &nbsp;
                    <Icon
                      name="check"
                      type="FontAwesome5"
                      style={{
                        fontSize: 16,
                        paddingLeft: 12,
                        color: 'green',
                      }}></Icon>
                  </Text>
                )}
              </View>
            ) : null}
          </View>
        ) : (
          <View>
            <Text style={{fontWeight: 'bold', marginTop: 10}}>
              VOUS UTILISEZ IOS14 (OU UNE VERSION PLUS RÉCENTE) ?
            </Text>

            <Text style={{fontWeight: 'bold', marginTop: 10}}>
              Voici la procédure pour modifier les paramètres de localisation :
            </Text>
            <Text>1. Ouvrez les paramètres de votre téléphone</Text>
            <Text>2. Accédez à "My Cross {'>'} Position"</Text>
            <Text>
              3. Sélectionnez “Lorsque l’app est active” et réglez “Position
              exacte” sur ON (voir capture d'écran ci-dessous)
            </Text>
            <Text>4. Redémarrez l'application</Text>

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
              Voici la procédure pour modifier les paramètres de localisation :
            </Text>
            <Text>1. Ouvrez les paramètres de votre téléphone</Text>
            <Text>2. Accédez à "My Cross {'>'} Position"</Text>
            <Text>
              3. Sélectionnez “Lorsque l’app est active” (voir capture d'écran
              ci-dessous)
            </Text>
            <Text>4. Redémarrez l'application</Text>

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

        {this.props.noHeader ? (
          <Text style={{textAlign: 'center', marginTop: 10}}>
            Vous retrouverez ces informations dans le menu d'aide
          </Text>
        ) : null}

        {this.props.noHeader && !this.props.onMap ? (
          <TouchableOpacity
            onPress={() => this.onPopupOk()}
            style={{
              // paddingBottom: 200,
              marginTop: 10,
              justifyContent: 'center',
              borderColor: ApiUtils.getColor(),
              backgroundColor: ApiUtils.getColor(),
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
      </View>
    );
  }
}

export default connect(mapStateToProps)(BatteryModalContent);
