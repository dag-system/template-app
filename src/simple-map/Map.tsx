import React, {Component} from 'react';
import {
  StyleSheet,
  Image,
  TouchableOpacity,
  View,
  Linking,
  Platform,
  ImageBackground,
} from 'react-native';
import {
  Container,
  Header,
  Body,
  Toast,
  Root,
  Drawer,
  Icon,
  Text,
  Content,
  Left,
  Right,
} from 'native-base';
import md5 from 'md5';
import ApiUtils from '../ApiUtils';
import {connect} from 'react-redux';
import Sidebar from './SideBar';
import moment from 'moment';
import Logo from '../assets/logo_header.png';
import GlobalStyles from '../styles';
import Autrans from '../assets/autrans.svg';
import IosReglages from '../assets/iosReglages.png';
import Ios2 from '../assets/ios2.png';
import {Sponsors} from './Sponsors';
import MarkerInteret from '../assets/marker.png';
import MarkerCircle from '../assets/circle.png';
import BackgroundGeolocation, {
  DeviceSettingsRequest,
} from 'react-native-background-geolocation';
import {Dimensions} from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
const mapStateToProps = state => {
  return {
    coordinates : state.coordinates,
    currentMapStyle : state.currentMapStyle
  };
};

const LATITUDE_DELTA = 0.00922;
const LONGITUDE_DELTA = 0.00421;

class Map extends Component {
  constructor(props) {
    super(props);

    this.state = {
      userdata: {
        nomUtilisateur: '',
        prenomUtilisateur: '',
        telUtilisateur: '',
        folocodeUtilisateur: '',
        idUtilisateur: '',
      },
      newPassword: '',
      newPasswordConfirmation: '',
      isErrorName: false,
      lives: [],
      isLoading: false,
      toasterMessage: '',
      showDefaultDdn: false,
    };
  }

  componentDidMount() {
    setTimeout(() => this.didMount(), 300);

    // alert(this.props.userData.ddnUtilisateur)
    //   alert(new Date(this.props.userData.ddnUtilisateur))

    // setTimeout(() => this.setState({ userdata: { ...this.state.userdata, ddnUtilisateur: this.state.userdata.ddnUtilisateur) }} ), 100)
  }
  didMount() {}

  


  render() {
    return (
  
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
          latitude: 45.1667, // 44.843884,
          longitude: 5.55,
          latitudeDelta: LATITUDE_DELTA,
          longitudeDelta: LONGITUDE_DELTA,
        }}
        toolbarEnabled={false}>
        <Polyline
          key="polyline"
          coordinates={this.props.coordinates}
          geodesic={true}
          strokeColor="rgba(0,0,0, 1)"
          strokeWidth={6}
          zIndex={0}
        />

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
              .filter(pol => pol.isActive == true)
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
          ? this.props.pointsInterets.map(marker => (
              <Marker
                onPress={() => this.onClickInterestPoint(marker)}
                // onCalloutPress={() => this.onClickInterestPoint(marker)}
                key={marker.id}
                coordinate={marker.coordinates}
                tracksViewChanges={false}>
                <ImageBackground
                  style={{height: 25, width: 20}}
                  source={MarkerInteret}>
                  <Text style={{width: 25, height: 25}} />
                </ImageBackground>
              </Marker>
            ))
          : null}
      </MapView>

    );
  }
}

const styles = StyleSheet.create({
    map: {
        flex: 1,
        borderColor: 'black',
        borderWidth: 0,
        zIndex: 1,
      },
});

export default connect(mapStateToProps)(Map);
