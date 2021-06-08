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
import ShareData from './ShareData';

export default function ShareMap(props: any) {
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
  const [interval, setCurrentInterval] = useState<any>();

  const LATITUDE_DELTA = 0.016022;
  const LONGITUDE_DELTA = 0.001221;
  const mapRef = useRef<MapView>(null);

  useEffect(() => {
    let currentInterval = setInterval(() => {
      centerMap();
    }, 1000);
    setCurrentInterval(currentInterval);
    return () => clearInterval(interval);
  }, [currentLiveSummary]);

  const centerMap = () => {

    console.log('center map')
    if (currentLiveSummary.coordinates.length != 0) {
      console.log('center map if')
      mapRef?.current?.fitToCoordinates(currentLiveSummary.coordinates, {
        edgePadding: {top: 10, right: 10, bottom: 10, left: 10},
        animated: true,
      });
    }

    // if (
    //   this.state.coordinates != null &&
    //   this.state.coordinates.length != 0 &&
    //   this.refs.map != null
    // ) {
    //   this.refs.map.fitToCoordinates(this.state.coordinates, {
    //     edgePadding: {top: 10, right: 10, bottom: 10, left: 10},
    //     animated: true,
    //   });
    // }
  };

  const ITEM_WIDTH = 300;
  const LOGO_SIZE = 50;
  const PADDING = 10;
  return (
    <View>
      <ShareData />
  

      <MapView
        // ref="map"
        ref={mapRef}
        style={{
          height: ITEM_WIDTH,
          width: ITEM_WIDTH,
        }}
        mapType={currentMapStyle}
        showsUserLocation={false}
        followsUserLocation={false}
        showsMyLocationButton={false}
        showsPointsOfInterest={false}
        showsScale={false}
        showsTraffic={false}
        // onPress={(coordinate) => { this.showMapFullSize() }}
        toolbarEnabled={false}
        initialRegion={{
          latitude: 45.78728972333324, // 44.843884,
          longitude: 4.874593511376774,
          latitudeDelta: LATITUDE_DELTA,
          longitudeDelta: LONGITUDE_DELTA,
        }}
        onLayout={() => centerMap()}>
        {currentLiveSummary.coordinates != null &&
        currentLiveSummary.coordinates.length > 0 ? (
          <Polyline
            key="polyline"
            coordinates={currentLiveSummary.coordinates}
            geodesic={true}
            strokeColor="rgba(63,170,239, 1)"
            strokeWidth={3}
            zIndex={12}
          />
        ) : null}
      </MapView>

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
