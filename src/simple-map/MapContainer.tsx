import React, {Component, useEffect, useRef, useState} from 'react';
import {StyleSheet, Platform, Linking, Alert} from 'react-native';
import {Container, Drawer, Footer, View} from 'native-base';
import {connect, useDispatch, useSelector} from 'react-redux';
import MapHeader from './MapHeader';
import MapButtons from './MapButtons';
import Map from './Map';
import GeolocComponent from './GeolocComponent';
import DefaultProps from '../models/DefaultProps';
import Sidebar from '../home/SideBar';
import TraceModal from '../home/TraceModal';
import {Sponsors} from '../home/Sponsors';
import VersionCheck from 'react-native-version-check';
import DeviceInfo from 'react-native-device-info';
import {useNavigation, useFocusEffect} from '@react-navigation/core';
import {
  TemplateAppName,
  TemplateIdOrganisation,
  TemplateSportLive,
  TemplateArrayImagesSponsorPath,
} from '../globalsModifs';
import ApiUtils from '../ApiUtils';
import Interest from '../models/Interest';
import AppState from '../models/AppState';
import PhoneData from '../models/PhoneData';

interface State {
  isModalTraceVisible: boolean;
  isDemo: boolean;
}

export default function MapContainer() {
  const dispatch = useDispatch();

  let drawer: any;

  const [isModalTraceVisible, setIsModalTraceVisible] = useState(false);
  const [isDemo, setIsDemo] = useState(false);
  const mapRef = useRef<any>(null);
  const geolocComponent = useRef<any>(null);

  const navigation = useNavigation();
  const {isRecording, userData} = useSelector((state: AppState) => state);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      // do something
      downloadData();
    });

    return unsubscribe;
  }, [isRecording]);

  const onUpdatePosition = (pos: any) => {
    mapRef?.current?.onUpdatePosition(pos);
  };

  const onCenter = () => {
    mapRef?.current?.onCenter();
  };

  const onStart = () => {
    geolocComponent.current.configGeoloc();
  };

  const closeDrawer = () => {
    if (drawer != null && drawer._root != null) drawer._root.close();
  };

  const onDrawer = () => {
    drawer._root.open();
    // drawerRef.current.open();
  };

  const openTraceModal = (isDemo: boolean) => {
    setIsModalTraceVisible(true);
    setIsDemo(isDemo);
  };

  const closeTraceModal = () => {
    setIsModalTraceVisible(false);
  };

  const centerOnTrace = (trace: any) => {
    closeTraceModal();

    mapRef?.current?.centerMapOnTrace(trace);
  };

  const showDemoTrace = (trace: any) => {
    closeTraceModal();
    navigation.navigate('DemoMap');
  };

  const centerOnPoi = (interest: Interest) => {
    closeTraceModal();
    mapRef?.current?.centerOnPoi(interest);
  };

  const getPhoneData = () => {
    let brand = DeviceInfo.getBrand();

    let androidId = DeviceInfo.getAndroidIdSync();
    let systemVersion = DeviceInfo.getSystemVersion();
    let deviceId = DeviceInfo.getDeviceId();

    let device = DeviceInfo.getDeviceSync();

    let model = DeviceInfo.getModel();

    let manufacturer = DeviceInfo.getManufacturerSync();
    let hardware = DeviceInfo.getHardwareSync();
    let apiLevel = DeviceInfo.getApiLevelSync();

    let data: PhoneData = {
      brand: brand,
      androidId: androidId,
      systemVersion: systemVersion,
      deviceId: deviceId,
      device: device,
      model: model,
      manufacturer: manufacturer,
      hardware: hardware,
      apiLevel: apiLevel,
    };

    var action = {type: 'UPDATE_PHONE_DATA', data: data};
    dispatch(action);
  };

  const downloadData = () => {
    getPhoneData();
    getNewVersion();

    getinformationStation();
    getLives(userData.idUtilisateur);
  };

  const getLives = (idUtilisateur: number) => {
    let formData = new FormData();
    formData.append('method', 'getLives');
    formData.append('auth', ApiUtils.getAPIAuth());
    formData.append('idUtilisateur', idUtilisateur);

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
        var action = {type: 'GET_LIVES', data: responseJson};
        dispatch(action);
      })
      .catch((e) => {
        console.log(e);
        ApiUtils.logError('getLives', e.message);
      });
  };

  const getinformationStation = () => {
    const formData = new FormData();
    formData.append('method', 'getInformationStation');
    formData.append('auth', ApiUtils.getAPIAuth());
    formData.append('idStation', TemplateIdOrganisation);
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
        //save values in cache

        var result = responseJson;

        if (result.traces != null && result.traces.length != 0) {
          var tracesArray = Object.values(result.traces);

          var finalTraceArray: any[] = [];
          var finalinterestArray: any = [];
          if (tracesArray != null && tracesArray.length != 0) {
            tracesArray.forEach((trace: any) => {
              var finalTrace = trace;

              var positionArray = Object.values(trace.positionsTrace);
              trace.positionsTrace = positionArray;

              finalTrace = {
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

          //challenges

          var challengesArray = Object.values(result.challenges);

          var finalChallengesArray: any[] = [];

          if (challengesArray != null && challengesArray.length != 0) {
            challengesArray.forEach((challenge: any) => {
              var finalChallenge: any = challenge;

              var positionArray: any = Object.values(challenge.positionsTrace);
              challenge.positionsTrace = positionArray;

              finalChallenge = {
                positionsTrace: positionArray,
                idChallenge: finalChallenge.idChallenge,
                libelleChallenge: finalChallenge.libelleChallenge,
                distanceChallenge: finalChallenge.distanceChallenge,
                gpxChallenge: finalChallenge.gpxChallenge,
                dateDebutChallenge: finalChallenge.dateDebutChallenge,
                dateFinChallenge: finalChallenge.dateFinChallenge,
              };

              finalChallengesArray.push(finalChallenge);
            });
          }

          if (result.interets != null && result.interets.length != 0) {
            var interestArray = Object.values(result.interets);
            var count = 0;
            interestArray.forEach((interest: any) => {
              var coordinate = {
                latitude: parseFloat(interest.latitudeInteret),
                longitude: parseFloat(interest.longitudeInteret),
              };

              var finalInterest = {
                id: 'interest' + count,
                idInteret: interest.idInteret,
                idStation: interest.idStation,
                coordinates: coordinate,
                libelleInteret: interest.libelleInteret,
                couleurTrace: interest.couleurTrace,
                descriptionInteret: interest.descriptionInteret,
                telephoneInteret: interest.telephoneInteret,
                lienInteret: interest.lienInteret,
                photoInteret: interest.photoInteret,
                description: '',
              };

              if (
                finalInterest.descriptionInteret == null &&
                interest.externalData != null
              ) {
                var extraData = JSON.parse(interest.externalData);
                if (
                  extraData.hasDescription.length > 0 &&
                  extraData.hasDescription[0] != null
                ) {
                  if (
                    extraData.hasDescription[0].shortDescription != null &&
                    extraData.hasDescription[0].shortDescription.length > 1
                  ) {
                    finalInterest.description =
                      extraData.hasDescription[0].shortDescription[1];
                  } else {
                    finalInterest.description =
                      extraData.hasDescription[0].shortDescription[0];
                  }
                }
              }
              if (interest.actifInteret == '1') {
                finalinterestArray.push(finalInterest);
                count++;
              }
            });
          }

          var station = {
            nomStation: result.nomStation,
            descriptionStation: result.descriptionStation,
            polylines: finalTraceArray,
            pointsInterets: finalinterestArray,
            challenges: finalChallengesArray,
            statistics: {
              nbKmTotal: result.nbKmTotal,
              nbActivites: result.nbActivites,
              nbUtilisateurs: result.nbUtilisateurs,
              nbClasses: result.nbClasses,
              nbKmEfforts: result.nbKmEfforts,
            },
          };

          var action = {type: 'UPDATE_STATION_DATA', data: station};
          dispatch(action);
        }
      })
      // .catch(e => alert('test', JSON.stringify(e)))
      .then();
  };

  const getNewVersion = () => {
    if (!isRecording) {
      VersionCheck.needUpdate({
        depth: Platform.OS == 'android' ? 3 : 2,
      }).then((res) => {
        if (res.isNeeded) {
          Alert.alert(
            'Nouvelle version disponible',
            "Une nouvelle version de l'application est disponible",
            [
              {
                text: 'Annuler',
                style: 'cancel',
              },
              {
                text: 'Télécharger',
                onPress: () => Linking.openURL(res.storeUrl),
              },
            ],
            {cancelable: false},
          );
        }
      });
    }
  };

  return (
    <Drawer
      ref={(ref) => {
        drawer = ref;
      }}
      // ref={drawerRef}
      content={
        <Sidebar
          navigation={navigation}
          drawer={drawer}
          selected="Map"
          closeDrawer={closeDrawer}
        />
      }>
      <Container style={styles.container}>
        <GeolocComponent onUpdatePosition={(pos) => onUpdatePosition(pos)} />
        <MapHeader navigation={navigation} ondrawer={() => onDrawer()} />
        <MapButtons
          onCenter={() => onCenter()}
          openTraceModal={(isDemo) => openTraceModal(isDemo)}
          onStart={() => {
            onStart();
          }}
        />
        <Map ref={mapRef} />

        {TemplateArrayImagesSponsorPath.length > 0 ? (
          <Footer style={{backgroundColor: 'white', paddingBottom: 64}}>
            <Sponsors />
          </Footer>
        ) : null}

        <TraceModal
          isVisible={isModalTraceVisible}
          onClose={() => closeTraceModal()}
          centerOnTrace={(trace) => centerOnTrace(trace)}
          showDemoTrace={(trace) => showDemoTrace(trace)}
          centerOnPoi={(poi) => centerOnPoi(poi)}
          isDemo={isDemo}
        />
      </Container>
    </Drawer>
  );
}

const styles = StyleSheet.create({
  map: {
    flex: 1,
    borderColor: 'black',
    borderWidth: 0,
    zIndex: 1,
  },
  container: {
    backgroundColor: 'transparent',
    fontFamily: 'Roboto',
    flex: 1,
  },
});

// export default connect(mapStateToProps)(MapContainer);
