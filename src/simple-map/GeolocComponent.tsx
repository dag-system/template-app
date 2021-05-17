import React, {Component, useEffect} from 'react';
import {View, Platform, Alert} from 'react-native';
import ApiUtils from '../ApiUtils';
import {connect, useDispatch, useSelector} from 'react-redux';
import Geolocation from '@react-native-community/geolocation';
import BackgroundGeolocation, {
  Config,
  Location,
  LocationError,
} from 'react-native-background-geolocation';
import {check, request, PERMISSIONS, RESULTS} from 'react-native-permissions';
const haversine = require('haversine');
import DefaultProps from '../models/DefaultProps';

import {TemplateDisplayName} from '../globalsModifs';
import AppState from '../models/AppState';

interface Props {
  onUpdatePosition(location: any): void;
}

export default function GeolocComponent(props: Props) {
  const dispatch = useDispatch();
  const {currentLive, isRecording, odometer, userData, isMoving} = useSelector(
    (state: AppState) => state,
  );

  useEffect(() => {
    BackgroundGeolocation.removeAllListeners(() => {
      requestMotionPermission();
      Geolocation.setRNConfiguration({
        authorizationLevel: 'always',
        skipPermissionRequests: false,
      });
      if (isRecording) {
        configGeoloc();
      }
    });
  }, [isRecording, isMoving]);

  const requestMotionPermission = () => {
    check(PERMISSIONS.IOS.MOTION)
      .then((result) => {
        switch (result) {
          case RESULTS.UNAVAILABLE:
            break;
          case RESULTS.DENIED:
            askMotionPermission();
            break;

          case RESULTS.GRANTED:
            break;
          case RESULTS.BLOCKED:
            break;
          default:
        }
      })
      .catch(() => {});
  };

  const askMotionPermission = () => {
    request(PERMISSIONS.IOS.MOTION).then((result) => {
      if (result == RESULTS.DENIED) {
        Alert.alert(
          'Permission refusée',
          'Vous devez accepter cette permission pour avoir un bon enregistrement de votre parcours',
        );
        // Sentry.captureMessage("Motion Permission refusée");
      }
    });
  };

  const configureGeofences = () => {
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
  };

  const configGeoloc = () => {
    var idLive = currentLive?.idLive;

    let config: Config = {
      debug: false,
      distanceFilter: 10,
      url: ApiUtils.getAPIUrl(),
      httpRootProperty: '.',
      httpTimeout: 300000,

      notification: {
        sticky: true,
        title: TemplateDisplayName,
        text: 'Suivi de votre position en cours',
        // channelImportance: BackgroundGeolocation.NOTIFICATION_PRIORITY_LOW,
      },
      enableHeadless: true,
      locationAuthorizationRequest: 'Always',
      backgroundPermissionRationale: {
        title:
          'Autoriser {applicationName} à accèder à votre position en arrière plan',
        message:
          "Pour enregistrer votre activité même quand l'application est en arrière plan, merci d'autoriser {backgroundPermissionOptionLabel}",
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

    if (isRecording) {
      config.params = {
        method: 'createPositions2',
        idLive: idLive,
        auth: ApiUtils.getAPIAuth(),
        idUtilisateur: userData.idUtilisateur,
      };
      config.extras = {
        method: 'createPositions2',
        idLive: idLive,
        auth: ApiUtils.getAPIAuth(),
        idUtilisateur: userData.idUtilisateur,
      };
    }

    BackgroundGeolocation.reset(
      config,
      () => {},
      () => {},
    );

    BackgroundGeolocation.ready(config, () => {
      BackgroundGeolocation.start(() => {
        BackgroundGeolocation.changePace(true);
      });

      BackgroundGeolocation.setConfig(config).then(() => {});
    });

    configureGeofences();
    // Step 1:  Listen to events:
    BackgroundGeolocation.on(
      'location',
      (loc: Location) => onLocation(loc),
      (error: LocationError) => onLocationError(error),
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
  };

  const onLocationError = (error: LocationError) => {
    // Sentry.captureMessage('location Error', JSON.stringify(error));
    ApiUtils.logError(
      'Location Error' +
        'ErrorCode : ' +
        error +
        ' idLive : ' +
        currentLive?.idLive +
        ' ' +
        Platform.OS,
      '',
    );
    if (error == 0) {
      // alert('Nous ne trouvons pas votre position');
    }
  };

  const onLocation = (location: Location) => {
    // //  addMarker(location);
    // console.log('on locaiton event');
    // console.log(location);
    // console.log('on locaiton event is moving : ' + isMoving);
    if (isMoving) {
      addMarker(location);
      props.onUpdatePosition(location);
    } else {
      let isGpsNotOk = location.coords.speed == -1;
      let data = {
        location: location,
        isGpsNotOk: isGpsNotOk,
      };
      var action = {type: 'UPDATE_GPS_OK', data: data};
      dispatch(action);
    }
  };

  const addMarker = (location: any) => {
    if (isMoving) {
      var coordinate = {
        uuid: location.uuid,
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        timestamp: location.timestamp,
        speed: location.coords.speed,
      };

      var action = {type: 'ADD_COORDINATE', data: coordinate};
      dispatch(action);
    }
  };

  return <View></View>;
}
