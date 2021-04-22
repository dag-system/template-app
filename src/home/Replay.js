import React, {Component} from 'react';
import {
  Platform,
  StyleSheet,
  View,
  PermissionsAndroid,
  Image,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import {
  Container,
  Header,
  Left,
  Body,
  Right,
  Text,
  Button,
  Fab,
  Icon,
  Content,
  Root,
  Toast,
  Picker,
  Drawer,
  Spinner,
} from 'native-base';
import MapView, {Marker} from 'react-native-maps';
import ApiUtils from '../ApiUtils';
import {connect} from 'react-redux';
import RNFetchBlob from 'rn-fetch-blob';
import Logo from '../assets/logo.png';
import GlobalStyles from '../styles';
import {Sponsors} from './Sponsors';
import {ReactNativeModal as ModalSmall} from 'react-native-modal';
import {Icon as IconElement} from 'react-native-elements';
import GPXDocument from '../lib/gpx-parse/GPXDocument';
import moment from 'moment';
import Slider from '@react-native-community/slider';
import Sidebar from './SideBar';

import {isPointInPolygon} from 'geolib';

import haversine from 'haversine-distance';
const mapStateToProps = (state) => {
  return {
    userData: state.userData,
    currentMapStyle: state.currentMapStyle,
    polylines: state.polylines,
    challenges: state.challenges,
  };
};

const LATITUDE_DELTA = 0.016022;
const LONGITUDE_DELTA = 0.001221;

const speed = Platform.OS == 'ios' ? 150 : 600;
const multiplicator = 1000 / speed;

class Replay extends Component {
  constructor(props) {
    super(props);

    this.state = {
      live: {},
      sports: [],
      libelleSport: '',
      coordinates: [],
      isMapFullSize: false,
      isloading: true,
      statsLive: {
        distance: null,
      },
      fabActive: false,
      segmentEfforts: [],
      coordinatesTime: [],
      coordinatesTime2: [],
      canStart: false,

      currentMarker: null,
      currentMarker2: null,
      index: 0,
      startTimeSeconds: 0,
      accelerator: 1,
      gpx1Name: '',
      gpx2Name: '',
      isDownloaded1: false,
      isDownloaded2: false,
      classement: [],

      isloadingChallenge: false,
      challengeId: -1,

      coordinates: [],
      coordinatesTimes: [],
      currentMarkers: [],
      isDownloadeds: [],
      gpxName: [],
      nbUsers: 2,
    };
  }

  componentDidMount() {
    setTimeout(() => this.didMount(), 300);
    this._unsubscribe = this.props.navigation.addListener('blur', () => {
      // do something

      this.componentWillUnmount();
    });
  }

  didMount() {
    if (this.props.polylines.length > 0) {
      let firstPolyline = this.props.polylines[0];
      if (firstPolyline.positionsTrace.length != 0) {
        this.refs.map.fitToCoordinates(firstPolyline.positionsTrace, {
          edgePadding: {top: 10, right: 10, bottom: 10, left: 10},
          animated: true,
        });
      }
    }
  }

  componentWillUnmount() {
    clearInterval(this.interval);
    this._unsubscribe();
  }

  closeDrawer = () => {
    this.drawer._root.close();
  };

  onDrawer() {
    this.drawer._root.open();
  }

  getPointPassage(idChallenge) {
    this.setState({isloading: true});
    let formData = new FormData();
    formData.append('method', 'getPointPassage');
    formData.append('auth', ApiUtils.getAPIAuth());
    formData.append('idChallenge', idChallenge);
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
        let result = Object.values(responseJson);

        this.setState({isloading: false, pointPassages: result});
      })

      .catch((e) => {
        this.setState({isloading: false});
        // ApiUtils.logError('create live', JSON.stringify(e.message));
        // alert('Une erreur est survenue : ' + JSON.stringify(e.message));
        console.log(e);
        if (e.message == 'Timeout' || e.message == 'Network request failed') {
          this.setState({noConnection: true});

          Toast.show({
            text: "Vous n'avez pas de connection internet, merci de réessayer",
            buttonText: 'Ok',
            type: 'danger',
            position: 'bottom',
            duration: 5000,
          });
        }
      });
  }

  centerMapOnTrace(positions) {
    // if (polyline.positionsTrace.length != 0) {
    this.refs.map.fitToCoordinates(positions, {
      edgePadding: {top: 10, right: 10, bottom: 10, left: 10},
      animated: true,
    });
    // }
  }

  getGpxPoint(gpxName, index) {
    if (index == 1) {
      this.setState({isDownloaded1: false});
    } else {
      this.setState({isDownloaded2: false});
    }
    this.setState({isloading: true});
    let formData = new FormData();
    formData.append('method', 'getGpxDataFromGpxName');
    formData.append('auth', ApiUtils.getAPIAuth());
    formData.append('gpxName', gpxName);

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
        let data = Object.values(responseJson);

        this.setState({isloading: false, canStart: true});

        if (index == 1) {
          let dataTime = this.getCoordinates(data);
          let dataMap = this.getCoordinatesForMap(data);

          this.setState({coordinates: dataMap}, () => this.centerMap());
          this.setState({coordinatesTime: dataTime});
          let startPoint1 = this.getClosestInterestPoint(
            this.props.challenges.filter(
              (c) => c.idChallenge == this.state.challengeId,
            )[0].positionsTrace[0],
            data,
            10,
          );
          this.setState({
            startPoint1: startPoint1,
            isDownloaded1: true,
            canStart: true,
          });
          this.centerMapOnTrace(dataMap);
        } else {
          let dataTime = this.getCoordinates(data);
          let dataMap = this.getCoordinatesForMap(data);
          this.setState({coordinates2: dataMap});
          this.setState({coordinatesTime2: dataTime});
          let startPoint2 = this.getClosestInterestPoint(
            this.props.challenges.filter(
              (c) => c.idChallenge == this.state.challengeId,
            )[0].positionsTrace[0],
            data,
            10,
          );
          this.setState({
            startPoint2: startPoint2,
            isDownloaded2: true,
            canStart: true,
          });
        }
      })

      .catch((e) => {
        this.setState({isloading: false});
        // ApiUtils.logError('create live', JSON.stringify(e.message));
        //alert('Une erreur est survenue : ' + JSON.stringify(e.message));
        console.log(e);
        if (e.message == 'Timeout' || e.message == 'Network request failed') {
          this.setState({noConnection: true});

          Toast.show({
            text: "Vous n'avez pas de connection internet, merci de réessayer",
            buttonText: 'Ok',
            type: 'danger',
            position: 'bottom',
            duration: 5000,
          });
        }
      });
  }

  getClassementChallenge(idChallenge) {
    this.setState({isloadingChallenge: true});
    let formData = new FormData();
    formData.append('method', 'getClassementForChallenge');
    formData.append('auth', ApiUtils.getAPIAuth());
    formData.append('idChallenge', idChallenge);

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
        this.setState({isloadingChallenge: false});
        this.setState({classement: responseJson.classement});
        if (
          responseJson.classement.filter(
            (c) => c.idUtilisateur == this.props.userData.idUtilisateur,
          ).length > 0
        ) {
          let userGpx = responseJson.classement.filter(
            (c) => c.idUtilisateur == this.props.userData.idUtilisateur,
          )[0].gpxLive;
          this.setState({gpx1Name: userGpx});
        }

        // this.setState({isloading: false, pointPassages: result});
      })

      .catch((e) => {
        this.setState({isloadingChallenge: false});
        // ApiUtils.logError('create live', JSON.stringify(e.message));
        // alert('Une erreur est survenue : ' + JSON.stringify(e.message));
        if (e.message == 'Timeout' || e.message == 'Network request failed') {
          this.setState({noConnection: true});

          Toast.show({
            text: "Vous n'avez pas de connection internet, merci de réessayer",
            buttonText: 'Ok',
            type: 'danger',
            position: 'bottom',
            duration: 5000,
          });
        }
      });
  }
  readFile(gpxFile, index) {
    let filePath = 'https://folomi.fr/fichiers/gpxLive/' + gpxFile + '.gpx';

    // var path = this.normalize(filePath);
    let dirs = RNFetchBlob.fs.dirs;
    let path = dirs.DownloadDir + '/' + 'folomi' + '/' + gpxFile + '.gpx';

    if (Platform.OS != 'android') {
      try {
        RNFetchBlob.config({
          path: path,
        })
          .fetch('GET', encodeURI(filePath))
          .then((res) => {
            try {
              let status = res.info().status;

              if (status == 200) {
                this.readGpxFile(res.path(), index);
              }
            } catch (e) {
              console.log(e);
              Toast.show({
                text: 'Une erreur est survenue. Merci de réessayer',
                buttonText: 'Ok',
                type: 'danger',
                duration: 3000,
                position: 'bottom',
              });
              // alert(e)
            }
          })
          .catch((e) => alert(e));
      } catch (e) {
        console.log(e);
      }
    }
  }

  getCoordinatesForMap(positions) {
    var coordinates = [];
    positions.forEach((element) => {
      element = Object.values(element);

      var coordinate = {
        latitude: parseFloat(element[0]),
        longitude: parseFloat(element[1]),
      };

      // var isInside = isPointInPolygon(coordinate, [
      //   {latitude: 45.239345439246804, longitude: 5.487474486152105},
      //   {latitude: 45.239345439246804, longitude: 5.603112382684815},
      //   {latitude: 45.16591923938339, longitude: 5.603112382684815},
      //   {latitude: 45.16591923938339, longitude: 5.487474486152105},
      // ]);

      // if (isInside) {
      coordinates.push(coordinate);
      // }
    });

    return coordinates;
  }

  getCoordinates(positions) {
    var coordinates = [];

    positions.forEach((element) => {
      element = Object.values(element);
      let time = element[2];
      time = Object.values(time);
      var coordinate = {
        latitude: parseFloat(element[0]),
        longitude: parseFloat(element[1]),
        time: time[0],
      };

      // var isInside = isPointInPolygon(coordinate, [
      //   {latitude: 45.239345439246804, longitude: 5.487474486152105},
      //   {latitude: 45.239345439246804, longitude: 5.603112382684815},
      //   {latitude: 45.16591923938339, longitude: 5.603112382684815},
      //   {latitude: 45.16591923938339, longitude: 5.487474486152105},
      // ]);

      // if (isInside) {
      coordinates.push(coordinate);
      // }
    });

    return coordinates;
  }

  readGpxFile(filePath, index) {
    // var path = this.normalize(filePath);
    var _this = this;

    RNFetchBlob.fs
      .readFile(filePath, 'utf8')
      .then((data) => {

        try {
          var test = new GPXDocument(data);

          test.getTracks().then((t) => {
            t.forEach((tr) => {
              var finalTrace = {
                // positionsTrace: positionArray,
                couleurTrace: ApiUtils.getColor(),
                nomTrace: tr.getName(),
                isActive: true,
                sportTrace: 'inconnu',
              };

              tr.loadAllSegmentInfo().then((resu) => {
                // console.log(resu);
                finalTrace.distanceTrace = (
                  resu[0].totalDistance / 1000
                ).toFixed(1);
                finalTrace.dplusTrace = resu[0].totalElevationGain.toFixed(0);

                // var positionArray = tr.transformGpxPointToLatLong(resu[0].points);
                finalTrace.positionsTrace = resu[0].latLongList;

                let latLongTime = resu[0].latLongTimeList;

                if (index == 1) {
                  _this.setState({coordinates: finalTrace.positionsTrace});
                  _this.setState({coordinatesTime: latLongTime});
                  let startPoint1 = _this.getClosestInterestPoint(
                    this.props.challenges.filter(
                      (c) => c.idChallenge == this.state.challengeId,
                    )[0].positionsTrace[0],
                    coordinatesTime,
                    10,
                  );
                  this.setState({startPoint1: startPoint1, canStart: true});
                  _this.centerMapOnTrace(finalTrace);
                } else {
                  _this.setState({
                    coordinates2: finalTrace.positionsTrace,
                    canStart: true,
                  });
                  _this.setState({coordinatesTime2: latLongTime});
                  let startPoint2 = _this.getClosestInterestPoint(
                    this.props.challenges.filter(
                      (c) => c.idChallenge == this.state.challengeId,
                    )[0].positionsTrace[0],
                    coordinatesTime2,
                    10,
                  );
                  this.setState({startPoint2: startPoint2});
                }

                // var action = {type: 'ADD_TRACE', data: finalTrace};
                // _this.props.dispatch(action);

                // Toast.show({
                //   text: 'Le fichier gpx a bien été importé',
                //   buttonText: 'Ok',
                //   type: 'success',
                //   duration: 3000,
                //   position: 'bottom',
                // });
                // polylines.push(finalTrace);
              });

              // this.setState({ polylines: polylines })
            });
          });
        } catch (e) {
          Toast.show({
            text: 'Une erreur est survenue. Merci de réessayer',
            buttonText: 'Ok',
            type: 'danger',
            duration: 3000,
            position: 'bottom',
          });
          // alert(e)
        }
      })
      .catch((e) => {
        Toast.show({
          text: 'Une erreur est survenue. Merci de réessayer',
          buttonText: 'Ok',
          type: 'danger',
          duration: 3000,
          position: 'bottom',
        });
        console.log(e);
      });
  }

  onClickDownloadGpx(url, name) {
    this.downloadFile(url, name);
  }

  onGoBack() {
    this.props.navigation.navigate('Lives');
  }

  downloadFile(url, name) {
    if (Platform.OS == 'android') {
      this.checkPermissions(url, name);
    } else {
      this.onDownloadFileok(url, name);
    }
  }

  onDownloadFileok(url, name) {
    url = 'https://folomi.fr/fichiers/' + name + '.gpx';
    let dirs = RNFetchBlob.fs.dirs;
    let path = dirs.DownloadDir + '/' + 'folomi' + '/' + name + '.gpx';

    return RNFetchBlob.config({
      path: path,
    })
      .fetch('GET', encodeURI(url))
      .then(() => {})
      .catch((e) => alert(e));
  }

  realign() {}

  pause() {
    this.setState({isPaused: true});
    clearInterval(this.interval);
  }

  continue() {
    this.setState({isPaused: false});
    clearInterval(this.interval);
    this.interval = setInterval(() => this.onInterval(), speed);
  }

  checkPermissions(url, name) {
    if (Platform.OS == 'android') {
      try {
        PermissionsAndroid.request(
          'android.permission.WRITE_EXTERNAL_STORAGE',
        ).then((res) => {
          console.warn(res);
          if (res == 'granted') {
            this.onDownloadFileok(url, name);
          } else {
            // alert('error')
            this.requestStoragePermission(url, name);
          }
        });
      } catch (error) {
        console.warn('location set error:', error);
      }
    }
  }

  requestStoragePermission = async (url, name) => {
    try {
      const granted = await PermissionsAndroid.requestMultiple(
        ['android.permission.WRITE_EXTERNAL_STORAGE'],
        {
          title: 'Accèder à vos fichiers',
          message: '',
          buttonNeutral: 'Plus tard',
          buttonNegative: 'Annuler',
          buttonPositive: 'OK',
        },
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        this.onDownloadFileok(url, name);
      } else {
      }
    } catch (err) {
      // console.warn(err);
    }
  };

  saveCurrentMapStyle(style) {
    var action = {type: 'UPDATE_MAP_STYLE', data: style};
    this.props.dispatch(action);
  }

  showMapFullSize() {
    this.setState({isMapFullSize: !this.state.isMapFullSize});
    this.centerMap();
  }

  onOpenTraceModal() {
    this.setState({isModalTraceVisible: true});
  }

  closeTraceModal() {
    this.setState({isModalTraceVisible: false});
  }

  centerMap() {
    if (this.state.coordinates != null && this.state.coordinates.length != 0) {
      this.refs.map.fitToCoordinates(this.state.coordinates, {
        edgePadding: {top: 10, right: 10, bottom: 10, left: 10},
        animated: true,
      });
    }
  }

  start() {
    this.interval = setInterval(() => this.onInterval(), speed);
    this.setState({isStarted: true, isPaused: false});
  }

  stop() {
    console.log(this.interval);
    clearInterval(this.interval);
    this.setState({
      startTimeSeconds: 0,
      currentMarker: null,
      currentMarker2: null,
      isStarted: false,
    });
  }

  onInterval = () => {
    let startTime = new Date().getTime();
    let startTimeSeconds = this.state.startTimeSeconds;
    // startTimeSeconds += 1;

    let markers1 = this.state.coordinatesTime;
    let markers2 = this.state.coordinatesTime2;

    let startPoint1 = this.state.startPoint1;
    if (this.state.startPoint1 == null) {
      startPoint1 = markers1[0];
    }
    let marker1 = this.getMarker(markers1, startTimeSeconds, startPoint1);

    if (marker1 != null) {
      // console.log(marker1);
      // let marker1 = markers1[index];
      let finalMarker1 = {
        latitude: marker1.latitude,
        longitude: marker1.longitude,
      };

      this.setState({currentMarker: finalMarker1});
    } else {
      // this.stop();
      console.log('marker1 est null');
    }

    let startPoint2 = this.state.startPoint2;
    if (this.state.startPoint2 == null) {
      startPoint2 = markers2[0];
    }

    let marker2 = this.getMarker(markers2, startTimeSeconds, markers2[0]);
    if (marker2 != null) {
      this.setState({currentMarker2: marker2});
    }

    if (marker1 == null && marker2 == null) {
      this.stop();
    } else {
      startTimeSeconds += (1 * this.state.accelerator) / multiplicator;
      this.setState({
        startTimeSeconds: startTimeSeconds,
      });
    }

    let endTime = new Date().getTime();

    let timeDifference = endTime - startTime;
    console.log(timeDifference);
  };

  getMarker(markers, time, startPoint) {
    let startDate = moment(startPoint.time);
    let marker = null;
    for (let i = 0; i < markers.length; i++) {
      let m = markers[i];
      let currentTime = moment(m.time);

      let diff = currentTime.diff(startDate, 'seconds'); // 1
      if (diff > time) {
        marker = m;

        break;
      }
    }
    return marker;
  }

  updateAccelerator() {
    let currentAccelerator = this.state.accelerator;
    if (currentAccelerator == 128) {
      currentAccelerator = 1;
    } else {
      currentAccelerator *= 2;
    }

    this.setState({accelerator: currentAccelerator});
  }

  onChangeTrace1(value) {
    this.setState({gpx1Name: value});
    this.setState({canStart: false});
  }

  onChangeTrace2(value) {
    this.setState({gpx2Name: value});
    this.setState({canStart: false});
  }

  onChangeChallenge(value) {
    this.setState({challengeId: value, isloadingChallenge: true});
    this.getClassementChallenge(value);
    //   this.getPointPassage(value);
  }

  validateRunners() {
    // // let gpxLive =
    // // 'https://folomi.fr/fichiers/gpxLive/' +
    // // '10354_5ffffc3d6d027' +
    // // '.gpx';

    // gpxLive =
    // 'https://folomi.fr/fichiers/gpxLive/' +
    // '10315_5fff374f5a594' +
    // '.gpx';

    // this.readFile(this.state.gpx1Name, 1);
    // this.readFile(this.state.gpx2Name, 2);
    this.setState({canStart: false});
    this.getGpxPoint(this.state.gpx1Name, 1);
    this.getGpxPoint(this.state.gpx2Name, 2);
  }

  isUserSelected() {
    return this.state.gpx1Name != '' && this.state.gpx2Name != '';
  }

  hasTraceDownloaded() {
    return (
      this.state.coordinatesTime.length > 0 &&
      this.state.coordinatesTime2.length > 0
    );
  }

  getClosestInterestPoint(startPoint, points, maxDistance) {
    var minDistance = Number.MAX_VALUE;
    var markerMin = null;

    points.forEach((p) => {
      // if (!this.isAlreadyVisitedPoints(p) && this.isShowType(p.type) && p.coordinates != null) {
      var dist = haversine(startPoint, p.coordinates);
      if (dist < minDistance && dist < maxDistance) {
        markerMin = p;
        minDistance = dist;
      }
      // }
    });

    return markerMin;
  }

  ongoHome() {
    this.props.navigation.navigate('Home');
  }

  getFabDefaultLogo() {
    if (this.props.currentMapStyle == 'terrain') {
      return 'tree';
    }

    if (this.props.currentMapStyle == 'hybrid') {
      return 'satellite';
    }
    return 'map';
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
            selected="Replay"
          />
        }>
        <Root>
          <Container>
            <Header style={styles.header}>
              <Left style={{flex: 1}}>
                <TouchableOpacity
                  style={styles.drawerButton}
                  onPress={() => this.onDrawer()}>
                  <Icon
                    style={styles.saveText}
                    name="bars"
                    type="FontAwesome5"
                  />
                </TouchableOpacity>
              </Left>
              <Body style={{flex: 0}} />
              <Right style={{flex: 1}}>
                <Image resizeMode="contain" source={Logo} style={styles.logo} />
              </Right>
            </Header>
            <Content style={styles.body} scrollEnabled={true}>
              {this.state.isMapFullSize ? null : (
                <View>
                  <Text
                    style={{
                      textAlign: 'center',
                      marginTop: 15,
                      marginBottom: 5,
                      fontWeight: 'bold',
                    }}>
                    Comparer les performances
                  </Text>

                  <Text style={{textAlign: 'center'}}>
                    Comparer 2 chronos et trouvez où vous pouvez gagner du temps
                    sur la piste
                  </Text>

                  <Picker
                    mode="dropdown"
                    accessibilityLabel={'Choisissez une épreuve'}
                    iosHeader={'Choisissez une épreuve'}
                    iosIcon={<Icon name="chevron-down" type="FontAwesome5" />}
                    style={{marginTop: 20, width: '100%'}}
                    selectedValue={this.state.challengeId}
                    onValueChange={this.onChangeChallenge.bind(this)}
                    placeholder={'Choisissez une épreuve'}
                    placeholderStyle={{
                      color: ApiUtils.getColor(),
                    }}
                    placeholderIconColor={ApiUtils.getColor()}
                    textStyle={{color: ApiUtils.getColor()}}
                    itemStyle={{
                      color: ApiUtils.getColor(),
                      marginLeft: 0,
                      paddingLeft: 10,
                      borderBottomColor: ApiUtils.getColor(),
                      borderBottomWidth: 1,
                    }}
                    itemTextStyle={{
                      color: ApiUtils.getColor(),
                      borderBottomColor: ApiUtils.getColor(),
                      borderBottomWidth: 1,
                    }}>
                    <Picker.Item label="Choisissez une épreuve" value="-1" />
                    {this.props.challenges.map((challenge) => {
                      return (
                        <Picker.Item
                          label={challenge.libelleChallenge}
                          value={challenge.idChallenge}
                        />
                      );
                    })}
                    {/* <Picker.Item label="My Cross" value={58} /> */}
                  </Picker>

                  {!this.state.isloadingChallenge &&
                  this.state.challengeId != -1 ? (
                    <View>
                      <View
                        style={[
                          GlobalStyles.row,
                          {justifyContent: 'space-between'},
                        ]}>
                        <View style={{width: '50%'}}>
                          <View
                            style={{
                              width: 25,
                              height: 25,
                              backgroundColor: ApiUtils.getBackgroundColor(),
                              borderRadius: 100,
                              borderColor: 'white',
                              borderWidth: 1,
                              justifyContent: 'center',
                              alignSelf: 'center',
                            }}>
                            <Text
                              style={{
                                color: 'white',
                                textAlign: 'center',
                                textAlignVertical: 'center',
                              }}>
                              1
                            </Text>
                          </View>
                          <Text style={{marginLeft: 0, textAlign: 'center'}}>
                            Votre chrono
                          </Text>

                          <Picker
                            mode="dropdown"
                            accessibilityLabel={'Choisir'}
                            iosHeader={'Choisir'}
                            iosIcon={
                              <Icon name="chevron-down" type="FontAwesome5" />
                            }
                            style={{marginTop: 0, width: '80%'}}
                            selectedValue={this.state.gpx1Name}
                            onValueChange={this.onChangeTrace1.bind(this)}
                            placeholder={'Choisir'}
                            placeholderStyle={{
                              color: ApiUtils.getColor(),
                            }}
                            placeholderIconColor={ApiUtils.getColor()}
                            textStyle={{color: ApiUtils.getColor()}}
                            itemStyle={{
                              color: ApiUtils.getColor(),
                              marginLeft: 0,
                              paddingLeft: 10,
                              borderBottomColor: ApiUtils.getColor(),
                              borderBottomWidth: 1,
                            }}
                            itemTextStyle={{
                              color: ApiUtils.getColor(),
                              borderBottomColor: ApiUtils.getColor(),
                              borderBottomWidth: 1,
                            }}>
                            <Picker.Item label="Choisir" value="-1" />

                            {this.state.classement?.map((c) => {
                              return (
                                <Picker.Item
                                  label={c.nomUtilisateur + ' ' + c.tempsEffort}
                                  value={c.gpxLive}
                                />
                              );
                            })}
                          </Picker>
                          {this.state.coordinatesTime.length < 300 &&
                          this.state.isDownloaded1 ? (
                            <Text style={{marginLeft: 12}}>
                              La trace de cet utilisateur n'est pas complète.
                              Vous ne pouvez pas la comparer :(
                            </Text>
                          ) : null}
                        </View>
                        <View style={{justifyContent: 'center', width: '50%'}}>
                          <View
                            style={{
                              width: 25,
                              height: 25,
                              backgroundColor: ApiUtils.red(),
                              borderRadius: 100,
                              borderColor: 'white',
                              borderWidth: 1,
                              alignSelf: 'center',
                              justifyContent: 'center',
                            }}>
                            <Text
                              style={{
                                color: 'white',
                                textAlign: 'center',
                                textAlignVertical: 'center',
                              }}>
                              2
                            </Text>
                          </View>
                          <Text style={{marginLeft: 0, textAlign: 'center'}}>
                            Votre rival{' '}
                          </Text>

                          <Picker
                            mode="dropdown"
                            accessibilityLabel={'Choisir'}
                            iosHeader={'Choisir'}
                            iosIcon={
                              <Icon name="chevron-down" type="FontAwesome5" />
                            }
                            style={{marginTop: 0, width: '80%'}}
                            selectedValue={this.state.gpx2Name}
                            onValueChange={this.onChangeTrace2.bind(this)}
                            placeholder={'Choisir'}
                            placeholderStyle={{
                              color: ApiUtils.getColor(),
                            }}
                            placeholderIconColor={ApiUtils.getColor()}
                            textStyle={{color: ApiUtils.getColor()}}
                            itemStyle={{
                              color: ApiUtils.getColor(),
                              marginLeft: 0,
                              paddingLeft: 10,
                              borderBottomColor: ApiUtils.getColor(),
                              borderBottomWidth: 1,
                            }}
                            itemTextStyle={{
                              color: ApiUtils.getColor(),
                              borderBottomColor: ApiUtils.getColor(),
                              borderBottomWidth: 1,
                            }}>
                            <Picker.Item label="Choisir" value="-1" />

                            {this.state.classement?.map((c) => {
                              return (
                                <Picker.Item
                                  label={c.nomUtilisateur + ' ' + c.tempsEffort}
                                  value={c.gpxLive}
                                />
                              );
                            })}
                          </Picker>

                          {this.state.gpx2Name != '' &&
                          this.state.coordinatesTime2.length < 300 &&
                          this.state.isDownloaded2 ? (
                            <Text style={{marginLeft: 12}}>
                              La trace de cet utilisateur n'est pas complète.
                              Vous ne pouvez pas la comparer :(
                            </Text>
                          ) : null}
                        </View>
                      </View>
                      <Button
                        style={{
                          marginTop: 10,
                          paddingHorizontal: 50,
                          elevation: 0,
                          alignSelf: 'center',
                          borderColor: ApiUtils.getColor(),
                          borderWidth: 1,
                          backgroundColor: this.isUserSelected()
                            ? ApiUtils.getColor()
                            : 'white',
                        }}
                        onPress={() => this.validateRunners()}>
                        <Text
                          style={{
                            color: this.isUserSelected()
                              ? 'white'
                              : ApiUtils.getColor(),
                          }}>
                          Comparer
                        </Text>
                      </Button>
                    </View>
                  ) : this.state.isloadingChallenge ? (
                    <Spinner color={'black'} />
                  ) : null}

                  {this.isUserSelected() &&
                  this.hasTraceDownloaded() &&
                  this.state.canStart &&
                  !this.state.isStarted ? (
                    <Button
                      style={{
                        marginTop: 10,
                        paddingHorizontal: 50,
                        elevation: 0,
                        alignSelf: 'center',
                        borderColor: ApiUtils.green(),
                        borderWidth: 1,
                        backgroundColor: ApiUtils.green(),
                      }}
                      onPress={() => this.start()}>
                      <Text
                        style={{
                          color: 'white',
                        }}>
                        Démarrer
                      </Text>
                    </Button>
                  ) : null}

                  {this.state.isStarted ? (
                    <View
                      style={[GlobalStyles.row, {justifyContent: 'center'}]}>
                      {!this.state.isPaused ? (
                        <Button
                          style={{
                            marginTop: 10,
                            paddingHorizontal: 50,
                            elevation: 0,
                            alignSelf: 'center',
                            borderColor: ApiUtils.orange(),
                            borderWidth: 1,
                            marginRight: 10,
                            backgroundColor: ApiUtils.orange(),
                          }}
                          onPress={() => this.pause()}>
                          <Text
                            style={{
                              color: 'white',
                            }}>
                            Pause
                          </Text>
                        </Button>
                      ) : (
                        <Button
                          style={{
                            marginTop: 10,
                            paddingHorizontal: 50,
                            elevation: 0,
                            alignSelf: 'center',
                            borderColor: ApiUtils.green(),
                            borderWidth: 1,
                            marginRight: 10,
                            backgroundColor: ApiUtils.green(),
                          }}
                          onPress={() => this.continue()}>
                          <Text
                            style={{
                              color: 'white',
                            }}>
                            Reprendre
                          </Text>
                        </Button>
                      )}

                      <Button
                        style={{
                          marginTop: 10,
                          paddingHorizontal: 50,
                          elevation: 0,
                          alignSelf: 'center',
                          borderColor: ApiUtils.red(),
                          borderWidth: 1,
                          backgroundColor: ApiUtils.red(),
                        }}
                        onPress={() => this.stop()}>
                        <Text
                          style={{
                            color: 'white',
                          }}>
                          Arrêter
                        </Text>
                      </Button>
                    </View>
                  ) : null}

                  {this.state.isStarted ? (
                    <View style={{marginLeft: 12}}>
                      <View>
                        <Text
                          style={{
                            marginTop: 10,
                            textAlign: 'center',
                            fontWeight: 'bold',
                          }}>
                          Vitesse
                        </Text>

                        <Slider
                          step={1}
                          minimumValue={1}
                          maximumValue={500}
                          style={{width: '90%'}}
                          value={this.state.accelerator}
                          onValueChange={(value) =>
                            this.setState({accelerator: value})
                          }
                        />
                        <Text style={{fontSize: 12}}>
                          X{this.state.accelerator}
                        </Text>
                      </View>

                      <Text
                        style={{
                          marginTop: 10,
                          textAlign: 'center',
                          fontWeight: 'bold',
                        }}>
                        Durée
                      </Text>

                      <Text style={{textAlign: 'center'}}>
                        {moment('1900-01-01 00:00:00')
                          .add(this.state.startTimeSeconds, 'seconds')
                          .format('HH:mm:ss')}
                      </Text>
                    </View>
                  ) : null}
                </View>
              )}
              {/* <ScrollView contentContainerStyle={styles.loginButtonSection}> */}
              <View
                style={{
                  height: this.state.isMapFullSize ? '90%' : 200,
                  marginTop: this.state.isMapFullSize ? 0 : 20,
                  flex: 1,
                }}>
                {/* {this.state.isloading ? (
                  <ActivityIndicator />
                ) : ( */}
                <MapView
                  ref="map"
                  style={{
                    height: this.state.isMapFullSize
                      ? Dimensions.get('screen').height
                      : 400,
                  }}
                  mapType={this.props.currentMapStyle}
                  showsUserLocation={false}
                  followsUserLocation={false}
                  showsMyLocationButton={false}
                  showsPointsOfInterest={false}
                  showsScale={false}
                  showsTraffic={false}
                  // onPress={(coordinate) => { this.showMapFullSize() }}
                  toolbarEnabled={false}
                  initialRegion={{
                    latitude: 45.76512485710589, // dag system
                    longitude: 4.8696115893891765,
                    latitudeDelta: LATITUDE_DELTA,
                    longitudeDelta: LONGITUDE_DELTA,
                  }}
                  onLayout={() => this.centerMap()}>
                  {this.state.coordinates != null &&
                  this.state.coordinates.length > 0 ? (
                    <MapView.Polyline
                      key="polyline1"
                      coordinates={this.state.coordinates}
                      geodesic={true}
                      strokeColor="orange"
                      strokeWidth={3}
                      zIndex={0}
                    />
                  ) : null}

                  {this.state.coordinates2 != null &&
                  this.state.coordinates2.length > 0 ? (
                    <MapView.Polyline
                      key="polyline2"
                      coordinates={this.state.coordinates2}
                      geodesic={true}
                      strokeColor="yellow"
                      strokeWidth={3}
                      zIndex={0}
                    />
                  ) : null}

                  {this.state.currentMarker != null ? (
                    <Marker
                      // onPress={() => this.onClickInterestPoint(marker)}
                      // onCalloutPress={() => this.onClickInterestPoint(marker)}
                      key={'marker1'}
                      coordinate={this.state.currentMarker}
                      tracksViewChanges={false}>
                      <View
                        style={{
                          width: 25,
                          height: 25,
                          backgroundColor: ApiUtils.getColor(),
                          borderRadius: 100,
                          borderColor: 'white',
                          borderWidth: 1,
                          justifyContent: 'center',
                        }}>
                        <Text
                          style={{
                            color: 'white',
                            textAlign: 'center',
                            textAlignVertical: 'center',
                          }}>
                          1
                        </Text>
                      </View>
                    </Marker>
                  ) : null}

                  {this.state.currentMarker2 != null ? (
                    <Marker
                      // onPress={() => this.onClickInterestPoint(marker)}
                      // onCalloutPress={() => this.onClickInterestPoint(marker)}
                      key={'marker2'}
                      coordinate={this.state.currentMarker2}
                      tracksViewChanges={false}>
                      <View
                        style={{
                          width: 25,
                          height: 25,
                          backgroundColor: ApiUtils.red(),
                          borderRadius: 100,
                          borderColor: 'white',
                          borderWidth: 1,
                          justifyContent: 'center',
                        }}>
                        <Text
                          style={{
                            color: 'white',
                            textAlign: 'center',
                            textAlignVertical: 'center',
                          }}>
                          2
                        </Text>
                      </View>
                    </Marker>
                  ) : null}
                  {/* 
                  {this.props.polylines != null
                    ? this.props.polylines
                        .filter(pol => pol.isActive == true)
                        .map((polyline, index) => (
                          <MapView.Polyline
                            key={polyline.nomTrace + index}
                            // onPress={() => this.selectPolyline(polyline)}
                            coordinates={polyline.positionsTrace}
                            tappable={true}
                            tracksViewChanges={false}
                            zIndex={0}
                            geodesic={true}
                            strokeColor={polyline.couleurTrace}
                            strokeWidth={5}
                          />
                        ))
                    : null} */}
                </MapView>
                {/* )} */}

                {/* {this.props.polylines != null &&
                this.props.polylines.length > 0 ? (
                  <Button
                    onPress={this.onOpenTraceModal.bind(this)}
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      width: 53,
                      height: 53,
                      backgroundColor: 'white',
                      zIndex: 5,
                      position: 'absolute',
                      top: Platform.OS == 'android' ? 20 : 20,
                      left: 80,
                    }}>
                    <Icon
                      type="Ionicons"
                      name="map-outline"
                      style={[{color: '#000', fontSize: 22}]}
                    />
                  </Button>
                ) : null} */}

                {this.props.currentMapStyle == 'standard' ||
                this.props.currentMapStyle == 'hybrid' ||
                this.props.currentMapStyle == 'terrain' ? (
                  <Fab
                    active={this.state.fabActive}
                    direction="down"
                    containerStyle={{}}
                    style={{backgroundColor: '#5067FF'}}
                    position="topRight"
                    onPress={() =>
                      this.setState({fabActive: !this.state.fabActive})
                    }>
                    <Icon name={this.getFabDefaultLogo()} type="FontAwesome5" />

                    {this.props.currentMapStyle != 'standard' ? (
                      <Button
                        style={{backgroundColor: '#34A34F'}}
                        onPress={() =>
                          this.setState({fabActive: false}, () =>
                            this.saveCurrentMapStyle('standard'),
                          )
                        }>
                        <Icon name="map" type="FontAwesome5" />
                      </Button>
                    ) : null}

                    {this.props.currentMapStyle != 'hybrid' ? (
                      <Button
                        style={{backgroundColor: '#34A34F'}}
                        onPress={() =>
                          this.setState({fabActive: false}, () =>
                            this.saveCurrentMapStyle('hybrid'),
                          )
                        }>
                        <Icon name="satellite" type="FontAwesome5" />
                      </Button>
                    ) : null}

                    {Platform.OS == 'android' &&
                    this.props.currentMapStyle != 'terrain' ? (
                      <Button
                        style={{backgroundColor: '#34A34F'}}
                        onPress={() =>
                          this.setState({fabActive: false}, () =>
                            this.saveCurrentMapStyle('terrain'),
                          )
                        }>
                        <Icon name="tree" type="FontAwesome5" />
                      </Button>
                    ) : null}
                  </Fab>
                ) : null}

                <Button
                  style={{
                    backgroundColor: 'white',
                    height: 53,
                    backgroundColor: 'white',
                    width: 53,
                    position: 'absolute',
                    top: Platform.OS == 'ios' ? 20 : 20,
                    left: Platform.OS == 'ios' ? 20 : 10,
                    // left : 0,
                    zIndex: 2,
                  }}
                  onPress={() => this.showMapFullSize()}>
                  {this.state.isMapFullSize ? (
                    <Icon
                      style={{color: 'black'}}
                      name="compress"
                      type="FontAwesome"
                    />
                  ) : (
                    <Icon
                      style={{color: 'black'}}
                      name="expand"
                      type="FontAwesome"
                    />
                  )}
                </Button>

                <Button
                  onPress={this.centerMap.bind(this)}
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    width: 53,
                    height: 53,
                    backgroundColor: 'white',
                    zIndex: 5,
                    position: 'absolute',
                    top: 20,
                    right: 100,
                  }}>
                  <Icon active name="md-locate" style={styles.centerLogo} />
                </Button>
              </View>
              {/* </ScrollView> */}

              {/* </View> */}
              <View style={{marginBottom: 300}} />
            </Content>
            <Sponsors />
            {/******** modal5 : Traces list  *****************/}
            <ModalSmall
              isVisible={this.state.isModalTraceVisible}
              onRequestClose={() => {
                this.setState({isModalTraceVisible: false});
              }}
              onSwipeComplete={() =>
                this.setState({isModalTraceVisible: false})
              }
              // swipeDirection={'left'}
            >
              <View
                style={{
                  marginTop: 22,
                  display: 'flex',
                  flexDirection: 'row-reverse',
                  backgroundColor: 'white',
                  marginRight: 0,
                  borderTopLeftRadius: 20,
                  borderTopRightRadius: 20,
                }}>
                <Button
                  style={{
                    backgroundColor: 'transparent',
                    elevation: 0,
                    marginRight: 10,
                  }}
                  onPress={() => {
                    this.closeTraceModal();
                  }}>
                  <IconElement active name="times-circle" type="font-awesome" />
                </Button>
              </View>
            </ModalSmall>
          </Container>
        </Root>
      </Drawer>
    );
  }
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: 'white',
    width: '100%',
    borderBottomColor: '#D3D3D3',
    borderBottomWidth: 1,
  },
  title: {
    width: '25%',
  },
  map: {
    height: 200,
  },
  buttonok: {
    marginTop: 20,
    marginBottom: 0,
    alignSelf: 'center',
    // width: 150,
    height: 30,
    borderRadius: 10,
    // marginRight: 40,
    backgroundColor: 'black',
  },
  saveButton: {
    backgroundColor: 'transparent',
    width: '38%',
    marginTop: 0,
    paddingTop: 0,
  },
  logo: {
    width: '100%',
    height: 50,
    marginRight: '50%',
  },
  bold: {
    fontWeight: 'bold',
  },
  drawerButton: {
    backgroundColor: 'transparent',
    width: '100%',
    marginTop: 0,
    paddingTop: 10,
    shadowOffset: {height: 0, width: 0},
    shadowOpacity: 0,
    elevation: 0,
    paddingLeft: 0,
  },
  resultCol: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    width: '30%',
  },
  resultNumber: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  saveText: {
    color: 'black',
    paddingLeft: 0,
    marginLeft: 5,
    marginRight: -5,
  },
  body: {
    width: '100%',
    backgroundColor: 'white',
    flex: 1,
    paddingBottom: 200,
  },
  loginButtonSection: {
    width: '100%',
    // height: '120%',
    flex: 1,
    paddingBottom: 100,
    // marginTop: 5,
  },
  centerLogo: {
    color: '#000',
  },
  container: {
    width: '100%',
  },
  textLink: {
    fontWeight: 'bold',
    fontSize: 15,
    marginTop: 16,
    marginRight: 10,
    alignContent: 'center',
    textAlign: 'center',
  },
  markerIcon: {
    borderWidth: 1,
    borderColor: ApiUtils.getBackgroundColor(),
    backgroundColor: ApiUtils.getBackgroundColor(),
    width: 10,
    height: 10,
    borderRadius: 5,
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
});

export default connect(mapStateToProps)(Replay);
