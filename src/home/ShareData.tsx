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
import Skieur from '../assets/skieur.png';
import ApiUtils from '../ApiUtils';
import {Sponsors} from './Sponsors';
import HeaderComponent from './HeaderComponent';
import ViewShot, {captureRef, captureScreen} from 'react-native-view-shot';
import MapView, {Polyline} from 'react-native-maps';

export default function ShareData(props: any) {
  const card = React.createRef();
  const [snapshot, setSnapshot] = useState();

  const dispatch = useDispatch();

  const [isModalNotificationVisible, setIsModalNotificationVisible] =
    useState(false);

  const [notificationText, setNotificationText] = useState('');
  const [notificationTitle, setNotificationTitle] = useState('');
  const [buttonTitle, setButtonTitle] = useState('');

  const {userData, currentLiveSummary, currentMapStyle} = useSelector(
    (state: AppState) => state,
  );

  const LATITUDE_DELTA = 0.016022;
  const LONGITUDE_DELTA = 0.001221;
  const mapRef = useRef<MapView>(null);
  //   useEffect(() => {
  //     init();
  //   }, []);

  const close = () => {
    props.onClose();
  };

  const ITEM_WIDTH = 300;
  const LOGO_SIZE = 70;
  const PADDING = 10;
  return (
    <View>
      <View
        style={{
          position: 'absolute',
          height: ITEM_WIDTH-30,
          top: 0,
          backgroundColor: 'black',
          opacity: 0.2,
          width: ITEM_WIDTH,
          zIndex: 1000,
        }}></View>

      <View
        style={{
          position: 'absolute',
          zIndex: 1001,
          top: 0,
          display: 'flex',
          flexDirection: 'row',
          width: ITEM_WIDTH,
          // paddingTop: 5,
          paddingHorizontal: PADDING,
        }}>
        <Image
          source={Logo}
          width={LOGO_SIZE}
          height={LOGO_SIZE}
          resizeMode="contain"
          style={{
            width: LOGO_SIZE,
            height: LOGO_SIZE,
          }}
        />
      </View>

      <View
        style={{
          position: 'absolute',
          height: 30,
          top: ITEM_WIDTH-30,
          backgroundColor: 'black',
          opacity: 0.5,
          width: ITEM_WIDTH,
          zIndex: 1000,
        }}></View>
      <View
        style={{
          position: 'absolute',
          zIndex: 1001,
          top: ITEM_WIDTH - PADDING * 3,
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          width: ITEM_WIDTH,
          paddingTop: 5,
          paddingHorizontal: PADDING,
        }}>
        <Text
          style={{
            color: 'white',
            fontWeight :'bold'
          }}>
          {currentLiveSummary.statsLive.distance} km
        </Text>
        <Text
          style={{
            color: 'white',
            fontWeight :'bold'
          }}>
          {currentLiveSummary.libelleLive}
        </Text>
        <Text
          style={{
            color: 'white',
            fontWeight :'bold'
          }}>
          {currentLiveSummary.statsLive.duree}
        </Text>
      </View>
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
