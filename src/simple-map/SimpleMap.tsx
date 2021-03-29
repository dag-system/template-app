import React, {PureComponent} from 'react';
import {
  Linking,
  StyleSheet,
  View,
  TouchableHighlight,
  PermissionsAndroid,
  FlatList,
  TextInput,
  Share,
  Modal,
  ScrollView,
  BackHandler,
  Alert,
  Image,
  Platform,
  ImageBackground,
  TouchableOpacity,
} from 'react-native';
import {isPointInPolygon} from 'geolib';
import ApiUtils from '../ApiUtils';
import ErrorMessage from '../home/ErrorMessage';
import {ReactNativeModal as ModalSmall} from 'react-native-modal';
import {buildGPX, GarminBuilder} from 'gpx-builder';
const {Point} = GarminBuilder.MODELS;
import {check, request, PERMISSIONS, RESULTS} from 'react-native-permissions';
// Import native-base UI components
import {
  Container,
  Button,
  Icon,
  Text,
  Body,
  Switch,
  Header,
  Toast,
  Root,
  Spinner,
  Picker,
  Left,
  Right,
} from 'native-base';
import Geolocation from '@react-native-community/geolocation';
import MarkerInteret from '../assets/marker.png';
import {Icon as IconElement} from 'react-native-elements';
import {connect} from 'react-redux';
import BackgroundGeolocation from 'react-native-background-geolocation';

// react-native-maps
import MapView, {Polyline, Marker} from 'react-native-maps';
import GlobalStyles from '../styles';
import {Sponsors} from '../home/Sponsors';
import {Dimensions} from 'react-native';
import BatteryModal from '../home/BatteryModal';
import DefaultProps from '../models/DefaultProps';

const LATITUDE_DELTA = 0.00922;
const LONGITUDE_DELTA = 0.00421;
// const LATITUDE_DELTA = 0.16022;
// const LONGITUDE_DELTA = 0.01221;
const haversine = require('haversine');

const mapStateToProps = (state) => {
  return {
    userData: state.userData,
    isRecording: state.isRecording,
    lives: state.lives,
    sports: state.sports,
    currentLive: state.currentLive,
    currentPosition: state.currentPosition,
    coordinates: state.coordinates,
    markers: state.markers,
    dates: state.dates,
    isMoving: state.isMoving,
    // showsUserLocation: false,
    // isMoving: false,
    // recording: false,
    // isStarted: false,
    odometer: state.odometer,
    pointsInterets: state.pointsInterets,
    polylines: state.polylines,
    odometerInitialValue: state.odometerInitialValue,
    descriptionStation: state.descriptionStation,
    nomStation: state.nomStation,
    currentMapStyle: state.currentMapStyle,
    isOkPopupGps: state.isOkPopupGps,
  };
};

interface Props extends DefaultProps {
  userData: any;
  isRecording: boolean;
  lives: any[];
  sports: any[];
  currentLive: any;
  currentPosition: any;
  coordinates: any[];
  markers: any[];
  dates: any[];
  isMoving: boolean;

  // showsUserLocation: false,
  // isMoving: false,
  // recording: false,
  // isStarted: false,
  odometer: number;
  pointsInterets: any[];
  polylines: any[];
  odometerInitialValue: number;
  descriptionStation: string;
  nomStation: string;
  currentMapStyle: string;
  isOkPopupGps: boolean;
}

interface State {
  modalVisible: boolean;
  modal2Visible: boolean;
  modal3Visible: boolean;
  ismodalBatteryOpen: boolean;
  acceptChallengeUtilisateur: boolean;
  acceptChallengeNameUtilisateur: boolean;
  libelleLiveIsModified: boolean;
  live: {
    invites: any[];
    libelleLive: string;
  };
  selectedSport: -1;
  comments: string;
  sports: [];
  fabActive: boolean;
  invites: [];
  rowID: 0;
  nomPersonne: string;
  prenomPersonne: string;
  telPersonne: string;
  mailPersonne: string;
  // MapView
  isModalTraceVisible: boolean;
  isModalInterestVisible: boolean;
  spinner: boolean;
  currentInteret: {
    idInteret: string;
    idStation: string;
    libelleInteret: string;
    descriptionInteret: string;
    telephoneInteret: string;
    lienInteret: string;
    photoInteret: string;
  };
  isSyncOk: boolean;
  currentPolyline: any;
  isGpsNotOk: boolean;
  time: number;
  libelleLive: string;
  coordinates: any[];
}

class SimpleMap extends PureComponent<Props, State> {
  interval: number;
  _unsubscribe: any;
  intervalPoints: number;
  constructor(props: any) {
    super(props);

    this.onAcceptGps = this.onAcceptGps.bind(this);
    this.onStop = this.onStop.bind(this);

    this.state = {
      modalVisible: false,
      modal2Visible: false,
      modal3Visible: false,
      ismodalBatteryOpen: false,
      acceptChallengeUtilisateur: false,
      acceptChallengeNameUtilisateur: false,
      libelleLiveIsModified: false,
      live: {
        invites: [],
        libelleLive: '',
      },
      libelleLive: '',
      selectedSport: -1,
      comments: '',
      coordinates: [],
      sports: [],
      invites: [],
      rowID: 0,
      nomPersonne: '',
      prenomPersonne: '',
      telPersonne: '',
      mailPersonne: '',
      fabActive: false,
      isModalTraceVisible: false,
      isModalInterestVisible: false,
      spinner: false,
      currentInteret: {
        descriptionInteret: '',
        idInteret: '',
        idStation: '',
        libelleInteret: '',
        telephoneInteret: '',
        lienInteret: '',
        photoInteret: '',
      },
      isSyncOk: false,
      currentPolyline: null,
      isGpsNotOk: true,
      time: 0,
    };

    this._unsubscribe = this.props.navigation.addListener('focus', () => {
      this.componentDidMount();
    });
  }

  addPersonne(personne) {
    var newInvites = this.props.currentLive.invites;
    newInvites.push(personne);

    var action = {type: 'UPDATE_INVITES', data: newInvites};
    this.props.dispatch(action);
  }

  getCoordinates = () => {
    this.setState({coordinates: this.props.coordinates});
    clearTimeout(this.intervalPoints);
    this.intervalPoints = setTimeout(() => this.getCoordinates(), 15000);
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

  onClickCreateInvite() {
    let formData = new FormData();
    formData.append('method', 'createUtilisateur');
    formData.append('auth', ApiUtils.getAPIAuth());
    formData.append('idLive', this.props.currentLive.idLive);
    formData.append('nomUtilisateur', this.state.nomPersonne);
    formData.append('prenomUtilisateur', this.state.prenomPersonne);
    formData.append('telUtilisateur', this.state.telPersonne);
    formData.append('emailUtilisateur', this.state.mailPersonne);

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
        if (
          responseJson.codeErreur == 'SUCCESS' ||
          responseJson.codeErreur == 'USER_EXISTS'
        ) {
          var personne = {
            idUtilisateur: responseJson.idUtilisateur,
            nomUtilisateur: responseJson.nomUtilisateur,
            prenomUtilisateur: responseJson.prenomUtilisateur,
            telUtilisateur: responseJson.telUtilisateur,
            folocodeUtilisateur: responseJson.folocodeUtilisateur,
          };

          this.addPersonne(personne);

          this.setState({nomPersonne: ''});
          this.setState({prenomPersonne: ''});
          this.setState({telPersonne: ''});
          this.setState({mailPersonne: ''});

          this.toggleModal2(!this.state.modal2Visible);
          this.toggleModal(!this.state.modalVisible);

          // this.saveUserInfo(responseJson);
          //this.onClickNavigate('SimpleMap');
        } else {
          alert('Une erreur est survenue : ' + responseJson.message);
        }
      })
      .catch((e) => {
        alert(e);
        ApiUtils.logError('simpleMap onClickCreateInvite', e.message);
      })
      .then
      // (e) => alert("erreur : " + e.message),
      //  this.onClickNavigate('SimpleMap'));
      //alert("error gettingData"+ e.message)
      ();
  }

  componentDidMount() {
    setTimeout(() => this.componentDidMountOk(), 300);
  }

  componentDidMountOk() {
    if (this.props.currentLive == null) {
      this.onDisconnect(false);
      this.props.navigation.navigate('Lives');
    }
    if (this.state.selectedSport == -1) {
      this.setState({selectedSport: this.props.currentLive.idSport});
    }

    // this._unsubscribe2 = this.props.navigation.addListener('blur', () => {
    //   this.componentWillUnmount();
    // });

    if (this.props.isRecording) {
      // BackgroundGeolocation.getLocations().then((result) => {
      //   console.log("resu : " + JSON.stringify(result));
      // })
    } else {
      // if (this.props.isOkPopupGps) {
      this.getFirstLocation();
      // }
    }

    this.setState({
      acceptChallengeNameUtilisateur:
        this.props.userData.acceptChallengeNameUtilisateur == 1,
    });

    this.setState({
      acceptChallengeUtilisateur:
        this.props.userData.acceptChallengeUtilisateur == 1,
    });

    this.requestMotionPermission();

    // this.setState({ acceptChallengeUtilisateur: this.props.userData.acceptChallengeUtilisateur });
    // clearInterval(this.interval);
    // this.interval = setInterval(() => this.setState({time: Date.now()}), 15000);

    clearTimeout(this.intervalPoints);
    this.intervalPoints = setTimeout(() => this.getCoordinates(), 15000);
    // this.setState({ acceptChallengeUtilisateur: this.props.userData.acceptChallengeUtilisateur });

    // this._unsubscribe = this.props.navigation.addListener('focus', () => {
    //   this.componentDidMount();
    // });
    this.calcDistanceFromAllCoordinates(this.props.coordinates);

    // Geolocation.requestAuthorization();
    Geolocation.setRNConfiguration({
      authorizationLevel: 'always',
      skipPermissionRequests: false,
    });

    BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);

    var idLive = this.props.currentLive?.idLive;

    let config = {
      debug: false,
      distanceFilter: 10,
      url: ApiUtils.getAPIUrl(),
      httpRootProperty: '.',
      httpTimeout: 300000,
      params: {
        method: 'createPositions2',
        idLive: idLive,
        auth: ApiUtils.getAPIAuth(),
        idUtilisateur: this.props.userData.idUtilisateur,
      },
      extras: {
        method: 'createPositions2',
        idLive: idLive,
        auth: ApiUtils.getAPIAuth(),
        idUtilisateur: this.props.userData.idUtilisateur,
      },
      notification: {
        sticky: true,
        title: 'DigiRAID Grenoble INP',
        text: 'Suivi de votre position en cours',
        channelImportance: BackgroundGeolocation.NOTIFICATION_PRIORITY_LOW,
      },
      enableHeadless: true,
      locationAuthorizationRequest: 'Always',
      backgroundPermissionRationale: {
        title:
          'Autoriser {applicationName} a accèder à votre position en arrière plan',
        message:
          "Pour enregistrer votre activiité même quand l'application est en arrière plan, merci d'autoriser {backgroundPermissionOptionLabel}",
        positiveAction: 'Autoriser {backgroundPermissionOptionLabel}',
        negativeAction: 'Annuler',
      },
      autoSync: true,
      autoSyncThreshold: 5,
      batchSync: true,
      preventSuspend: true,
      maxRecordsToPersist: -1,
      stopOnTerminate: false, //TODO TO DO
      startOnBoot: true,
      reset: true,
      foregroundService: true,
      disableElasticity: true,
      logLevel: BackgroundGeolocation.LOG_LEVEL_VERBOSE,
      disableStopDetection: true,
      disableMotionActivityUpdates: true,
      stationaryRadius: 5,
      maxDaysToPersist: 4,
      heartbeatInterval: 20,
      stopTimeout: Platform.OS == 'ios' ? 60 : 5,
      desiredAccuracy:
        Platform.OS == 'ios'
          ? BackgroundGeolocation.DESIRED_ACCURACY_NAVIGATION
          : BackgroundGeolocation.DESIRED_ACCURACY_HIGH,
      desiredOdometerAccuracy: 10,
    };

    BackgroundGeolocation.reset(
      config,
      () => {},
      () => {},
    );

    BackgroundGeolocation.ready(config, () => {
      this.setState({
        libelleLive: ApiUtils.getLibelleLive(),
      });
      BackgroundGeolocation.start();

      BackgroundGeolocation.setConfig(config).then(() => {});
    });

    // Step 1:  Listen to events:
    BackgroundGeolocation.on(
      'location',
      (loc) => this.onLocation(loc),
      this.onLocationError.bind(this),
    );

    BackgroundGeolocation.onAuthorization((authorizationEvent) => {
      if (authorizationEvent.success) {
        // Sentry.captureMessage("[authorization] SUCCESS: ");
      } else {
        // Sentry.captureMessage("[authorization] FAILURE: " + JSON.stringify(authorizationEvent.error));
      }
    });

    BackgroundGeolocation.onProviderChange(async (event) => {
      if (
        event.accuracyAuthorization ==
        BackgroundGeolocation.ACCURACY_AUTHORIZATION_REDUCED
      ) {
        // Supply "Purpose" key from Info.plist as 1st argument.
        try {
          let accuracyAuthorization = await BackgroundGeolocation.requestTemporaryFullAccuracy(
            'Delivery',
          );
          if (
            accuracyAuthorization ==
            BackgroundGeolocation.ACCURACY_AUTHORIZATION_FULL
          ) {
            this.getFirstLocation();
          } else {
            // Sentry.captureMessage("[requestTemporaryFullAccuracy] DENIED: ");
          }
        } catch (error) {
          // Sentry.captureMessage("[requestTemporaryFullAccuracy] FAILED TO SHOW DIALOG: ");
          console.warn(
            '[requestTemporaryFullAccuracy] FAILED TO SHOW DIALOG: ',
            error,
          );
        }
      }
    });

    BackgroundGeolocation.onHeartbeat(() => {
      // You could request a new location if you wish.
      BackgroundGeolocation.getCurrentPosition({
        samples: 3,
        persist: true,
      }).then((location) => {
        // Sentry.captureMessage("heartbeat event "+ JSON.stringify(location));
      });
    });

    this.setState({coordinates: this.props.coordinates});
  }

  handleBackButton() {
    return true;
  }

  async needTopUpdatePosition(newCoordinate) {
    if (this.refs.map != null) {
      this.refs.map
        .getMapBoundaries()
        .then((data) => {
          var isInside = isPointInPolygon(newCoordinate.coords, [
            {
              latitude: data.northEast.latitude,
              longitude: data.southWest.longitude,
            },
            data.northEast,
            {
              latitude: data.southWest.latitude,
              longitude: data.northEast.longitude,
            },
            data.southWest,
          ]);

          if (!isInside) {
            this.setCenter(newCoordinate);
          }
        })
        .catch(() => {});
    }
  }

  componentWillUnmount() {
    this._unsubscribe();
    console.log('unmounted');
    //  clearInterval(this.interval);
    clearTimeout(this.intervalPoints);
    BackHandler.removeEventListener('hardwareBackPress', this.handleBackButton);

    BackgroundGeolocation.removeListeners();
  }

  async saveRecordingState(isrecording) {
    var action = {type: 'SAVE_IS_RECORDING', data: isrecording};
    this.props.dispatch(action);
  }

  requestMotionPermission() {
    check(PERMISSIONS.IOS.MOTION)
      .then((result) => {
        switch (result) {
          case RESULTS.UNAVAILABLE:
            break;
          case RESULTS.DENIED:
            this.askMotionPermission();
            break;
          case RESULTS.LIMITED:
            break;
          case RESULTS.GRANTED:
            break;
          case RESULTS.BLOCKED:
            break;
          default:
        }
      })
      .catch(() => {});
  }

  askMotionPermission() {
    request(PERMISSIONS.IOS.MOTION).then((result) => {
      if (result == RESULTS.DENIED) {
        Alert.alert(
          'Permission refusée',
          'Vous devez accepter cette permission pour avoir un bon enregistrement de votre parcours',
        );
        // Sentry.captureMessage("Motion Permission refusée");
      }
    });
  }

  getFirstLocation() {
    Geolocation.setRNConfiguration({
      authorizationLevel: 'always',
      skipPermissionRequests: false,
    });
    // Geolocation.requestAuthorization();

    Geolocation.getCurrentPosition(
      (position) => {
        console.log('fisrtlocation :', position);
        this.setCenter(position);
        if (position.coords.speed != -1) {
          this.setState({isGpsNotOk: false});
        } else {
          //  this.getFirstLocation();
        }

        // this.setState({currentPosition: position});
      },
      (error) => {
        ApiUtils.logError('getFirstPosition', JSON.stringify(error));
        // See error code charts below.
      },
      {enableHighAccuracy: true, timeout: 1200, maximumAge: 1000},
    );

    // Geolocation.watchPosition(
    //   position => {
    //     console.log("watch position", position);
    //     this.setCenter(position);
    //     if (position.coords.accuracy != 0 && position.coords.accuracy <400) {
    //       this.setState({isGpsNotOk: false});

    //     }

    //     this.setState({currentPosition: position});
    //   },
    //   error => {
    //     console.log("error");
    //     ApiUtils.logError('getFirstPosition', JSON.stringify(error));
    //     // See error code charts below.
    //   },
    //   {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000},
    // );
  }

  /**
   * @event location
   */

  onLocation(location) {
    if (this.props.isMoving) {
      this.addMarker(location);

      if (location.coords.speed == -1 && !this.state.isGpsNotOk) {
        this.setState({isGpsNotOk: true});
      }
    }

    if (location.coords.speed != -1 && this.state.isGpsNotOk) {
      this.setState({isGpsNotOk: false});
    }
    // this.setState({currentPosition: location});
  }

  async calcDistance(oldLatLong, newLatLng) {
    var dist = haversine(oldLatLong, newLatLng);

    var odometerDataNew = {
      odometer: this.props.odometer + dist,
    };

    var action = {type: 'UPDATE_ODOMETER', data: odometerDataNew};
    this.props.dispatch(action);
  }

  async calcDistanceFromAllCoordinates(coordinates) {
    var dist = 0;
    let count = 0;
    coordinates.forEach((coord) => {
      if (count > 0) {
        dist += haversine(coord, coordinates[count - 1]);
      }
      count++;
    });

    var odometerData = {
      odometer: dist,
    };
    var action = {type: 'SET_ODOMETER', data: odometerData};
    this.props.dispatch(action);
  }

  onLocationError(error) {
    // Sentry.captureMessage('location Error', JSON.stringify(error));
    ApiUtils.logError(
      'Location Error' +
        'ErrorCode : ' +
        error +
        ' idLive : ' +
        this.props.currentLive.idLive +
        ' ' +
        Platform.OS,
      '',
    );
    if (error == 0) {
      // alert('Nous ne trouvons pas votre position');
    }
  }

  openBatteryModal = () => {
    this.setState({ismodalBatteryOpen: true});
  };

  closeModalBattery = () => {
    this.setState({ismodalBatteryOpen: false});
  };

  onToggleEnabled(isMoving, isRecording) {
    if (isMoving) {
      // clearInterval(this.interval);
      // this.interval = setInterval(() => this.setState({time: Date.now()}), 15000);
      BackgroundGeolocation.start(
        () => {
          // NOTE:  We tell react-native-maps to show location only AFTER BackgroundGeolocation
          // has requested location authorization.  If react-native-maps requests authorization first,
          // it will request WhenInUse -- "Permissions Tug-of-war"

          this.setState({
            showsUserLocation: true,
          });
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

  onClickGetCurrentPosition() {
    if (this.props.currentPosition) {
      this.setCenter(this.props.currentPosition);
    } else {
      //si on a pas autorisé le partage faudrait non ? comme ça on peut geolocalisé le gars
      // if(!this.state.isMoving)
      // {
      // }
    }
    if (this.props.isRecording) {
      // if (this.state.currentPosition) {
      //   this.setCenter(this.state.currentPosition);
      // }
    } else {
      // BackgroundGeolocation.getCurrentPosition((location) => {
      //   console.log('- getCurrentPosition success: ', location);
      //   this.setCenter(location);
      // }, (error) => {
      //   if(this.state.currentPosition)
      //   {
      //     this.setCenter(this.state.currentPosition);
      //   }
      //  // console.warn('- getCurrentPosition error: ', error);
      // }, {
      //   persist: true,
      //   samples: 1
      // });
    }
  }

  async addMarker(location) {
    let marker = {
      key: location.uuid,
      // title: location.timestamp,
      // heading: location.coords.heading,
      coordinate: {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      },
    };

    var coordinate = {
      uuid: location.uuid,
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      timestamp: location.timestamp,
    };

    await this.needTopUpdatePosition(location);

    if (this.props.coordinates.length > 0) {
      var lastPos = this.props.coordinates[this.props.coordinates.length - 1];
      var newPost = coordinate;
      this.calcDistance(lastPos, newPost);
    }

    var actionMarker = {type: 'ADD_MARKER', data: marker};
    this.props.dispatch(actionMarker);

    var action = {type: 'ADD_COORDINATE', data: coordinate};
    this.props.dispatch(action);
  }

  setCenter(coords) {
    if (!this.refs.map) {
      return;
    }

    this.refs.map.animateToRegion({
      latitude: coords.latitude,
      longitude: coords.longitude,
      latitudeDelta: LATITUDE_DELTA,
      longitudeDelta: LONGITUDE_DELTA,
    });
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

  onDisconnect(isSummary) {
    // return BackgroundGeolocation.destroyLocations()
    // .then(
    // BackgroundGeolocation.resetOdometer().then(

    BackgroundGeolocation.stop();
    BackgroundGeolocation.removeAllListeners();
    // This is the location where odometer was set at.
    // console.log("[setOdometer] success: ", location);
    var action = {type: 'CLEAR_MAP', data: null};
    this.props.dispatch(action);
    this.onToggleEnabled(false, false);

    if (isSummary) {
      this.props.navigation.navigate('LiveSummary');
    } else {
      this.props.navigation.navigate('Lives');
    }
  }

  onClickSeeResult() {
    let url = this.props.userData.urlResultats;
    Linking.canOpenURL(url).then((supported) => {
      if (supported) {
        Linking.openURL(url);
      } else {
        //console.log("Don't know how to open URI: " + url);
      }
    });
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

  getCurrentTime() {
    if (this.props.dates.length == 0 || this.props.dates == null) {
      return '00:00:00';
    } else {
      if (this.props.dates.length % 2 == 0) {
        //on est en pause
        var currentTime = 0;
        for (var i = 0; i < this.props.dates.length - 1; i++) {
          currentTime += this.props.dates[i + 1] - this.props.dates[i];
          i++;
        }

        var hours = Math.floor(
          (currentTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
        );
        var minutes = Math.floor(
          (currentTime % (1000 * 60 * 60)) / (1000 * 60),
        );
        var seconds = Math.floor((currentTime % (1000 * 60)) / 1000);
        return this.formattedTime(hours, minutes, seconds);
      } else {
        var currentTime = 0;
        for (var i = 0; i < this.props.dates.length - 1; i++) {
          currentTime += this.props.dates[i + 1] - this.props.dates[i];
          i++;
        }

        var now = new Date().getTime();

        currentTime =
          currentTime + now - this.props.dates[this.props.dates.length - 1];

        var hours = Math.floor(
          (currentTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
        );
        var minutes = Math.floor(
          (currentTime % (1000 * 60 * 60)) / (1000 * 60),
        );
        var seconds = Math.floor((currentTime % (1000 * 60)) / 1000);
        return this.formattedTime(hours, minutes, seconds);
      }
    }
  }

  getCurrentTimeInSec() {
    if (this.props.dates.length == 0 || this.props.dates == null) {
      return 0;
    } else {
      if (this.props.dates.length % 2 == 0) {
        //on est en pause
        var currentTime = 0;
        for (var i = 0; i < this.props.dates.length - 1; i++) {
          currentTime += this.props.dates[i + 1] - this.props.dates[i];
          i++;
        }
        var hours = Math.floor(
          (currentTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
        );
        var minutes = Math.floor(
          (currentTime % (1000 * 60 * 60)) / (1000 * 60),
        );
        var seconds = Math.floor((currentTime % (1000 * 60)) / 1000);
        return hours * 3600 + minutes * 60 + seconds;
        return currentTime;
      } else {
        var currentTime = 0;
        for (var i = 0; i < this.props.dates.length - 1; i++) {
          currentTime += this.props.dates[i + 1] - this.props.dates[i];
          i++;
        }

        var now = new Date().getTime();

        currentTime =
          currentTime + now - this.props.dates[this.props.dates.length - 1];

        var hours = Math.floor(
          (currentTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
        );
        var minutes = Math.floor(
          (currentTime % (1000 * 60 * 60)) / (1000 * 60),
        );
        var seconds = Math.floor((currentTime % (1000 * 60)) / 1000);
        return hours * 3600 + minutes * 60 + seconds;
      }
    }
  }

  formattedTime(hours, minutes, seconds) {
    var hoursDisplay = hours;
    if (hours < 10) {
      hoursDisplay = '0' + hours;
    }

    var minutesDisplay = minutes;
    if (minutes < 10) {
      minutesDisplay = '0' + minutes;
    }

    var secondsDisplay = seconds;
    if (seconds < 10) {
      secondsDisplay = '0' + seconds;
    }

    return hoursDisplay + ':' + minutesDisplay + ':' + secondsDisplay;
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
    this.sendBgLocations();
    this.syncPositions();
    //  else {
    //   this.onToggleEnabled(false, true)
    // }

    this.toggleModal3(true);

    this.createGpx();
    this.sendAllCoordinates();
  }

  onClickInviteUser() {
    this.toggleModal(true);
  }

  normalize(path) {
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      const filePrefix = 'file://';
      if (path.startsWith(filePrefix)) {
        path = path.substring(filePrefix.length);
        try {
          path = decodeURI(path);
        } catch (e) {}
      }
    }
    return path;
  }

  requestStoragePermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        'android.permission.READ_EXTERNAL_STORAGE',
        {
          title: 'Accèder à vos fichiers',
          message: '',
          buttonNeutral: 'Plus tard',
          buttonNegative: 'Annuler',
          buttonPositive: 'OK',
        },
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.warn('You can use the camera');
      } else {
      }
    } catch (err) {
      // console.warn(err);
    }
  };

  checkPermissions() {
    if (Platform.OS == 'android') {
      try {
        PermissionsAndroid.request(
          'android.permission.READ_EXTERNAL_STORAGE',
        ).then((res) => {
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

  centerMapOnTrace(polyline) {
    if (polyline.positionsTrace.length != 0) {
      this.refs.map.fitToCoordinates(polyline.positionsTrace, {
        edgePadding: {top: 10, right: 10, bottom: 10, left: 10},
        animated: true,
      });
    }
    this.closeTraceModal();
    this.selectPolyline(polyline);
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

  onClickShare() {
    Share.share(
      {
        message:
          'Suivez ma position en direct  : ' +
          ApiUtils.getShareUrl() +
          this.props.currentLive.codeLive,
        title: 'Suivez ma position en direct !',
      },
      {
        // Android only:
        dialogTitle: 'Suivez ma position en direct ! ',
      },
    );
  }

  toggleModal(visible) {
    return this.setState({modalVisible: visible});
  }

  toggleModal2(visible) {
    return this.setState({modal2Visible: visible});
  }

  toggleModal3(visible) {
    return this.setState({modal3Visible: visible});
  }

  isErrorForm() {
    var isError = false;
    if (this.state.nomPersonne == '') {
      isError = true;
    }

    if (this.state.prenomPersonne == '') {
      isError = true;
    }

    if (this.state.telPersonne == '' && this.state.mailPersonne == '') {
      isError = true;
    }

    return isError;
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

  async sendBgLocations() {
    BackgroundGeolocation.getLocations(
      () => {
        // Sentry.captureMessage("getLocations ok");
      },
      () => {},
    );
  }

  syncPositions() {
    try {
      BackgroundGeolocation.sync(
        (records) => {
          this.setState({isSyncOk: true});
          // Sentry.captureMessage("sync ok");
          ApiUtils.logError(
            'sync at end idUtilisateur: ' + this.props.userData.idUtilisateur,
            JSON.stringify(records),
          );
        },
        () => {},
      );
    } catch (e) {
      // this.setState({isSyncOk : false}) ;
      // Sentry.captureMessage("sync ko");
      ApiUtils.logError(
        'ERROR sync at end idUtilisateur: ' + this.props.userData.idUtilisateur,
      );
    }
  }

  onSendRequestStop() {
    // this.syncPositions();

    this.setState({spinner: true}, () => {
      let formData = new FormData();
      formData.append('method', 'updateLive');
      formData.append('auth', ApiUtils.getAPIAuth());
      formData.append('idLive', this.props.currentLive.idLive);
      formData.append('etatLive', 2);
      formData.append('commentLive', this.state.comments);
      formData.append('libelleLive', this.state.libelleLive);
      formData.append('idSport', this.state.selectedSport);
      var acceptChallengeUtilisateur = 0;
      if (this.state.acceptChallengeUtilisateur) {
        acceptChallengeUtilisateur = 1;
      }

      formData.append('acceptChallengeUtilisateur', acceptChallengeUtilisateur);

      var acceptChallengeNameUtilisateur = 0;
      if (this.state.acceptChallengeNameUtilisateur) {
        acceptChallengeNameUtilisateur = 1;
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

            this.toggleModal3(false);
            this.onDisconnect(true);

            var action = {
              type: 'UPDATE_ACCEPT_CHALLENGE',
              data: {
                acceptChallengeUtilisateur: acceptChallengeUtilisateur,
                acceptChallengeNameUtilisateur: acceptChallengeNameUtilisateur,
              },
            };
            this.props.dispatch(action);

            // .then(
            //   this.props.navigation.navigate('LiveSummary')
            // );
          } else {
            alert(responseJson.message);
          }
        })
        .catch((e) => {
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

  goBack() {
    if (this.props.isRecording) {
      Alert.alert(
        "Quitter l'activité",
        "Si vous quittez l'activité vous allez perdre les données enregistrées. Etes-vous sûr de quitter l'activité ?",
        [
          {
            text: 'Annuler',
            style: 'cancel',
          },
          {text: 'Quitter', onPress: () => this.goBackOk()},
        ],
        {cancelable: false},
      );
    } else {
      this.goBackOk();
    }
  }

  async createGpx() {
    try {
      const gpxData = new GarminBuilder();
      let points = [];

      this.props.coordinates.forEach((c) => {
        var point = new Point(c.latitude, c.longitude, {
          time: new Date(c.timestamp),
        });
        points.push(point);
      });

      gpxData.setSegmentPoints(points);
      var gpxString = buildGPX(gpxData.toObject());
      await this.sendGeneratedGPX(gpxString);
    } catch (e) {
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
        if (responseJson.codeErreur == 'SUCCESS') {
        } else {
          // alert('erreur : ' + responseJson.message);
        }
      })
      .catch((e) => {
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
    formData.append('coordinates', JSON.stringify(this.props.coordinates));
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

  goBackOk() {
    this.onDisconnect(false);

    var action = {type: 'CLEAR_MAP', data: null};
    this.props.dispatch(action);
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

  onignoreOk() {
    this.setState({spinner: true});
    let formData = new FormData();
    formData.append('method', 'deleteLive');
    formData.append('auth', ApiUtils.getAPIAuth());
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
        if (responseJson.codeErreur == 'SUCCESS') {
          var action = {
            type: 'IGNORE_LIVE',
            data: this.props.currentLive.idLive,
          };
          this.props.dispatch(action);

          this.onDisconnect(false);
          this.toggleModal3(false);
          this.props.navigation.navigate('Lives');

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

  getSports() {
    let formData = new FormData();
    formData.append('method', 'getSports');
    formData.append('auth', ApiUtils.getAPIAuth());

    //fetch followCode API
    return fetch(ApiUtils.getAPIUrl(), {
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
        var result = [];
        for (var i in responseJson) {
          result.push(responseJson[i]);
        }
        var selectableSports = [];
        result.forEach(function (element, index) {
          var newSelectableSport = {
            value: index,
            label: element,
          };
          selectableSports.push(newSelectableSport);
        });

        var action = {type: 'GET_SPORTS', data: selectableSports};

        this.props.dispatch(action);
      })
      .catch((e) => ApiUtils.logError('simpleMap getSports', e.message))
      .then();
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

  onOpenTraceModal() {
    this.setState({isModalTraceVisible: true});
  }

  closeTraceModal() {
    this.setState({isModalTraceVisible: false});
  }

  onOpenInterestModal() {
    this.setState({isModalInterestVisible: true});
  }

  closeInterestModal() {
    this.setState({isModalInterestVisible: false});
  }
  formatphoneNumber() {}

  onClickInterestPhone(phoneNumber, idInteret) {
    ApiUtils.logStats(
      idInteret + ';' + this.props.userData.idUtilisateur + ';phone',
    );
    Linking.canOpenURL(`tel:${phoneNumber}`).then((supported) => {
      if (supported) {
        Linking.openURL(`tel:${phoneNumber}`);
      } else {
        alert("Le numéro de télehpne n'est pas valide :" + phoneNumber);
        ApiUtils.logError(
          'Interest phone open',
          'Dont know how to open URI: ' + phoneNumber,
        );
      }
    });
  }

  onClickUrlInterest(url, idInteret) {
    ApiUtils.logStats(
      idInteret + ';' + this.props.userData.idUtilisateur + ';web',
    );
    Linking.canOpenURL(url).then((supported) => {
      if (supported) {
        Linking.openURL(url);
      } else {
        ApiUtils.logError(
          'Interest url click',
          'Dont know how to open URI: ' + url,
        );
      }
    });
  }

  onClickInterestPoint(marker) {
    this.setState({currentInteret: marker});
    this.onOpenInterestModal();
  }

  selectPolyline(polyline) {
    this.setState({currentPolyline: polyline});
  }

  closeCurrentPolyline() {
    this.setState({currentPolyline: null});
  }

  getSpeed() {
    var time = this.getCurrentTimeInSec();

    if (time == 0) {
      return '-';
    }

    // var distInm = (this.props.odometer - this.props.odometerInitialValue);

    let distKm = this.props.odometer;

    return ((distKm / time) * 3600).toFixed(2);
  }

  onValueSportChange(value) {
    this.setState({
      selectedSport: value,
    });
  }

  onAcceptGps() {
    this.getFirstLocation();
    var action = {type: 'VIEW_POPUPGPS', data: null};
    this.props.dispatch(action);
  }

  toggleTrace(traceName) {
    //update isVisiblede trace name

    //TO DO ACTION DISPATCH

    var action = {type: 'TOGGLE_TRACE', data: traceName};
    this.props.dispatch(action);

    // this.setState({ polyline: traces });
  }

  static navigationOptions = {
    drawerLabel: () => null,
  };

  onGetLogs = () => {
    BackgroundGeolocation.logger.getLog(function () {});
  };

  render() {
    return (
      <Container style={styles.container}>
        <Header style={styles.header}>
          <Body>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                width: '100%',
                paddingRight: 0,
              }}>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'flex-start',
                  paddingRight: 0,
                }}>
                <TouchableOpacity
                  style={styles.goBackButton}
                  onPress={() => this.goBack()}>
                  <Icon
                    style={styles.saveText}
                    name="chevron-left"
                    type="FontAwesome5"
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  style={{
                    backgroundColor: 'transparent',
                    elevation: 0,
                    justifyContent: 'center',
                  }}
                  onPress={() => this.goBack()}>
                  <View style={[GlobalStyles.row]}>
                    <Text style={{color: 'black'}}>
                      {this.props.userData.nomUtilisateur}
                    </Text>
                    <Text style={{color: 'black', marginLeft: 5}}>
                      {this.props.userData.prenomUtilisateur}
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
              <View style={{flexDirection: 'row', justifyContent: 'flex-end'}}>
                <TouchableOpacity
                  style={styles.headerButton}
                  onPress={() => this.onGetLogs()}>
                  <Icon
                    active
                    name="folder-open"
                    style={styles.headerButtonLogo}
                    type="FontAwesome5"
                  />
                </TouchableOpacity>
                {this.props.currentPosition ? (
                  <TouchableOpacity
                    style={[styles.headerButton, {marginLeft: 10}]}
                    onPress={() => this.onClickShare()}>
                    <Icon
                      active
                      name="share"
                      style={styles.headerButtonLogo}
                      type="FontAwesome5"
                    />
                  </TouchableOpacity>
                ) : null}
              </View>
            </View>
          </Body>
        </Header>

        <View style={styles.statBanner}>
          <Text style={styles.timeText}>{this.getCurrentTime()}</Text>
          <Text>|</Text>
          <Text style={styles.timeText}>{this.getSpeed()} km/h</Text>
          <Text>|</Text>
          <Text style={styles.timeText}>
            {this.props.odometer?.toFixed(2)} km
          </Text>
        </View>

        <View style={styles.liveNameBanner}>
          <Text style={styles.liveNameText}>
            {this.props.currentLive?.libelleLive}
          </Text>
        </View>

        <Button
          onPress={() => this.onClickGetCurrentPosition()}
          style={{
            // flexDirection: 'row', justifyContent: 'space-between',
            width: 53,
            height: 53,
            backgroundColor: 'white',
            zIndex: 5,
            position: 'absolute',
            top: Platform.OS == 'android' ? 153 : 205,
            right: 100,
          }}>
          {Platform.OS == 'ios' ? (
            <Icon
              name="location-arrow"
              style={[styles.title, {fontSize: 20}]}
              type="FontAwesome5"
            />
          ) : (
            <Icon
              name="locate-outline"
              style={[styles.title, {fontSize: 22}]}
              type="Ionicons"
            />
          )}
        </Button>

        {this.props.polylines != null && this.props.polylines.length > 0 ? (
          <Button
            onPress={this.onOpenTraceModal.bind(this)}
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              width: 53,
              height: 53,
              backgroundColor: 'white',
              zIndex: 5,
              position: 'absolute',
              top: Platform.OS == 'android' ? 153 : 205,
              left: 20,
            }}>
            <Icon
              active
              type="Ionicons"
              name="map-outline"
              style={[styles.title, {fontSize: 22}]}
            />
          </Button>
        ) : null}

        <TouchableOpacity
          style={{
            position: 'absolute',

            // alignSelf: 'center',
            // width: 70,
            // heigth: 100,
            padding: 10,
            width: 60,
            height: 60,
            borderRadius: 300,
            top: Platform.OS == 'android' ? 153 : 205,
            zIndex: 100,
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'center',
            backgroundColor: '#5067FF',
            right: 10,
            shadowColor: '#000',
            shadowOffset: {
              width: 0,
              height: 5,
            },
            shadowOpacity: 0.34,
            shadowRadius: 6.27,

            elevation: 10,
          }}
          onPress={() => this.saveCurrentMapStyle()}>
          <View
            style={{
              justifyContent: 'center',
              alignSelf: 'center',
              alignContent: 'center',
              // width: 40,
              // heigth: 100,
            }}>
            <Icon
              name={this.getFabDefaultLogo()}
              style={{
                color: 'white',
                alignSelf: 'center',
                marginBottom: 3,
                fontSize: 23,
              }}
              color="white"
              type="FontAwesome5"
            />
            {/* <Text style={{textAlign : 'center', color : 'white'}}>{this.props.currentMapStyle}</Text> */}
          </View>
        </TouchableOpacity>

        {this.state.isGpsNotOk ? (
          <View
            style={{
              justifyContent: 'center',
              display: 'flex',
              flexDirection: 'row',
              zIndex: 5,
              width: '100%',
              position: 'absolute',
              top: Platform.OS == 'android' ? 210 : 235,
              marginLeft: 'auto',
            }}>
            <View
              style={[
                {
                  backgroundColor: '#FE3C03',
                  width: '70%',
                  marginLeft: 'auto',
                  marginRight: 'auto',
                  paddingVertical: 20,
                  paddingHorizontal: 15,
                  borderRadius: 30,
                  zIndex: 99,
                },
              ]}>
              <View>
                <Text
                  style={[
                    styles.liveNameText,
                    {color: 'white', textTransform: 'uppercase'},
                  ]}>
                  En attente de l’acquisition du signal GPS, ne partez pas.
                </Text>
                <Text
                  style={{color: 'white', textAlign: 'center', marginTop: 10}}>
                  Si ce message ne disparait pas : verifier votre paramètres
                  d'économie d'energie, de localisation etc...
                </Text>
                <TouchableOpacity
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
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ) : null}

        {!this.state.isGpsNotOk && !this.props.isRecording ? (
          <TouchableOpacity
            style={{
              justifyContent: 'center',
              display: 'flex',
              flexDirection: 'row',
              zIndex: 99,
            }}>
            <View
              style={[
                {
                  zIndex: 12,
                  backgroundColor: '#39F800',
                  position: 'absolute',
                  top: 100,
                  width: '70%',
                  paddingVertical: 30,
                  paddingHorizontal: 15,
                  borderRadius: 30,
                },
              ]}>
              <Text
                style={[
                  styles.liveNameText,
                  {color: 'black', textTransform: 'uppercase'},
                ]}>
                Position GPS captée, c’est parti ! Démarrez votre activité
              </Text>
            </View>
          </TouchableOpacity>
        ) : null}

        <Root>
          {/* <Map   style={styles.map}></Map> */}

          <MapView
            ref="map"
            mapType={this.props.currentMapStyle}
            style={styles.map}
            showsUserLocation={true}
            followsUserLocation={false}
            scrollEnabled={true}
            showsMyLocationButton={false}
            showsPointsOfInterest={false}
            showsScale={false}
            showsTraffic={false}
            initialRegion={{
              latitude: 45.19080336677786, // 44.843884,
              longitude: 5.717292753977742,
              latitudeDelta: LATITUDE_DELTA,
              longitudeDelta: LONGITUDE_DELTA,
            }}
            toolbarEnabled={false}>
            <Polyline
              key="polyline"
              coordinates={this.state.coordinates}
              geodesic={true}
              strokeColor="rgba(0,0,0, 1)"
              strokeWidth={6}
              zIndex={0}
            />

            {/* <MapView.Circle
          key="circle"
          center={{
            latitude: 44.930582,

            longitude: 4.899076
          }}
          radius={1000}
          geodesic={true}
          strokeColor='rgba(0,0,0, 1)'
          strokeWidth={2}
          tracksViewChanges={false}
          zIndex={0}
        /> */}

            {this.props.polylines != null
              ? this.props.polylines
                  .filter((pol) => pol.isActive == true)
                  .map((polyline, index) => (
                    <Polyline
                      key={polyline.nomTrace + index}
                      onPress={() => this.selectPolyline(polyline)}
                      coordinates={polyline.positionsTrace}
                      tappable={true}
                      zIndex={0}
                      geodesic={true}
                      strokeColor={polyline.couleurTrace}
                      strokeWidth={5}
                    />
                  ))
              : null}
            {/* {this.props.markers.map((marker, index) => (
          <MapView.Marker
            key={index}
            coordinate={marker.coordinate}
            anchor={{ x: 0, y: 0 }}
            tracksViewChanges={false}
            // image={MarkerCircle}
            title="">
            <View style={[styles.markerIcon]}></View>
          </MapView.Marker>))
        } */}

            {this.props.pointsInterets != null
              ? this.props.pointsInterets.map((marker) => (
                  <Marker
                    onPress={() => this.onClickInterestPoint(marker)}
                    // onCalloutPress={() => this.onClickInterestPoint(marker)}
                    key={marker.id}
                    coordinate={marker.coordinates}
                    tracksViewChanges={false}>
                    <ImageBackground
                      style={{height: 25, width: 20}}
                      source={MarkerInteret}>
                      <Text style={{width: 25, height: 25}} />
                    </ImageBackground>
                  </Marker>
                ))
              : null}
          </MapView>

          {this.state.currentPolyline != null ? (
            <View
              style={{
                height: 100,
                width: '80%',
                alignSelf: 'center',
                backgroundColor: 'white',
                position: 'absolute',
                bottom: 10,
                padding: 10,
                borderRadius: 10,
              }}>
              <View
                style={{
                  width: '70%',
                  height: 7,
                  marginTop: 0,
                  marginRight: 3,
                  backgroundColor: this.state.currentPolyline.couleurTrace,
                }}
              />

              <Button
                style={{
                  backgroundColor: 'transparent',
                  zIndex: 1,
                  elevation: 0,
                  marginRight: 0,
                  height: 40,
                  width: 40,
                  position: 'absolute',
                  right: 0,
                  top: 0,
                  justifyContent: 'center',
                }}
                onPress={() => {
                  this.closeCurrentPolyline();
                }}>
                <View>
                  <IconElement
                    style={{alignSelf: 'center'}}
                    name="times-circle"
                    type="font-awesome"
                  />
                </View>
              </Button>

              <Button
                style={{
                  backgroundColor: 'transparent',
                  zIndex: 1,
                  elevation: 0,
                  marginRight: 0,
                  height: 40,
                  width: 40,
                  position: 'absolute',
                  right: 0,
                  top: 30,
                  justifyContent: 'center',
                }}
                onPress={() => {
                  this.centerMapOnTrace(this.state.currentPolyline);
                }}>
                <View>
                  <IconElement
                    style={{alignSelf: 'center', color: 'black'}}
                    name="search-plus"
                    type="font-awesome"
                  />
                  {/* <Icon active name="md-locate" style={styles.title} /> */}
                  {/* <Icon style={{ alignSelf: 'center' }} active name="times-circle" type='font-awesome' /> */}
                </View>
              </Button>

              <Button
                style={{
                  backgroundColor: 'transparent',
                  zIndex: 1,
                  elevation: 0,
                  marginRight: 0,
                  height: 40,
                  width: 40,
                  position: 'absolute',
                  right: 0,
                  top: 60,
                  justifyContent: 'center',
                }}
                onPress={() => {
                  this.toggleTrace(this.state.currentPolyline.nomTrace);
                }}>
                {!this.state.currentPolyline.isActive ? (
                  <IconElement name="eye-slash" type="font-awesome" />
                ) : (
                  <IconElement name="eye" type="font-awesome" />
                )}
              </Button>

              <View
                style={{
                  width: '100%',
                  paddingTop: 10,
                  display: 'flex',
                  flexDirection: 'column',
                }}>
                <Text
                  style={{fontWeight: 'bold'}}
                  numberOfLines={1}
                  ellipsizeMode="tail">
                  {' '}
                  {this.state.currentPolyline.nomTrace}{' '}
                </Text>
                <Text
                  style={{fontSize: 14}}
                  numberOfLines={1}
                  ellipsizeMode="tail">
                  {' '}
                  {this.state.currentPolyline.sportTrace} -{' '}
                  {this.state.currentPolyline.distanceTrace}km -{' '}
                  {this.state.currentPolyline.dplusTrace}D+{' '}
                </Text>
              </View>
            </View>
          ) : null}
        </Root>

        {/******** modal3 : finish LIVE *****************/}
        <Modal
          animationType={'none'}
          transparent={false}
          visible={this.state.modal3Visible}
          onRequestClose={() => {
            this.toggleModal3(!this.state.modal3Visible);
          }}>
          {/* {this.state.modal3Visible ? ( */}
          <Root>
            <View style={styles.modal}>
              <Header style={styles.headerModal}>
                <Left>
                  <Button
                    style={styles.drawerButton}
                    onPress={() => {
                      this.toggleModal3(!this.state.modal3Visible);
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
                    style={styles.errorMessage}
                    value={this.state.libelleLive}
                    message="Le titre de la course doit être renseignée"
                  />

                  <View style={styles.picker}>
                    <Picker
                      mode="dropdown"
                      accessibilityLabel={"Choisissez le type d'activité"}
                      iosHeader={"Choisissez le type d'activité"}
                      iosIcon={<Icon name="chevron-down" type="FontAwesome5" />}
                      style={{marginTop: 0}}
                      selectedValue={this.state.selectedSport}
                      onValueChange={this.onValueSportChange.bind(this)}
                      placeholder={"Choisissez le type d'activité"}
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
                      <Picker.Item
                        label="Choisissez le type d'activité"
                        value="-1"
                      />
                      <Picker.Item label={'RAID'} value="16" />
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
                        Le type d'activité doit être renseigné
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
                          : ApiUtils.getBackgroundColor(),
                        borderWidth: 1,
                        backgroundColor: this.isErrorFormStop()
                          ? 'transparent'
                          : ApiUtils.getBackgroundColor(),
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
              <View
                style={{
                  marginBottom: 0,
                  position: 'absolute',
                  bottom: Platform.OS == 'ios' ? 80 : 50,
                  zIndex: 12,
                  width: '100%',
                  backgroundColor: 'white',
                }}>
                <Sponsors />
              </View>
            </View>
          </Root>
          {/* ) : null} */}
        </Modal>

        {/******** modal : Battery modal *****************/}
        <Modal
          animationType={'none'}
          transparent={false}
          visible={this.state.ismodalBatteryOpen}
          onRequestClose={() => {
            this.closeModalBattery();
          }}>
          <BatteryModal
            noHeader={true}
            onMap={true}
            coord={this.props.currentPosition}
            idlive={this.props.currentLive?.idLive}
            onclose={this.closeModalBattery}
          />
        </Modal>

        {/******** modal4 : Alert gps   *****************/}
        <ModalSmall isVisible={!this.props.isOkPopupGps}>
          <View style={{backgroundColor: 'white', padding: 20}}>
            <Text
              style={{
                textAlign: 'center',
                fontWeight: 'bold',
                marginTop: 0,
                marginBottom: 20,
              }}>
              Accès à votre position GPS en arrière plan
            </Text>
            <Text style={{textAlign: 'justify'}}>
              L'application a besoin d'accèder à votre position en arrière plan
              pour pouvoir enregistrer la totalité de votre activité. Nous
              enregistrons votre position GPS même quand l'application est
              arretée ou en arrière plan.
            </Text>
            <TouchableOpacity
              onPress={this.onAcceptGps}
              style={{justifyContent: 'flex-end', marginTop: 30}}>
              <Text style={{textAlign: 'right'}}>Ok</Text>
            </TouchableOpacity>
          </View>
        </ModalSmall>

        {/******** modal5 : Traces list  *****************/}
        <ModalSmall
          isVisible={this.state.isModalTraceVisible}
          onRequestClose={() => {
            this.setState({isModalTraceVisible: false});
          }}
          onSwipeComplete={() => this.setState({isModalTraceVisible: false})}
          // swipeDirection={'left'}
        >
          <View
            style={{
              marginTop: 22,
              display: 'flex',
              flexDirection: 'row-reverse',
              backgroundColor: 'white',
              marginRight: 0,
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
            }}>
            <Button
              style={{
                backgroundColor: 'transparent',
                elevation: 0,
                marginRight: 10,
              }}
              onPress={() => {
                this.closeTraceModal();
              }}>
              <IconElement name="times-circle" type="font-awesome" />
            </Button>
          </View>
          <ScrollView
            style={{
              marginTop: 0,
              backgroundColor: 'white',
              paddingBottom: 200,
              borderBottomLeftRadius: 20,
              borderBottomRightRadius: 20,
            }}>
            <View style={{flex: 1, paddingLeft: 10, paddingRight: 10}}>
              {/* {this.props.nomStation != "" && this.props.nomStation != null ?
                <View>
                  <Text style={{ marginTop: 0, textAlign: "center", }}>Vous êtes actuellement sur la station  : </Text> 
                   <Text style={{ marginTop: 10, textAlign: "center", fontWeight: "bold" }}>{this.props.nomStation} </Text> 
                   <Text style={{ marginTop: 10, paddingLeft: 10, paddingRight: 10 }}>{this.props.descriptionStation} </Text>
                </View>
                : null} */}

              <FlatList
                style={{
                  height: '100%',
                  width: '100%',
                  padding: 0,
                  marginTop: 5,
                  paddingBottom: 200,
                }}
                data={this.props.polylines}
                renderItem={({item}) => (
                  <TouchableHighlight
                    underlayColor="rgba(255,255,255,1,0.6)"
                    // underlayColor='rgba(192,192,192,1,0.6)'
                    // onPress={this.viewLive.bind(this, item)}
                  >
                    <View>
                      <View style={{}}>
                        <View style={styles.traceLine}>
                          <View
                            style={{
                              width: 20,
                              height: 7,
                              marginTop: 25,
                              marginRight: 3,
                              backgroundColor: item.couleurTrace,
                            }}
                          />
                          <View
                            style={{
                              width: '70%',
                              paddingTop: 10,
                              display: 'flex',
                              flexDirection: 'column',
                            }}>
                            <Text
                              style={{fontWeight: 'bold'}}
                              numberOfLines={1}
                              ellipsizeMode="tail">
                              {' '}
                              {item.nomTrace}{' '}
                            </Text>
                            <Text
                              style={{fontSize: 14}}
                              numberOfLines={1}
                              ellipsizeMode="tail">
                              {' '}
                              {item.sportTrace} - {item.distanceTrace}km -{' '}
                              {item.dplusTrace}D+{' '}
                            </Text>
                          </View>
                          <Button
                            style={styles.buttonHideTrace}
                            onPress={() => {
                              this.toggleTrace(item.nomTrace);
                            }}>
                            {!item.isActive ? (
                              <IconElement
                                name="eye-slash"
                                type="font-awesome"
                              />
                            ) : (
                              <IconElement name="eye" type="font-awesome" />
                            )}
                          </Button>

                          <Button
                            style={{
                              backgroundColor: 'transparent',
                              zIndex: 1,
                              elevation: 0,
                              marginRight: 0,
                              height: 40,
                              width: 40,
                              justifyContent: 'center',
                            }}
                            onPress={() => {
                              this.centerMapOnTrace(item);
                            }}>
                            <View>
                              <IconElement
                                style={{
                                  alignSelf: 'center',
                                  color: 'black',
                                }}
                                name="search-plus"
                                type="font-awesome"
                              />
                              {/* <Icon active name="md-locate" style={styles.title} /> */}
                              {/* <Icon style={{ alignSelf: 'center' }} active name="times-circle" type='font-awesome' /> */}
                            </View>
                          </Button>
                          {/* <Text style={{ width: 180 }}> Folocode : {item.folocodeUtilisateur} </Text>  */}
                        </View>
                      </View>
                    </View>
                  </TouchableHighlight>
                )}
                keyExtractor={(item, index) => index.toString()}
              />
            </View>
          </ScrollView>
        </ModalSmall>

        {/* Point d'interet  */}

        <ModalSmall
          style={{marginTop: 22, paddingTop: 22, borderRadius: 10}}
          isVisible={this.state.isModalInterestVisible}
          onSwipeComplete={() => this.setState({isModalInterestVisible: false})}
          onRequestClose={() => {
            this.setState({isModalInterestVisible: false});
          }}>
          <View
            style={{
              display: 'flex',
              flexDirection: 'row-reverse',
              backgroundColor: 'white',
              borderTopLeftRadius: 10,
              borderTopRightRadius: 10,
            }}>
            <Button
              style={{
                backgroundColor: 'transparent',
                elevation: 0,
                marginRight: 10,
              }}
              onPress={() => {
                this.closeInterestModal();
              }}>
              <IconElement name="times-circle" type="font-awesome" />
            </Button>
          </View>
          <ScrollView
            style={{
              marginTop: 0,
              backgroundColor: 'white',
              paddingBottom: 200,
              borderBottomLeftRadius: 10,
              borderBottomRightRadius: 10,
            }}>
            <View style={{flex: 1, paddingLeft: 5, paddingRight: 5}}>
              <Text
                style={{
                  marginTop: 0,
                  marginBottom: 20,
                  textAlign: 'center',
                  fontWeight: 'bold',
                }}>
                {' '}
                {this.state.currentInteret.libelleInteret}
              </Text>

              {this.state.currentInteret.photoInteret != null &&
              this.state.currentInteret.photoInteret != '' &&
              this.state.currentInteret.photoInteret.length > 0 ? (
                <Image
                  style={{height: 200, width: '100%'}}
                  source={{
                    uri: ApiUtils.getPhotoUrl(
                      this.state.currentInteret.idStation,
                      this.state.currentInteret.photoInteret,
                    ),
                  }}
                />
              ) : null}

              <View
                style={{
                  marginTop: 10,
                  marginBottom: 10,
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  width: '100%',
                  paddingRight: 5,
                  paddingLeft: 5,
                }}>
                {this.state.currentInteret.telephoneInteret != '' &&
                this.state.currentInteret.telephoneInteret != null ? (
                  <Button
                    style={{
                      marginTop: 20,
                      marginBottom: 0,
                      alignSelf: 'center',
                      // width: 150,
                      height: 40,
                      borderRadius: 10,
                      // marginRight: 40,
                      backgroundColor: 'black',
                    }}
                    onPress={() =>
                      this.onClickInterestPhone(
                        this.state.currentInteret.telephoneInteret,
                        this.state.currentInteret.idInteret,
                      )
                    }>
                    <Text style={styles.buttonText}>
                      {this.state.currentInteret.telephoneInteret}
                    </Text>
                  </Button>
                ) : null}
                {/* <Text>{JSON.stringify(this.state.currentInteret)}</Text> */}

                {this.state.currentInteret.lienInteret != '' &&
                this.state.currentInteret.lienInteret != null ? (
                  <Button
                    style={{
                      marginTop: 20,
                      marginBottom: 0,
                      alignSelf: 'center',
                      // width: 150,
                      height: 40,
                      borderRadius: 10,
                      // marginRight: 40,
                      backgroundColor: 'black',
                    }}
                    onPress={() =>
                      this.onClickUrlInterest(
                        this.state.currentInteret.lienInteret,
                        this.state.currentInteret.idInteret,
                      )
                    }>
                    <Text style={styles.buttonText}>Lien web</Text>
                  </Button>
                ) : null}
              </View>

              <Text
                style={{
                  marginTop: 10,
                  paddingLeft: 10,
                  paddingRight: 10,
                  paddingBottom: 100,
                }}>
                {this.state.currentInteret.descriptionInteret}{' '}
              </Text>
            </View>
          </ScrollView>
        </ModalSmall>
      </Container>
    );
  }
}

var styles = StyleSheet.create({
  container: {
    backgroundColor: 'transparent',
    fontFamily: 'Roboto',
  },

  traceLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    backgroundColor: 'white',
    // padding: 10
  },
  buttonHideTrace: {
    backgroundColor: 'transparent',
    // marginTop: 5,
    elevation: 0,
  },
  header: {
    backgroundColor: '#2B3990',
    paddingLeft: 10,
    paddingTop: 10,
    paddingBottom: 10,
    // height: 80
  },
  headerModal: {
    backgroundColor: 'white',
    paddingLeft: 10,
    paddingTop: 0,
    paddingBottom: 5,
    // height: 50
  },
  dossard: {
    fontWeight: 'bold',
  },
  timeText: {
    fontWeight: 'bold',
    fontSize: 20,
  },
  title: {
    color: '#000',
  },
  modal: {
    paddingLeft: 0,
  },

  headerButton: {
    backgroundColor: 'transparent',
    color: 'black',
    elevation: 0,
    justifyContent: 'center',
  },
  headerButtonLogo: {
    color: 'black',
  },
  statBanner: {
    flexDirection: 'row',
    borderTopColor: '#D5D5D5',
    borderTopWidth: 1,
    justifyContent: 'space-around',
    width: '100%',
    backgroundColor: 'white',
    padding: 10,
  },
  statBanner2: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    backgroundColor: 'white',
    borderTopWidth: 1,
    padding: 10,
  },
  liveNameBanner: {
    backgroundColor: 'white',
    borderTopColor: '#D5D5D5',
    borderTopWidth: 1,
    justifyContent: 'center',
    width: '100%',
    height: 30,
    paddingTop: 5,
    paddingBottom: 5,
    color: 'white',
  },
  liveNameText: {
    color: 'black',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  footer: {
    backgroundColor: 'transparent',
    paddingLeft: 0,
    paddingRight: 0,
    paddingBottom: 0,
    marginBottom: -5,
    width: Dimensions.get('screen').width,
    height: 60,
  },
  footerBody: {
    // justifyContent: 'center',
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    width: Dimensions.get('screen').width,
  },
  icon: {
    color: '#fff',
  },
  rowContainer: {
    padding: 10,
    height: 50,
    paddingTop: 15,
    paddingLeft: 0,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: 'black',
  },
  line: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingRight: 0,
    paddingLeft: 0,
  },
  buttonok: {
    width: 60,
    height: 60,
    backgroundColor: ApiUtils.getBackgroundColor(),
    borderRadius: 30,
    textAlign: 'center',
    padding: 0,
    paddingLeft: 18,
    position: 'absolute',
    right: 20,
    bottom: 0,
  },
  infoIcon: {
    marginTop: 60,
  },
  plusButtonLogo: {
    color: 'black',
    fontSize: 18,
  },
  personneForm: {
    marginTop: 10,
  },
  textInfo: {
    paddingLeft: 30,
    paddingRight: 30,
    marginTop: 10,
    fontWeight: 'bold',
    fontStyle: 'italic',
    textAlign: 'center',
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
  saveButton: {
    backgroundColor: 'transparent',
    width: 110,
    marginTop: 0,
    paddingTop: 10,
    shadowOffset: {height: 0, width: 0},
    shadowOpacity: 0,
    elevation: 0,
  },
  drawerButton: {
    backgroundColor: 'transparent',
    width : '100%',
    marginTop: 0,
    paddingTop: 10,
    shadowOffset: {height: 0, width: 0},
    shadowOpacity: 0,
    elevation: 0,
    marginLeft: 0,
    paddingLeft: 0,
  },
  goBackButton: {
    backgroundColor: 'transparent',
    width: 30,
    marginTop: 0,
    paddingTop: 10,
    shadowOffset: {height: 0, width: 0},
    shadowOpacity: 0,
    elevation: 0,
    marginLeft: 0,
    paddingLeft: 0,
  },
  picker: {
    marginTop: 0,
    padding: 10,
  },
  ignoreActivityLink: {
    marginTop: 10,
    marginBottom: 20,
    alignSelf: 'center',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  saveText: {
    color: 'black',
    paddingLeft: 0,
    marginLeft: 0,
    marginRight: -5,
  },
  buttonText: {
    fontWeight: 'bold',
    fontSize: 18,
    paddingBottom: 5,
  },
  map: {
    flex: 1,
    borderColor: 'black',
    borderWidth: 0,
    zIndex: 1,
  },
  status: {
    fontSize: 12,
  },
  markerIcon: {
    borderWidth: 1,
    borderColor: ApiUtils.getBackgroundColor(),
    backgroundColor: ApiUtils.getBackgroundColor(),
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  markerIconBIG: {
    borderWidth: 1,
    borderColor: ApiUtils.getBackgroundColor(),
    backgroundColor: 'blue',
    width: 100,
    height: 100,
    borderRadius: 5,
  },
  buttonlink: {
    marginTop: 30,
    marginBottom: 0,
    alignSelf: 'center',
    // width: 150,
    height: 30,
    borderRadius: 10,
    // marginRight: 40,
    backgroundColor: 'black',
  },

  markerInterest: {
    borderWidth: 1,
    borderColor: 'black',
    backgroundColor: 'red',
    width: 50,
    height: 50,
    borderRadius: 25,
  },
});

export default connect(mapStateToProps)(SimpleMap);
