import React, {Component} from 'react';
import {
  Platform,
  StyleSheet,
  Linking,
  View,
  PermissionsAndroid,
  Image,
  ActivityIndicator,
  ScrollView,
  Share as ShareRn,
  TouchableHighlight,
  TouchableOpacity,
  Dimensions,
  Alert,
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
} from 'native-base';
import MapView, {Polyline} from 'react-native-maps';
import ApiUtils from '../ApiUtils';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {connect} from 'react-redux';
import RNFetchBlob from 'rn-fetch-blob';
import Share from 'react-native-share';
import Logo from '../assets/logo_header.png';
import GlobalStyles from '../styles';
import {Sponsors} from './Sponsors';
import Autrans from '../assets/autrans.svg';
import {ReactNativeModal as ModalSmall} from 'react-native-modal';
import {Icon as IconElement} from 'react-native-elements';
import {FlatList} from 'react-native';
import GPXDocument from '../lib/gpx-parse/GPXDocument';
import {check, request, PERMISSIONS, RESULTS} from 'react-native-permissions';
import DefaultProps from '../models/DefaultProps';

const mapStateToProps = (state) => {
  return {
    userData: state.userData,
    currentLive: state.currentLive,
    currentMapStyle: state.currentMapStyle,
    polylines: state.polylines,
    sports: state.sports,
  };
};

const LATITUDE_DELTA = 0.16022;
const LONGITUDE_DELTA = 0.01221;

interface Props extends DefaultProps {
  userData: any;
  currentLive: any;
  currentMapStyle: string;
  polylines: any[];
  sports: any[];
}

interface State {
  live: any;
  sports: any[];
  libelleSport: string;
  coordinates: any[];
  isMapFullSize: boolean;
  isloading: boolean;
  statsLive: {
    distance: number;
    dPlus: string;
    vMoy: string;
    dMoins: string;
    allureKm: string;
    lienReplay: string;
    lienPartage: string;
    duree: string;
  };
  followCode: string;
  fabActive: boolean;
  currentPolyline: any;
  segmentEfforts: any[];
  isModalTraceVisible: boolean;
  refresh: boolean;
}

class LiveSummary extends Component<Props, State> {
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
        allureKm: null,
        dMoins: '',
        dPlus: '',
        duree: '',
        lienPartage: null,
        lienReplay: null,
        vMoy: '',
      },
      refresh: false,
      followCode: null,
      fabActive: false,
      segmentEfforts: [],
      currentPolyline: null,
      isModalTraceVisible: false,
    };
  }

  componentDidMount() {
    this.loadLive(this.props.currentLive.idLive);
  }

  loadLive(idLive) {
    this.setState({isloading: true});
    let formData = new FormData();
    formData.append('method', 'getDetailLive');
    formData.append('auth', ApiUtils.getAPIAuth());
    formData.append('idLive', idLive);
    formData.append('positions', '1');

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
        this.setState({live: responseJson});
        // alert(JSON.stringify(responseJson.segmentEfforts.length));
        // this.setState({ segmentEfforts: responseJson.segmentEfforts });
        this.setState({statsLive: responseJson.statsLive});
        var action = {type: 'SAVE_CURRENT_LIVE', data: responseJson};

        this.props.dispatch(action);

        let libelleSport = 'CROSS';
        if (responseJson.idSport == 17) libelleSport = 'CROSS';

        this.setState({libelleSport: libelleSport});

        if (responseJson.IsImportedFromGpx == 1) {
          this.getGpxPoint(responseJson.gpxLive);
        } else {
          this.saveCoordinates(
            responseJson.positions.tracks[0].trkseg[0].points,
          );
        }

        this.setState({isloading: false});
      })

      .catch((e) => {
        this.setState({isloading: false});
        ApiUtils.logError('create live', JSON.stringify(e.message));
        // alert('Une erreur est survenue : ' + JSON.stringify(e.message));
        console.log(e);
        if (e.message == 'Timeout' || e.message == 'Network request failed') {
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

  getGpxPoint(gpxName) {
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
        this.setState({isloading: false});

        let dataMap = this.getCoordinatesForMap(data);
        this.setState({coordinates: dataMap}, () =>
          this.centerMapOnGpx(dataMap),
        );

        this.centerMapOnGpx(dataMap);
      })

      .catch((e) => {
        this.setState({isloading: false});
        // ApiUtils.logError('create live', JSON.stringify(e.message));
        // alert('Une erreur est survenue : ' + JSON.stringify(e.message));
        console.log(e);
        if (e.message == 'Timeout' || e.message == 'Network request failed') {
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

  getCoordinatesForMap(positions) {
    var coordinates = [];
    positions.forEach((element) => {
      element = Object.values(element);

      var coordinate = {
        latitude: parseFloat(element[0]),
        longitude: parseFloat(element[1]),
      };
      coordinates.push(coordinate);
    });

    return coordinates;
  }

  async onDownloadFileok(url, name) {
    let dirs = RNFetchBlob.fs.dirs;
    let path = dirs.DocumentDir + '/' + name + '.gpx';

    var _this = this;
    return RNFetchBlob.config({
      path: path,
    })
      .fetch('GET', encodeURI(url))
      .then((res) => {
        let status = res.info().status;

        if (status == 200) {
          console.log(status);
          console.log(res.path());
          _this.shareToFiles(res.path());
        }
      })
      .catch((e) => alert(e));
  }

  onClickDownloadGpx(url, name) {
    this.downloadFile(url, name);
  }

  saveCoordinates(positions) {
    var coordinates = [];

    positions.forEach((element) => {
      var coordinate = {
        latitude: element.lat,
        longitude: element.lon,
      };
      coordinates.push(coordinate);
    });
    // if (coordinates.length > 0) {
    //   this.refs.map.fitToCoordinates(coordinates, {
    //     edgePadding: {top: 10, right: 10, bottom: 10, left: 10},
    //     animated: false,
    //   });
    // }

    this.setState({coordinates: coordinates});

    var live = this.props.currentLive;
    live.coordinates = coordinates;

    var action = {type: 'SAVE_CURRENT_LIVE', data: live};
    this.props.dispatch(action);
  }

  getSports(idSport) {
    let formData = new FormData();
    formData.append('method', 'getSports');
    formData.append('auth', ApiUtils.getAPIAuth());

    //fetch followCode API
    return fetch(ApiUtils.getAPIUrl(), {
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
        var result = [];
        for (var i in responseJson) {
          result.push(responseJson[i]);
        }
        var selectableSports = [];
        result.forEach(function (element, index) {
          var newSelectableSport = {
            value: index,
            label: element,
          };
          selectableSports.push(newSelectableSport);
        });
        this.setState({sports: selectableSports});
        var libelleSport = this.state.sports[idSport - 1].label;
        this.setState({libelleSport: libelleSport});
      })
      .catch((e) => ApiUtils.logError('LiveSummary getSports', e.message))
      .then();
  }

  onGoBack() {
    this.props.navigation.navigate('Lives');
  }

  getShortDate(date) {
    if (!!date) {
      var justDate = date.substr(0, 10);
      var splitDate = justDate.split('-');
      var year = splitDate[0].substr(2, 2);
      var month = splitDate[1];
      var day = splitDate[2];
      return day + '/' + month + '/' + year;
    } else {
      return '';
    }
  }

  getShortTime(date) {
    if (!!date) {
      var justDate = date.substr(10, 10);

      var splitDate = justDate.split(':');

      var hour = splitDate[0];

      var minutes = splitDate[1];
      return hour + 'h' + minutes;
    } else {
      return '';
    }
  }

  getSportName() {
    //  alert(this.state.live.idSport);
    return;
  }

  onClickShare() {
    //this.shareImage();
    this.shareOldStyle();
  }

  shareOldStyle() {
    let url =
      'https://folomi.fr/s/compte/partage.php?c=' + this.state.live.codeLive;
    if (this.state.live.segmentEfforts.length > 0) {
      url =
        'https://folomi.fr/s/compte/photo-challenge.php?idE=' +
        this.state.live.segmentEfforts[0].idEffort;
    }

    ShareRn.share(
      {
        message: 'Découvrez mon activité au DIY TAC Run  : ' + url,
        title: 'Découvrez mon activité au DIY TAC Run !',
      },
      {
        // Android only:
        dialogTitle: 'Découvrez mon activité au DIY TAC Run ! ',
      },
    );
  }

  shareImage = () => {
    let url =
      'https://folomi.fr/s/compte/photo-foulee.php?c=' +
      this.state.live.codeLive;

    if (this.state.live.segmentEfforts.length > 0) {
      url =
        'https://folomi.fr/s/compte/photo-challenge.php?idE=' +
        this.state.live.segmentEfforts[0].idEffort;
    }

    RNFetchBlob.fetch('GET', url)
      .then((resp) => {
        let base64image = resp.data;
        if (Platform.OS == 'ios') {
          this.shareOldStyle();
        } else {
          this.share('data:image/png;base64,' + base64image);
        }
      })
      .catch((err) => this.shareOldStyle());
  };

  share = (base64image) => {
    let shareOptions = {
      title: 'Découvrez mon activité au DIY TAC Run',
      url: base64image,
      message:
        'https://folomi.fr/s/compte/partage-fouleeblanche.php?c=' +
        this.state.live.codeLive,
      subject: 'Découvrez mon activité au DIY TAC Run',
    };

    Share.open(shareOptions)
      .then((res) => {})
      .catch((err) => {
        err && console.log(err);
      });
  };

  openLink(idLive) {
    let url = 'https://folomi.fr/s/compte/playback.php?idLs[]=' + idLive;
    Linking.canOpenURL(url).then((supported) => {
      if (supported) {
        Linking.openURL(url);
      } else {
        ApiUtils.logError('Home openLink', 'Dont know how to open URI: ' + url);
      }
    });
  }

  downloadFile(url, name) {
    // if (Platform.OS == 'android') {
    this.checkPermissions(url, name);
    // } else {
    //   this.onDownloadFileok(url, name);
    // }
  }

  checkPermissions(url, name) {
    if (Platform.OS == 'android') {
      try {
        PermissionsAndroid.request(
          'android.permission.WRITE_EXTERNAL_STORAGE',
        ).then((res) => {
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
    } else {
      this.requestMediaLibraryPermission(url, name);
    }
  }

  requestMediaLibraryPermission(url, name) {
    check(PERMISSIONS.IOS.MEDIA_LIBRARY)
      .then((result) => {
        console.log(result);
        switch (result) {
          case RESULTS.UNAVAILABLE:
            this.onDownloadFileok(url, name);
            break;
          case RESULTS.DENIED:
            this.askMediaLibraryPermission(url, name);
            break;
          case RESULTS.LIMITED:
            break;
          case RESULTS.GRANTED:
            this.onDownloadFileok(url, name);
            break;
          case RESULTS.BLOCKED:
            break;
          default:
        }
      })
      .catch((error) => {});
  }

  askMediaLibraryPermission(url, name) {
    request(PERMISSIONS.IOS.MEDIA_LIBRARY).then((result) => {
      if (result == RESULTS.DENIED) {
        Alert.alert(
          'Permission refusée',
          'Vous devez accepter cette permission pour pouvoir télécharger le gpx',
        );
      } else {
        this.onDownloadFileok(url, name);
      }
    });
  }

  requestStoragePermission = async (url, name) => {
    try {
      const granted = await PermissionsAndroid.requestMultiple([
        'android.permission.WRITE_EXTERNAL_STORAGE',
      ]);
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        this.onDownloadFileok(url, name);
      } else {
      }
    } catch (err) {
      // console.warn(err);
    }
  };

  selectPolyline(polyline) {
    this.setState({currentPolyline: polyline});
  }

  toggleTrace(traceName) {
    var action = {type: 'TOGGLE_TRACE', data: traceName};
    this.props.dispatch(action);
    this.setState({refresh: !this.state.refresh});
  }

  shareToFiles = async (filePath) => {
    const shareOptions = {
      title: 'Save file',
      failOnCancel: false,
      saveToFiles: true,
      url: Platform.OS === 'android' ? 'file://' + filePath : filePath,
    };

    // If you want, you can use a try catch, to parse
    // the share response. If the user cancels, etc.
    try {
      const ShareResponse = await Share.open(shareOptions);
    } catch (error) {
      console.log('Error =>', error);
      // setResult('error: '.concat(getErrorString(error)));
    }
  };

  centerMapOnTrace(polyline) {
    if (polyline.positionsTrace.length != 0) {
      this.refs.map.fitToCoordinates(polyline.positionsTrace, {
        edgePadding: {top: 10, right: 10, bottom: 10, left: 10},
        animated: true,
      });
    }
    this.closeTraceModal();
    this.selectPolyline(polyline);
  }

  centerMapOnGpx(positions) {
    this.refs.map.fitToCoordinates(positions, {
      edgePadding: {top: 10, right: 10, bottom: 10, left: 10},
      animated: true,
    });
  }

  saveCurrentMapStyle(style) {
    var action = {type: 'UPDATE_MAP_STYLE', data: style};
    this.props.dispatch(action);
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

  static navigationOptions = {
    drawerLabel: () => null,
  };

  centerMap() {
    if (this.state.coordinates != null && this.state.coordinates.length != 0) {
      this.refs.map.fitToCoordinates(this.state.coordinates, {
        edgePadding: {top: 10, right: 10, bottom: 10, left: 10},
        animated: true,
      });
    }
    this.closeTraceModal();
  }

  onOpenSegment(segment) {
    this.saveCurrentSegment(segment);
    // alert("ok");
    return this.props.navigation.navigate('SegmentSummary');
  }

  saveCurrentSegment(segment) {
    try {
      AsyncStorage.setItem('@followme:currentSegment', JSON.stringify(segment));
    } catch (error) {
      ApiUtils.logError('LiveSummary currentSegment', error.message);
    }
  }

  render() {
    return (
      <Root>
        <Container>
          <Header style={styles.header}>
            <Left style={{flex: 1}}>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'flex-start',
                  width: '100%',
                  paddingRight: 0,
                  paddingLeft: 0,
                  marginTop: 20,
                  marginBottom: 20,
                }}>
                <Button
                  style={styles.drawerButton}
                  onPress={() => this.onGoBack()}>
                  <Icon
                    style={styles.saveText}
                    name="chevron-left"
                    type="FontAwesome5"
                  />
                  {/* <Text style={styles.saveText}>Précedent</Text> */}
                </Button>
              </View>
            </Left>
            <Body style={{flex: 0}} />
            <Right style={{flex: 1}}>
              <Image resizeMode="contain" source={Logo} style={styles.logo} />
            </Right>
          </Header>
          <Content style={styles.body} scrollEnabled={true}>
            <ScrollView contentContainerStyle={styles.loginButtonSection}>
              {this.state.statsLive == null &&
              this.state.live.IsImportedFromGpx == 0 &&
              !this.state.isloading ? (
                <View>
                  <Text style={{textAlign: 'center'}} />
                  <TouchableOpacity
                    onPress={() =>
                      this.loadLive(this.props.currentLive.idLive)
                    }>
                    <Text
                      style={{
                        textAlign: 'center',
                      }}>
                      Votre challenge DIY TAC Run est en cours de calcul.
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() =>
                      this.loadLive(this.props.currentLive.idLive)
                    }>
                    <Text
                      style={{
                        textAlign: 'center',
                        textDecorationLine: 'underline',
                        marginTop: 10,
                      }}>
                      Cliquez ici plus tard pour recevoir un résumé de votre
                      Challenge DIY TAC Run
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() =>
                      Linking.openURL('https://www.insa-lyon.fr/')
                    }>
                    <Text style={{textAlign: 'center', marginTop: 10}}>
                      (Résultats plus complets sur
                    </Text>
                    <Text
                      style={{
                        textAlign: 'center',
                        textDecorationLine: 'underline',
                      }}>
                      {' '}
                      https://www.insa-lyon.fr/)
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : null}

              {this.state.isMapFullSize ? null : (
                <View>
                  {this.state.live.idActiviteStravaLive == null &&
                  this.state.live.gpxLive != null &&
                  !this.state.isloading ? (
                    <View style={{marginTop: 10}}>
                      <Text
                        style={{textAlign: 'center', paddingHorizontal: 12}}>
                        Patientez, votre challenge DIY TAC Run est toujours en
                        cours de calcul. Voici en attendant votre activité
                        globale de votre journée
                      </Text>
                      <TouchableOpacity
                        onPress={() =>
                          this.loadLive(this.props.currentLive.idLive)
                        }>
                        <Text
                          style={{
                            textAlign: 'center',
                            textDecorationLine: 'underline',
                            marginTop: 10,
                          }}>
                          Cliquez ici plus tard pour recevoir un résumé de votre
                          Challenge DIY TAC Run
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() =>
                          Linking.openURL('https://www.insa-lyon.fr/')
                        }>
                        <Text style={{textAlign: 'center', marginTop: 10}}>
                          (Résultats plus complets sur
                        </Text>
                        <Text
                          style={{
                            textAlign: 'center',
                            textDecorationLine: 'underline',
                          }}>
                          {' '}
                          https://www.insa-lyon.fr/)
                        </Text>
                      </TouchableOpacity>
                    </View>
                  ) : null}

                  {this.state.isMapFullSize ? null : this.state.live
                      .segmentEfforts != null &&
                    this.state.live.segmentEfforts.length > 0 ? (
                    <View style={{width: '100%'}}>
                      <Text
                        style={{
                          paddingTop: 5,
                          paddingBottom: 5,
                          fontSize: 20,
                          fontWeight: 'bold',
                          marginBottom: 20,
                          marginTop: 20,
                          textAlign: 'center',
                          color: ApiUtils.getBackgroundColor(),
                          // backgroundColor: '#E6E6E6',
                        }}>
                        Challenge DIY TAC Run
                      </Text>

                      {this.state.live.segmentEfforts.map((segment) => {
                        return (
                          <View style={{paddingHorizontal: 10}}>
                            <TouchableOpacity
                              onPress={() => this.onOpenSegment(segment)}>
                              <View
                                style={{
                                  width: '100%',
                                  marginBottom: 10,
                                  paddingLeft: 0,
                                  paddingRight: 0,
                                  paddingBottom: 10,
                                  borderBottomColor: '#DDDDDD',
                                  borderBottomWidth: 1,
                                  // display: 'flex',
                                  // flexDirection: 'row',
                                  // justifyContent: 'space-between',
                                }}>
                                <View
                                  style={{
                                    display: 'flex',
                                    flexDirection: 'row',
                                    // justifyContent: 'space-evenly',
                                    width: '100%',
                                  }}>
                                  <Text
                                    style={{
                                      marginBottom: 5,
                                      color: ApiUtils.getBackgroundColor(),
                                    }}>
                                    {segment.nomSegment}
                                  </Text>
                                </View>
                                <View
                                  style={{
                                    display: 'flex',
                                    flexDirection: 'row',
                                    justifyContent: 'space-between',
                                    width: '100%',
                                  }}>
                                  <View>
                                    <Text
                                      style={{
                                        textAlign: 'center',
                                        alignSelf: 'center',
                                        marginBottom: 3,
                                      }}>
                                      Distance
                                    </Text>
                                    <Text>{segment.distanceSegment} km</Text>
                                  </View>

                                  <Text>|</Text>
                                  <View>
                                    <Text
                                      style={{
                                        textAlign: 'center',
                                        marginBottom: 3,
                                      }}>
                                      Temps
                                    </Text>
                                    <Text>{segment.tempsSegmentString}</Text>
                                  </View>
                                  <Text>|</Text>
                                  <View>
                                    <Text
                                      style={{
                                        textAlign: 'center',
                                        marginBottom: 3,
                                      }}>
                                      Allure
                                    </Text>
                                    <Text>
                                      {segment.vitesseMoyenneSegment}/km
                                    </Text>
                                  </View>
                                  <View>
                                    <Text
                                      style={{
                                        padding: 5,
                                        borderColor: ApiUtils.getBackgroundColor(),
                                        borderWidth: 2,
                                        // marginTop: -8,
                                        fontWeight: 'bold',
                                        color: ApiUtils.getBackgroundColor(),
                                      }}>
                                      Voir
                                    </Text>
                                  </View>
                                </View>
                              </View>
                            </TouchableOpacity>
                          </View>
                        );
                      })}
                    </View>
                  ) : null}

                  {this.state.live?.segmentEfforts?.length == 0 &&
                  this.state.live.idActiviteStravaLive != null ? (
                    <View>
                      <Text
                        style={{
                          textAlign: 'center',
                          marginTop: 10,
                          marginBottom: 10,
                        }}>
                        Aucun challenge "DIY TAC Run" détécté
                      </Text>
                    </View>
                  ) : null}
                </View>
              )}
              {this.state.isMapFullSize ? null : (
                <View
                  style={{
                    paddingLeft: 10,
                    paddingRight: 5,
                    marginBottom: 10,
                    paddingTop: 10,
                  }}>
                  <Text
                    style={{
                      textAlign: 'center',
                      marginTop: 0,
                      marginBottom: 10,
                    }}>
                    Voici l'activité globale de votre journée :
                  </Text>

                  <Text style={styles.bold}>{this.state.live.libelleLive}</Text>
                  <Text>
                    {this.getShortDate(this.state.live.dateCreationLive) +
                      ' - ' +
                      this.getShortTime(this.state.live.dateCreationLive)}
                  </Text>
                </View>
              )}

              <View
                style={{
                  height: this.state.isMapFullSize ? '90%' : 200,
                  flex: 1,
                }}>
                {this.state.isloading ? (
                  <ActivityIndicator />
                ) : (
                  <MapView
                    ref="map"
                    style={{
                      height: this.state.isMapFullSize
                        ? Dimensions.get('screen').height
                        : 200,
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
                      latitude: 45.1667, // 44.843884,
                      longitude: 5.55,
                      latitudeDelta: LATITUDE_DELTA,
                      longitudeDelta: LONGITUDE_DELTA,
                    }}
                    onLayout={() => this.centerMap()}>
                    {this.state.coordinates != null &&
                    this.state.coordinates.length > 0 ? (
                      <Polyline
                        key="polyline"
                        coordinates={this.state.coordinates}
                        geodesic={true}
                        strokeColor="rgba(63,170,239, 1)"
                        strokeWidth={3}
                        zIndex={0}
                      />
                    ) : null}

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
                  </MapView>
                )}

                {this.props.polylines != null &&
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
                ) : null}

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

              {this.state.isMapFullSize ? null : (
                <View
                  style={{
                    paddingRight: 20,
                    paddingLeft: 20,
                    justifyContent: 'space-evenly',
                  }}>
                  {/* <View
                      style={{
                        flexDirection: 'row',
                        width: '100%',
                       
                      }}> */}
                  <Text
                    style={{
                      fontWeight: 'bold',
                      color: ApiUtils.getBackgroundColor(),
                      marginTop: 10,
                      marginBottom: 10,
                      marginLeft: 10,
                      paddingBottom: 10,
                      borderBottomColor: '#DDDDDD',
                      borderBottomWidth: 1,
                    }}>
                    {this.state.libelleSport}
                  </Text>

                  {this.state.statsLive == null &&
                  !this.state.isloading ? null : this.state.live
                      .IsImportedFromGpx == 0 ? (
                    <View>
                      <View
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'space-evenly',
                          width: '100%',

                          marginTop: 0,
                          marginBottom: 20,
                        }}>
                        <View style={styles.resultCol}>
                          <Text style={[GlobalStyles.uppercase]}>DISTANCE</Text>
                          <Text style={styles.resultNumber}>
                            {this.state.statsLive?.distance} km
                          </Text>
                          <View
                            style={{
                              borderBottomColor: 'black',
                              borderBottomWidth: 1,
                              marginTop: 10,
                              width: 20,
                            }}
                          />
                        </View>
                        <View style={styles.resultCol}>
                          <Text style={[GlobalStyles.uppercase]}>
                            DéNIVELé +
                          </Text>
                          <Text style={styles.resultNumber}>
                            {this.state.statsLive?.dPlus} m
                          </Text>
                          <View
                            style={{
                              borderBottomColor: 'black',
                              borderBottomWidth: 1,
                              marginTop: 10,
                              width: 20,
                            }}
                          />
                        </View>
                        <View style={styles.resultCol}>
                          <Text style={[GlobalStyles.uppercase]}>
                            DéNIVELé -
                          </Text>
                          <Text style={styles.resultNumber}>
                            {this.state.statsLive?.dMoins} m
                          </Text>
                          <View
                            style={{
                              borderBottomColor: 'black',
                              borderBottomWidth: 1,
                              marginTop: 10,
                              width: 20,
                            }}
                          />
                        </View>
                      </View>
                      <View
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'space-evenly',
                          width: '100%',
                        }}>
                        <View style={styles.resultCol}>
                          <Text style={[GlobalStyles.uppercase]}>DURéE</Text>
                          <Text style={styles.resultNumber}>
                            {this.state.statsLive?.duree}
                          </Text>
                          <View
                            style={{
                              borderBottomColor: 'black',
                              borderBottomWidth: 1,
                              marginTop: 10,
                              width: 20,
                            }}
                          />
                        </View>
                        <View style={styles.resultCol}>
                          <Text style={[GlobalStyles.uppercase]}>
                            VITESSE MOY
                          </Text>
                          <Text style={styles.resultNumber}>
                            {this.state.statsLive?.vMoy} km/h
                          </Text>
                          <View
                            style={{
                              borderBottomColor: 'black',
                              borderBottomWidth: 1,
                              marginTop: 10,
                              width: 20,
                            }}
                          />
                        </View>
                        <View style={styles.resultCol}>
                          <Text style={[GlobalStyles.uppercase]}>ALLURE</Text>
                          <Text style={styles.resultNumber}>
                            {this.state.statsLive?.allureKm}
                          </Text>
                          <View
                            style={{
                              borderBottomColor: 'black',
                              borderBottomWidth: 1,
                              marginTop: 10,
                              width: 20,
                            }}
                          />
                        </View>
                      </View>
                    </View>
                  ) : null}
                  {this.state.live.commentLive != '' &&
                  this.state.live.commentLive != null ? (
                    <View
                      style={{
                        width: '100%',
                        paddingRight: 10,
                        paddingLeft: 5,
                      }}>
                      <Text style={{marginTop: 10, fontWeight: 'bold'}}>
                        Commentaires :
                      </Text>
                      <Text style={{marginTop: 5, paddingLeft: 5}}>
                        {this.state.live.commentLive}
                      </Text>
                    </View>
                  ) : null}

                  {this.state.statsLive?.lienReplay != null &&
                  this.state.live.IsImportedFromGpx != 1 ? (
                    <TouchableOpacity
                      style={[
                        GlobalStyles.button,
                        {
                          width: '80%',
                          alignSelf: 'center',
                          marginTop: 30,
                          paddingVertical: 12,
                        },
                      ]}
                      onPress={() => this.openLink(this.state.live.idLive)}
                      disabled={this.state.followCode == ''}>
                      <Text
                        style={{
                          textAlign: 'center',
                          textTransform: 'uppercase',
                          fontWeight: 'bold',
                        }}>
                        Revoir votre parcours
                      </Text>
                    </TouchableOpacity>
                  ) : (
                    <View />
                  )}
                  {this.state.statsLive?.lienPartage != null ? (
                    <TouchableOpacity
                      style={[
                        GlobalStyles.button,
                        {
                          width: '80%',
                          alignSelf: 'center',
                          marginTop: 13,
                          paddingVertical: 12,
                        },
                      ]}
                      onPress={() => this.onClickShare()}
                      disabled={this.state.followCode == ''}>
                      <Text
                        style={{
                          textAlign: 'center',
                          textTransform: 'uppercase',
                          fontWeight: 'bold',
                        }}>
                        PARTAGER
                      </Text>
                    </TouchableOpacity>
                  ) : (
                    <View />
                  )}

                  {this.state.live.gpxLive != null ? (
                    <TouchableOpacity
                      style={[
                        GlobalStyles.button,
                        {
                          width: '80%',
                          alignSelf: 'center',
                          marginTop: 13,
                          paddingVertical: 12,
                        },
                      ]}
                      onPress={() =>
                        this.onClickDownloadGpx(
                          ApiUtils.getGpxUrl(this.state.live.gpxLive),
                          this.state.live.gpxLive,
                        )
                      }>
                      <Text
                        style={{
                          textAlign: 'center',
                          textTransform: 'uppercase',
                          fontWeight: 'bold',
                        }}>
                        Télécharger le fichier GPX
                      </Text>
                    </TouchableOpacity>
                  ) : null}
                </View>
              )}
              {/* </View> */}
            </ScrollView>

            {/* </View> */}
          </Content>
          <Sponsors />
          {/******** modal5 : Traces list  *****************/}
          <ModalSmall
            isVisible={this.state.isModalTraceVisible}
            onSwipeComplete={() => this.setState({isModalTraceVisible: false})}
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
                <IconElement name="times-circle" type="font-awesome" />
              </Button>
            </View>
            <ScrollView
              style={{
                marginTop: 0,
                backgroundColor: 'white',
                paddingBottom: 200,
                borderBottomLeftRadius: 20,
                borderBottomRightRadius: 20,
              }}>
              <View style={{flex: 1, paddingLeft: 10, paddingRight: 10}}>
                <View style={styles.traceLine}>
                  <View
                    style={{
                      width: 20,
                      height: 7,
                      marginTop: 25,
                      marginRight: 3,
                      backgroundColor: 'rgba(63,170,239, 1)',
                    }}
                  />
                  <View
                    style={{
                      width: '70%',
                      paddingTop: 10,
                      display: 'flex',
                      flexDirection: 'column',
                    }}>
                    <Text
                      style={{fontWeight: 'bold'}}
                      numberOfLines={1}
                      ellipsizeMode="tail">
                      {this.props.currentLive.libelleLive}
                    </Text>
                    <Text
                      style={{fontSize: 14}}
                      numberOfLines={1}
                      ellipsizeMode="tail">
                      {this.state.libelleSport} -{' '}
                      {this.state.statsLive?.distance} km -
                      {this.state.statsLive?.dPlus}D+
                    </Text>
                  </View>

                  <Button
                    style={{
                      backgroundColor: 'transparent',
                      zIndex: 1,
                      elevation: 0,
                      marginRight: 0,
                      height: 40,
                      width: 40,
                      justifyContent: 'center',
                    }}
                    onPress={() => {
                      this.centerMap();
                    }}>
                    <View>
                      <IconElement
                        style={{
                          alignSelf: 'center',
                          color: 'black',
                        }}
                        name="search-plus"
                        type="font-awesome"
                      />
                      {/* <Icon active name="md-locate" style={styles.title} /> */}
                      {/* <Icon style={{ alignSelf: 'center' }} active name="times-circle" type='font-awesome' /> */}
                    </View>
                  </Button>
                  {/* <Text style={{ width: 180 }}> Folocode : {item.folocodeUtilisateur} </Text>  */}
                </View>

                <FlatList
                  style={{
                    height: '100%',
                    width: '100%',
                    padding: 0,
                    marginTop: 5,
                    paddingBottom: 200,
                  }}
                  data={this.props.polylines}
                  renderItem={({item}) => (
                    <TouchableHighlight
                      underlayColor="rgba(255,255,255,1,0.6)"
                      // underlayColor='rgba(192,192,192,1,0.6)'
                      // onPress={this.viewLive.bind(this, item)}
                    >
                      <View>
                        <View style={styles.traceLine}>
                          <View
                            style={{
                              width: 20,
                              height: 7,
                              marginTop: 25,
                              marginRight: 3,
                              backgroundColor: item.couleurTrace,
                            }}
                          />
                          <View
                            style={{
                              width: '70%',
                              paddingTop: 10,
                              display: 'flex',
                              flexDirection: 'column',
                            }}>
                            <Text
                              style={{fontWeight: 'bold'}}
                              numberOfLines={1}
                              ellipsizeMode="tail">
                              {item.nomTrace}
                            </Text>
                            <Text
                              style={{fontSize: 14}}
                              numberOfLines={1}
                              ellipsizeMode="tail">
                              {item.sportTrace} - {item.distanceTrace}km -
                              {item.dplusTrace}D+
                            </Text>
                          </View>
                          <Button
                            style={styles.buttonHideTrace}
                            onPress={() => {
                              this.toggleTrace(item.nomTrace);
                            }}>
                            {!item.isActive ? (
                              <IconElement
                                name="eye-slash"
                                type="font-awesome"
                              />
                            ) : (
                              <IconElement name="eye" type="font-awesome" />
                            )}
                          </Button>

                          <Button
                            style={{
                              backgroundColor: 'transparent',
                              zIndex: 1,
                              elevation: 0,
                              marginRight: 0,
                              height: 40,
                              width: 40,
                              justifyContent: 'center',
                            }}
                            onPress={() => {
                              this.centerMapOnTrace(item);
                            }}>
                            <View>
                              <IconElement
                                style={{
                                  alignSelf: 'center',
                                  color: 'black',
                                }}
                                name="search-plus"
                                type="font-awesome"
                              />
                              {/* <Icon active name="md-locate" style={styles.title} /> */}
                              {/* <Icon style={{ alignSelf: 'center' }} active name="times-circle" type='font-awesome' /> */}
                            </View>
                          </Button>
                          {/* <Text style={{ width: 180 }}> Folocode : {item.folocodeUtilisateur} </Text>  */}
                        </View>
                      </View>
                    </TouchableHighlight>
                  )}
                  keyExtractor={(item, index) => index.toString()}
                />
              </View>
            </ScrollView>
          </ModalSmall>
        </Container>
      </Root>
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
    width: 120,
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

export default connect(mapStateToProps)(LiveSummary);
