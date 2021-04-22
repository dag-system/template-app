import React, {Component} from 'react';
import {
  Platform,
  StyleSheet,
  Alert,
  Linking,
  View,
  TextInput,
  Image,
  FlatList,
  TouchableHighlight,
  ActivityIndicator,
  Modal,
} from 'react-native';
import {
  Container,
  Header,
  Content,
  Footer,
  Left,
  Body,
  Right,
  Card,
  CardItem,
  Text,
  H1,
  Button,
  Title,
  Form,
  Item,
  Input,
  Label,
  H3,
} from 'native-base';
import {connect} from 'react-redux';
import ApiUtils from '../ApiUtils';
import Help from './Help';
import RNPusherPushNotifications from 'react-native-pusher-push-notifications';
import DeviceInfo from 'react-native-device-info';
import VersionCheck from 'react-native-version-check';
import BatteryModal from './BatteryModal';

import {TemplateIdOrganisation} from '../globalsModifs';
import AskGpsModal from './AskGpsModal';

const mapStateToProps = (state) => {
  return {
    userData: state.userData,
    recordingState: state.recordingState,
    lives: state.lives,
    sports: state.sports,
    isOkPopupBAttery: state.isOkPopupBAttery,
    isOkPopupBAttery2: state.isOkPopupBAttery2,
    isOkPopupGps: state.isOkPopupGps,
  };
};

class Introduction extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    setTimeout(() => this.didMount(), 300);
  }

  didMount() {
    if (this.props.userData != null && this.props.isOkPopupBAttery) {
      this.onClickNavigate('SimpleMap');
    }
    this.downloadData();
  }

  async downloadData() {
    // this.init();
    this.getPhoneData();
    this.getNewVersion();

    this.getinformationStation();
  }

  async getNewVersion() {
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

  async getinformationStation() {
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

          var finalTraceArray = []; // new Object(this.props.polylines);
          var finalinterestArray = [];
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

          var finalChallengesArray = []; // new Object(this.props.polylines);

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
          this.props.dispatch(action);
        }
      })
      // .catch(e => alert('test', JSON.stringify(e)))
      .then();
  }

  getPhoneData() {
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
    this.props.dispatch(action);
  }

  onClickNavigate(routeName) {
    this.props.navigation.navigate(routeName);
  }

  init = () => {
    RNPusherPushNotifications.setInstanceId(
      '653e46e5-9ff8-48ae-9591-feaa4054023e',
    );

    RNPusherPushNotifications.on('registered', () => {
      this.subscribe('debug-' + this.props.userData.idUtilisateur);
      RNPusherPushNotifications.on('notification', this.handleNotification);
    });
  };

  subscribe = (interest) => {
    console.log(`Subscribing to "${interest}"`);
    RNPusherPushNotifications.subscribe(
      interest,
      (statusCode, response) => {
        console.error(statusCode, response);
      },
      () => {
        console.log(`CALLBACK: Subscribed to ${interest}`);
      },
    );
  };

  handleNotification = (notification) => {
    console.log('LALA');

    if (notification.data != null) {
      console.log(notification.data.TSLocationManager);

      if (notification.data.TSLocationManager == 'true') {
        console.log('ici');
        return;
      }
    }

    console.log(notification);
    if (Platform.OS == 'ios') {
      console.log(notification.userInfo.data.notification);
      let actionData = notification.userInfo.data.notification;
      var action = {
        type: 'ADD_NOTIFICATION',
        data: actionData,
      };
      let idLive = actionData.idLive;

      let live = {
        idLive: idLive,
      };

      switch (notification.appState) {
        case 'inactive':
          console.log('inactive');
          // this.props.dispatch(action);
          // var actionSaveLive = {type: 'SAVE_CURRENT_LIVE', data: live};

          // this.props.dispatch(actionSaveLive);

          // this.onClickNavigate('LiveSummary');

          this.setState({
            isVisibleNotifcationModal: true,
            idLiveNotif: actionData.idLive,
          });
          this.props.dispatch(action);

        // inactive: App came in foreground by clicking on notification.
        //           Use notification.userInfo for redirecting to specific view controller
        case 'background':
        // background: App is in background and notification is received.
        //             You can fetch required data here don't do anything with UI
        case 'active':
          console.log('active');
          // App is foreground and notification is received. Show a alert or something.
          this.setState({
            isVisibleNotifcationModal: true,
            idLiveNotif: actionData.idLive,
          });
          this.props.dispatch(action);
        default:
          break;
      }
    } else {
      console.log('data: handleNotification (android)');

      if (notification.data != '') {
        let datastring = notification.data.notification;
        let data = JSON.parse(datastring);

        let idLive = data.idLive;
        let live = {
          idLive: idLive,
        };

        let actionData = JSON.parse(notification.data.notification);
        var action = {
          type: 'ADD_NOTIFICATION',
          data: actionData,
        };

        if (notification.data.collapse_key != null) {
          //from notification click
          if (!this.props.isRecording) {
            var actionSaveLive = {type: 'SAVE_CURRENT_LIVE', data: live};

            this.props.dispatch(actionSaveLive);

            this.onClickNavigate('LiveSummary');
          } else {
            this.props.dispatch(action);
          }
        } else {
          this.setState({
            isVisibleNotifcationModal: true,
            idLiveNotif: data.idLive,
          });
          this.props.dispatch(action);
        }
      }
    }
  };

  render() {
    return (
      <Content style={{backgroundColor: ApiUtils.getBackgroundColor()}}>
        <Modal visible={!this.props.isOkPopupBAttery}>
          <Container style={{flex: 1}}>
            <View style={{flex: 1}}>
              <Help noHeader={true} />

              {/* <View style={{height: 300}} /> */}
            </View>
          </Container>
        </Modal>

        <Modal
          visible={
            !this.props.isOkPopupBAttery2 && this.props.isOkPopupBAttery
          }>
          <Container style={{flex: 1}}>
            <View style={{flex: 1}}>
              <BatteryModal noHeader={true} />

              {/* <View style={{height: 300}} /> */}
            </View>
          </Container>
        </Modal>

        <Modal
          visible={
            this.props.isOkPopupBAttery2 &&
            this.props.isOkPopupBAttery &&
            !this.props.isOkPopupGps
          }>
          <Container style={{flex: 1}}>
            <View style={{flex: 1, justifyContent :'center'}}>
              <AskGpsModal
                noHeader={true}
                onValidate={() => this.onClickNavigate('SimpleMap')}
              />
              {/* <View style={{height: 300}} /> */}
            </View>
          </Container>
        </Modal>
      </Content>
    );
  }
}

const styles = StyleSheet.create({
  icon: {
    width: 24,
    height: 24,
  },
});

export default connect(mapStateToProps)(Introduction);
