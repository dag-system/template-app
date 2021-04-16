import React, {Component} from 'react';
import {
  StyleSheet,
  Linking,
  View,
  ScrollView,
  Share,
  TouchableHighlight,
} from 'react-native';
import {Container, Header, Body, Text, Button, Icon} from 'native-base';
import MapView from 'react-native-maps';
import ApiUtils from '../ApiUtils';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {connect} from 'react-redux';

import {textAutoBackgroundColor} from './../globalsModifs';
const mapStateToProps = (state) => {
  return {
    currentLive: state.currentLive,
    sports: state.sports,
    currentLiveFromSegment: state.currentLiveFromSegment,
    currentLiveFromSegmentId: state.currentLiveFromSegmentId,
  };
};

class LiveSummaryFromSegment extends Component {
  constructor(props) {
    super(props);

    this.state = {
      live: {},
      sports: [],
      libelleSport: '',
      coordinates: [],
      statsLive: {
        distance: null,
      },
      segmentEfforts: [],
    };
  }

  componentDidMount() {
    this.loadLive(this.props.currentLiveFromSegmentId);
  }

  loadLive(idLive) {
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
      .then((response) => response.json())
      .then((responseJson) => {
        this.setState({live: responseJson});
        // alert(JSON.stringify(responseJson.segmentEfforts.length));
        // this.setState({ segmentEfforts: responseJson.segmentEfforts });
        this.setState({statsLive: responseJson.statsLive});

        this.saveCurrentLive(responseJson);

        this.saveCoordinates(responseJson.positions.tracks[0].trkseg[0].points);

        this.getSports(responseJson.idSport);
      })
      .catch((e) => ApiUtils.logError('LiveSummary loadLive', e.message))
      .then();
  }

  saveCurrentLive(live) {
    try {
      AsyncStorage.setItem('@followme:currentLive', JSON.stringify(live));
    } catch (error) {
      ApiUtils.logError('LiveSummary saveCurrentLive', error.message);
    }
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
    if (coordinates.length > 0) {
      this.refs.map.fitToCoordinates(coordinates, {
        edgePadding: {top: 10, right: 10, bottom: 10, left: 10},
        animated: false,
      });
    }

    this.setState({coordinates: coordinates});
  }

  onClickNavigate() {
    this.props.navigation.navigate('SimpleMap');
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
        var libelleSport = this.props.sports[idSport - 1].label;
        this.setState({libelleSport: libelleSport});
      })
      .catch((e) => ApiUtils.logError('LiveSummary getSports', e.message))
      .then();
  }

  onGoBack() {
    this.props.navigation.navigate('SegmentSummary');
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
          'Découvrez mon activité sur  : ' +
          this.props.currentLive.statsLive.lienPartage,
        title: 'Découvrez mon activité sur !',
      },
      {
        // Android only:
        dialogTitle: 'Découvrez mon activité sur ! ',
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
        {/* <Body style={styles.body}> */}

        <Header style={styles.header}>
          <Body>
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
                <Text style={styles.saveText}>Précedent</Text>
              </Button>
            </View>
          </Body>
        </Header>
        <View style={styles.loginButtonSection}>
          <ScrollView contentContainerStyle={styles.loginButtonSection}>
            {this.props.currentLive.statsLive != null ? (
              <View style={styles.loginButtonSection}>
                <View
                  style={{paddingLeft: 10, paddingRight: 5, marginBottom: 10}}>
                  <Text style={styles.bold}>
                    {this.props.currentLive.libelleLive}
                  </Text>
                  <Text>
                    {this.getShortDate(
                      this.props.currentLive.dateCreationLive,
                    ) +
                      ' - ' +
                      this.getShortTime(
                        this.props.currentLive.dateCreationLive,
                      )}
                  </Text>
                </View>

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
                <View style={styles.map}>
                  <MapView
                    ref="map"
                    style={styles.map}
                    showsUserLocation={false}
                    followsUserLocation={false}
                    showsMyLocationButton={false}
                    showsPointsOfInterest={false}
                    showsScale={false}
                    showsTraffic={false}
                    onPress={() => {
                      this.props.navigation.navigate('LiveSummaryMap');
                    }}
                    toolbarEnabled={false}
                    onLayout={() => this.centerMap()}>
                    <MapView.Polyline
                      key="polyline"
                      coordinates={this.props.currentLive.coordinates}
                      geodesic={true}
                      strokeColor="rgba(63,170,239, 1)"
                      strokeWidth={3}
                      zIndex={0}
                    />
                  </MapView>
                </View>

                <View>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'center',
                      width: '100%',
                      paddingRight: 0,
                      paddingLeft: 0,
                      marginTop: 10,
                      marginBottom: 10,
                    }}>
                    <Text style={{fontStyle: 'italic', fontWeight: 'bold'}}>
                      {' '}
                      {this.props.currentLive.libelleSport}
                    </Text>
                  </View>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      width: '100%',
                      paddingRight: 10,
                      paddingLeft: 10,
                      marginTop: 0,
                      marginBottom: 20,
                    }}>
                    <View style={styles.resultCol}>
                      <Text>Distance</Text>
                      <Text style={styles.resultNumber}>
                        {this.props.currentLive.statsLive.distance} km
                      </Text>
                    </View>
                    <View style={styles.resultCol}>
                      <Text>Denivelé +</Text>
                      <Text style={styles.resultNumber}>
                        {this.props.currentLive.statsLive.dPlus} m
                      </Text>
                    </View>
                    <View style={styles.resultCol}>
                      <Text>Denivelé -</Text>
                      <Text style={styles.resultNumber}>
                        {this.props.currentLive.statsLive.dMoins} m{' '}
                      </Text>
                    </View>
                  </View>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      width: '100%',
                      paddingRight: 10,
                      paddingLeft: 10,
                    }}>
                    <View style={styles.resultCol}>
                      <Text>Durée</Text>
                      <Text style={styles.resultNumber}>
                        {this.props.currentLive.statsLive.duree}
                      </Text>
                    </View>
                    <View style={styles.resultCol}>
                      <Text>Vitesse Moy</Text>
                      <Text style={styles.resultNumber}>
                        {this.props.currentLive.statsLive.vMoy} km/h
                      </Text>
                    </View>
                    <View style={styles.resultCol}>
                      <Text>Allure</Text>
                      <Text style={styles.resultNumber}>
                        {this.props.currentLive.statsLive.allureKm}
                      </Text>
                    </View>
                  </View>

                  {this.props.currentLive.commentLive != '' &&
                  this.props.currentLive.commentLive != null ? (
                    <View
                      style={{width: '100%', paddingRight: 10, paddingLeft: 5}}>
                      <Text style={{marginTop: 10, fontWeight: 'bold'}}>
                        {' '}
                        Commentaires :{' '}
                      </Text>
                      <Text style={{marginTop: 5, paddingLeft: 5}}>
                        {this.props.currentLive.commentLive}
                      </Text>
                    </View>
                  ) : null}

                  {this.props.currentLive.statsLive.lienReplay != null ? (
                    <Button
                      full
                      style={styles.buttonok}
                      onPress={() =>
                        this.openLink(
                          this.props.currentLive.statsLive.lienReplay,
                        )
                      }
                      disabled={this.props.currentLive.followCode == ''}>
                      <Text>REJOUER VOTRE ACTIVITE</Text>
                    </Button>
                  ) : (
                    <View></View>
                  )}
                  {this.props.currentLive.statsLive.lienPartage != null ? (
                    <Button
                      full
                      style={[styles.buttonok, {marginTop: 5}]}
                      onPress={() => this.onClickShare()}
                      disabled={this.props.currentLive.followCode == ''}>
                      <Text>PARTAGER</Text>
                    </Button>
                  ) : (
                    <View></View>
                  )}

                  {this.props.currentLive.segmentEfforts != null &&
                  this.props.currentLive.segmentEfforts.length > 0 ? (
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
                          backgroundColor: '#E6E6E6',
                        }}>
                        Vos challenges de la séance{' '}
                      </Text>

                      {this.props.currentLive.segmentEfforts.map((segment) => {
                        return (
                          <View>
                            <TouchableHighlight
                              underlayColor="rgba(255,255,255,1,0.6)"
                              onPress={() => this.onOpenSegment(segment)}>
                              <View
                                style={{
                                  width: '100%',
                                  marginBottom: 10,
                                  paddingLeft: 10,
                                  paddingRight: 10,
                                  display: 'flex',
                                  flexDirection: 'row',
                                  justifyContent: 'space-between',
                                }}>
                                <View>
                                  <View>
                                    <Text
                                      style={{fontSize: 14, marginBottom: 5}}>
                                      {segment.nomSegment}{' '}
                                    </Text>
                                  </View>
                                  <View
                                    style={{
                                      display: 'flex',
                                      flexDirection: 'row',
                                      justifyContent: 'space-between',
                                    }}>
                                    <Text style={{fontSize: 14}}>
                                      {segment.distanceSegment} km -{' '}
                                    </Text>
                                    <Text style={{fontSize: 14}}>
                                      {segment.tempsSegmentString} -{' '}
                                    </Text>
                                    <Text style={{fontSize: 14}}>
                                      {segment.vitesseMoyenneSegment}/km
                                    </Text>
                                  </View>
                                </View>
                              </View>
                            </TouchableHighlight>
                          </View>
                        );
                      })}
                    </View>
                  ) : null}
                </View>
              </View>
            ) : (
              <View>
                <Text style={{textAlign: 'center', marginTop: 60}}>
                  Nous ne trouvons pas d'activité correspondante
                </Text>
              </View>
            )}
          </ScrollView>
        </View>
      </Container>
    );
  }
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: ApiUtils.getBackgroundColor(),
    width: '100%',
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
    color: textAutoBackgroundColor,
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
    height: '120%',
    marginTop: 5,
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

export default connect(mapStateToProps)(LiveSummaryFromSegment);
