import React, {Component} from 'react';
import {StyleSheet, Platform, Linking, Alert} from 'react-native';
import {Container, Drawer, Footer, View} from 'native-base';
import {connect} from 'react-redux';
import MapHeader from './MapHeader';
import MapButtons from './MapButtons';
import Map from './Map';
import GeolocComponent from './GeolocComponent';
import DefaultProps from '../models/DefaultProps';
import Sidebar from '../home/SideBar';
import TraceModal from '../home/TraceModal';
import {Sponsors} from '../home/Sponsors';
import VersionCheck from 'react-native-version-check';
import DeviceInfo from 'react-native-device-info';
import {
  TemplateAppName,
  TemplateIdOrganisation,
  TemplateSportLive,
} from '../globalsModifs';
import ApiUtils from '../ApiUtils';
import Interest from '../models/Interest';

const mapStateToProps = (state) => {
  return {
    currentLive: state.currentLive,
  };
};

interface Props extends DefaultProps {
  currentLive: any;
}

interface State {
  isModalTraceVisible: boolean;
}

class MapContainer extends Component<Props, State> {
  drawer: Drawer;
  map: React.RefObject<unknown>;
  constructor(props) {
    super(props);
    this.map = React.createRef();
    this.state = {
      isModalTraceVisible: false,
    };
    this._unsubscribe = this.props.navigation.addListener('focus', () => {
      this.componentDidMount();
    });
  }

  componentDidMount() {
    setTimeout(() => this.didMount(), 300);
  }
  didMount() {
   this.closeDrawer();
   this.downloadData();
    // if (this.props.currentLive == null) {
    //   this.props.navigation.navigate('Lives');
    // }
  }

  onUpdatePosition = (pos) => {
    if (this.map != null && this.map.current != null) {
      this.map.current.onUpdatePosition(pos);
    }
  };

  onCenter = () => {
    if (this.map != null && this.map.current != null) {
      this.map.current.onCenter();
    }
  };

  closeDrawer = () => {
    if (this.drawer != null && this.drawer._root != null)
      this.drawer._root.close();
  };

  onDrawer = () => {
    this.drawer._root.open();
  };

  openTraceModal = () => {
    this.setState({isModalTraceVisible: true});
  };

  closeTraceModal = () => {
    this.setState({isModalTraceVisible: false});
  };

  centerOnTrace = (trace: any) => {
    this.closeTraceModal();
    if (this.map != null && this.map.current != null) {
      this.map.current.centerMapOnTrace(trace);
    }
  };

  centerOnPoi = (interest : Interest) => {
    this.closeTraceModal();
    if (this.map != null && this.map.current != null) {
      this.map.current.centerOnPoi(interest);
    }
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

  async downloadData() {
    this.getPhoneData();
    this.getNewVersion();

    this.getinformationStation();
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

              console.log(finalInterest.libelleInteret);
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

  async getNewVersion() {
    if (!this.props.isRecording) {
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
  }

  render() {
    return (
      <Drawer
        ref={(ref) => {
          this.drawer = ref;
        }}
        content={
          <Sidebar
            navigation={this.props.navigation}
            drawer={this.drawer}
            selected="Map"
          />
        }>
        <Container style={styles.container}>
          <GeolocComponent
            onUpdatePosition={(pos) => this.onUpdatePosition(pos)}
          />
          <MapHeader
            navigation={this.props.navigation}
            ondrawer={() => this.onDrawer()}
          />
          <MapButtons
            navigation={this.props.navigation}
            onCenter={() => this.onCenter()}
            openTraceModal={() => this.openTraceModal()}
            closeTraceModal={() => this.closeTraceModal()}
          />
          <Map ref={this.map} />

          <Footer style={{backgroundColor: 'white', paddingBottom: 64}}>
            <Sponsors />
          </Footer>

          <TraceModal
            isVisible={this.state.isModalTraceVisible}
            onClose={() => this.closeTraceModal()}
            centerOnTrace={(trace) => this.centerOnTrace(trace)}
            centerOnPoi={(poi) => this.centerOnPoi(poi)}
          />
        </Container>
      </Drawer>
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
  container: {
    backgroundColor: 'transparent',
    fontFamily: 'Roboto',
    flex: 1,
  },
});

export default connect(mapStateToProps)(MapContainer);
