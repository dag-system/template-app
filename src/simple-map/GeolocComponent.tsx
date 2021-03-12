import React, {Component} from 'react';
import {View, Platform, Alert} from 'react-native';
import ApiUtils from '../ApiUtils';
import {connect} from 'react-redux';
import Geolocation from '@react-native-community/geolocation';
import BackgroundGeolocation from 'react-native-background-geolocation';
import {check, request, PERMISSIONS, RESULTS} from 'react-native-permissions';
const haversine = require('haversine');
import DefaultProps from '../models/DefaultProps';

const mapStateToProps = (state) => {
  return {
    isRecording: state.isRecording,
    currentLive: state.currentLive,
    userData: state.userData,
    coordinates: state.coordinates,
    isMoving: state.isMoving,
    odometer: state.odometer,
  };
};

interface Props extends DefaultProps {
  isRecording: boolean;
  currentLive: any;
  userData: any;
  dates: any[];
  odometer: any;
  isMoving: boolean;
}

interface State {}

class GeolocComponent extends Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {};
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

  componentDidMount() {
    setTimeout(() => this.didMount(), 300);
  }
  didMount() {
    if (this.props.currentLive == null) {
      //  this.onDisconnect(false);
      this.props.navigation.navigate('Lives');
    } else {
      this.requestMotionPermission();
      Geolocation.setRNConfiguration({
        authorizationLevel: 'always',
        skipPermissionRequests: false,
      });
      this.configGeoloc();
    }
  }

  componentWillUnmount() {
    BackgroundGeolocation.removeAllListeners();
  }

  async calcDistance(oldLatLong, newLatLng) {
    var dist = haversine(oldLatLong, newLatLng);

    var odometerDataNew = {
      odometer: this.props.odometer + dist,
    };

    var action = {type: 'UPDATE_ODOMETER', data: odometerDataNew};
    this.props.dispatch(action);
  }

  configureGeofences() {
    let geofences = [
      {
        identifier: 'foo',
        radius: 200,
        latitude: 37.33016634,
        longitude: -122.02686902,
        notifyOnEntry: true,
        notifyOnExit: true,
      },
      {
        identifier: 'bar',
        radius: 200,
        latitude: 45.51921926,
        longitude: -122.0306692,
        notifyOnEntry: true,
        notifyOnExit: true,
      },
    ];

    BackgroundGeolocation.addGeofences(geofences);
  }

  configGeoloc() {
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
        title: 'My Cross',
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
      BackgroundGeolocation.start(() => {
        BackgroundGeolocation.changePace(true);
      });

      BackgroundGeolocation.setConfig(config).then(() => {});
    });

    this.configureGeofences();
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

    BackgroundGeolocation.onGeofence((event) => {
      console.log('[onGeofence] ', event);
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
      }).then(() => {});
    });
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

  onLocation(location) {
    if (this.props.isMoving) {
      this.addMarker(location);
      this.props.onUpdatePosition(location);
    } else {
      let isGpsNotOk = location.coords.speed == -1;
      let data = {
        location: location,
        isGpsNotOk: isGpsNotOk,
      };
      var action = {type: 'UPDATE_GPS_OK', data: data};
      this.props.dispatch(action);
    }
  }

  async addMarker(location) {
    var coordinate = {
      uuid: location.uuid,
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      timestamp: location.timestamp,
      speed: location.coords.speed,
    };

    // if (this.props.coordinates.length > 0) {
    //   var lastPos = this.props.coordinates[this.props.coordinates.length - 1];
    //   var newPost = coordinate;
    //   this.calcDistance(lastPos, newPost);
    // }

    var action = {type: 'ADD_COORDINATE', data: coordinate};
    this.props.dispatch(action);
  }

  render() {
    return <View></View>;
  }
}

export default connect(mapStateToProps)(GeolocComponent);
