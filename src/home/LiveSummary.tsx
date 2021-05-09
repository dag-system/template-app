import React, {Component, useEffect, useRef, useState} from 'react';
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
  Modal,
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
import moment from 'moment';
import AutoHeightWebView from 'react-native-autoheight-webview';
import WebView from 'react-native-webview';
import haversine from 'haversine-distance';
import MapView, {Polyline} from 'react-native-maps';
import ApiUtils from '../ApiUtils';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {connect, useDispatch, useSelector} from 'react-redux';
import RNFetchBlob from 'rn-fetch-blob';
import Share from 'react-native-share';
import Logo from '../assets/logo.png';
import GlobalStyles from '../styles';
import {Sponsors} from './Sponsors';
import {ReactNativeModal as ModalSmall} from 'react-native-modal';
import {Icon as IconElement} from 'react-native-elements';
import {FlatList} from 'react-native';
import {check, request, PERMISSIONS, RESULTS} from 'react-native-permissions';
import DefaultProps from '../models/DefaultProps';
import {
  VictoryArea,
  VictoryAxis,
  VictoryBar,
  VictoryChart,
  VictoryTheme,
} from 'victory-native';

import {TemplateSportLive, textAutoBackgroundColor} from '../globalsModifs';
import GpxService from '../services/GpxServices';
import Live from '../models/Live';
import {useNavigation} from '@react-navigation/core';
import AppState from '../models/AppState';

// const mapStateToProps = (state) => {
//   return {
//     userData: state.userData,
//     currentLiveSummary: state.currentLiveSummary,
//     currentMapStyle: state.currentMapStyle,
//     polylines: state.polylines,
//     sports: state.sports,
//   };
// };

const LATITUDE_DELTA = 0.016022;
const LONGITUDE_DELTA = 0.001221;

interface Props extends DefaultProps {
  userData: any;
  currentLiveSummary: any;
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
  isOpenReplayModal: boolean;
  splits: any[];
  speedData: any[];
}

export default function LiveSummary(props: Props) {
  const [live, setLive] = useState<Live>();
  const [loading, setIsLoading] = useState(true);
  const [splits, setSplits] = useState<any[]>([]);
  const [speedData, setSpeedData] = useState<any[]>([]);
  const [sports, setSports] = useState<any[]>([]);
  const [libelleSport, setLibelleSport] = useState('');
  const [coordinates, setCoordinates] = useState<any[]>([]);
  const [isMapFullSize, setIsMapFullSize] = useState(false);
  const [statsLive, setStatsLive] = useState<any>();
  const [fabActive, setFabActive] = useState(false);
  const [currentPolyline, setCurrentPolyline] = useState(null);
  const [segmentEfforts, setSegmentEfforts] = useState<any[]>([]);
  const [isModalTraceVisible, setIsModalTraceVisible] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [isOpenReplayModal, setIsOpenReplayModal] = useState(false);
  const mapRef = useRef<MapView>(null);
  const {
    userData,
    currentLiveSummary,
    currentMapStyle,
    polylines,
  } = useSelector((state: AppState) => state);

  const navigation = useNavigation();
  const dispatch = useDispatch();

  useEffect(() => {
    loadLive(currentLiveSummary.idLive)
  }, [currentLiveSummary.idLive]);
  // constructor(props) {
  //   super(props);

  //   state = {
  //     live: {},
  //     sports: [],
  //     libelleSport: '',
  //     coordinates: [],
  //     isMapFullSize: false,
  //     splits: [],
  //     isloading: true,
  //     statsLive: {
  //       distance: null,
  //       allureKm: null,
  //       dMoins: '',
  //       dPlus: '',
  //       duree: '',
  //       lienPartage: null,
  //       lienReplay: null,
  //       vMoy: '',
  //     },
  //     refresh: false,
  //     followCode: null,
  //     fabActive: false,
  //     segmentEfforts: [],
  //     currentPolyline: null,
  //     isModalTraceVisible: false,
  //     isOpenReplayModal: false,
  //     speedData: [],
  //   };
  // }

  // componentDidMount() {
  //   setTimeout(() => loadLive(currentLiveSummary.idLive), 300);
  // }

  const loadLive = (idLive: number) => {
    setIsLoading(true);
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
        setLive(responseJson);

        // alert(JSON.stringify(responseJson.segmentEfforts.length));
        // setState({ segmentEfforts: responseJson.segmentEfforts });
        setStatsLive(responseJson.statsLive);
        // setState({statsLive: responseJson.statsLive});

        var action = {type: 'SAVE_CURRENT_LIVE', data: responseJson};

        dispatch(action);

        let libelleSport = '';
        const jsonSport = TemplateSportLive;

        for (let i = 0; i < jsonSport.length; i++) {
          if (jsonSport[i].idSport == responseJson.idSport) {
            libelleSport = jsonSport[i].sportName;
          }
        }

        setLibelleSport(libelleSport);
        // setState({libelleSport: libelleSport});

        if (responseJson.IsImportedFromGpx == 1) {
          getGpxPoint(responseJson.gpxLive);
        } else {
          saveCoordinates(responseJson.positions.tracks[0].trkseg[0].points);
        }

        setIsLoading(false);
      })

      .catch((e) => {
        setIsLoading(false);
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
  };

  const getGpxPoint = (gpxName: string) => {
    setIsLoading(true);
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
        setIsLoading(false);

        let dataMap = getCoordinatesForMap(data);
        setCoordinates(() => {
          centerMapOnGpx(dataMap);
          return dataMap;
        });
        // setState({coordinates: dataMap}, () =>
        //   centerMapOnGpx(dataMap),
        // );

        centerMapOnGpx(dataMap);
      })

      .catch((e) => {
        setIsLoading(false);
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
  };

  const getCoordinatesForMap = (positions: any[]) => {
    var coordinates: any[] = [];
    positions.forEach((element) => {
      element = Object.values(element);

      var coordinate = {
        latitude: parseFloat(element[0]),
        longitude: parseFloat(element[1]),
      };
      coordinates.push(coordinate);
    });

    return coordinates;
  };

  const onDownloadFileok = async (url: string, name: string) => {
    let dirs = RNFetchBlob.fs.dirs;
    let path = dirs.DocumentDir + '/' + name + '.gpx';

    return RNFetchBlob.config({
      path: path,
    })
      .fetch('GET', encodeURI(url))
      .then((res) => {
        let status = res.info().status;

        if (status == 200) {
          console.log(res.path());
          shareToFiles(res.path());
        }
      })
      .catch((e) => Alert.alert(e));
  };

  const onClickDownloadGpx = (url: string, name: string | undefined) => {
    if (name != null) {
      downloadFile(url, name);
    }
  };

  const saveCoordinates = (positions: any[]) => {
    var coordinates: any[] = [];

    positions.forEach((element) => {
      var coordinate = {
        latitude: element.lat,
        longitude: element.lon,
      };
      coordinates.push(coordinate);
    });
    // if (coordinates.length > 0) {
    //   refs.map.fitToCoordinates(coordinates, {
    //     edgePadding: {top: 10, right: 10, bottom: 10, left: 10},
    //     animated: false,
    //   });
    // }

    setCoordinates(() => {
      centerMap();
      return coordinates;
    });

    // setState({coordinates: coordinates}, () => centerMap());

    var live = currentLiveSummary;
    live.coordinates = coordinates;

    var action = {type: 'SAVE_CURRENT_LIVE', data: live};
    dispatch(action);

    //calculateTimeForEachKm(positions);
  };

  const calculateTimeForEachKm = (coordinates: any[]) => {
    let dist = 0;
    let splits = [];
    let startPoint = coordinates[0];
    let speedData = [];

    for (let i = 1; i < coordinates.length; i++) {
      let currentDist = GpxService.calculateDistBetweenTwoPoints(
        coordinates[i],
        coordinates[i - 1],
      );
      dist += currentDist;

      let currentTime = GpxService.calculateTimeBetweenTwoPoints(
        coordinates[i],
        coordinates[i - 1],
      );
      let currentSpeed = GpxService.convertTokmH(
        GpxService.calculateSpeed(currentDist, currentTime),
      );
      speedData.push({index: i, speed: currentSpeed, totalDist: dist});
      if (dist > 1000) {
        let time = GpxService.calculateTimeBetweenTwoPoints(
          coordinates[i],
          startPoint,
        );
        let speed = GpxService.convertTokmH(
          GpxService.calculateSpeed(dist, time),
        );

        let pace = GpxService.speedToPace(speed);
        let timeString = GpxService.paceDisplay(time);
        splits.push({time: timeString, dist: dist, speed: speed, pace: pace});
        dist = GpxService.calculateDistBetweenTwoPoints(
          coordinates[i],
          coordinates[i - 1],
        );
        startPoint = coordinates[i - 1];
      }

      if (i == coordinates.length - 1) {
        let time = GpxService.calculateTimeBetweenTwoPoints(
          coordinates[i],
          startPoint,
        );

        let speed = GpxService.convertTokmH(
          GpxService.calculateSpeed(dist, time),
        );
        let pace = GpxService.speedToPace(speed);
        let timeString = GpxService.paceDisplay(time);
        splits.push({time: timeString, dist: dist, speed: speed, pace: pace});

        dist = 0;
        startPoint = coordinates[i];
      }
    }
    // console.log(splits);
    setSplits(splits);
    setSpeedData(speedData);
    // setState({splits: splits, speedData: speedData});
  };

  const getSports = (idSport: number) => {
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
        var selectableSports: any[] = [];
        result.forEach(function (element, index) {
          var newSelectableSport = {
            value: index,
            label: element,
          };
          selectableSports.push(newSelectableSport);
        });
        setSports(selectableSports);
        // setState({sports: selectableSports});
        var libelleSport = sports[idSport - 1].label;
        setLibelleSport(libelleSport);
        // setState({libelleSport: libelleSport});
      })
      .catch((e) => ApiUtils.logError('LiveSummary getSports', e.message))
      .then();
  };

  const onGoBack = () => {
    navigation.navigate('Lives');
  };

  const getShortDate = (date: string | undefined) => {
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
  };

  const getShortTime = (date: string | undefined) => {
    if (!!date) {
      var justDate = date.substr(10, 10);

      var splitDate = justDate.split(':');

      var hour = splitDate[0];

      var minutes = splitDate[1];
      return hour + 'h' + minutes;
    } else {
      return '';
    }
  };

  const onClickShare = () => {
    shareOldStyle();
  };

  const shareOldStyle = () => {
    let url = 'https://folomi.fr/s/compte/partage.php?c=' + live?.codeLive;
    if (live?.segmentEfforts != null && live?.segmentEfforts.length > 0) {
      url =
        'https://folomi.fr/s/compte/photo-challenge.php?idE=' +
        live?.segmentEfforts[0].idEffort;
    }

    ShareRn.share(
      {
        message: 'Découvrez mon activité : ' + url,
        title: 'Découvrez mon activité !',
      },
      {
        // Android only:
        dialogTitle: 'Découvrez mon activité ! ',
      },
    );
  };

  const share = (base64image: string) => {
    let shareOptions = {
      title: 'Découvrez mon activité',
      url: base64image,
      message: 'https://folomi.fr/s/compte/partage.php?c=' + live?.codeLive,
      subject: 'Découvrez mon activité',
    };

    Share.open(shareOptions)
      .then(() => {})
      .catch((err: any) => {
        err && console.log(err);
      });
  };

  const downloadFile = (url: string, name: string) => {
    // if (Platform.OS == 'android') {
    checkPermissions(url, name);
    // } else {
    //   onDownloadFileok(url, name);
    // }
  };

  const openReplayModal = () => {
    setIsOpenReplayModal(true);
  };

  const closeReplayModal = () => {
    setIsOpenReplayModal(false);
  };

  const checkPermissions = (url: string, name: string) => {
    if (Platform.OS == 'android') {
      try {
        PermissionsAndroid.request(
          'android.permission.WRITE_EXTERNAL_STORAGE',
        ).then((res) => {
          if (res == 'granted') {
            onDownloadFileok(url, name);
          } else {
            // alert('error')
            requestStoragePermission(url, name);
          }
        });
      } catch (error) {
        console.warn('location set error:', error);
      }
    } else {
      requestMediaLibraryPermission(url, name);
    }
  };

  const requestMediaLibraryPermission = (url: string, name: string) => {
    check(PERMISSIONS.IOS.MEDIA_LIBRARY)
      .then((result) => {
        switch (result) {
          case RESULTS.UNAVAILABLE:
            onDownloadFileok(url, name);
            break;
          case RESULTS.DENIED:
            askMediaLibraryPermission(url, name);
            break;
          case RESULTS.GRANTED:
            onDownloadFileok(url, name);
            break;
          case RESULTS.BLOCKED:
            break;
          default:
        }
      })
      .catch((error) => {});
  };

  const askMediaLibraryPermission = (url: string, name: string) => {
    request(PERMISSIONS.IOS.MEDIA_LIBRARY).then((result) => {
      if (result == RESULTS.DENIED) {
        Alert.alert(
          'Permission refusée',
          'Vous devez accepter cette permission pour pouvoir télécharger le gpx',
        );
      } else {
        onDownloadFileok(url, name);
      }
    });
  };

  const requestStoragePermission = async (url: string, name: string) => {
    try {
      const granted = await PermissionsAndroid.requestMultiple([
        'android.permission.WRITE_EXTERNAL_STORAGE',
      ])
      if (granted['android.permission.WRITE_EXTERNAL_STORAGE'] === PermissionsAndroid.RESULTS.GRANTED) {
        onDownloadFileok(url, name);
      } else {
      }
    } catch (err) {
      // console.warn(err);
    }
  };

  const selectPolyline = (polyline: any) => {
    setCurrentPolyline(polyline);
    // setState({currentPolyline: polyline});
  };

  const toggleTrace = (traceName: string) => {
    var action = {type: 'TOGGLE_TRACE', data: traceName};
    dispatch(action);
    setRefresh((value) => !value);
  };

  const shareToFiles = async (filePath: string) => {
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

  const centerMapOnTrace = (polyline: any) => {
    if (polyline.positionsTrace.length != 0) {
      mapRef?.current?.fitToCoordinates(polyline.positionsTrace, {
        edgePadding: {top: 10, right: 10, bottom: 10, left: 10},
        animated: true,
      });
    }
    closeTraceModal();
    selectPolyline(polyline);
  };

  const centerMapOnGpx = (positions: any[]) => {
    mapRef?.current?.fitToCoordinates(positions, {
      edgePadding: {top: 10, right: 10, bottom: 10, left: 10},
      animated: true,
    });
  };

  const saveCurrentMapStyle = (style: any) => {
    var action = {type: 'UPDATE_MAP_STYLE', data: style};
    dispatch(action);
  };

  const getFabDefaultLogo = () => {
    if (currentMapStyle == 'terrain') {
      return 'tree';
    }

    if (currentMapStyle == 'hybrid') {
      return 'satellite';
    }
    return 'map';
  };

  const showMapFullSize = () => {
    setIsMapFullSize((value) => !value);
    centerMap();
  };

  const onOpenTraceModal = () => {
    setIsModalTraceVisible(true);
  };

  const closeTraceModal = () => {
    setIsModalTraceVisible(false);
  };

  // static navigationOptions = {
  //   drawerLabel: () => null,
  // };

  const centerMap = () => {
    if (coordinates != null && coordinates.length != 0 && mapRef?.current != null) {
      mapRef?.current?.fitToCoordinates(coordinates, {
        edgePadding: {top: 10, right: 10, bottom: 10, left: 10},
        animated: true,
      });
    }
    closeTraceModal();
  };

  const onOpenSegment = (segment: any) => {
    saveCurrentSegment(segment);
    // alert("ok");
    return navigation.navigate('SegmentSummary');
  };

  const saveCurrentSegment = (segment: any) => {
    try {
      AsyncStorage.setItem('@followme:currentSegment', JSON.stringify(segment));
    } catch (error) {
      ApiUtils.logError('LiveSummary currentSegment', error.message);
    }
  };

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
              <Button style={styles.drawerButton} onPress={() => onGoBack()}>
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
            {statsLive == null && live?.IsImportedFromGpx == 0 && !loading ? (
              <View>
                <Text style={{textAlign: 'center'}} />
                <TouchableOpacity
                  onPress={() => loadLive(currentLiveSummary.idLive)}>
                  <Text
                    style={{
                      textAlign: 'center',
                    }}>
                    Votre challenge est en cours de calcul.
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => loadLive(currentLiveSummary.idLive)}>
                  <Text
                    style={{
                      textAlign: 'center',
                      textDecorationLine: 'underline',
                      marginTop: 10,
                    }}>
                    Cliquez ici plus tard pour recevoir un résumé de votre
                    Challenge
                  </Text>
                </TouchableOpacity>
              </View>
            ) : null}

            {isMapFullSize ? null : (
              <View>
                {live?.idActiviteStravaLive == null &&
                live?.gpxLive != null &&
                !loading ? (
                  <View style={{marginTop: 10}}>
                    <Text style={{textAlign: 'center', paddingHorizontal: 12}}>
                      Patientez, votre challenge est toujours en cours de
                      calcul. Voici en attendant votre activité globale de votre
                      journée
                    </Text>
                    <TouchableOpacity
                      onPress={() => loadLive(currentLiveSummary.idLive)}>
                      <Text
                        style={{
                          textAlign: 'center',
                          textDecorationLine: 'underline',
                          marginTop: 10,
                        }}>
                        Cliquez ici plus tard pour recevoir un résumé de votre
                        Challenge
                      </Text>
                    </TouchableOpacity>
                  </View>
                ) : null}

                {isMapFullSize ? null : live?.segmentEfforts != null &&
                  live?.segmentEfforts.length > 0 ? (
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
                        color: ApiUtils.getColor(),
                        // backgroundColor: '#E6E6E6',
                      }}>
                      Challenge
                    </Text>

                    {live.segmentEfforts.map((segment) => {
                      return (
                        <View style={{paddingHorizontal: 10}}>
                          <TouchableOpacity
                            onPress={() => onOpenSegment(segment)}>
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
                                    color: ApiUtils.getColor(),
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
                                      borderColor: ApiUtils.getColor(),
                                      borderWidth: 2,
                                      // marginTop: -8,
                                      fontWeight: 'bold',
                                      color: ApiUtils.getColor(),
                                    }}>
                                    Voir
                                  </Text>
                                </View>
                              </View>
                              <View>
                                {segment.isValid != null &&
                                segment.isValid != 1 ? (
                                  <Text
                                    style={{
                                      textAlign: 'center',
                                      marginTop: 5,
                                    }}>
                                    Le parcours effectué n'a pas été consideré
                                    comme complet. Cette activité n'est donc pas
                                    dans les résultats.
                                  </Text>
                                ) : null}
                              </View>
                            </View>
                          </TouchableOpacity>
                        </View>
                      );
                    })}
                  </View>
                ) : null}

                {live?.segmentEfforts?.length == 0 &&
                live.idActiviteStravaLive != null ? (
                  <View>
                    <Text
                      style={{
                        textAlign: 'center',
                        marginTop: 10,
                        marginBottom: 10,
                      }}>
                      Aucun challenge détécté
                    </Text>
                  </View>
                ) : null}
              </View>
            )}
            {isMapFullSize ? null : (
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

                <Text style={styles.bold}>{live?.libelleLive}</Text>
                <Text>
                  {getShortDate(live?.dateCreationLive) +
                    ' - ' +
                    getShortTime(live?.dateCreationLive)}
                </Text>
              </View>
            )}

            <View
              style={{
                height: isMapFullSize ? '90%' : 200,
                flex: 1,
              }}>
              {loading ? (
                <ActivityIndicator />
              ) : (
                <MapView
                ref={mapRef}
                  style={{
                    height: isMapFullSize
                      ? Dimensions.get('screen').height
                      : 200,
                  }}
                  mapType={currentMapStyle}
                  showsUserLocation={false}
                  followsUserLocation={false}
                  showsMyLocationButton={false}
                  showsPointsOfInterest={false}
                  showsScale={false}
                  showsTraffic={false}
                  // onPress={(coordinate) => { showMapFullSize() }}
                  toolbarEnabled={false}
                  initialRegion={{
                    latitude: 45.78728972333324, // 44.843884,
                    longitude: 4.874593511376774,
                    latitudeDelta: LATITUDE_DELTA,
                    longitudeDelta: LONGITUDE_DELTA,
                  }}
                  onLayout={() => centerMap()}>
                  {coordinates != null && coordinates.length > 0 ? (
                    <Polyline
                      key="polyline"
                      coordinates={coordinates}
                      geodesic={true}
                      strokeColor="rgba(63,170,239, 1)"
                      strokeWidth={3}
                      zIndex={12}
                    />
                  ) : null}

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
                </MapView>
              )}

              {polylines != null && polylines.length > 0 ? (
                <Button
                  onPress={() => onOpenTraceModal()}
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

              {currentMapStyle == 'standard' ||
              currentMapStyle == 'hybrid' ||
              currentMapStyle == 'terrain' ? (
                <Fab
                  active={fabActive}
                  direction="down"
                  containerStyle={{}}
                  style={{backgroundColor: '#5067FF'}}
                  position="topRight"
                  onPress={() => setFabActive((value) => !value)}>
                  <Icon name={getFabDefaultLogo()} type="FontAwesome5" />

                  {currentMapStyle != 'standard' ? (
                    <Button
                      style={{backgroundColor: '#34A34F'}}
                      onPress={() =>
                        setFabActive(() => {
                          saveCurrentMapStyle('standard');
                          return false;
                        })
                      }>
                      <Icon name="map" type="FontAwesome5" />
                    </Button>
                  ) : null}

                  {currentMapStyle != 'hybrid' ? (
                    <Button
                      style={{backgroundColor: '#34A34F'}}
                      onPress={() =>
                        setFabActive(() => {
                          saveCurrentMapStyle('hybrid');
                          return false;
                        })
                      }>
                      <Icon name="satellite" type="FontAwesome5" />
                    </Button>
                  ) : null}

                  {Platform.OS == 'android' &&
                  currentMapStyle != 'terrain' ? (
                    <Button
                      style={{backgroundColor: '#34A34F'}}
                      onPress={() =>
                        setFabActive(() => {
                          saveCurrentMapStyle('terrain');
                          return false;
                        })
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
                onPress={() => showMapFullSize()}>
                {isMapFullSize ? (
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
                onPress={() => centerMap()}
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

            {isMapFullSize ? null : (
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
                  {libelleSport}
                </Text>

                {statsLive == null &&
                !loading ? null : live?.IsImportedFromGpx == 0 ? (
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
                          {statsLive?.distance} km
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
                        <Text style={[GlobalStyles.uppercase]}>DéNIVELé +</Text>
                        <Text style={styles.resultNumber}>
                          {statsLive?.dPlus} m
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
                        <Text style={[GlobalStyles.uppercase]}>DéNIVELé -</Text>
                        <Text style={styles.resultNumber}>
                          {statsLive?.dMoins} m
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
                          {statsLive?.duree}
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
                          {statsLive?.vMoy} km/h
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
                          {statsLive?.allureKm}
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

                {splits != null && splits.length > 0 ? (
                  <View>
                    <VictoryChart
                    // theme={VictoryTheme.material}
                    >
                      <VictoryArea data={speedData} x="dist" y="speed" />
                      <VictoryAxis
                        dependentAxis
                        label="Vitesse (km/h)"
                        fixLabelOverlap={true}
                        style={{
                          axis: {stroke: '#756f6a'},
                          axisLabel: {fontSize: 20, padding: 30},
                          // grid: {stroke: ({ tick }) => tick > 0.5 ? "red" : "grey"},
                          ticks: {stroke: 'grey', size: 0},
                          tickLabels: {fontSize: 15, padding: 5},
                        }}
                      />
                      <VictoryAxis
                        label="Distance km"
                        style={{
                          axis: {stroke: '#756f6a'},
                          axisLabel: {fontSize: 20, padding: 30},
                          // grid: {stroke: ({ tick }) => tick > 0.5 ? "red" : "grey"},
                          ticks: {stroke: 'grey', size: 0},
                          tickLabels: {fontSize: 15, padding: 5},
                        }}
                        tickFormat={(t) => (t / 100).toFixed(1)}
                      />
                    </VictoryChart>
                    <Text>Intervalles</Text>
                    {splits.map((split, index) => {
                      return (
                        <View
                          style={{
                            display: 'flex',
                            flexDirection: 'row',
                            justifyContent: 'space-around',
                          }}>
                          {/* <Text>{index} </Text> */}
                          <Text>
                            {split.dist > 1000
                              ? index + 1
                              : (split.dist / 1000).toFixed(2)}{' '}
                            km{' '}
                          </Text>
                          <Text>{split.time} s </Text>
                          <Text>{split.speed?.toFixed(1)} km/h </Text>
                          <Text>
                            {split.dist > 1000 ? split.time : split.pace}/km
                          </Text>
                        </View>
                      );
                    })}
                  </View>
                ) : null}
                {live?.commentLive != '' && live?.commentLive != null ? (
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
                      {live.commentLive}
                    </Text>
                  </View>
                ) : null}

                {statsLive?.lienReplay != null &&
                live?.IsImportedFromGpx != 1 ? (
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
                    onPress={() => openReplayModal()}
                 >
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
                {statsLive?.lienPartage != null ? (
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
                    onPress={() => onClickShare()}
                  >
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

                {live?.gpxLive != null ? (
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
                      onClickDownloadGpx(
                        ApiUtils.getGpxUrl(live.gpxLive),
                        live.gpxLive,
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

        <Modal
          visible={isOpenReplayModal}
          onRequestClose={() => closeReplayModal()}>
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
                  onPress={() => closeReplayModal()}>
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

          <Content
            style={{paddingHorizontal: 0, paddingTop: 0}}
            scrollEnabled={true}>
            <WebView
              source={{
                uri:
                  'https://folomi.fr/s/compte/playback.php?idLs[]=' +
                  live?.idLive,
              }}
              style={{
                marginTop: 0,
                height:
                  Dimensions.get('screen').height -
                  (Platform.OS === 'ios' ? 64 : 56),
              }}></WebView>
          </Content>
        </Modal>

        {/******** modal5 : Traces list  *****************/}
        <ModalSmall
          isVisible={isModalTraceVisible}
          onSwipeComplete={() => setIsModalTraceVisible(false)}
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
                closeTraceModal();
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
                    {currentLiveSummary?.libelleLive}
                  </Text>
                  <Text
                    style={{fontSize: 14}}
                    numberOfLines={1}
                    ellipsizeMode="tail">
                    {libelleSport} - {statsLive?.distance} km -
                    {statsLive?.dPlus}D+
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
                    centerMap();
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
                data={polylines}
                renderItem={({item}) => (
                  <TouchableHighlight
                    underlayColor="rgba(255,255,255,1,0.6)"
                    // underlayColor='rgba(192,192,192,1,0.6)'
                    // onPress={viewLive.bind(this, item)}
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
                            toggleTrace(item.nomTrace);
                          }}>
                          {!item.isActive ? (
                            <IconElement name="eye-slash" type="font-awesome" />
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
                            centerMapOnTrace(item);
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

const styles = StyleSheet.create({
  header: {
    backgroundColor: ApiUtils.getBackgroundColor(),
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
    color: textAutoBackgroundColor,
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

// export default connect(mapStateToProps)(LiveSummary);
