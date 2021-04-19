import React, {Component} from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  View,
  Platform,
  Alert,
  Modal,
} from 'react-native';
import {
  Header,
  Body,
  Toast,
  Root,
  Icon,
  Text,
  Left,
  Right,
  Button,
  Switch,
  Picker,
  Spinner,
  Footer,
} from 'native-base';
import ApiUtils from '../ApiUtils';
import {connect} from 'react-redux';
import {Sponsors} from '../home/Sponsors';
import BackgroundGeolocation from 'react-native-background-geolocation';
import {Dimensions} from 'react-native';
import ErrorMessage from '../home/ErrorMessage';
import {ScrollView, TextInput} from 'react-native-gesture-handler';
import DefaultProps from '../models/DefaultProps';
import {buildGPX, GarminBuilder} from 'gpx-builder';
import {Point} from 'gpx-builder/dist/builder/BaseBuilder/models';
import VersionCheck from 'react-native-version-check';
import {TemplateSportLive} from '../globalsModifs';
import * as Animated from 'react-native-animatable';

const mapStateToProps = (state) => {
  return {
    isRecording: state.isRecording,
    currentLive: state.currentLive,
    isMoving: state.isMoving,
    userData: state.userData,
    coordinatesString: state.coordinatesString,
    currentPosition: state.currentPosition,
    currentMapStyle: state.currentMapStyle,
    polylines: state.polylines,
    isGpsNotOk: state.isGpsNotOk,
  };
};

interface Props extends DefaultProps {
  currentLive: any;
  isRecording: boolean;
  isMoving: boolean;
  userData: any;
  coordinatesString: string;
  polylines: any[];
  currentMapStyle: string;
  onCenter(): void;
  openTraceModal(): void;
  closeTraceModal(): void;
  isGpsNotOk: boolean;
}

interface State {
  modalStopVisible: boolean;
  selectedSport: number;
  libelleLive: string;
  comments: string;
  spinner: boolean;
  libelleLiveIsModified: boolean;
  acceptChallengeNameUtilisateur: boolean;
  currentMapStyle: string;
  isOpenExtraButtons: boolean;
  modalChooseSportVisible :boolean;


  listSport: {
    idSport: number;
    sportName: string;
  }[];
}

class MapButtons extends Component<Props, State> {
  extraButtons: any;
  constructor(props) {
    super(props);

    this.state = {
      modalStopVisible: false,
      selectedSport: -1,
      libelleLive: '',
      comments: '',
      libelleLiveIsModified: false,
      spinner: false,
      acceptChallengeNameUtilisateur: false,
      listSport: TemplateSportLive,
      modalChooseSportVisible : false
    };
  }

  componentDidMount() {
    setTimeout(() => this.didMount(), 300);
  }
  didMount() {
    if (this.props.currentLive != null) {
      this.setState({
        libelleLive: this.props.currentLive.libelleLive,
        selectedSport: this.props.currentLive.idSport,
      });
    }
    this.setState({
      // libelleLive: this.props.currentLive.libelleLive,
      acceptChallengeNameUtilisateur:
        this.props.userData.acceptChallengeNameUtilisateur == 1,
    });
  }

  getLibelleLive() {
    var date = new Date();
    var hour = date.getHours();

    if (hour <= 11) {
      return 'Activité matinale';
    }
    if (hour > 11 && hour < 19) {
      return "Activité de l'après-midi";
    }

    if (hour >= 19) {
      return 'Activité du soir';
    }
  }

  toggleModalChooseSport = () =>{
    this.setState({modalChooseSportVisible : !this.state.modalChooseSportVisible})
  }

  onCreateLive = () =>
  {
    if (TemplateSportLive.length == 1) {

      this.onClickCreateLiveOk();
    }else{
      this.setState({modalChooseSportVisible : true})
    }
  }
  onClickCreateLiveOk = () => {

    this.setState({modalChooseSportVisible : false});

    let formData = new FormData();
    formData.append('method', 'createLive');
    formData.append('auth', ApiUtils.getAPIAuth());
    formData.append('idUtilisateur', this.props.userData.idUtilisateur);
    formData.append('idversion', VersionCheck.getCurrentVersion());
    let idSport = -1;
    if (TemplateSportLive.length == 1) {
      idSport = TemplateSportLive[0].idSport;
      formData.append('idSport', TemplateSportLive[0].idSport);
    }else{
      formData.append('idSport', this.state.selectedSport);
    }

    formData.append('os', Platform.OS);
    formData.append('phoneData', JSON.stringify(this.props.phoneData));

    var libelleLive = this.getLibelleLive();

    formData.append('libelleLive', libelleLive);
    this.setState({spinner : true});
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
        // alert("success http");
        //save values in cache
        if (responseJson.codeErreur == 'SUCCESS') {
          //SaveData

          var live = {
            idLive: responseJson.idLive,
            codeLive: responseJson.codeLive,
            libelleLive: responseJson.libelleLive,
            dateCreationLive: responseJson.dateCreationLive,
            idSport: idSport,
            invites: [],
            statsInfos: {},
          };

          var action = {type: 'CREATE_LIVE', data: live};
          this.props.dispatch(action);
          this.setState({spinner : false});
          this.onstart();
        } else {
          this.setState({spinner : false});
          alert(responseJson.message);
        }
      })
      .catch((e) => {
        this.setState({spinner : false});
        ApiUtils.logError('CreateNewLive onClickCreateLive', e.message);
        // this.onClickNavigate('Lives');
      })
      .then();
  }

  onstart() {
    BackgroundGeolocation.destroyLocations(
      () => {
        this.saveRecordingState(true);
        this.onTimerStartPause();
      },
      () => {
        this.saveRecordingState(true);
        this.onTimerStartPause();
      },
    );

    // this.setState({ isStarted: true })
  }

  async saveRecordingState(isrecording) {
    var action = {type: 'SAVE_IS_RECORDING', data: isrecording};
    this.props.dispatch(action);
  }

  onStop() {
    Alert.alert(
      "Arrêter l'activité",
      "Etes vous sûr d'arrêter ?",
      [
        {
          text: 'Annuler',
          style: 'cancel',
        },
        {text: 'Arrêter', onPress: () => this.onStopOk()},
      ],
      {cancelable: false},
    );
  }

  onStopOk() {
    if (this.props.isMoving) {
      this.onTimerStartPause();
    }
    this.syncPositions();
    this.createGpx();
    //  this.sendAllCoordinates();

    this.toggleStopModal();
  }

  onTimerStartPause() {
    var now = new Date().getTime();

    var action = {type: 'ADD_DATE', data: now};
    this.props.dispatch(action);

    let isMoving = !this.props.isMoving;

    var actionIsMoving = {type: 'IS_MOVING', data: isMoving};
    this.props.dispatch(actionIsMoving);

    this.onToggleEnabled(isMoving, this.props.isRecording);
  }

  onTimerPause() {
    if (this.props.isMoving) {
      Alert.alert(
        'Mettre en pause',
        'Etes vous sûr de mettre en pause ?',
        [
          {
            text: 'Annuler',
            style: 'cancel',
          },
          {text: 'Mettre en pause', onPress: () => this.onTimerStartPause()},
        ],
        {cancelable: false},
      );
    } else {
      Alert.alert(
        'Reprendre',
        "êtes vous sûr de reprendre l'activité ?",
        [
          {
            text: 'Annuler',
            style: 'cancel',
          },
          {text: 'Reprendre', onPress: () => this.onTimerStartPause()},
        ],
        {cancelable: false},
      );
    }

    // this.onTimerStartPause();
  }

  onToggleEnabled(isMoving, isRecording) {
    if (isMoving) {
      // clearInterval(this.interval);
      // this.interval = setInterval(() => this.setState({time: Date.now()}), 15000);
      BackgroundGeolocation.start(
        () => {
          // NOTE:  We tell react-native-maps to show location only AFTER BackgroundGeolocation
          // has requested location authorization.  If react-native-maps requests authorization first,
          // it will request WhenInUse -- "Permissions Tug-of-war"

          BackgroundGeolocation.changePace(true);
        },
        (state) => {
          ApiUtils.logError('failure geoloc', JSON.stringify(state));
        },
      );
    } else {
      if (isRecording) {
        BackgroundGeolocation.changePace(false);
      } else {
        BackgroundGeolocation.stop();
      }

      //  clearInterval(this.interval);
    }
  }

  onClickValidateStop() {
    this.syncPositions();

    var isError = false;
    if (this.state.libelleLive == '') {
      isError = true;
    }

    if (this.state.selectedSport == -1) {
      isError = true;
    }

    if (!isError) {
      this.onSendRequestStop();
    }
  }

  onSendRequestStop() {
    this.syncPositions();

    this.setState({spinner: true}, () => {
      let formData = new FormData();
      formData.append('method', 'updateLive');
      formData.append('auth', ApiUtils.getAPIAuth());
      formData.append('idLive', this.props.currentLive.idLive);
      formData.append('etatLive', '2');
      formData.append('commentLive', this.state.comments);
      formData.append('libelleLive', this.state.libelleLive);
      formData.append('idSport', this.state.selectedSport.toString());

      var acceptChallengeNameUtilisateur = '0';
      if (this.state.acceptChallengeNameUtilisateur) {
        acceptChallengeNameUtilisateur = '1';
      }

      formData.append(
        'acceptChallengeNameUtilisateur',
        acceptChallengeNameUtilisateur,
      );
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
            this.setState({spinner: false});

            this.onDisconnect(true);

            var action = {
              type: 'UPDATE_ACCEPT_CHALLENGE',
              data: {
                acceptChallengeNameUtilisateur: acceptChallengeNameUtilisateur,
              },
            };
            this.props.dispatch(action);
            this.props.navigation.navigate('LiveSummary');
            // .then(
            //   this.props.navigation.navigate('LiveSummary')
            // );
          } else {
            alert(responseJson.message);
          }
        })
        .catch((e) => {
          console.log(JSON.stringify(e));
          this.setState({spinner: false});
          ApiUtils.logError('create live', JSON.stringify(e.message));
          // alert('Une erreur est survenue : ' + JSON.stringify(e.message));

          if (e.message == 'Timeout' || e.message == 'Network request failed') {
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
    });
  }
  async createGpx() {
    try {
      const gpxData = new GarminBuilder();
      let points = [];

      let coords = JSON.parse(this.props.coordinatesString);
      coords.forEach((c) => {
        var point = new Point(c.latitude, c.longitude, {
          time: new Date(c.timestamp),
        });
        points.push(point);
      });

      gpxData.setSegmentPoints(points);
      var gpxString = buildGPX(gpxData.toObject());
      await this.sendGeneratedGPX(gpxString);
    } catch (e) {
      console.log(e);
      ApiUtils.logError(
        'createGPX',
        'idUser: ' +
          this.props.userData.idUtilisateur +
          ' message: ' +
          JSON.stringify(e),
      );
    }
  }

  async sendGeneratedGPX(gpx) {
    let formData = new FormData();
    formData.append('method', 'sendGeneratedGpx');
    formData.append('auth', ApiUtils.getAPIAuth());
    formData.append('idUtilisateur', this.props.userData.idUtilisateur);
    formData.append('gpxContent', gpx);
    formData.append('idLive', this.props.currentLive.idLive);
    //fetch followCode API
    fetch(ApiUtils.getAPIUrl(), {
      method: 'POST',
      headers: {
        // Accept: 'application/jsjhon',
        // 'Content-Type': 'application/json',
      },
      body: formData,
    })
      .then(ApiUtils.checkStatus)
      .then((response) => response.json())
      .then((responseJson) => {
        console.log('sendgenerated SUCCESS');
        if (responseJson.codeErreur == 'SUCCESS') {
        } else {
          // alert('erreur : ' + responseJson.message);
        }
      })
      .catch((e) => {
        console.log(e);
        // alert('erreur : ' + e.message);
        ApiUtils.logError(
          'send generated gpx',
          'idUser: ' +
            this.props.userData.idUtilisateur +
            ' message: ' +
            JSON.stringify(e),
        );
      });
  }

  async sendAllCoordinates() {
    let formData = new FormData();
    formData.append('method', 'sendAllCoordinates');
    formData.append('auth', ApiUtils.getAPIAuth());
    formData.append('idUtilisateur', this.props.userData.idUtilisateur);
    formData.append('coordinates', this.props.coordinatesString);
    formData.append('idLive', this.props.currentLive.idLive);

    fetch(ApiUtils.getAPIUrl(), {
      method: 'POST',
      headers: {
        // Accept: 'application/jsjhon',
        // 'Content-Type': 'application/json',
      },
      body: formData,
    })
      .then(ApiUtils.checkStatus)
      .then((response) => response.json())
      .then((responseJson) => {
        if (responseJson.codeErreur == 'SUCCESS') {
        }
      })
      .catch((e) => {
        // alert('erreur : ' + e.message);
        ApiUtils.logError(
          'send all coordinates gpx',
          'idUser: ' +
            this.props.userData.idUtilisateur +
            ' message: ' +
            JSON.stringify(e),
        );
      });
  }

  syncPositions() {
    try {
      BackgroundGeolocation.sync(
        (records) => {
          // this.setState({isSyncOk: true});
          ApiUtils.logError(
            'sync at end idUtilisateur: ' + this.props.userData.idUtilisateur,
            JSON.stringify(records),
          );
        },
        () => {},
      );
    } catch (e) {
      // this.setState({isSyncOk : false}) ;
      ApiUtils.logError(
        'ERROR sync at end idUtilisateur: ' + this.props.userData.idUtilisateur,
      );
    }
  }

  onignoreOk() {
    this.setState({spinner: true});
    let formData = new FormData();
    formData.append('method', 'deleteLive');
    formData.append('auth', ApiUtils.getAPIAuth());
    formData.append('idLive', this.props.currentLive?.idLive);
    //fetch followCode API
    fetch(ApiUtils.getAPIUrl(), {
      method: 'POST',
      headers: {
        // Accept: 'application/jsjhon',
        // 'Content-Type': 'application/json',
      },
      body: formData,
    })
      .then(ApiUtils.checkStatus)
      .then((response) => response.json())
      .then((responseJson) => {
        if (responseJson.codeErreur == 'SUCCESS') {
          var action = {
            type: 'IGNORE_LIVE',
            data: this.props.currentLive.idLive,
          };
          this.props.dispatch(action);

          this.onDisconnect(false);
          // this.toggleModal3(false);
          // this.props.navigation.navigate('Lives');

          this.setState({spinner: false});
          //this.props.navigation.navigate('Lives');
        } else {
          alert('erreur : ' + responseJson.message);

          this.setState({spinner: false});
        }
      })
      .catch((e) => {
        this.setState({spinner: false});

        ApiUtils.logError('simpleMap ignoreActivity', e.message);
      });
  }

  ignoreActivity = () => {
    Alert.alert(
      "Ignorer l'activité",
      "Si vous ignorez l'activité vous allez perdre les données enregistrées. Etes-vous sûr d'ignorer l'activité ?",
      [
        {
          text: 'Annuler',
          style: 'cancel',
        },
        {text: 'Ignorer', onPress: () => this.onignoreOk()},
      ],
      {cancelable: false},
    );
  };

  onDisconnect(isSummary) {
    BackgroundGeolocation.stop();
    BackgroundGeolocation.removeAllListeners();

    var action = {type: 'CLEAR_MAP', data: null};
    this.props.dispatch(action);
    this.onToggleEnabled(false, false);

    this.toggleStopModal();

    // if (isSummary) {
    //   this.props.navigation.navigate('LiveSummary');
    // } else {
    //   this.props.navigation.navigate('Lives');
    // }
  }

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

    return isError;
  }

  toggleStopModal() {
    this.setState({modalStopVisible: !this.state.modalStopVisible});
  }

  onValueSportChange = (value) => {
    this.setState({selectedSport: value});
  };

  onClickGetCurrentPosition() {
    this.props.onCenter();
  }

  toggleExtraButtons = () => {
    if (this.state.isOpenExtraButtons) {
      // if(this.extraButtons !=null)
      // {
      //   this.extraButtons
      //   .animate('zoomOut', 300)
      //   .then((endState) =>
      //     console.log(
      //       endState.finished
      //         ? this.setState({
      //             isOpenExtraButtons: !this.state.isOpenExtraButtons,
      //           })
      //         : 'bounce cancelled',
      //     ),
      //   );
      // }else{
      this.setState({
        isOpenExtraButtons: !this.state.isOpenExtraButtons,
      });
      // }
    } else {
      this.setState({isOpenExtraButtons: !this.state.isOpenExtraButtons});
    }
  };

  saveCurrentMapStyle() {
    let nextStyle = 'standard';

    if (Platform.OS == 'android') {
      if (this.props.currentMapStyle == 'standard') {
        nextStyle = 'terrain';
      } else if (this.props.currentMapStyle == 'terrain') {
        nextStyle = 'hybrid';
      } else if (this.props.currentMapStyle == 'hybrid') {
        nextStyle = 'standard';
      } else {
        nextStyle = 'standard';
      }
    }

    if (Platform.OS == 'ios') {
      if (this.props.currentMapStyle == 'standard') {
        nextStyle = 'hybrid';
      } else if (this.props.currentMapStyle == 'hybrid') {
        nextStyle = 'standard';
      } else {
        nextStyle = 'standard';
      }
    }

    var action = {type: 'UPDATE_MAP_STYLE', data: nextStyle};
    this.props.dispatch(action);
  }

  getFabDefaultLogo() {
    if (this.props.currentMapStyle == 'terrain') {
      return 'tree';
    }

    if (this.props.currentMapStyle == 'hybrid') {
      return 'satellite';
    }
    return 'map';
  }

  onOpenTraceModal() {
    this.props.openTraceModal();
    // this.setState({isModalTraceVisible: true});
  }

  closeTraceModal() {
    this.props.closeTraceModal();
    // this.setState({isModalTraceVisible: false});
  }

  isErrorFormCreate = () => {
    return this.state.selectedSport == -1;
  };

  render() {
    return (
      <View
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: Platform.OS == 'ios' ? 110 : 70,
          paddingTop: 50,
          zIndex: 1000,
          justifyContent: 'center',
          // borderWidth :1,
          // borderColor : 'black',
        }}>
        <View>
          {this.props.isGpsNotOk ? (
            <View
              style={{
                justifyContent: 'center',
                display: 'flex',
                flexDirection: 'row',
                zIndex: 5,
                width: '100%',
                // position: 'absolute',
                // top: 100,
                marginLeft: 'auto',
              }}>
              <View
                style={[
                  {
                    backgroundColor: '#FE3C03',
                    marginLeft: 'auto',
                    marginRight: 'auto',
                    paddingVertical: 5,
                    paddingHorizontal: 15,
                    borderRadius: 30,
                    marginBottom: 10,
                  },
                ]}>
                <View>
                  <Text style={{color: 'white'}}>
                    {this.props.isGpsNotOk}
                    En attente de l’acquisition du signal GPS
                  </Text>

                  {/* <TouchableOpacity
                    onPress={() => this.openBatteryModal()}
                    style={{zIndex: 200}}>
                    <Text
                      style={{
                        color: 'white',
                        textAlign: 'center',
                        marginTop: 10,
                        textDecorationLine: 'underline',
                      }}>
                      En savoir plus
                    </Text>
                  </TouchableOpacity> */}
                </View>
              </View>
            </View>
          ) : null}

          {!this.props.isGpsNotOk && !this.props.isRecording ? (
            <TouchableOpacity
              style={{
                justifyContent: 'center',
                display: 'flex',
                flexDirection: 'row',
                marginBottom: 10,
              }}>
              <Animated.View
                animation="bounceOutRight"
                delay={2000}
                style={[
                  {
                    backgroundColor: '#44E660',
                    paddingVertical: 5,
                    paddingHorizontal: 15,
                    borderRadius: 30,
                  },
                ]}>
                <Text style={{color: 'white', textAlign: 'center'}}>
                  Signal GPS Trouvé
                </Text>
              </Animated.View>
            </TouchableOpacity>
          ) : null}
        </View>

        <View
          style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'center',
          }}>
          <View>
            {this.state.isOpenExtraButtons ? (
              <View
                ref={(ref) => {
                  this.extraButtons = ref;
                }}
                animation="zoomIn"
                key="extraButtons"
                style={{
                  marginBottom: 0,
                  position: 'absolute',

                  bottom: 80,
                }}>
                {/* {this.props.polylines != null &&
                this.props.polylines.length > 0 ? ( */}
                <TouchableOpacity
                  onPress={() => this.onOpenTraceModal()}
                  style={{
                    flexDirection: 'row',
                    width: 40,
                    height: 40,
                    borderRadius: 300,
                    backgroundColor: 'white',
                    zIndex: 1000,
                    marginBottom: 10,
                    justifyContent: 'center',

                    shadowColor: '#000',
                    shadowOffset: {
                      width: 0,
                      height: 5,
                    },
                    shadowOpacity: 0.34,
                    shadowRadius: 6.27,
                  }}>
                  <View style={{justifyContent: 'center'}}>
                    <Icon
                      type="FontAwesome5"
                      name="filter"
                      style={[styles.title, {fontSize: 16}]}
                    />
                  </View>
                </TouchableOpacity>

                {/* // ) : null} */}

                <TouchableOpacity
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 300,
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'center',
                    backgroundColor: 'white',
                    shadowColor: '#000',
                    shadowOffset: {
                      width: 0,
                      height: 5,
                    },
                    shadowOpacity: 0.34,
                    shadowRadius: 6.27,

                    // elevation: 0,
                  }}
                  onPress={() => this.saveCurrentMapStyle()}>
                  <View style={{justifyContent: 'center'}}>
                    <Icon
                      style={[styles.title, {fontSize: 19}]}
                      name={this.getFabDefaultLogo()}
                      color="black"
                      type="FontAwesome5"
                    />
                  </View>
                </TouchableOpacity>
              </View>
            ) : null}

            <TouchableOpacity
              onPress={() => this.toggleExtraButtons()}
              style={{
                alignSelf: 'center',
                backgroundColor: 'white',
                marginTop: 20,
                padding: 10,
                borderRadius: 300,
                justifyContent: 'center',
                marginRight: 20,
                width: 40,
                height: 40,
                display: 'flex',
                flexDirection: 'row',
              }}>
              <View style={{justifyContent: 'center'}}>
                <Icon
                  name={this.state.isOpenExtraButtons ? 'times' : 'ellipsis-v'}
                  style={[styles.title, {fontSize: 20}]}
                  type="FontAwesome5"
                />
              </View>
            </TouchableOpacity>
          </View>
          {this.props.isRecording ? (
            <TouchableOpacity
              onPress={() => this.onStop()}
              style={{
                alignSelf: 'center',
                backgroundColor: '#E6444B',
                // width: '100%',
                // height: '100%',
                // width:100,
                width: 80,
                height: 80,
                borderRadius: 300,
                justifyContent: 'center',
              }}>
              <Text
                style={[
                  styles.buttonText,
                  {color: 'white', textAlign: 'center'},
                ]}>
                Stop
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={() => this.onCreateLive()}
              style={{
                alignSelf: 'center',
                backgroundColor: this.props.isGpsNotOk ? '#B9B9B9' : '#44E660',
                // width: '100%',
                // height: '100%',
                // width:100,
                width: 80,
                height: 80,
                borderRadius: 300,
                justifyContent: 'center',
              }}
              disabled={this.props.isGpsNotOk}>
              {this.state.spinner ? (
                <Spinner color="white" style={{alignSelf :'center'}} />
              ) : (
                <Text
                  style={[
                    styles.buttonText,
                    {color: 'white', textAlign: 'center'},
                  ]}>Start</Text>
              )}
            </TouchableOpacity>
          )}

          <TouchableOpacity
            onPress={() => this.onClickGetCurrentPosition()}
            style={{
              alignSelf: 'center',
              backgroundColor: 'white',
              // width: '100%',
              // height: '100%',
              // width:100,
              width: 40,
              height: 40,
              borderRadius: 300,
              justifyContent: 'center',
              display: 'flex',
              flexDirection: 'row',
              marginLeft: 20,
            }}>
            {Platform.OS == 'ios' ? (
              <View style={{justifyContent: 'center'}}>
                <Icon
                  name="location-arrow"
                  style={[styles.title, {fontSize: 20}]}
                  type="FontAwesome5"
                />
              </View>
            ) : (
              <View style={{justifyContent: 'center'}}>
                <Icon
                  name="locate-outline"
                  style={[styles.title, {fontSize: 22}]}
                  type="Ionicons"
                />
              </View>
            )}
          </TouchableOpacity>
        </View>
        {/******** modal3 : finish LIVE *****************/}
        <Modal
          animationType={'none'}
          transparent={false}
          visible={this.state.modalStopVisible}
          onRequestClose={() => {
            this.toggleStopModal();
          }}>
          <Root>
            <View>
              <Header style={styles.headerModal}>
                <Left>
                  <TouchableOpacity
                    style={styles.drawerButton}
                    onPress={() => {
                      this.toggleStopModal();
                    }}>
                    <Icon name="chevron-left" type="FontAwesome5" />
                  </TouchableOpacity>
                </Left>
                <Body style={{justifyContent: 'center', flex: 1}}>
                  <Text style={{fontWeight: 'bold'}}>
                    Enregistrez votre activité
                  </Text>
                </Body>
                <Right style={{flex: 0}} />
              </Header>

              <ScrollView scrollEnabled={true}>
                <View>
                  <TextInput
                    style={[styles.inputCode, {fontWeight: 'bold'}]}
                    clearButtonMode="always"
                    placeholder="Titre"
                    value={this.state.libelleLive}
                    onChangeText={(value) => this.onChangeLiveName(value)}
                  />

                  <ErrorMessage
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
                      onValueChange={(value) => this.onValueSportChange(value)}
                      placeholder={'Choisissez votre sport'}
                      placeholderStyle={{
                        color: ApiUtils.getColor(),
                      }}
                      placeholderIconColor={ApiUtils.getColor()}
                      textStyle={{color: ApiUtils.getColor()}}
                      itemStyle={{
                        color: ApiUtils.getColor(),
                        marginLeft: 0,
                        paddingLeft: 10,
                        borderBottomColor: ApiUtils.getColor(),
                        borderBottomWidth: 1,
                      }}
                      itemTextStyle={{
                        color: ApiUtils.getColor(),
                        borderBottomColor: ApiUtils.getColor(),
                        borderBottomWidth: 1,
                      }}>
                      <Picker.Item label="Choisissez votre sport" value="-1" />
                      {this.state.listSport.map((sport, index) => {
                        return (
                          <Picker.Item
                            label={sport.sportName}
                            value={sport.idSport}
                            key={index}
                          />
                        );
                      })}
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
                        borderBottomColor: '#000000',
                        borderBottomWidth: 1,
                        // height: 120,
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

                  {this.state.spinner ? (
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
                          : ApiUtils.getColor(),
                        borderWidth: 1,
                        backgroundColor: this.isErrorFormStop()
                          ? 'transparent'
                          : ApiUtils.getColor(),
                      }}
                      onPress={() => this.onClickValidateStop()}
                      disabled={this.isErrorFormStop()}>
                      <Text
                        style={{
                          color: this.isErrorFormStop() ? 'black' : 'white',
                        }}>
                        ENREGISTRER
                      </Text>
                    </Button>
                  )}

                  <View style={{marginTop: -5}}>
                    <Text
                      style={styles.ignoreActivityLink}
                      onPress={() => this.ignoreActivity()}>
                      Ignorer l'activité
                    </Text>
                  </View>

                  <View style={{marginBottom: 300}} />
                </View>
              </ScrollView>
            </View>
          </Root>
          <Footer style={{backgroundColor: 'white', paddingBottom: 64}}>
            <Sponsors />
          </Footer>
        </Modal>

            {/******** modal : choose sport for new LIVE *****************/}
            <Modal
              animationType={'none'}
              transparent={false}
              visible={this.state.modalChooseSportVisible}
              onRequestClose={() => {
                this.toggleModalChooseSport();
              }}>
              {/* {this.state.modal3Visible ? ( */}
              <Root>
                <View>
                  <Header style={styles.headerModal}>
                    <Left>
                      <Button
                        style={styles.drawerButton}
                        onPress={() => {
                          this.toggleModalChooseSport();
                        }}>
                        <Icon
                          style={styles.saveText}
                          name="chevron-left"
                          type="FontAwesome5"
                        />
                      </Button>
                    </Left>
                    <Body style={{justifyContent: 'center', flex: 1}}>
                      <Text style={{fontWeight: 'bold'}}>
                        Démarrer une activité
                      </Text>
                    </Body>
                    <Right style={{flex: 1}} />
                  </Header>

                  <ScrollView scrollEnabled={true}>
                    <View>
                      <View>
                        <Picker
                          mode="dropdown"
                          accessibilityLabel={'Choisissez votre sport'}
                          iosHeader={'Choisissez votre sport'}
                          iosIcon={
                            <Icon name="chevron-down" type="FontAwesome5" />
                          }
                          style={{marginTop: 0}}
                          selectedValue={this.state.selectedSport}
                          onValueChange={this.onValueSportChange.bind(this)}
                          placeholder={'Choisissez votre sport'}
                          placeholderStyle={{
                            color: ApiUtils.getColor(),
                          }}
                          placeholderIconColor={ApiUtils.getColor()}
                          textStyle={{color: ApiUtils.getColor()}}
                          itemStyle={{
                            color: ApiUtils.getColor(),
                            marginLeft: 0,
                            paddingLeft: 10,
                            borderBottomColor: ApiUtils.getColor(),
                            borderBottomWidth: 1,
                          }}
                          itemTextStyle={{
                            color: ApiUtils.getColor(),
                            borderBottomColor: ApiUtils.getColor(),
                            borderBottomWidth: 1,
                          }}>
                          <Picker.Item
                            label="Choisissez votre sport"
                            value="-1"
                          />
                          {this.state.listSport.map((sport, index) => {
                            return (
                              <Picker.Item
                                label={sport.sportName}
                                value={sport.idSport}
                                key={index}
                              />
                            );
                          })}
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
                      </View>

                      <Button
                        style={{
                          marginTop: 10,
                          paddingHorizontal: 50,
                          elevation: 0,
                          alignSelf: 'center',
                          borderColor: this.isErrorFormCreate()
                            ? 'black'
                            : ApiUtils.getColor(),
                          borderWidth: 1,
                          backgroundColor: this.isErrorFormCreate()
                            ? 'transparent'
                            : ApiUtils.getColor(),
                        }}
                        onPress={() => this.onClickCreateLiveOk()}
                        disabled={this.isErrorFormCreate()}>
                        <Text
                          style={{
                            color: this.isErrorFormCreate() ? 'black' : 'white',
                          }}>
                          C'est parti
                        </Text>
                      </Button>

                      <View style={{marginTop: -5}}>
                        <Text
                          style={styles.ignoreActivityLink}
                          onPress={() => this.toggleModalChooseSport()}>
                          Annuler
                        </Text>
                      </View>

                      <View style={{marginBottom: 300}} />
                    </View>
                  </ScrollView>
                  <View
                    style={{
                      marginBottom: 0,
                      position: 'absolute',
                      bottom: Platform.OS == 'ios' ? 80 : 50,
                      zIndex: 12,
                      width: '100%',
                      backgroundColor: 'white',
                    }}
                  />
                </View>
              </Root>
              <Sponsors />
              {/* ) : null} */}
            </Modal>
          
      </View>
    );
  }
}

const styles = StyleSheet.create({
  ignoreActivityLink: {
    marginTop: 10,
    marginBottom: 20,
    alignSelf: 'center',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  headerModal: {
    backgroundColor: 'white',
    paddingLeft: 10,
    paddingTop: 0,
    paddingBottom: 5,
    // height: 50
  },
  drawerButton: {
    backgroundColor: 'transparent',
    width: '100%',
    marginTop: 0,
    paddingTop: 10,
    shadowOffset: {height: 0, width: 0},
    shadowOpacity: 0,
    elevation: 0,
    marginLeft: 0,
    paddingLeft: 0,
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
  picker: {
    marginTop: 0,
    padding: 10,
  },
  buttonText: {
    fontWeight: 'bold',
    fontSize: 18,
    paddingBottom: 5,
  },
});

export default connect(mapStateToProps)(MapButtons);
