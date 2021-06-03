import React, {useEffect, useRef, useState} from 'react';
import {
  StyleSheet,
  Platform,
  Alert,
  Text,
  Modal,
  Image,
  TouchableOpacity,
} from 'react-native';
import {
  Body,
  Container,
  Content,
  H1,
  H2,
  Header,
  Icon,
  Left,
  Right,
  View,
} from 'native-base';
import GlobalStyles from '../styles';
import {useDispatch, useSelector} from 'react-redux';
import AppState from '../models/AppState';
import RNPusherPushNotifications from 'react-native-pusher-push-notifications';
import {
  TemplateAppName,
  TemplateBackgroundColor,
  TemplateDisplayName,
  textAutoBackgroundColor,
} from '../globalsModifs';
// import Logovdm from '../assets/sponsor_logo4.png';
import Logo from '../assets/logo.png';
import ApiUtils from '../ApiUtils';
import {Sponsors} from './Sponsors';
import HeaderComponent from './HeaderComponent';

export default function NotificationManager() {
  const dispatch = useDispatch();

  const [isModalNotificationVisible, setIsModalNotificationVisible] =
    useState(false);

  const [notificationText, setNotificationText] = useState('');
  const [notificationTitle, setNotificationTitle] = useState('');
  const [buttonTitle, setButtonTitle] = useState('');

  const {userData} = useSelector((state: AppState) => state);

  useEffect(() => {
    init();
  }, []);

  useEffect(() => {
    init();
  }, [userData]);

  const init = () => {
    console.log('init');
    RNPusherPushNotifications.setInstanceId(
      'ee65d394-91cd-457e-b830-ffa1f4468545',
    );

    // subscribe('debug-' + TemplateAppName);
    // subscribe('debug-' + TemplateAppName+"-"+Platform.OS);
    // RNPusherPushNotifications.on('notification', handleNotification);
    RNPusherPushNotifications.on('registered', () => {
      subscribe('debug-' + TemplateAppName);
      subscribe('debug-' + TemplateAppName + '-' + Platform.OS);
      if (userData != null) {
        console.log('subscribe');
        console.log(userData);
        subscribe('debug-' + userData.idUtilisateur);
      }
      // this.subscribe('debug-' + this.props.userData.idUtilisateur);
      RNPusherPushNotifications.on('notification', handleNotification);
    });
  };

  const subscribe = (interest) => {
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

  const closeModal = () => {
    setIsModalNotificationVisible(false);
  };

  const handleNotification = (notification) => {
    console.log('LALA');
    console.log(notification);

    if (notification.data != null) {
      if (notification.data.TSLocationManager == 'true') {
        return;
      }
    }
    setIsModalNotificationVisible(true);
    if (Platform.OS == 'ios') {
      let actionData = notification.userInfo.data.notification;

      setNotificationText(actionData.text);
      setNotificationTitle(actionData.title);
      setButtonTitle(actionData.buttonText);
      switch (notification.appState) {
        case 'inactive':
        // Alert.alert(actionData.text);

        // inactive: App came in foreground by clicking on notification.
        //           Use notification.userInfo for redirecting to specific view controller
        case 'background':
        // background: App is in background and notification is received.
        //             You can fetch required data here don't do anything with UI
        case 'active':
        // App is foreground and notification is received. Show a alert or something.
        // Alert.alert(actionData.text);

        default:
          break;
      }
    } else {
      console.log(notification.data);
      if (notification.data != '') {
        // let datastring = notification.data.notification;
        if (notification.data.notification != null) {
          console.log('start parse notification');
          let actionData = JSON.parse(notification.data.notification);
          setNotificationText(actionData.text);
          setNotificationTitle(actionData.title);
          setButtonTitle(actionData.buttonText);
        }

        // Alert.alert(actionData.text);
        // if (notification.data.collapse_key != null) {

        // } else {
        // }
      }
    }
  };

  return (
    <View>
      <Modal
        visible={isModalNotificationVisible}
        style={{backgroundColor: 'white'}}>
        <HeaderComponent
          onPressBack={() => {
            closeModal()
          }}
          mode="back"
        />

        <Container>
          <Content style={{padding: 20}}>
            <H2 style={{textAlign: 'center', marginBottom: 20}}>
              {notificationTitle}
            </H2>

            <Text style={{textAlign: 'center'}}>{notificationText}</Text>

            <View
              style={{
                justifyContent: 'center',
                alignContent: 'center',
                display: 'flex',
                flexDirection: 'row',
                marginTop: 30,
              }}>
              <TouchableOpacity
                style={[
                  GlobalStyles.button,
                  {
                    width: '80%',
                    elevation: 0,
                    borderColor: 'black',
                    borderWidth: 1,
                    padding: 10,
                    backgroundColor: TemplateBackgroundColor,
                  },
                ]}
                onPress={() => closeModal()}>
                <Text style={{color: 'white', textAlign: 'center'}}>
                  {buttonTitle}
                </Text>
              </TouchableOpacity>
            </View>
          </Content>
          <Sponsors />
        </Container>

        {/* <Text>{notificationText}</Text> */}
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  logo: {},
  header: {
    backgroundColor: ApiUtils.getBackgroundColor(),
  },
});

// export default connect(mapStateToProps)(MapContainer);
