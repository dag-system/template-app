import React, {Component} from 'react';
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
import Swipeout from 'react-native-swipeout';
import RNPickerSelect from 'react-native-picker-select';
import {isPointInPolygon} from 'geolib';
import ApiUtils from '../ApiUtils';
import ErrorMessage from '../home/ErrorMessage';
import {ReactNativeModal as ModalSmall} from 'react-native-modal';
import RNFetchBlob from 'rn-fetch-blob';
// Import native-base UI components
import {
  Container,
  Button,
  Icon,
  Text,
  Body,
  Switch,
  Fab,
  Header,
  Footer,
  Toast,
  Root,
  Spinner,
  Picker,
  Left,
  Right,
} from 'native-base';
// import Geolocation from 'react-native-geolocation-service';
import Geolocation from '@react-native-community/geolocation';
import MarkerInteret from '../assets/marker.png';
import MarkerCircle from '../assets/circle.png';
import {Icon as IconElement} from 'react-native-elements';
// import gpxParse from 'gpx-parse';
import GPXDocument from '../lib/gpx-parse/GPXDocument';
import {connect} from 'react-redux';
// import gpxParser from 'gpxparser';
////
// Import BackgroundGeolocation plugin
// Note: normally you will not specify a relative url ../ here.  I do this in the sample app
// because the plugin can be installed from 2 sources:
//
// 1.  npm:  react-native-background-geolocation
// 2.  private github repo (customers only):  react-native-background-geolocation-android
//
// This simply allows one to change the import in a single file.
import BackgroundGeolocation from '../react-native-background-geolocation';

// react-native-maps
import MapView, {Polyline, Marker} from 'react-native-maps';
import DocumentPicker from 'react-native-document-picker';
import GlobalStyles from '../styles';

// const LATITUDE_DELTA = 0.00922;
// const LONGITUDE_DELTA = 0.00421;
const LATITUDE_DELTA = 0.16022;
const LONGITUDE_DELTA = 0.01221;
const haversine = require('haversine');

var interval = null;

const mapStateToProps = state => {
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
    isFirstPoint: state.isFirstPoint,
    pointsInterets: state.pointsInterets,
    polylines: state.polylines,
    odometerInitialValue: state.odometerInitialValue,
    descriptionStation: state.descriptionStation,
    nomStation: state.nomStation,
    currentMapStyle: state.currentMapStyle,
  };
};

class SimpleMap extends Component {
  constructor(props) {
    super(props);

    this.state = {
      enabled: false,
      isMoving: false,
      recording: false,
      isStarted: false,
      motionActivity: {activity: 'unknown', confidence: 100},
      odometer: 0,
      totalPositiveAltitude: 0,
      totalNegativeAltitude: 0,
      lastAltitude: 0,
      currentSpeed: '-',
      modalVisible: false,
      modal2Visible: false,
      modal3Visible: false,
      acceptChallengeUtilisateur: false,
      acceptChallengeNameUtilisateur: false,
      modalAddInterestVisible: false,
      libelleLiveIsModified: false,
      setLocationToCenter: true,
      odometerInitialValue: 0,
      // username: props.navigation.state.params.username,
      userdata: {
        nomUtilisateur: '',
        prenomUtilisateur: '',
        folocodeUtilisateur: '',
        acceptChallengeUtilisateur: false,
      },
      live: {
        invites: [],
      },
      selectedSport: -1,
      comments: '',
      sports: [],
      invites: [],
      rowID: 0,
      nomPersonne: '',
      prenomPersonne: '',
      telPersonne: '',
      mailPersonne: '',
      // MapView
      polylines: [],
      nomStation: '',
      descriptionStation: '',
      coordinates2: [],
      markers: [],
      coordinates: [],
      isModalTraceVisible: false,
      isModalInterestVisible: false,
      showsUserLocation: true,
      pointsInterets: [],
      timer: 0,
      spinner: false,
      spinnerText: '',
      timerString: '00:00:00',
      currentInteret: {
        libelleInteret: '',
        telephoneInteret: '',
        lienInteret: '',
        photoInteret: '',
      },
      currentPolyline: null,
    };
    // const didBlurSubscription = this.props.navigation.addListener(
    //   'willFocus',
    //   payload => {
    //     this.componentDidMount();
    //   }
    // );

    // const blurListener = this.props.navigation.addListener('willBlur', () => {
    //   // console.log('unmount');
    //   this.componentWillUnmount();
    // });

    this._unsubscribe = this.props.navigation.addListener('focus', payload => {
      this.componentDidMount();
    });

    this._unsubscribe2 = this.props.navigation.addListener('blur', payload => {
      this.componentWillUnmount();
    });
  }

  // Buttons
  swipeoutBtns = [
    {
      text: 'Supprimer',
      backgroundColor: 'red',
      underlayColor: 'rgba(0, 0, 0, 1, 0.6)',
      onPress: () => {
        this.deleteInvite();
      },
    },
  ];

  addPersonne(personne) {
    var newInvites = this.props.currentLive.invites;
    newInvites.push(personne);

    var action = {type: 'UPDATE_INVITES', data: newInvites};
    this.props.dispatch(action);
  }

  componentWillUnmount() {
    console.log('willunmount');
    alert('ok');
    BackgroundGeolocation.removeListeners();
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
      .then(response => response.json())
      .then(responseJson => {
        console.log(responseJson);
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
      .catch(e => {
        alert(e);
        ApiUtils.logError('simpleMap onClickCreateInvite', e.message);
      })
      .then
      // (e) => alert("erreur : " + e.message),
      //  this.onClickNavigate('SimpleMap'));
      //alert("error gettingData"+ e.message)
      ();
  }

  deleteInvite() {
    var folocodePersonne = this.state.rowID;
    let formData = new FormData();
    formData.append('method', 'deletePersonne');
    formData.append('auth', ApiUtils.getAPIAuth());
    formData.append('idLive', this.props.currentLive.idLive);
    formData.append('idUtilisateur', folocodePersonne);
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
      .then(response => response.json())
      .then(responseJson => {
        //save values in cache

        if (responseJson.codeErreur == 'DELETE_PERSONNE_SUCCESS') {
          //SaveData

          var finalInvites = this.props.currentLive.invites.filter(function(
            personne,
          ) {
            return personne.idUtilisateur != folocodePersonne;
          });

          var action = {type: 'UPDATE_INVITES', data: finalInvites};
          this.props.dispatch(action);

          // this.setState({
          //   invites: this.state.invites.filter(function (personne) {
          //     return personne.idUtilisateur != folocodePersonne
          //   })
          // });
        } else {
          alert('erreur : ' + responseJson.message);
        }
      })
      .catch(e => ApiUtils.logError('simpleMap deleteInvite', e.message))
      .then();
  }

  componentDidMount() {
    if (this.props.currentLive == null) {
      this.onDisconnect();
      this.props.navigation.navigate('Lives');
    }

    this._unsubscribe2 = this.props.navigation.addListener('blur', () => {
      this.componentWillUnmount();
    });

    if (this.props.isRecording) {
      // BackgroundGeolocation.getLocations().then((result) => {
      //   console.log("resu : " + JSON.stringify(result));
      // })
    }

    this.setState({
      acceptChallengeNameUtilisateur:
        this.props.userData.acceptChallengeNameUtilisateur == 1,
    });

    this.setState({
      acceptChallengeUtilisateur:
        this.props.userData.acceptChallengeUtilisateur == 1,
    });

    // this.setState({ acceptChallengeUtilisateur: this.props.userData.acceptChallengeUtilisateur });
    clearInterval(this.interval);
    this.interval = setInterval(() => this.setState({time: Date.now()}), 800);
    // this.setState({ acceptChallengeUtilisateur: this.props.userData.acceptChallengeUtilisateur });

    // this._unsubscribe = this.props.navigation.addListener('focus', () => {
    //   this.componentDidMount();
    // });
    this.calcDistanceFromAllCoordinates(this.props.coordinates);

    // Geolocation.requestAuthorization();
    Geolocation.setRNConfiguration({authorizationLevel: 'always'});

    BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);
    //  BackgroundGeolocation.on('activitychange', this.onActivityChange.bind(this));
    //BackgroundGeolocation.on('providerchange', this.onProviderChange.bind(this));
    // BackgroundGeolocation.on('powersavechange', this.onPowerSaveChange.bind(this));
    //   AppState.addEventListener('change', this._handleAppStateChange);
    // this.getSports();

    var idLive = this.props.currentLive?.idLive;

    BackgroundGeolocation.ready(
      {
        distanceFilter: 10,
        url: ApiUtils.getAPIUrl(),
        httpRootProperty: '.',
        params: {
          method: 'createPosition',
          idLive: idLive,
          auth: ApiUtils.getAPIAuth(),
        },
        extras: {
          method: 'createPosition',
          idLive: idLive,
          auth: ApiUtils.getAPIAuth(),
        },
        notification: {
          sticky: true,
          title: 'Foulée Blanche',
          text: 'Suivi de votre position en cours',
          channelImportance: BackgroundGeolocation.NOTIFICATION_PRIORITY_LOW,
        },
        enableHeadless: true,
        locationAuthorizationRequest: 'Always',
        backgroundPermissionRationale: {
          title:
            'Authoriser {applicationName} a accèder à votre position en arrière plan',
          message:
            "Pour enregistrer votre activiité même quand l'application est en arrière plan, merci d'autoriser {backgroundPermissionOptionLabel}",
          positiveAction: 'Autoriser {backgroundPermissionOptionLabel}',
          negativeAction: 'Annuler',
        },
        autoSync: true,
        autoSyncThreshold: 5,
        batchSync: true,
        preventSuspend: true,
        stopOnTerminate: false, //TODO TO DO
        startOnBoot: true,
        foregroundService: true,
        disableElasticity : true,
        debug: false,
        desiredAccuracy: BackgroundGeolocation.DESIRED_ACCURACY_HIGH,
        desiredOdometerAccuracy: 10, //If you only want to calculate odometer from GPS locations, you could set desiredOdometerAccuracy: 10. This will prevent odometer updates when a device is moving around indoors, in a shopping mall, for example.
        logLevel: BackgroundGeolocation.LOG_LEVEL_OFF,
      },
      state => {
        this.setState({
          enabled: state.enabled,
          isMoving: state.isMoving,
          showsUserLocation: false,
          comments: '',
          selectedSport: -1,
          libelleLive: ApiUtils.getLibelleLive(),
          nomPersonne: '',
          prenomPersonne: '',
          telPersonne: '',
          mailPersonne: '',
        });
      },
    );

    // .then(() => {

    // Step 1:  Listen to events:
    BackgroundGeolocation.on(
      'location',
      loc => this.onLocation(loc),
      this.onLocationError.bind(this),
    );
    BackgroundGeolocation.on('motionchange', this.onMotionChange.bind(this));
    BackgroundGeolocation.onHttp(httpEvent => {
      try {
        if (httpEvent.responseText != null && httpEvent.responseText != '') {
          var result = JSON.parse(httpEvent.responseText);

          if (result.codeErreur == 'SUCCESS') {
            if (
              result.tracesStation != null &&
              result.tracesStation.length != 0
            ) {
              this.setState({nomStation: result.nomStation});

              this.setState({descriptionStation: result.descriptionStation});
              var tracesArray = Object.values(result.tracesStation);

              var finalTraceArray = []; // new Object(this.props.polylines);
              if ((tracesArray != null) & (tracesArray.length != 0)) {
                tracesArray.forEach(trace => {
                  var finalTrace = trace;

                  var positionArray = Object.values(trace.positionsTrace);
                  trace.positionsTrace = positionArray;

                  var finalTrace = {
                    positionsTrace: positionArray,
                    couleurTrace: trace.couleurTrace,
                    nomTrace: trace.nomTrace,
                    isActive: true,
                    sportTrace: trace.sportTrace,
                    distanceTrace: trace.distanceTrace,
                    dplusTrace: trace.dplusTrace,
                  };
                  finalTraceArray.push(finalTrace);
                });
              }

              this.setState({polylines: finalTraceArray});

              var station = {
                nomStation: result.nomStation,
                descriptionStation: result.descriptionStation,
                polylines: finalTraceArray,
                // pointsInterets: finalinterestArray
              };

              var action = {type: 'UPDATE_STATION_DATA', data: station};
              this.props.dispatch(action);
            }

            // if (result.pointsInterets != null && result.pointsInterets.length != 0) {

            //   var finalinterestArray = [];
            //   var interestArray = Object.values(result.pointsInterets);
            //   var count = 0;
            //   interestArray.forEach(interest => {
            //     var coordinate = {
            //       latitude: parseFloat(interest.latitudeInteret),
            //       longitude: parseFloat(interest.longitudeInteret)
            //     }

            //     var finalInterest = {
            //       id: "interest" + count,
            //       idInteret: interest.idInteret,
            //       idStation: interest.idStation,
            //       coordinates: coordinate,
            //       libelleInteret: interest.libelleInteret,
            //       couleurTrace: interest.couleurTrace,
            //       descriptionInteret: interest.descriptionInteret,
            //       telephoneInteret: interest.telephoneInteret,
            //       lienInteret: interest.lienInteret,
            //       photoInteret: interest.photoInteret,
            //     };

            //     if (finalInterest.descriptionInteret == null && interest.externalData != null) {

            //       var extraData = JSON.parse(interest.externalData);
            //       if (extraData.hasDescription.length > 0 && extraData.hasDescription[0] != null) {
            //         if (extraData.hasDescription[0].shortDescription != null && extraData.hasDescription[0].shortDescription.length > 1) {
            //           finalData.description = extraData.hasDescription[0].shortDescription[1];
            //         } else {
            //           finalData.description = extraData.hasDescription[0].shortDescription[0];
            //         }

            //       }
            //     }
            //     if (interest.actifInteret == "1") {
            //       finalinterestArray.push(finalInterest);
            //       count++;
            //     }

            //   });
            //   this.setState({ pointsInterets: finalinterestArray });
            // }
          } else {
            // this.setState({ polylines: [] });
          }
        }
      } catch (e) {
        ApiUtils.logError(
          'simpleMap createPosition onHTTP --  ',
          e.message + '  ---   json reçu :' + httpEvent.responseText,
        );
      }
    });
  }

  handleBackButton() {
    return true;
  }

  async needTopUpdatePosition(newCoordinate) {
    if (this.refs.map != null) {
      this.refs.map
        .getMapBoundaries()
        .then(data => {
          var isInside = isPointInPolygon(newCoordinate, [
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
        .catch(error => {
          alert('error');
          console.warn(JSON.stringify(error));
        });
    }
  }

  componentWillUnmount() {
    this._unsubscribe();
    clearInterval(this.interval);
    BackHandler.removeEventListener('hardwareBackPress', this.handleBackButton);
  }

  async saveRecordingState(isrecording) {
    var action = {type: 'SAVE_IS_RECORDING', data: isrecording};
    this.props.dispatch(action);
  }

  getFirstLocation() {
    Geolocation.requestAuthorization();
    Geolocation.setRNConfiguration({authorizationLevel: 'always'});

    Geolocation.getCurrentPosition(
      position => {
        this.setCenter(position);

        this.setState({currentPosition: position});
      },
      error => {
        ApiUtils.logError('getFirstPosition', JSON.stringify(error));
        // See error code charts below.
      },
      {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000},
    );
  }

  /**
   * @event location
   */

  onLocation(location) {
    this.addMarker(location);

    if (!location.sample) {
      var odometerCurrent = location.odometer;

      // var coordinate = {
      //   latitude: location.coords.latitude,
      //   longitude: location.coords.longitude
      // };

      // latitude: location.coords.latitude,
      // longitude: location.coords.longitude,

      // var speed = location.coords.speed;

      // if (speed != -1) {
      //   var speedKmH = (speed * 3.6).toFixed(1);
      //   this.setState({ currentSpeed: speedKmH });
      // } else {
      //   this.setState({ currentSpeed: '-' });
      // }

      // this.generateLotOfMarkers(10000);

      // console.log('odomter : ' + location.odometer + '   odomtert initial  : ' + this.props.odometerInitialValue)
      // if (this.props.isFirstPoint) {

      //   this.setCenter(location);

      //   var odometerData = {
      //     odometerInitialValue: odometerCurrent,
      //     isFirstPoint: false,
      //     odometer: 0,
      //     currentPosition: location
      //   };

      //   var action = { type: 'UPDATE_ODOMETER', data: odometerData }
      //   this.props.dispatch(action);

      //   // this.setState({ odometerInitialValue: odometerCurrent, isFirstPoint: false });
      //   // this.setState({
      //   //   odometer: (odometerCurrent - odometerCurrent).toFixed(2)
      //   // });
      // } else {
      //   console.log('la',location.odometer)

      //   var odometerDataNew = {
      //     odometerInitialValue: this.props.odometerInitialValue,
      //     isFirstPoint: false,
      //     odometer: location.odometer,
      //     currentPosition: location
      //   };

      //   var action2 = { type: 'UPDATE_ODOMETER', data: odometerDataNew }
      //   this.props.dispatch(action2);

      //   // this.setState({
      //   //   odometer: ((location.odometer - this.props.odometerInitialValue) / 1000).toFixed(2)
      //   // });
      // }

      // alert(location.odometer);

      // var altitudeDiff = location.altitude - this.state.lastAltitude;

      // if (altitudeDiff > 0) {
      //   this.setState({ totalPositiveAltitude: (this.state.totalPositiveAltitude + altitudeDiff) });
      // } else {
      //   this.setState({ totalNegativeAltitude: (this.state.totalPositiveAltitude - altitudeDiff) });
      // }

      // this.setState({ lastAltitude: (location.altitude) });
    }

    this.setState({currentPosition: location});
  }

  async calcDistance(location, oldLatLong, newLatLng) {
    console.log('olaltLong : ', oldLatLong);
    console.log('newLatLng : ', newLatLng);
    var dist = haversine(oldLatLong, newLatLng);

    console.log('odometer : ' + dist);

    var odometerDataNew = {
      odometerInitialValue: this.props.odometerInitialValue,
      isFirstPoint: false,
      odometer: this.props.odometer + dist,
      currentPosition: location,
    };

    var action = {type: 'UPDATE_ODOMETER', data: odometerDataNew};
    this.props.dispatch(action);
  }

  async calcDistanceFromAllCoordinates(coordinates) {
    var dist = 0;
    let count = 0;
    coordinates.forEach(coord => {
      if (count > 0) {
        dist += haversine(coord, coordinates[count - 1]);
      }
      count++;
    });

    var odometerData = {
      // odometerInitialValue: this.props.odometerInitialValue,
      // isFirstPoint: this.props.isFirstPoint,
      odometer: dist,
      // currentPosition: this.props.currentLocation,
    };
    var action = {type: 'SET_ODOMETER', data: odometerData};
    this.props.dispatch(action);
  }

  onLocationError(error) {
    ApiUtils.logError('Error', 'ErrorCode : ' + error);
    if (error == 0) {
      // alert('Nous ne trouvons pas votre position');
    }
  }
  /**
   * @event motionchange
   */
  onMotionChange(event) {
    //console.log('[event] motionchange: ', event.isMoving, event.location);
    this.setState({
      isMoving: event.isMoving,
    });
    let location = event.location;
  }
  /**
   * @event activitychange
   */
  onActivityChange(event) {
    //console.log('[event] activitychange: ', event);
    this.setState({
      motionActivity: event,
    });
  }
  /**
   * @event providerchange
   */
  onProviderChange(event) {
    // console.log('[event] providerchange', event);
  }
  /**
   * @event powersavechange
   */
  onPowerSaveChange(isPowerSaveMode) {
    //console.log('[event] powersavechange', isPowerSaveMode);
  }

  onToggleEnabled(isMoving, isRecording) {
    if (isMoving) {
      BackgroundGeolocation.start(
        state => {
          // NOTE:  We tell react-native-maps to show location only AFTER BackgroundGeolocation
          // has requested location authorization.  If react-native-maps requests authorization first,
          // it will request WhenInUse -- "Permissions Tug-of-war"

          this.setState({
            showsUserLocation: true,
          });
          BackgroundGeolocation.changePace(true);
        },
        state => {
          ApiUtils.logError('failure geoloc', JSON.stringify(state));
        },
      );
    } else {
      BackgroundGeolocation.stop();
      clearInterval(this.interval);
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
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    };

    await this.needTopUpdatePosition(location);

    if (this.props.coordinates.length > 0) {
      var lastPos = this.props.coordinates[this.props.coordinates.length - 1];
      var newPost = coordinate;
      this.calcDistance(location, lastPos, newPost);
    }

    var action = {type: 'ADD_MARKER', data: marker};
    this.props.dispatch(action);

    var action = {type: 'ADD_COORDINATE', data: coordinate};
    this.props.dispatch(action);

    var action = {type: 'UPDATE_CURRENT_POSITION', data: location};
    this.props.dispatch(action);
  }

  generateLotOfMarkers(numbers) {
    let markerst = [];
    let coordinates = [];

    for (let i = 1; i < numbers; i++) {
      let test = Math.random();
      let lat = 44.935 + i / 100;
      let long = 4.89 + i / 100;
      let coordinatet = {
        latitude: lat,
        longitude: long,
      };
      let marker = {
        key: test * 1000,
        // title: location.timestamp,
        // heading: location.coords.heading,
        coordinate: coordinatet,
      };

      markerst.push(marker);
    }

    this.setState({
      markers: markerst,
      // coordinates: [...this.state.coordinates, coordinates]
    });
  }

  setCenter(location) {
    if (!this.refs.map) {
      return;
    }

    this.refs.map.animateToRegion({
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      latitudeDelta: LATITUDE_DELTA,
      longitudeDelta: LONGITUDE_DELTA,
    });
  }

  saveCurrentMapStyle(style) {
    var action = {type: 'UPDATE_MAP_STYLE', data: style};
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
    Linking.canOpenURL(url).then(supported => {
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

    var action = {type: 'IS_MOVING', data: isMoving};
    this.props.dispatch(action);

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
    this.onTimerStartPause();
  }

  onStop() {
    if (this.props.isMoving) {
      this.onTimerStartPause();
    }
    //  else {
    //   this.onToggleEnabled(false, true)
    // }
    this.toggleModal3(true);
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
        // console.log("location permission denied");
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
        ).then(res => {
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

  async onClickAddGpx() {
    this.checkPermissions();

    // Pick a single file
    try {
      const res = await DocumentPicker.pick({
        // type: 'application/gpx+xml',
      });
      console.log(
        res.uri,
        res.type, // mime type
        res.name,
        res.size,
      );

      var uri = res.uri;
      var filePath = uri;

      if (res.name.includes('.gpx')) {
        setTimeout(() => this.readFile(filePath), 100);
      } else {
        alert("Le fichier n'est pas un fichier gpx");
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

  readFile(filePath) {
    var path = this.normalize(filePath);
    var _this = this;

    RNFetchBlob.fs
      .readFile(path, 'utf8')
      .then(data => {
        // alert('ok')
        // console.log(data);
        // handle the data ..

        try {
          var test = new GPXDocument(data);

          test.getTracks().then(t => {
            t.forEach(tr => {
              var finalTrace = {
                // positionsTrace: positionArray,
                couleurTrace: ApiUtils.getColor(),
                nomTrace: tr.getName(),
                isActive: true,
                sportTrace: 'inconnu',
              };

              tr.loadAllSegmentInfo().then(resu => {
                // console.log(resu);
                finalTrace.distanceTrace = (
                  resu[0].totalDistance / 1000
                ).toFixed(1);
                finalTrace.dplusTrace = resu[0].totalElevationGain.toFixed(0);

                // var positionArray = tr.transformGpxPointToLatLong(resu[0].points);
                finalTrace.positionsTrace = resu[0].latLongList;

                var action = {type: 'ADD_TRACE', data: finalTrace};
                _this.props.dispatch(action);

                _this.centerMapOnTrace(finalTrace);

                Toast.show({
                  text: 'Le fichier gpx a bien été importé',
                  buttonText: 'Ok',
                  type: 'success',
                  duration: 3000,
                  position: 'bottom',
                });
                // polylines.push(finalTrace);
              });

              // this.setState({ polylines: polylines })
            });
          });
        } catch (e) {
          Toast.show({
            text: 'Une erreur est survenue. Merci de réessayer',
            buttonText: 'Ok',
            type: 'danger',
            duration: 3000,
            position: 'bottom',
          });
          // alert(e)
        }
      })
      .catch(e => {
        Toast.show({
          text: 'Une erreur est survenue. Merci de réessayer',
          buttonText: 'Ok',
          type: 'danger',
          duration: 3000,
          position: 'bottom',
        });
        console.log(e);
      });
  }

  onstart() {
    this.saveRecordingState(true);
    this.onTimerStartPause();
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

  toggleModalAddInterest(visible) {
    return this.setState({modalAddInterestVisible: visible});
  }

  closeModalAddInterestSuccess = () => {
    this.setState({modalAddInterestVisible: false}, () => {
      Toast.show({
        text: "Le point d'interêt a bien été ajouté",
        buttonText: 'Ok',
        duration: 3000,
        type: 'success',
        position: 'bottom',
      });
    });
  };

  closeModalAddInterest = () => {
    return this.setState({modalAddInterestVisible: false});
  };

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
    var isError = false;
    if (this.state.live.libelleLive == '') {
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
    this.setState(
      {spinner: true, spinnerText: 'Enregistrement en cours...'},
      () => {
        let formData = new FormData();
        formData.append('method', 'updateLive');
        formData.append('auth', ApiUtils.getAPIAuth());
        formData.append('idLive', this.props.currentLive.idLive);
        formData.append('etatLive', 2);
        formData.append('commentLive', this.state.comments);
        formData.append('libelleLive', this.state.libelleLive);
        formData.append('idSport', this.state.selectedSport);
        var acceptChallengeUtilisateur = 0;
        console.log(this.state.acceptChallengeUtilisateur);
        if (
          this.state.acceptChallengeUtilisateur ||
          this.state.acceptChallengeUtilisateur == 1 ||
          this.state.acceptChallengeUtilisateur == 'true'
        ) {
          acceptChallengeUtilisateur = 1;
        }

        formData.append(
          'acceptChallengeUtilisateur',
          acceptChallengeUtilisateur,
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
          .then(response => response.json())
          .then(responseJson => {
            if (responseJson.codeErreur == 'SUCCESS') {
              this.setState({spinner: false, spinnerText: ''});

              this.toggleModal3(false);
              this.onDisconnect(true);

              var action = {
                type: 'UPDATE_ACCEPT_CHALLENGE',
                data: acceptChallengeUtilisateur,
              };
              this.props.dispatch(action);
              // .then(
              //   this.props.navigation.navigate('LiveSummary')
              // );
            } else {
              alert(responseJson.message);
            }
          })
          .catch(e => {
            alert('Un erreur est intervenue. Veuillez réessayer');
            this.setState({spinner: false, spinnerText: ''});
            ApiUtils.logError(
              'simpleMap onSendRequestStop',
              JSON.stringify(e) + ' ' + e.message,
            );
          })
          .then();
      },
    );
  }

  goBack() {
    if (this.props.isRecording) {
      Alert.alert(
        "Quitter l'activité",
        "Si vous quittez l'activité vous allez perdre les données enregistrées. Etes-vous sûr de quitter l'activité ?",
        [
          {
            text: 'Annuler',
            onPress: () => console.log('Cancel Pressed'),
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

  goBackOk() {
    this.onDisconnect(false);
  }

  ignoreActivity = () => {
    Alert.alert(
      "Ignorer l'activité",
      "Si vous ignorez l'activité vous allez perdre les données enregistrées. Etes-vous sûr d'ignorer l'activité ?",
      [
        {
          text: 'Annuler',
          onPress: () => console.log('Cancel Pressed'),
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
    // console.log('currentPorps : ' + JSON.stringify(this.props.currentLive));
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
      .then(response => response.json())
      .then(responseJson => {
        if (responseJson.codeErreur == 'SUCCESS') {
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
      .catch(e => {
        this.setState({spinner: false});
        alert(e);
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
      .then(response => response.json())
      .then(responseJson => {
        var result = [];
        for (var i in responseJson) {
          result.push(responseJson[i]);
        }
        var selectableSports = [];
        result.forEach(function(element, index) {
          var newSelectableSport = {
            value: index,
            label: element,
          };
          selectableSports.push(newSelectableSport);
        });

        var action = {type: 'GET_SPORTS', data: selectableSports};

        this.props.dispatch(action);
      })
      .catch(e => ApiUtils.logError('simpleMap getSports', e.message))
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
  formatphoneNumber(phoneNumber) {}

  onClickInterestPhone(phoneNumber, idInteret) {
    ApiUtils.logStats(
      '',
      idInteret + ';' + this.props.userData.idUtilisateur + ';phone',
    );
    Linking.canOpenURL(`tel:${phoneNumber}`).then(supported => {
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
      '',
      idInteret + ';' + this.props.userData.idUtilisateur + ';web',
    );
    Linking.canOpenURL(url).then(supported => {
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
    console.log(value);
    this.setState({
      selectedSport: value,
    });
  }

  getInvites() {
    if (!!this.props.currentLive) {
      var invites = this.props.currentLive.invites;
      var finalInvites = [];
      if (invites != null) {
        invites.forEach(i => {
          if (i.idUtilisateur != this.props.userData.idUtilisateur) {
            if (
              finalInvites.filter(f => f.idUtilisateur == i.idUtilisateur)
                .length == 0
            ) {
              finalInvites.push(i);
            }
          }
        });
      }

      return finalInvites;
    } else {
      return [];
    }
  }

  toggleTrace(traceName) {
    //update isVisiblede trace name
    var traces = this.props.polylines;

    //TO DO ACTION DISPATCH

    var action = {type: 'TOGGLE_TRACE', data: traceName};
    this.props.dispatch(action);

    // this.setState({ polyline: traces });
  }

  static navigationOptions = {
    drawerLabel: () => null,
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
                    <Text style={{color: 'black', marginLeft : 5}}>
                      {this.props.userData.prenomUtilisateur}
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
              <View style={{flexDirection: 'row', justifyContent: 'flex-end'}}>
                <TouchableOpacity
                  style={styles.headerButton}
                  info
                  onPress={() => this.onClickAddGpx()}>
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
            {this.props.odometer.toFixed(2)} km
          </Text>
        </View>

        {/* <View style={styles.statBanner2}>
          <Text style={styles.timeText}>Vitesse instantanée : {this.state.currentSpeed} km/h</Text>
        </View> */}

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
            top: Platform.OS == 'android' ? 153 : 203,
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
              top: Platform.OS == 'android' ? 153 : 203,
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

        <Root>
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
              latitude: 45.1667, // 44.843884,
              longitude: 5.55,
              latitudeDelta: LATITUDE_DELTA,
              longitudeDelta: LONGITUDE_DELTA,
            }}
            toolbarEnabled={false}>
            <Polyline
              key="polyline"
              coordinates={this.props.coordinates}
              geodesic={true}
              strokeColor="rgba(0,0,0, 1)"
              strokeWidth={6}
              tracksViewChanges={false}
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
                  .filter(pol => pol.isActive == true)
                  .map((polyline, index) => (
                    <Polyline
                      key={polyline.nomTrace + index}
                      onPress={() => this.selectPolyline(polyline)}
                      coordinates={polyline.positionsTrace}
                      tappable={true}
                      tracksViewChanges={false}
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

            {/* {this.props.pointsInterets != null ? this.props.pointsInterets.map((marker) => (
              <Marker
                onPress={() => this.onClickInterestPoint(marker)}
                // onCalloutPress={() => this.onClickInterestPoint(marker)}
                key={marker.id}
                coordinate={marker.coordinates}
                tracksViewChanges={false}

              >
                <ImageBackground
                  style={{ height: 25, width: 20 }}
                  source={MarkerInteret}
                >
                  <Text style={{ width: 25, height: 25 }}></Text>
                </ImageBackground>
                
              </Marker>)) : null
            } */}
          </MapView>

          {this.props.currentMapStyle == 'standard' ||
          this.props.currentMapStyle == 'hybrid' ||
          this.props.currentMapStyle == 'terrain' ? (
            <Fab
              active={this.state.fabActive}
              direction="down"
              containerStyle={{}}
              style={{backgroundColor: '#5067FF'}}
              position="topRight"
              onPress={() => this.setState({fabActive: !this.state.fabActive})}>
              <Icon name={this.getFabDefaultLogo()} type="FontAwesome5" />

              {this.props.currentMapStyle != 'standard' ? (
                <Button
                  style={{backgroundColor: '#34A34F'}}
                  onPress={() =>
                    this.setState({fabActive: false}, () =>
                      this.saveCurrentMapStyle('standard'),
                    )
                  }>
                  <Icon name="map" type="FontAwesome5" />
                </Button>
              ) : null}

              {this.props.currentMapStyle != 'hybrid' ? (
                <Button
                  style={{backgroundColor: '#34A34F'}}
                  onPress={() =>
                    this.setState({fabActive: false}, () =>
                      this.saveCurrentMapStyle('hybrid'),
                    )
                  }>
                  <Icon name="satellite" type="FontAwesome5" />
                </Button>
              ) : null}

              {Platform.OS == 'android' &&
              this.props.currentMapStyle != 'terrain' ? (
                <Button
                  style={{backgroundColor: '#34A34F'}}
                  onPress={() =>
                    this.setState({fabActive: false}, () =>
                      this.saveCurrentMapStyle('terrain'),
                    )
                  }>
                  <Icon name="tree" type="FontAwesome5" />
                </Button>
              ) : null}
            </Fab>
          ) : null}

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
                    active
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
                  <IconElement
                    active
                    name="eye-slash"
                    type="font-awesome"
                    style={styles.toggleRaceLogo}
                  />
                ) : (
                  <IconElement
                    active
                    name="eye"
                    type="font-awesome"
                    style={styles.toggleRaceLogo}
                  />
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

        {/******** modal1 Invités *****************/}
        <Modal
          animationType={'none'}
          transparent={false}
          visible={this.state.modalVisible}
          onRequestClose={() => {
            this.toggleModal(false);
            this.toggleModal2(false);
          }}>
          <Root>
            <View style={styles.modal}>
              <Header style={styles.headerModal}>
                <Body>
                  <View
                    style={{
                      flexDirection: 'row',
                      width: '100%',
                      paddingRight: 0,
                      paddingLeft: 0,
                      marginLeft: 0,
                    }}>
                    <Button
                      style={styles.drawerButton}
                      onPress={() =>
                        this.toggleModal(!this.state.modalVisible)
                      }>
                      <Icon
                        style={styles.saveText}
                        name="chevron-left"
                        type="FontAwesome5"
                      />
                      <Text style={styles.saveText}>Précedent</Text>
                    </Button>
                  </View>
                </Body>
              </Header>
              <View>
                {this.getInvites().length == 0 ? (
                  <Text
                    style={{
                      height: '85%',
                      width: '100%',
                      paddingTop: 40,
                      paddingLeft: 20,
                    }}>
                    Vous n'avez pas encore d'invités
                  </Text>
                ) : (
                  <FlatList
                    style={{height: '85%', width: '100%'}}
                    data={this.getInvites()}
                    renderItem={({item}) => (
                      <Swipeout
                        right={this.swipeoutBtns}
                        autoClose={true}
                        backgroundColor="transparent"
                        rowID={item.idUtilisateur}
                        onOpen={(sectionID, rowID) => {
                          this.setState({
                            sectionID,
                            rowID,
                          });
                        }}>
                        <TouchableHighlight
                          underlayColor="rgba(255,255,255,1,0.6)"
                          // underlayColor='rgba(192,192,192,1,0.6)'
                          // onPress={this.viewLive.bind(this, item)}
                        >
                          <View>
                            <View style={styles.rowContainer}>
                              <View style={styles.line}>
                                <Text
                                  style={{width: '40%', fontWeight: 'bold'}}
                                  numberOfLines={1}
                                  ellipsizeMode="tail">
                                  {' '}
                                  {item.nomUtilisateur} {item.prenomUtilisateur}
                                </Text>
                                <Text style={{width: 180}}>
                                  {' '}
                                  Folocode : {item.folocodeUtilisateur}{' '}
                                </Text>
                              </View>
                            </View>
                          </View>
                        </TouchableHighlight>
                      </Swipeout>
                    )}
                    keyExtractor={(item, index) => index.toString()}
                  />
                )}
              </View>

              <Button
                style={styles.buttonok}
                small
                info
                onPress={() => {
                  this.toggleModal2(!this.state.modal2Visible);
                  this.toggleModal(!this.state.modalVisible);
                }}>
                <IconElement
                  active
                  name="add"
                  type="EvilIcons"
                  style={styles.plusButtonLogo}
                />
              </Button>
            </View>
          </Root>
        </Modal>

        {/******** modal2 Créer un invité *****************/}
        <Modal
          animationType={'none'}
          transparent={false}
          visible={this.state.modal2Visible}
          onRequestClose={() => {
            // this.toggleModal2(!this.state.modal2Visibles);

            this.toggleModal2(false);
            this.toggleModal(true);
          }}>
          <View style={styles.modal}>
            <Header style={styles.headerModal}>
              <Body>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    width: '100%',
                    paddingRight: 0,
                    paddingLeft: 0,
                  }}>
                  <Button
                    style={styles.drawerButton}
                    onPress={() => {
                      this.toggleModal2(!this.state.modal2Visible);
                      this.toggleModal(!this.state.modalVisible);
                    }}>
                    <Icon
                      style={styles.saveText}
                      name="chevron-left"
                      type="FontAwesome5"
                    />
                  </Button>
                  <Button
                    style={styles.saveButton}
                    onPress={() => this.onClickCreateInvite()}
                    disabled={this.isErrorForm()}>
                    <Text style={styles.saveText}>ENREGISTRER</Text>
                  </Button>
                </View>
              </Body>
            </Header>

            <View style={styles.personneForm}>
              <TextInput
                style={styles.inputCode}
                clearButtonMode="always"
                placeholder="Nom *"
                value={this.state.nomPersonne}
                onChangeText={phoneNumber =>
                  this.setState({nomPersonne: phoneNumber})
                }
              />
              <ErrorMessage
                style={styles.errorMessage}
                value={this.state.nomPersonne}
                message="Le nom doit être renseignée"
              />

              <TextInput
                style={styles.inputCode}
                clearButtonMode="always"
                placeholder="Prénom *"
                value={this.state.prenomPersonne}
                onChangeText={phoneNumber =>
                  this.setState({prenomPersonne: phoneNumber})
                }
              />
              <ErrorMessage
                style={styles.errorMessage}
                value={this.state.prenomPersonne}
                message="Le prénom doit être renseigné"
              />

              <TextInput
                style={styles.inputCode}
                clearButtonMode="always"
                placeholder="Téléphone"
                value={this.state.telPersonne}
                onChangeText={phoneNumber =>
                  this.setState({telPersonne: phoneNumber})
                }
              />

              <TextInput
                style={styles.inputCode}
                clearButtonMode="always"
                placeholder="Email"
                value={this.state.mailPersonne}
                onChangeText={phoneNumber =>
                  this.setState({mailPersonne: phoneNumber})
                }
              />

              {this.state.mailPersonne == '' && this.state.telPersonne == '' ? (
                <ErrorMessage
                  style={styles.errorMessage}
                  value={''}
                  message="Le numéro de téléphone ou l'adresse mail doit être renseigné"
                />
              ) : null}

              {this.state.mailPersonne != '' &&
              !ApiUtils.validateEmail(this.state.mailPersonne) ? (
                <ErrorMessage
                  value={''}
                  message="L'adresse email n'est pas valide"
                />
              ) : null}

              <View style={styles.infoIcon}>
                <IconElement active name="info-circle" type="font-awesome" />

                <Text style={styles.textInfo}>
                  Si vous renseignez le numéro de mobile et/ou l'adresse email,
                  un sms et/ou un email sera envoyé à l'utilisateur lui
                  indiquant la marche à suivre pour rejoindre votre live.{' '}
                </Text>
              </View>
            </View>
          </View>
        </Modal>

        {/******** modal3 : finish LIVE *****************/}
        <Modal
          animationType={'none'}
          transparent={false}
          visible={this.state.modal3Visible}
          onRequestClose={() => {
            this.toggleModal3(!this.state.modal3Visible);
          }}>
          {this.state.modal3Visible ? (
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
                <Body style={{justifyContent : 'center'}}>
                    <Text style={{fontWeight : 'bold'}}>Enregistrez votre activité</Text>
                </Body>
                {/* <Right></Right> */}
              </Header>

              <ScrollView contentContainerStyle={styles.loginButtonSection}>
                <View style={styles.loginButtonSection}>
                  <TextInput
                    style={[styles.inputCode,{fontWeight : 'bold'}]}
                    clearButtonMode="always"
                    placeholder="Titre"
                    value={this.state.libelleLive}
                    onChangeText={value => this.onChangeLiveName(value)}
                  />

                  <ErrorMessage
                    style={styles.errorMessage}
                    value={this.state.libelleLive}
                    message="Le titre de la course doit être renseignée"
                  />

                  <View style={styles.picker}>
                    <Picker
                      mode="dropdown"
                      accessibilityLabel={'choisirSport'}
                      iosHeader={'Choisir le sport'}
                      iosIcon={<Icon name="arrow-down" />}
                      style={{marginTop: 0}}
                      selectedValue={this.state.selectedSport}
                      onValueChange={this.onValueSportChange.bind(this)}
                      placeholder={"Choisissez le type d'activité"}
                      placeholderStyle={{color: ApiUtils.getBackgroundColor()}}
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
                      <Picker.Item label={'CLASSSIQUE'} value="14" />
                      <Picker.Item label={'SKATING'} value="15" />
                    </Picker>
                    {/* <RNPickerSelect
                       placeholder={{
                         label: "Choisissez le type d'activité...",
                         value: -1,
                       }}
                       items={this.props.sports}
                       onValueChange={(value) => {
                         this.setState({
                           selectedSport: value,
                         });
                       }}
                       style={{ ...pickerSelectStyles }}
                       value={this.state.selectedSport}
                     /> */}

                    {this.state.selectedSport == -1 ? (
                      <Text
                        style={{
                          marginTop: 10,
                          color: 'red',
                          fontSize: 14,
                          paddingLeft: 5,
                          fontStyle : 'italic'
                        }}>
                        Le type d'activité doit être renseigné
                      </Text>
                    ) : null}

                    <View
                      style={{
                        backgroundColor: this.state.text,
                        borderBottomColor: '#000000',
                        borderBottomWidth: 1,
                        // height: 120,
                        marginBottom: 0,
                        marginTop: 20,
                        paddingTop: 0,
                      }}>
                      <Text style={{fontWeight : 'bold', paddingBottom : 8,borderBottomWidth : 1,
                      borderBottomColor : "#DDDDDD"}}>Commentaire : </Text>
                      <TextInput
                        style={{marginTop: 0}}
                        multiline={true}
                        numberOfLines={4}
                        onChangeText={text => this.setState({comments: text})}
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
                        tyle={{paddingTop: 20}}
                        onValueChange={text => {
                          console.log(text);
                          this.setState({acceptChallengeUtilisateur: text});
                        }}
                        value={this.state.acceptChallengeUtilisateur}
                      />
                      <Text style={{marginLeft: 10}}>
                        J'accepte de participer aux challenges de la foulée blanche 2021
                      </Text>
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
                        tyle={{paddingTop: 20}}
                        onValueChange={text => {
                          console.log(text);
                          this.setState({acceptChallengeNameUtilisateur: text});
                        }}
                        value={this.state.acceptChallengeNameUtilisateur}
                      />
                      <Text style={{marginLeft: 10}}>
                        J'accepte que mon nom apparaisse dans le classement des
                        spéciales
                      </Text>
                    </View>
                  </View>

                  {this.state.spinner ? (
                    <View
                      style={{
                        textAlign: 'center',
                        marginTop: 15,
                        width: '100%',
                      }}>
                      <Spinner color="black" />
                      <Text
                        full
                        style={{textAlign: 'center', alignSelf: 'center'}}>
                        Enregistrement en cours
                      </Text>
                    </View>
                  ) : (
                    <Button
                      style={{
                        marginTop: 10,
                        paddingHorizontal : 50,
                        elevation : 0,
                        alignSelf: 'center',
                        borderColor : this.isErrorFormStop() ? 'black' : ApiUtils.getBackgroundColor(),
                        borderWidth : 1,
                        backgroundColor: this.isErrorFormStop()
                          ? 'transparent'
                          : ApiUtils.getBackgroundColor(),
                      }}
                      onPress={() => this.onClickValidateStop()}
                      disabled={this.isErrorFormStop()}>
                      <Text style={{color :this.isErrorFormStop() ? 'black' : 'white' }}>ENREGISTRER</Text>
                    </Button>
                  )}

                  <View style={{textAlign: 'center', marginTop: -5}}>
                    <Text
                      full
                      style={styles.ignoreActivityLink}
                      onPress={() => this.ignoreActivity()}>
                      Ignorer l'activité
                    </Text>
                  </View>
                </View>
              </ScrollView>
            </View>
          ) : null}
        </Modal>
        {/******** modal4 : Upload interest point  *****************/}
        {/* <Modal
          animationType={'none'}
          transparent={false}
          visible={this.state.modalAddInterestVisible}
          onRequestClose={() => {
            this.closeModalAddInterest();
          }}>
          <AddInterest
            coord={this.props.currentPosition}
            idlive={this.props.currentLive?.idLive}
            onclose={this.closeModalAddInterest}
            onclosesuccess={this.closeModalAddInterestSuccess}
          />
        </Modal> */}

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
              <IconElement active name="times-circle" type="font-awesome" />
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
                                active
                                name="eye-slash"
                                type="font-awesome"
                                style={styles.toggleRaceLogo}
                              />
                            ) : (
                              <IconElement
                                active
                                name="eye"
                                type="font-awesome"
                                style={styles.toggleRaceLogo}
                              />
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
                                style={{alignSelf: 'center', color: 'black'}}
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
          visible={this.state.isModalInterestVisible}
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
              <IconElement
                active
                name="times-circle"
                type="font-awesome"
                style={styles.toggleRaceLogo}
              />
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

        <Footer style={styles.footer}>
          <Body style={styles.footerBody}>
            {!this.props.isRecording ? (
              <Button full style={{backgroundColor : '#39F800'}}
               onPress={this.onstart.bind(this)}>
                       <Text style={[styles.buttonText,{color : 'black'}]}>DEMARRER</Text>
              </Button>
            ) : (
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'flex-start',
                  width: '100%',
                  paddingRight: 0,
                  paddingLeft: 0,
                }}>
                <Button
                  full style={{backgroundColor : '#C7C7C9'}}
                  onPress={this.onTimerPause.bind(this)}>
                  <Text style={[styles.buttonText,{color : 'black'}]}>
                    {this.props.isMoving ? 'PAUSE' : 'RELANCER'}
                  </Text>
                </Button>
                <Button full  onPress={this.onStop.bind(this)} style={{backgroundColor :'#FE3C03'}}>
                <Text style={[styles.buttonText,{color : 'white'}]}>STOP</Text>
                </Button>
              </View>
            )}
          </Body>
        </Footer>
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
    backgroundColor: 'white',
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
    fontWeight : 'bold'
  },
  footer: {
    backgroundColor: ApiUtils.getBackgroundColor(),
    paddingLeft: 0,
    paddingRight: 0,
    height: 56,
  },
  footerBody: {
    justifyContent: 'center',
    flex: 1,
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
    fontStyle : 'italic'
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
    width: 120,
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
    marginTop: 60,
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
    borderWidth: 2,
    zIndex: -1,
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

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 16,
    paddingTop: 13,
    paddingHorizontal: 10,
    paddingBottom: 12,
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 4,
    backgroundColor: 'white',
    color: 'black',
  },
});

export default connect(mapStateToProps)(SimpleMap);
