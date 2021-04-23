import React, {useEffect} from 'react';
import {Platform, Alert, Linking, View, Modal} from 'react-native';
import {Container, Content} from 'native-base';
import {useDispatch, useSelector} from 'react-redux';
import ApiUtils from '../ApiUtils';
import Help from './Help';
import DeviceInfo from 'react-native-device-info';
import VersionCheck from 'react-native-version-check';
import BatteryModal from './BatteryModal';

import {TemplateIdOrganisation} from '../globalsModifs';
import AskGpsModal from './AskGpsModal';
import Polyline from '../models/Polyline';
import Interest from '../models/Interest';
import Challenge from '../models/Challenge';
import AppState from '../models/AppState';
import {useNavigation} from '@react-navigation/core';

export default function Introduction() {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const {
    userData,
    isOkPopupBAttery,
    isOkPopupBAttery2,
    isOkPopupGps,
  } = useSelector((state: AppState) => state);

  useEffect(() => {
    if (userData != null && isOkPopupBAttery) {
      onClickNavigate('SimpleMap');
    }
    downloadData();
  }, [navigation]);

  const downloadData = () => {
    getPhoneData();
    getNewVersion();

    getinformationStation();
  };

  const getNewVersion = () => {
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

          var finalTraceArray: Polyline[] = []; // new Object(this.props.polylines);
          var finalinterestArray: Interest[] = [];
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

          var challengesArray: Challenge[] = Object.values(result.challenges);

          var finalChallengesArray: Challenge[] = []; // new Object(this.props.polylines);

          if (challengesArray != null && challengesArray.length != 0) {
            challengesArray.forEach((challenge) => {
              var finalChallenge = challenge;

              var positionArray = Object.values(challenge.positionsTrace);
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
          };

          var action = {type: 'UPDATE_STATION_DATA', data: station};
          dispatch(action);
        }
      })
      // .catch(e => alert('test', JSON.stringify(e)))
      .then();
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

    let data = {
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

  const onClickNavigate = (routeName: string) => {
    navigation.navigate(routeName);
  };

  return (
    <Content style={{backgroundColor: ApiUtils.getBackgroundColor()}}>
      <Modal visible={!isOkPopupBAttery}>
        <Container style={{flex: 1}}>
          <View style={{flex: 1}}>
            <Help noHeader={true} />
          </View>
        </Container>
      </Modal>

      <Modal visible={!isOkPopupBAttery2 && isOkPopupBAttery}>
        <Container style={{flex: 1}}>
          <View style={{flex: 1}}>
            <BatteryModal noHeader={true} />
          </View>
        </Container>
      </Modal>

      <Modal visible={isOkPopupBAttery2 && isOkPopupBAttery && !isOkPopupGps}>
        <Container style={{flex: 1}}>
          <View style={{flex: 1, justifyContent: 'center'}}>
            <AskGpsModal onValidate={() => onClickNavigate('SimpleMap')} />
          </View>
        </Container>
      </Modal>
    </Content>
  );
}