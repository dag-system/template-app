import React, {PureComponent} from 'react';
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
} from 'react-native';
import {Icon, Text, Button} from 'native-base';
import {connect} from 'react-redux';
import MarkerInteret from '../assets/marker.png';
import MapView, {Marker, Polyline} from 'react-native-maps';
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

const LATITUDE_DELTA_CLOSE = 0.02922;
const LONGITUDE_DELTA_CLOSE = 0.02421;

const LATITUDE_DELTA = 0.016022;
const LONGITUDE_DELTA = 0.001221;

const mapStateToProps = (state) => {
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

interface Props extends DefaultProps {
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

class Map extends PureComponent<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      ismodalBatteryOpen: false,
      isModalTraceVisible: false,
      currentPolyline: null,
      refresh: false,
      currentInteret: null,
      isModalInterestVisible: false,
    };
  }

  componentDidMount() {
    setTimeout(() => this.didMount(), 300);

    // alert(this.props.userData.ddnUtilisateur)
    //   alert(new Date(this.props.userData.ddnUtilisateur))

    // setTimeout(() => this.setState({ userdata: { ...this.state.userdata, ddnUtilisateur: this.state.userdata.ddnUtilisateur) }} ), 100)
  }
  didMount() {
    if (this.props.polylines.length > 0) {
      let firstPolyline = this.props.polylines[0];
      if (firstPolyline.positionsTrace.length != 0) {
        if (this.refs.map != null) {
          this.refs.map.fitToCoordinates(firstPolyline.positionsTrace, {
            edgePadding: {top: 10, right: 10, bottom: 10, left: 10},
            animated: true,
          });
        }
      }
    }
  }

  centerMapOnTrace(polyline) {
    if (polyline.positionsTrace.length != 0) {
      this.refs.map.fitToCoordinates(polyline.positionsTrace, {
        edgePadding: {top: 10, right: 10, bottom: 10, left: 10},
        animated: true,
      });
    }
    this.selectPolyline(polyline);
  }

  centerOnPoi(interest : Interest) {
    console.log(interest.coordinates)
    this.setCenter(interest.coordinates);
  }

  selectPolyline(polyline) {
    this.setState({currentPolyline: polyline});
  }

  closeCurrentPolyline() {
    this.setState({currentPolyline: null});
  }

  onCenter = () => {
    this.onClickGetCurrentPosition();
  };

  setCenter(coords) {
    if (!this.refs.map) {
      return;
    }

    this.refs.map.animateToRegion({
      latitude: coords.latitude,
      longitude: coords.longitude,
      latitudeDelta: LATITUDE_DELTA_CLOSE,
      longitudeDelta: LONGITUDE_DELTA_CLOSE,
    });
  }

  generateLotOfCoordinates() {
    let data = [];
    for (let i = 0; i < 5000; i++) {
      let coord = {
        latitude: 12,
        longitude: 12,
        speed: 3,
      };
      data.push(coord);
    }
    var action = {type: 'SAVE_COORDINATES', data: data};
    this.props.dispatch(action);
  }

  onClickGetCurrentPosition() {
    if (this.props.currentPosition) {
      this.setCenter(this.props.currentPosition);
    }
  }

  onClickInterestPoint(marker) {
    this.setState({currentInteret: marker});
    this.onOpenInterestModal();
  }

  onOpenInterestModal() {
    this.setState({isModalInterestVisible: true});
  }

  closeInterestModal() {
    this.setState({isModalInterestVisible: false});
  }

  onUpdatePosition = (newCoordinate) => {
    if (this.refs.map != null) {
      this.refs.map
        .getMapBoundaries()
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
            this.setCenter(newCoordinate.coords);
          }
        })
        .catch(() => {});
    }
  };

  openBatteryModal = () => {
    this.setState({ismodalBatteryOpen: true});
  };

  closeModalBattery = () => {
    this.setState({ismodalBatteryOpen: false});
  };

  onClickUrlInterest(url) {
    Linking.canOpenURL(url).then((supported) => {
      if (supported) {
        Linking.openURL(url);
      }
    });
  }

  onClickInterestPhone(phoneNumber, idInteret) {
    Linking.canOpenURL(`tel:${phoneNumber}`).then((supported) => {
      if (supported) {
        Linking.openURL(`tel:${phoneNumber}`);
      } else {
        alert("Le numéro de télehpne n'est pas valide :" + phoneNumber);
        ApiUtils.logError(
          'Interest phone open',
          'Dont know how to open URI: ' + phoneNumber,
        );
      }
    });
  }

  render() {
    return (
      <View style={styles.map}>
        {/* Point d'interet  */}
        {!this.props.isRecording ? <MapCarousel /> : <MapStatBanner />}
        <ModalSmall
          style={{marginTop: 22, paddingTop: 22, borderRadius: 10}}
          isVisible={this.state.isModalInterestVisible}
          onSwipeComplete={() =>
            this.setState({isModalInterestVisible: false})
          }>
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
                this.closeInterestModal();
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
                {this.state.currentInteret?.libelleInteret}
              </Text>

              {this.state.currentInteret?.photoInteret != null &&
              this.state.currentInteret?.photoInteret != '' ? (
                <Image
                  style={{height: 200, width: '100%'}}
                  source={{
                    uri: `data:image/png;base64,${this.state.currentInteret?.photoInteret}`,
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
                {this.state.currentInteret?.telephoneInteret != '' &&
                this.state.currentInteret?.telephoneInteret != null ? (
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
                      this.onClickInterestPhone(
                        this.state.currentInteret?.telephoneInteret,
                        this.state.currentInteret?.idInteret,
                      )
                    }>
                    <Text>{this.state.currentInteret?.telephoneInteret}</Text>
                  </Button>
                ) : null}
                {this.state.currentInteret?.lienInteret != '' &&
                this.state.currentInteret?.lienInteret != null ? (
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
                      this.onClickUrlInterest(
                        this.state.currentInteret?.lienInteret,
                      )
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
                {this.state.currentInteret?.descriptionInteret}{' '}
              </Text>
            </View>
          </ScrollView>
        </ModalSmall>

        <MapView
          ref="map"
          mapType={this.props.currentMapStyle}
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
          toolbarEnabled={false}>
          {this.props.coordinatesString != '' ? (
            <Polyline
              key="polyline"
              coordinates={JSON.parse(this.props.coordinatesString)}
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

          {this.props.polylines != null
            ? this.props.polylines
                .filter((pol) => pol.isActive == true)
                .map((polyline, index) => (
                  <Polyline
                    key={polyline.nomTrace + index}
                    onPress={() => this.selectPolyline(polyline)}
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

          {this.props.pointsInterets != null
            ? this.props.pointsInterets.map((marker) => (
                <Marker
                  onPress={() => this.onClickInterestPoint(marker)}
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
        <Modal
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
        </Modal>
      </View>
    );
  }
}

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

export default connect(mapStateToProps, null, null, {forwardRef: true})(Map);
