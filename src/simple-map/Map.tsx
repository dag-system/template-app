import React, {
  forwardRef,
  PureComponent,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  FlatList,
  View,
  ScrollView,
  Platform,
  TouchableHighlight,
  Image,
  ImageBackground,
  Modal,
  Linking,
  Alert,
} from 'react-native';
import {Icon, Text, Button} from 'native-base';
import {connect, useSelector} from 'react-redux';
import MarkerInteret from '../assets/marker.png';
import MapView, {LatLng, Marker, Polyline} from 'react-native-maps';
import {ReactNativeModal as ModalSmall} from 'react-native-modal';
import {Icon as IconElement} from 'react-native-elements';
import {isPointInPolygon} from 'geolib';
import BatteryModal from '../home/BatteryModal';
import DefaultProps from '../models/DefaultProps';
import ApiUtils from '../ApiUtils';
import Carousel, {Pagination} from 'react-native-snap-carousel';
import MapCarousel from './MapCarousel';
import MapStatBanner from './MapStatBanner';
import Interest from '../models/Interest';
import AppState from '../models/AppState';
import PolylineModel from '../models/Polyline';

const LATITUDE_DELTA_CLOSE = 0.02922;
const LONGITUDE_DELTA_CLOSE = 0.02421;

const LATITUDE_DELTA = 0.016022;
const LONGITUDE_DELTA = 0.001221;

const mapStateToProps = (state: AppState) => {
  return {
    currentMapStyle: state.currentMapStyle,
    coordinatesString: state.coordinatesString,
    polylines: state.polylines,
    currentPosition: state.currentPosition,
    isGpsNotOk: state.isGpsNotOk,
    isRecording: state.isRecording,
    pointsInterets: state.pointsInterets,
  };
};

interface Props {
  dispatch(action: any): void;
  currentMapStyle: string;
  coordinatesString: string;
  polylines: any[];
  currentPosition: any;
  isGpsNotOk: boolean;
  isRecording: boolean;
  pointsInterets: any[];
}

interface State {
  ismodalBatteryOpen: boolean;
  isModalTraceVisible: boolean;
  currentPolyline: any;
  refresh: boolean;
  currentInteret: any;
  isModalInterestVisible: boolean;
}

const Map = forwardRef((props, ref) => {
  const [currentInteret, setCurrentInteret] = useState<Interest>();
  const [currentPolyline, setCurrentPolyline] = useState<PolylineModel>();
  const [isModalInterestVisible, setIsModalInterestVisible] = useState(false);
  const [isModalBatteryOpen, setIsModalBatteryOpen] = useState(false);

  const mapRef = useRef<MapView>(null);
  const {
    pointsInterets,
    currentMapStyle,
    polylines,
    currentPosition,
    isRecording,
    coordinatesString,
  } = useSelector((state: AppState) => state);

  useImperativeHandle(ref, () => ({
    onCenter() {
      onClickGetCurrentPosition();
    },
    onUpdatePosition(pos: any) {
      onUpdatePosition(pos);
    },
    centerMapOnTrace(polyline: PolylineModel) {
      centerMapOnTrace(polyline);
    },
    centerOnPoi(interest: Interest) {
      centerOnPoi(interest);
    },
  }));

  const centerMapOnTrace = (polyline: PolylineModel) => {
    if (polyline.positionsTrace.length != 0) {
      mapRef?.current?.fitToCoordinates(polyline.positionsTrace, {
        edgePadding: {top: 10, right: 10, bottom: 10, left: 10},
        animated: true,
      });
    }
    selectPolyline(polyline);
  };
  const centerMapOnFirstTrace = () => {
    if (polylines.length > 0) {
      let firstPolyline = polylines[0];
      if (firstPolyline.positionsTrace.length != 0) {
        if (mapRef?.current != null) {
          mapRef?.current.fitToCoordinates(firstPolyline.positionsTrace, {
            edgePadding: {top: 10, right: 10, bottom: 10, left: 10},
            animated: true,
          });
        }
      }
    }
  };
  const centerOnPoi = (interest: Interest) => {
    setCenter(interest.coordinates);
  };

  const selectPolyline = (polyline: PolylineModel) => {
    setCurrentPolyline(polyline);
  };

  const closeCurrentPolyline = () => {
    setCurrentPolyline(undefined);
    // this.setState({currentPolyline: null});
  };

  const onCenter = () => {
    onClickGetCurrentPosition();
  };

  const setCenter = (coords: LatLng) => {
    if (mapRef?.current == null) {
      return;
    }

    mapRef?.current?.animateToRegion({
      latitude: coords.latitude,
      longitude: coords.longitude,
      latitudeDelta: LATITUDE_DELTA_CLOSE,
      longitudeDelta: LONGITUDE_DELTA_CLOSE,
    });
  };

  const onClickGetCurrentPosition = () => {
    if (currentPosition) {
      setCenter(currentPosition);
    }
  };

  const onClickInterestPoint = (marker: Interest) => {
    setCurrentInteret(marker);
    // this.setState({currentInteret: marker});
    onOpenInterestModal();
  };

  const onOpenInterestModal = () => {
    setIsModalInterestVisible(true);
    // this.setState({isModalInterestVisible: true});
  };

  const closeInterestModal = () => {
    setIsModalInterestVisible(false);
    // this.setState({isModalInterestVisible: false});
  };

  const onUpdatePosition = (newCoordinate: any) => {
    if (mapRef?.current != null) {
      mapRef?.current
        ?.getMapBoundaries()
        .then((data) => {
          var isInside = isPointInPolygon(newCoordinate.coords, [
            {
              latitude: data.northEast.latitude,
              longitude: data.southWest.longitude,
            },
            data.northEast,
            {
              latitude: data.southWest.latitude,
              longitude: data.northEast.longitude,
            },
            data.southWest,
          ]);

          if (!isInside) {
            setCenter(newCoordinate.coords);
          }
        })
        .catch(() => {});
    }
  };

  const onClickUrlInterest = (url: string) => {
    Linking.canOpenURL(url).then((supported) => {
      if (supported) {
        Linking.openURL(url);
      }
    });
  };

  const onClickInterestPhone = (phoneNumber: string, idInteret: any) => {
    Linking.canOpenURL(`tel:${phoneNumber}`).then((supported) => {
      if (supported) {
        Linking.openURL(`tel:${phoneNumber}`);
      } else {
        Alert.alert("Le numéro de télehpne n'est pas valide :" + phoneNumber);
        ApiUtils.logError(
          'Interest phone open',
          'Dont know how to open URI: ' + phoneNumber,
        );
      }
    });
  };

  return (
    <View style={styles.map}>
      {/* Point d'interet  */}
      {!isRecording ? <MapCarousel /> : <MapStatBanner />}
      <ModalSmall
        style={{marginTop: 22, paddingTop: 22, borderRadius: 10}}
        isVisible={isModalInterestVisible}
        onSwipeComplete={() => setIsModalInterestVisible(false)}>
        <View
          style={{
            display: 'flex',
            flexDirection: 'row-reverse',
            backgroundColor: 'white',
            borderTopLeftRadius: 10,
            borderTopRightRadius: 10,
          }}>
          <Button
            style={{
              backgroundColor: 'transparent',
              elevation: 0,
              marginRight: 10,
            }}
            onPress={() => {
              closeInterestModal();
            }}>
            <IconElement name="times-circle" type="font-awesome" />
          </Button>
        </View>
        <ScrollView
          style={{
            marginTop: 0,
            backgroundColor: 'white',
            paddingBottom: 200,
            borderBottomLeftRadius: 10,
            borderBottomRightRadius: 10,
          }}>
          <View style={{flex: 1, paddingLeft: 5, paddingRight: 5}}>
            <Text
              style={{
                marginTop: 0,
                marginBottom: 20,
                textAlign: 'center',
                fontWeight: 'bold',
              }}>
              {currentInteret?.libelleInteret}
            </Text>

            {currentInteret?.photoInteret != null &&
            currentInteret?.photoInteret != '' ? (
              <Image
                style={{height: 200, width: '100%'}}
                source={{
                  uri: `data:image/png;base64,${currentInteret?.photoInteret}`,
                }}
              />
            ) : null}

            <View
              style={{
                marginTop: 10,
                marginBottom: 10,
                flexDirection: 'row',
                justifyContent: 'space-between',
                width: '100%',
                paddingRight: 5,
                paddingLeft: 5,
              }}>
              {currentInteret?.telephoneInteret != '' &&
              currentInteret?.telephoneInteret != null ? (
                <Button
                  style={{
                    marginTop: 20,
                    marginBottom: 0,
                    alignSelf: 'center',
                    // width: 150,
                    height: 40,
                    borderRadius: 10,
                    // marginRight: 40,
                    backgroundColor: 'black',
                  }}
                  onPress={() =>
                    onClickInterestPhone(
                      currentInteret?.telephoneInteret,
                      currentInteret?.idInteret,
                    )
                  }>
                  <Text>{currentInteret?.telephoneInteret}</Text>
                </Button>
              ) : null}
              {currentInteret?.lienInteret != '' &&
              currentInteret?.lienInteret != null ? (
                <Button
                  style={{
                    marginTop: 20,
                    marginBottom: 0,
                    alignSelf: 'center',
                    // width: 150,
                    height: 40,
                    borderRadius: 10,
                    // marginRight: 40,
                    backgroundColor: 'black',
                  }}
                  onPress={() =>
                    onClickUrlInterest(currentInteret?.lienInteret)
                  }>
                  <Text>Lien web</Text>
                </Button>
              ) : null}
            </View>

            <Text
              style={{
                marginTop: 10,
                paddingLeft: 10,
                paddingRight: 10,
                paddingBottom: 100,
              }}>
              {currentInteret?.descriptionInteret}{' '}
            </Text>
          </View>
        </ScrollView>
      </ModalSmall>

      <MapView
        ref={mapRef}
        mapType={currentMapStyle}
        style={styles.map}
        showsUserLocation={true}
        followsUserLocation={false}
        scrollEnabled={true}
        showsMyLocationButton={false}
        showsPointsOfInterest={false}
        showsScale={false}
        showsTraffic={false}
        initialRegion={{
          latitude: 45.76512485710589, // 44.843884,
          longitude: 4.8696115893891765,
          latitudeDelta: LATITUDE_DELTA_CLOSE,
          longitudeDelta: LONGITUDE_DELTA_CLOSE,
        }}
        onLayout={() => centerMapOnFirstTrace()}
        toolbarEnabled={false}>
        {coordinatesString != '' ? (
          <Polyline
            key="polyline"
            coordinates={JSON.parse(coordinatesString)}
            geodesic={true}
            strokeColor="rgba(0,0,0, 1)"
            strokeWidth={6}
            zIndex={0}
          />
        ) : null}

        {/* <MapView.Circle
          key="circle"
          center={{
            latitude: 44.930582,

            longitude: 4.899076
          }}
          radius={1000}
          geodesic={true}
          strokeColor='rgba(0,0,0, 1)'
          strokeWidth={2}
          tracksViewChanges={false}
          zIndex={0}
        /> */}

        {polylines != null
          ? polylines
              .filter((pol) => pol.isActive == true)
              .map((polyline, index) => (
                <Polyline
                  key={polyline.nomTrace + index}
                  onPress={() => selectPolyline(polyline)}
                  coordinates={polyline.positionsTrace}
                  tappable={true}
                  zIndex={0}
                  geodesic={true}
                  strokeColor={polyline.couleurTrace}
                  strokeWidth={5}
                />
              ))
          : null}
        {/* {this.props.markers.map((marker, index) => (
          <MapView.Marker
            key={index}
            coordinate={marker.coordinate}
            anchor={{ x: 0, y: 0 }}
            tracksViewChanges={false}
            // image={MarkerCircle}
            title="">
            <View style={[styles.markerIcon]}></View>
          </MapView.Marker>))
        } */}

        {pointsInterets != null
          ? pointsInterets.map((marker: Interest) => (
              <Marker
                onPress={() => onClickInterestPoint(marker)}
                // onCalloutPress={() => this.onClickInterestPoint(marker)}
                key={marker.id}
                coordinate={marker.coordinates}
                tracksViewChanges={true}>
                <ImageBackground
                  style={{height: 25, width: 20}}
                  source={MarkerInteret}>
                  <Text style={{width: 25, height: 25}} />
                </ImageBackground>
              </Marker>
            ))
          : null}
      </MapView>
      {/******** modal : Battery modal *****************/}
      {/* <Modal
          animationType={'none'}
          transparent={false}
          visible={this.state.ismodalBatteryOpen}
          onRequestClose={() => {
            this.closeModalBattery();
          }}>
          <BatteryModal
            noHeader={true}
            onMap={true}
            onclose={() => this.closeModalBattery()}
          />
        </Modal> */}
    </View>
  );
});

export default Map;

const styles = StyleSheet.create({
  map: {
    flex: 1,
    borderColor: 'black',
    borderWidth: 0,
    zIndex: 0,
    minHeight: 400,
  },
  title: {
    color: '#000',
  },
  traceLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    backgroundColor: 'white',
    // padding: 10
  },
  buttonHideTrace: {
    backgroundColor: 'transparent',
    // marginTop: 5,
    elevation: 0,
  },
  liveNameText: {
    color: 'black',
    textAlign: 'center',
    fontWeight: 'bold',
  },
});
