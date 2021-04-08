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
  ActivityIndicator,Modal,
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
const mapStateToProps = (state) => {
  return {
    userData: state.userData,
    recordingState: state.recordingState,
    lives: state.lives,
    sports: state.sports,
    isOkPopupBAttery : state.isOkPopupBAttery
  };
};

class Introduction extends Component {
  constructor(props) {
    super(props);
    this.state = {
    }
  }

  componentDidMount() {
   
  }

  async downloadData() {
    this.init();
    this.getPhoneData();
    await this.getNewVersion();
    await this.getLives(this.props.userData.idUtilisateur);

    await this.getinformationStation();
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
        <Modal
          visible={!this.props.isOkPopupBAttery || this.state.isOpenModalHelp}>
          <Container style={{flex: 1}}>
            <View style={{flex: 1}}>
              <Help noHeader={true} />

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
