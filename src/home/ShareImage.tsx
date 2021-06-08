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
import ShareData from './ShareData';

export default function ShareImage(props: any) {
  const card = React.createRef();
  const [snapshot, setSnapshot] = useState();

  const dispatch = useDispatch();

  const [isModalNotificationVisible, setIsModalNotificationVisible] =
    useState(false);

  const [notificationText, setNotificationText] = useState('');
  const [notificationTitle, setNotificationTitle] = useState('');
  const [buttonTitle, setButtonTitle] = useState('');

  const {userData, currentLiveSummary} = useSelector(
    (state: AppState) => state,
  );

  //   useEffect(() => {
  //     init();
  //   }, []);

  const close = () => {
    props.onClose();
  };

  const ITEM_WIDTH = 300;
  const LOGO_SIZE = 50;
  const PADDING = 10;
  return (
    <View>
      <ShareData />

      {props.image == null ? (
        <Image
          source={Skieur}
          width={ITEM_WIDTH}
          resizeMode="cover"
          style={{width: ITEM_WIDTH, height: ITEM_WIDTH}}
        />
      ) : (
        <View>
          <Image
            source={{
              uri: `data:${props.image.mime};base64,${props.image.data}`,
            }}
            width={ITEM_WIDTH}
            resizeMode="cover"
            style={{width: ITEM_WIDTH, height: ITEM_WIDTH}}
          />
        </View>
      )}
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
