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
} from 'native-base';
import MapView from 'react-native-maps';
import ApiUtils from '../ApiUtils';
import AsyncStorage from '@react-native-community/async-storage';
import {connect} from 'react-redux';
import RNFetchBlob from 'rn-fetch-blob';
import Share from 'react-native-share';
import Logo from '../assets/logo_header.png';
import GlobalStyles from '../styles';

const mapStateToProps = state => {
  return {
    userData: state.userData,
    currentLive: state.currentLive,
    currentMapStyle: state.currentMapStyle,
    sports: state.sports,
  };
};

const LATITUDE_DELTA = 0.16022;
const LONGITUDE_DELTA = 0.01221;

class LiveSummary extends Component {
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
    formData.append('positions', 1);

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
      .then(response => response.json())
      .then(responseJson => {
        this.setState({live: responseJson});
        // alert(JSON.stringify(responseJson.segmentEfforts.length));
        // this.setState({ segmentEfforts: responseJson.segmentEfforts });
        this.setState({statsLive: responseJson.statsLive});

        var action = {type: 'SAVE_CURRENT_LIVE', data: responseJson};

        this.props.dispatch(action);
        console.log(responseJson.idActiviteStravaLive);

        var libelleSport = this.props.sports.filter(
          s => s.idSport == responseJson.idSport,
        )[0].libelleSport;
        this.setState({libelleSport: libelleSport});

   
        this.saveCoordinates(responseJson.positions.tracks[0].trkseg[0].points);


        this.setState({isloading: false});
      })
      .catch(e => {
        this.setState({isloading: false});
        ApiUtils.logError('LiveSummary loadLive', e.message);
      });
  }

  onClickDownloadGpx(url, name) {
    this.downloadFile(url, name);
  }

  saveCoordinates(positions) {
    var coordinates = [];

    positions.forEach(element => {
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
      .then(response => response.json())
      .then(responseJson => {
        var result = [];
        for (var i in responseJson) {
          result.push(responseJson[i]);
        }
        var selectableSports = [];
        result.forEach(function(element, index) {
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
      .catch(e => ApiUtils.logError('LiveSummary getSports', e.message))
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
    ShareRn.share(
      {
        message:
          'Découvrez mon activité à la Foulée Blanche  : ' +
          'https://www.folomi.fr/s/compte/partage-fouleeblanche.php?c=' +
          this.state.live.codeLive,
        title: 'Découvrez mon activité à la Foulée Blanche !',
      },
      {
        // Android only:
        dialogTitle: 'Découvrez mon activité à la Foulée Blanche ! ',
      },
    );
  }

  openLink(url) {
    Linking.canOpenURL(url).then(supported => {
      if (supported) {
        Linking.openURL(url);
      } else {
        ApiUtils.logError('Home openLink', 'Dont know how to open URI: ' + url);
      }
    });
  }

  downloadFile(url, name) {
    if (Platform.OS == 'android') {
      this.checkPermissions(url, name);
    } else {
      this.onDownloadFileok(url, name);
    }
  }

  onDownloadFileok(url, name) {
    let dirs = RNFetchBlob.fs.dirs;
    let path = dirs.DownloadDir + '/' + 'folomi' + '/' + name + '.gpx';

    var _this = this;
    return RNFetchBlob.config({
      path: path,
    })
      .fetch('GET', encodeURI(url))
      .then(() => {
        _this.shareToFiles(path);
      })
      .catch(e => alert(e));
  }

  checkPermissions(url, name) {
    if (Platform.OS == 'android') {
      try {
        PermissionsAndroid.request(
          'android.permission.WRITE_EXTERNAL_STORAGE',
        ).then(res => {
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

  shareToFiles = async filePath => {
    const shareOptions = {
      title: 'Save file',
      failOnCancel: false,
      saveToFiles: true,
      url: Platform.OS === 'android' ? 'file://' + filePath : filePath, // base64 with mimeType or path to local file
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
          {/* <View style={styles.loginButtonSection}> */}
          <ScrollView contentContainerStyle={styles.loginButtonSection}>
            {/* <View style={styles.loginButtonSection}> */}
            {this.state.isMapFullSize ? null : (
              <View
                style={{
                  paddingLeft: 10,
                  paddingRight: 5,
                  marginBottom: 10,
                  paddingTop: 10,
                }}>
                <Text style={styles.bold}>{this.state.live.libelleLive}</Text>
                <Text>
                  {this.getShortDate(this.state.live.dateCreationLive) +
                    ' - ' +
                    this.getShortTime(this.state.live.dateCreationLive)}
                </Text>
              </View>
            )}

            <View
              style={{height: this.state.isMapFullSize ? '90%' : 200, flex: 1}}>
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
                    <MapView.Polyline
                      key="polyline"
                      coordinates={this.state.coordinates}
                      geodesic={true}
                      strokeColor="rgba(63,170,239, 1)"
                      strokeWidth={3}
                      zIndex={0}
                    />
                  ) : null}
                </MapView>
              )}
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

                {this.state.statsLive == null && !this.state.isloading ? (
                  <View>
                    <Text style={{textAlign: 'center'}}>
                      Votre activité est en cours de calcul sur notre serveur
                    </Text>
                    <TouchableOpacity
                      onPress={() =>
                        this.loadLive(this.props.currentLive.idLive)
                      }>
                      <Text
                        style={{
                          textAlign: 'center',
                          textDecorationLine: 'underline',
                        }}>
                        Cliquez ici pour actualiser
                      </Text>
                    </TouchableOpacity>
                  </View>
                ) : (
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
                        <Text style={[GlobalStyles.uppercase]}>DéNIVELé +</Text>
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
                        <Text style={[GlobalStyles.uppercase]}>DéNIVELé -</Text>
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
                )}
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

                {this.state.statsLive?.lienReplay != null ? (
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
                    onPress={() =>
                      this.openLink(this.state.statsLive.lienReplay)
                    }
                    disabled={this.state.followCode == ''}>
                    <Text
                      style={{
                        textAlign: 'center',
                        textTransform: 'uppercase',
                        fontWeight: 'bold',
                      }}>
                      REJOUER VOTRE ACTIVITé
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

                {this.state.live.idActiviteStravaLive == null && !this.state.isloading ?
                    <View style={{marginTop : 10}}>
                    <Text style={{textAlign: 'center'}}>
                      Vos challenges sont en cours sur notre serveur
                    </Text>
                    <TouchableOpacity
                      onPress={() =>
                        this.loadLive(this.props.currentLive.idLive)
                      }>
                      <Text
                        style={{
                          textAlign: 'center',
                          textDecorationLine: 'underline',
                          marginTop : 10
                        }}>
                        Cliquez ici pour actualiser
                      </Text>
                    </TouchableOpacity>
                  </View>
                 : null}

                {this.state.live.segmentEfforts != null &&
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
                      Vos challenges de la séance
                    </Text>

                    {this.state.live.segmentEfforts.map(segment => {
                      return (
                        <View>
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
                                  <Text style={{textAlign : 'center', alignSelf : 'center', marginBottom : 3}}>Distance</Text>
                                  <Text>{segment.distanceSegment} km</Text>
                                </View>

                                <Text>|</Text>
                                <View>
                                <Text style={{textAlign : 'center', marginBottom : 3}}>Temps</Text>
                                  <Text>{segment.tempsSegmentString}</Text>
                                </View>
                                <Text>|</Text>
                                <View>
                                <Text style={{textAlign : 'center', marginBottom : 3}}>Allure</Text>
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
              </View>
            )}
            {/* </View> */}
          </ScrollView>
          {/* </View> */}
        </Content>
      </Container>
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
    alignSelf: 'center',
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
});

export default connect(mapStateToProps)(LiveSummary);
