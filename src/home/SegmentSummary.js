import React, {Component} from 'react';
import {
  StyleSheet,
  Linking,
  View,
  Image,
  ScrollView,
  Share,
  FlatList,
  TouchableHighlight,
  ActivityIndicator,
} from 'react-native';
import {
  Container,
  Header,
  Left,
  Body,
  Right,
  Text,
  Button,
  Icon,
} from 'native-base';
import MapView from 'react-native-maps';
import ApiUtils from '../ApiUtils';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {connect} from 'react-redux';
import Logo from '../assets/logo_header.png';
import Autrans from '../assets/autrans.svg';
const mapStateToProps = (state) => {
  return {
    userData: state.userData,
    recordingState: state.recordingState,
    lives: state.lives,
    sports: state.sports,
    currentMapStyle: state.currentMapStyle,
  };
};

class SegmentSummary extends Component {
  constructor(props) {
    super(props);

    this.state = {
      live: {},
      sports: [],
      libelleSport: '',
      segment: {},
      denivelePlusSegment: 0,
      nomSegment: 0,
      distanceSegment: 0,
      coordinates: [],
      statsLive: {
        distance: null,
      },
      userdata: {
        idUtilisateur: '',
        nomUtilisateur: '',
        prenomUtilisateur: '',
        folocodeUtilisateur: '',
        acceptShareSegment: false,
      },
      showEffortList: false,
      bestSegment: null,
      segmentEfforts: [],
      isLoading: true,
    };
  }

  componentDidMount() {
    this.setState({showEffortList: false});

    this.loadCurrentSegment().then((res) => {
      var segment = JSON.parse(res);

      this.setState({
        nomSegment: segment.nomSegment,
        distanceSegment: segment.distanceSegment,
        denivelePlusSegment: segment.denivelePlusSegment,
      });
      this.loadSegment(segment.idSegment);
    });
  }

  getBestSegment(segment) {
    if (segment.segmentEfforts != null && segment.segmentEfforts.length > 0) {
      var minTime = this.getMinTimeOfSegments(segment.segmentEfforts);
      var bestSegment = this.segment.segmentEfforts.filter(
        (s) => s.timeSegment == minTime,
      )[0];
      this.setState({bestSegment: bestSegment});
    }
    return 0;
  }

  openLive(idLive) {
    this.saveCurrentLiveFromSegment(idLive);
  }

  saveCurrentLiveFromSegment(idLive) {
    var action = {type: 'CURRENT_LIVE_FOR_SEGMENT_ID', data: idLive};
    this.props.dispatch(action);

    this.onClickNavigate('LiveSummaryFromSegment');

    // var live = {
    //   idLive: idLive
    // };
    // try {
    //   AsyncStorage.setItem('@followme:currentLiveFromSegment', JSON.stringify(live)).then(this.onClickNavigate('LiveSummaryFromSegment'));
    // } catch (error) {
    //   alert("error saving " + error.message);
    // }
  }
  onClickNavigate(routeName) {
    this.props.navigation.navigate(routeName);
  }

  loadSegment(idSegment) {
    let formData = new FormData();
    formData.append('method', 'getSegmentDetail');
    formData.append('auth', ApiUtils.getAPIAuth());
    formData.append('idSegment', idSegment);
    formData.append('idUtilisateur', this.props.userData.idUtilisateur);
    // formData.append('idLive', idLive);//to do
    // formData.append('positions', 1);

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
      .then((response) => response.json()) //;
      .then((responseJson) => {
        // alert(JSON.stringify(responseJson));
        console.log(responseJson);
        this.setState({segment: responseJson});
        // this.setState({ segmentEfforts: responseJson.efforts });

        this.saveCoordinates(responseJson.coords); // TO DO
        this.getBestSegment(responseJson);

        this.setState({isLoading: false});
      })

      .catch((e) => {
        this.setState({isloading: false});
        ApiUtils.logError('get segment', JSON.stringify(e.message));
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

  async loaduserData() {
    return ApiUtils.loaduserData().then((res) => {
      var user = JSON.parse(res);
      this.setState({userdata: user});
      return user;
    });
  }

  saveCoordinates(positions) {
    var coordinates = [];
    positions.forEach((element) => {
      var coordinate = {
        latitude: parseFloat(element[0]),
        longitude: parseFloat(element[1]),
      };
      coordinates.push(coordinate);
    });
    if (this.refs.map != null) {
      this.refs.map.fitToCoordinates(coordinates, {
        edgePadding: {top: 10, right: 10, bottom: 10, left: 10},
        animated: false,
      });
    }

    this.setState({coordinates: coordinates});
  }

  async loadCurrentSegment() {
    return AsyncStorage.getItem(
      '@followme:currentSegment',
      (err, segmentString) => {
        if (segmentString !== null) {
          // var segment = JSON.parse(segment);
          return segmentString;
        }
      },
    );
  }

  onGoBack() {
    this.props.navigation.navigate('LiveSummary');
  }

  getShortDate(date) {
    if (!!date) {
      var justDate = date.substr(0, 10);
      var splitDate = justDate.split('-');
      var year = splitDate[0].substr(2, 2);
      var month = splitDate[1];
      var day = splitDate[2];
      return day + '/' + month + '/' + year;
    }
  }

  getShortTime(date) {
    if (!!date) {
      var justDate = date.substr(10, 10);

      var splitDate = justDate.split(':');

      var hour = splitDate[0];

      var minutes = splitDate[1];
      return hour + 'h' + minutes;
    }
  }

  onClickShare() {
    Share.share(
      {
        message:
          'Découvrez mon activité au DIY TAC Run  : ' +
          this.state.statsLive.lienPartage,
        title: 'Découvrez mon activité  au DIY TAC Run!',
      },
      {
        // Android only:
        dialogTitle: 'Découvrez mon activité au DIY TAC Run! ',
      },
    );
  }

  openLink(url) {
    Linking.canOpenURL(url).then((supported) => {
      if (supported) {
        Linking.openURL(url);
      } else {
        ApiUtils.logError('Home openLink', 'Dont know how to open URI: ' + url);
      }
    });
  }

  getMinTimeOfSegments(segmentEfforts) {
    var min = segmentEfforts[0].timeSegment;
    for (let s of segmentEfforts) {
      if (s.timeSegment < min) {
        min = s.timeSegment;
      }
    }
    return min;
  }

  static navigationOptions = {
    drawerLabel: () => null,
  };

  centerMap() {
    if (this.state.coordinates.length != 0) {
      this.refs.map.fitToCoordinates(this.state.coordinates, {
        edgePadding: {top: 10, right: 10, bottom: 10, left: 10},
        animated: true,
      });
    }
  }

  getEffortLabel(number) {
    if (number > 1) {
      return 'efforts';
    } else {
      return 'effort';
    }
  }

  showEffortList() {
    this.setState({showEffortList: true});
  }

  render() {
    return (
      <Container>
        {/* <Body style={styles.body}> */}

        <Header style={styles.header}>
          <Left style={{flex: 1}}>
            {/* <View style={{ flexDirection: 'row', justifyContent: 'flex-start', width: '100%', paddingRight: 0, paddingLeft: 0, marginTop: 20, marginBottom: 20 }}> */}
            <Button style={styles.drawerButton} onPress={() => this.onGoBack()}>
              <Icon
                style={styles.saveText}
                name="chevron-left"
                type="FontAwesome5"
              />
              {/* <Text style={styles.saveText}>Précedent</Text> */}
            </Button>
            {/* </View> */}
          </Left>
          <Body style={{flex: 0}} />
          <Right style={{flex: 1}}>
            <Image resizeMode="contain" source={Logo} style={styles.logo} />
            <Autrans
              width={'40%'}
              height={50}
              style={{
                alignSelf: 'center',
                opacity: 1,
                marginLeft: 10,
                marginBottom: 5,
              }}
            />
          </Right>
        </Header>
        <View style={styles.loginButtonSection}>
          <ScrollView contentContainerStyle={styles.loginButtonSection}>
            <View style={styles.loginButtonSection}>
              {/* <View style={{ paddingLeft: 10, paddingRight: 5, marginBottom: 10 }}>
                  <Text style={styles.bold}>{this.state.segment.nomSegment}</Text>
                </View> */}

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
                  top: 70,
                  right: 20,
                }}>
                <Icon active name="md-locate" style={styles.centerLogo} />
              </Button>

              <View
                style={{
                  width: '100%',
                  paddingRight: 0,
                  paddingLeft: 10,
                  marginTop: 10,
                  marginBottom: 10,
                }}>
                <Text style={{fontWeight: 'bold'}}>
                  {' '}
                  {this.state.nomSegment}
                </Text>
                <Text>
                  {' '}
                  {this.state.distanceSegment} km -{' '}
                  {this.state.denivelePlusSegment}D+
                </Text>
              </View>

              {/* <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', paddingRight: 10, paddingLeft: 10, marginTop: 0, marginBottom: 20 }}>
                    <View style={styles.resultCol}><Text>Distance</Text><Text style={styles.resultNumber}>{this.state.segment.distanceSegment} km</Text></View>
                    <View style={styles.resultCol}><Text>Denivelé +</Text><Text style={styles.resultNumber}>{this.state.segment.denivelePlusSegment} m</Text></View>
                    <View style={styles.resultCol}><Text>Denivelé -</Text><Text style={styles.resultNumber}>{this.state.segment.deniveleMoinsSegment} m </Text></View>
                  </View> */}

              <View style={styles.map}>
                {this.state.isLoading ? (
                  <ActivityIndicator />
                ) : (
                  <MapView
                    ref="map"
                    style={styles.map}
                    mapType={this.props.currentMapStyle}
                    showsUserLocation={false}
                    followsUserLocation={false}
                    showsMyLocationButton={false}
                    showsPointsOfInterest={false}
                    showsScale={false}
                    showsTraffic={false}
                    // onPress={(coordinate) => { this.props.navigation.navigate('LiveSummaryMap'); }} //TO DO
                    toolbarEnabled={false}
                    onLayout={() => this.centerMap()}>
                    <MapView.Polyline
                      key="polyline"
                      coordinates={this.state.coordinates}
                      geodesic={true}
                      strokeColor="rgba(63,170,239, 1)"
                      strokeWidth={3}
                      zIndex={0}
                    />
                  </MapView>
                )}
              </View>

              <View>
                {/* {!this.state.showEffortList && this.state.segment.efforts != null && this.state.segment.efforts.listEfforts != null ?

                    <View
                      style={{
                        marginBottom: 0, paddingLeft: 10, paddingRight: 10, padding: 10,
                        marginTop: 0,
                        backgroundColor: 'white',
                        borderBottomWidth: 0.5,
                        justifyContent: 'center',
                        borderBottomColor: '#B9B9B9'
                      }}>
                      <TouchableHighlight
                       underlayColor='rgba(255,255,255,1,0.6)'
                        onPress={() => this.showEffortList()}>
                        <View>
                          <TouchableHighlight
                          underlayColor='rgba(255,255,255,1,0.6)'
                            onPress={() => this.showEffortList()}>
                            <Text>Voir vos résultats </Text>
                          </TouchableHighlight>
                          <TouchableHighlight
                           underlayColor='rgba(255,255,255,1,0.6)'
                            onPress={() => this.showEffortList()}>
                            <Text>{this.state.segment.efforts.listEfforts.length} {this.getEffortLabel(this.state.segment.efforts.listEfforts.length)} </Text>
                          </TouchableHighlight>
                        </View>
                      </TouchableHighlight>
                    </View>
                    : null} */}

                {this.state.segment.efforts != null &&
                this.state.segment.efforts.listEfforts != null ? (
                  <View style={{justifyContent: 'center'}}>
                    <View>
                      <Text
                        style={{
                          padding: 10,
                          textAlign: 'center',
                          color: ApiUtils.getBackgroundColor(),
                        }}>
                        VOS EFFORTS
                      </Text>
                      <View
                        style={{
                          marginBottom: 0,
                          paddingLeft: 10,
                          paddingRight: 10,
                          padding: 10,
                          marginTop: 0,
                          backgroundColor: 'white',
                          borderBottomWidth: 0.5,
                          borderBottomColor: '#B9B9B9',
                        }}>
                        <Text>
                          Vous avez effectué ce segment{' '}
                          {this.state.segment.efforts.listEfforts.length} fois.{' '}
                        </Text>
                        <View style={{display: 'flex', flexDirection: 'row'}}>
                          <Text style={{color: '#787221'}}>
                            Meilleur temps le{' '}
                            {this.state.segment.efforts.bestEffort.dateEffort}{' '}
                            en{' '}
                          </Text>
                          <Text style={{color: '#787221', fontWeight: 'bold'}}>
                            {this.state.segment.efforts.bestEffort.tempsEffort}{' '}
                          </Text>
                        </View>
                      </View>
                    </View>

                    <FlatList
                      style={{width: '100%'}}
                      data={this.state.segment.efforts.listEfforts.sort(
                        (a, b) => a.dateEffort < b.dateEffort,
                      )}
                      renderItem={({item}) =>
                        item.idEffort ==
                        this.state.segment.efforts.bestEffort.idEffort ? (
                          <TouchableHighlight
                            underlayColor="rgba(255,255,255,1,0.6)"
                            disabled={true}
                            // onPress={() => this.openLive(item.idLive)}
                          >
                            <View style={styles.rowContainer}>
                              <View>
                                <Text style={{fontWeight: 'bold'}}>
                                  {item.dateEffort}
                                </Text>
                              </View>
                              <View>
                                <Text style={{fontWeight: 'bold'}}>
                                  {item.tempsEffort}
                                </Text>
                              </View>
                            </View>
                          </TouchableHighlight>
                        ) : (
                          <TouchableHighlight
                            underlayColor="rgba(255,255,255,1,0.6)"
                            // onPress={() => this.openLive(item.idLive)}
                          >
                            <View style={styles.rowContainer}>
                              <View>
                                <TouchableHighlight
                                  underlayColor="rgba(255,255,255,1,0.6)"
                                  onPress={() => this.openLive(item.idLive)}>
                                  <Text>{item.dateEffort}</Text>
                                </TouchableHighlight>
                              </View>
                              <View>
                                <TouchableHighlight
                                  underlayColor="rgba(255,255,255,1,0.6)"
                                  onPress={() => this.openLive(item.idLive)}>
                                  <Text>{item.tempsEffort}</Text>
                                </TouchableHighlight>
                              </View>
                            </View>
                          </TouchableHighlight>
                        )
                      }
                      keyExtractor={(item, index) => index.toString()}
                    />
                  </View>
                ) : null}

                {this.state.segment.classement != null ? (
                  <View style={{justifyContent: 'center'}}>
                    <Text
                      style={{
                        padding: 10,
                        textAlign: 'center',
                        color: ApiUtils.getBackgroundColor(),
                      }}>
                      CLASSEMENT
                    </Text>

                    <FlatList
                      style={{height: '85%', width: '100%'}}
                      data={this.state.segment.classement}
                      renderItem={({item}) =>
                        item.idUtilisateur ==
                        this.props.userData.idUtilisateur ? (
                          <View style={styles.rowContainer}>
                            <Text />
                            <View>
                              <Text style={{fontWeight: 'bold'}}>
                                {item.classement}
                              </Text>
                            </View>
                            <View>
                              <Text
                                style={{fontWeight: 'bold', textAlign: 'left'}}>
                                {item.prenomUtilisateur} {item.nomUtilisateur}
                              </Text>
                            </View>
                            <View>
                              <Text style={{fontWeight: 'bold'}}>
                                {item.tempsEffort} - le {item.dateEffort}
                              </Text>
                            </View>
                          </View>
                        ) : (
                          <View style={styles.rowContainer}>
                            <View>
                              <Text>{item.classement}</Text>
                            </View>
                            <View>
                              <Text style={{textAlign: 'left'}}>
                                {item.prenomUtilisateur} {item.nomUtilisateur}
                              </Text>
                            </View>
                            <View>
                              <Text>
                                {item.tempsEffort} - le {item.dateEffort}
                              </Text>
                            </View>
                          </View>
                        )
                      }
                      keyExtractor={(item, index) => index.toString()}
                    />
                  </View>
                ) : null}
              </View>
            </View>
            <View style={{marginBottom: 200}} />
          </ScrollView>
        </View>
        {/* </Body> */}
      </Container>
    );
  }
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: 'white',
    width: '100%',
  },
  title: {
    width: '25%',
  },
  map: {
    height: 200,
  },
  buttonok: {
    marginTop: 30,
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
  },
  loginButtonSection: {
    width: '100%',
    // height: '140%',
    paddingBottom: 100,
  },
  centerLogo: {
    color: '#000',
  },
  container: {
    width: '100%',
  },
  logo: {
    width: '100%',
    height: 50,
    alignSelf: 'center',
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    padding: 20,
    marginTop: 0,
    marginBottom: 0,
    backgroundColor: 'white',
    borderBottomWidth: 0.5,
    borderBottomColor: '#B9B9B9',
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

export default connect(mapStateToProps)(SegmentSummary);
