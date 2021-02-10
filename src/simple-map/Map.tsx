import React, {PureComponent} from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  FlatList,
  View,
  ScrollView,
  Platform,
  TouchableHighlight,Image,
  ImageBackground,Modal, Linking
} from 'react-native';
import {
  Icon,
  Text,
  Button,
} from 'native-base';
import {connect} from 'react-redux';
import MarkerInteret from '../assets/marker.png';
import MapView, {Marker, Polyline} from 'react-native-maps';
import {ReactNativeModal as ModalSmall} from 'react-native-modal';
import {Icon as IconElement} from 'react-native-elements';
import { isPointInPolygon } from 'geolib';
import BatteryModal from '../home/BatteryModal';
import DefaultProps from '../models/DefaultProps';
import ApiUtils from '../ApiUtils';

const LATITUDE_DELTA_CLOSE = 0.00922;
const LONGITUDE_DELTA_CLOSE = 0.00421;

const LATITUDE_DELTA = 0.16022;
const LONGITUDE_DELTA = 0.01221;

const mapStateToProps = state => {
  return {
    currentMapStyle: state.currentMapStyle,
    coordinatesString : state.coordinatesString,
    polylines: state.polylines,
    currentPosition : state.currentPosition,
    isGpsNotOk : state.isGpsNotOk,
    isRecording : state.isRecording,
    pointsInterets: state.pointsInterets,
  };
};

interface Props extends DefaultProps {
  currentMapStyle: string,
    coordinatesString : string,
    polylines: any[],
    currentPosition : any,
    isGpsNotOk : boolean,
    isRecording : boolean,
    pointsInterets : any[]
}

interface State {
  ismodalBatteryOpen: boolean;
  isModalTraceVisible : boolean;
  currentPolyline : any;
  refresh : boolean;
  currentInteret : any;
  isModalInterestVisible : boolean;
}

class Map extends PureComponent<Props,State> {
  constructor(props) {
    super(props);

    this.state = {
      ismodalBatteryOpen : false,
      isModalTraceVisible : false,
      currentPolyline : null,
      refresh : false,
      currentInteret : null,
      isModalInterestVisible : false
    };
  }

  componentDidMount() {
    setTimeout(() => this.didMount(), 300);

    // alert(this.props.userData.ddnUtilisateur)
    //   alert(new Date(this.props.userData.ddnUtilisateur))

    // setTimeout(() => this.setState({ userdata: { ...this.state.userdata, ddnUtilisateur: this.state.userdata.ddnUtilisateur) }} ), 100)
  }
  didMount() {
   
  }

  saveCurrentMapStyle() {
    let nextStyle = 'standard';

    if (Platform.OS == 'android') {
      if (this.props.currentMapStyle == 'standard') {
        nextStyle = 'terrain';
      } else if (this.props.currentMapStyle == 'terrain') {
        nextStyle = 'hybrid';
      } else if (this.props.currentMapStyle == 'hybrid') {
        nextStyle = 'standard';
      } else {
        nextStyle = 'standard';
      }
    }

    if (Platform.OS == 'ios') {
      if (this.props.currentMapStyle == 'standard') {
        nextStyle = 'hybrid';
      } else if (this.props.currentMapStyle == 'hybrid') {
        nextStyle = 'standard';
      } else {
        nextStyle = 'standard';
      }
    }

    var action = {type: 'UPDATE_MAP_STYLE', data: nextStyle};
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

  onOpenTraceModal() {
    this.setState({isModalTraceVisible: true});
  }

  closeTraceModal() {
    this.setState({isModalTraceVisible: false});
  }

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

  selectPolyline(polyline) {
    this.setState({currentPolyline: polyline});
  }

  closeCurrentPolyline() {
    this.setState({currentPolyline: null});
  }

  toggleTrace(traceName) {
    var action = {type: 'TOGGLE_TRACE', data: traceName};
    this.props.dispatch(action);
    this.setState({refresh : !this.state.refresh})
  }

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

  generateLotOfCoordinates()
  {
    
    let data =[];
    for(let i=0; i <5000; i++)
    {
      let coord = {
        latitude : 12,
        longitude : 12,
        speed : 3
      }
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
        .then(data => {
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
        .catch(() => {
        });
    }
  }

  openBatteryModal = () => {
    this.setState({ismodalBatteryOpen: true});
  };

  closeModalBattery = () => {
    this.setState({ismodalBatteryOpen: false});
  };


  onClickUrlInterest(url) {
  
    Linking.canOpenURL(url).then(supported => {
      if (supported) {
        Linking.openURL(url);
      } 
    });
  }

  onClickInterestPhone(phoneNumber, idInteret) {

    Linking.canOpenURL(`tel:${phoneNumber}`).then(supported => {
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

        <TouchableOpacity
          style={{
            position: 'absolute',

            // alignSelf: 'center',
            // width: 70,
            // heigth: 100,
            padding: 10,
            width: 60,
            height: 60,
            borderRadius: 300,
            top: 20,
            zIndex: 100,
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'center',
            backgroundColor: '#5067FF',
            left: 100,
            shadowColor: '#000',
            shadowOffset: {
              width: 0,
              height: 5,
            },
            shadowOpacity: 0.34,
            shadowRadius: 6.27,

            elevation: 10,
          }}
          onPress={() => this.saveCurrentMapStyle()}>
          <View
            style={{
              justifyContent: 'center',
              alignSelf: 'center',
              alignContent: 'center',
              // width: 40,
              // heigth: 100,
            }}>
            <Icon
              name={this.getFabDefaultLogo()}
              style={{
                color: 'white',
                alignSelf: 'center',
                marginBottom: 3,
                fontSize: 23,
              }}
              color="white"
              type="FontAwesome5"
            />
            {/* <Text style={{textAlign : 'center', color : 'white'}}>{this.props.currentMapStyle}</Text> */}
          </View>
        </TouchableOpacity>

        <Button
          onPress={() => this.onClickGetCurrentPosition()}
          style={{
            // flexDirection: 'row', justifyContent: 'space-between',
            width: 53,
            height: 53,
            backgroundColor: 'white',
            zIndex: 5,
            position: 'absolute',
            top: 20,
            left: 180,
          }}>
          {Platform.OS == 'ios' ? (
            <Icon
              name="location-arrow"
              style={[styles.title, {fontSize: 20}]}
              type="FontAwesome5"
            />
          ) : (
            <Icon
              name="locate-outline"
              style={[styles.title, {fontSize: 22}]}
              type="Ionicons"
            />
          )}
        </Button>

        {this.props.polylines != null && this.props.polylines.length > 0 ? (
          <Button
            onPress={() => this.onOpenTraceModal()}
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              width: 53,
              height: 53,
              backgroundColor: 'white',
              zIndex: 5,
              position: 'absolute',
              top: 20,
              left: 20,
            }}>
            <Icon
              active
              type="Ionicons"
              name="map-outline"
              style={[styles.title, {fontSize: 22}]}
            />
          </Button>
        ) : null}

        {this.props.isGpsNotOk ? (
          <View 
          style={{
            justifyContent: 'center',
            display: 'flex',
            flexDirection: 'row',
            zIndex: 5,
             width : '100%',
            position : 'absolute',
            top: 100,
            marginLeft : 'auto'
          }}>
     
            <View
              style={[
                {
                  backgroundColor: '#FE3C03',
                  width: '70%',
                  marginLeft : 'auto',
                  marginRight : 'auto',
                  paddingVertical: 20,
                  paddingHorizontal: 15,
                  borderRadius: 30,
                  zIndex: 99,
                },
              ]}>
              <View>
                <Text
                  style={[
                    styles.liveNameText,
                    {color: 'white', textTransform: 'uppercase'},
                  ]}>
                    {this.props.isGpsNotOk}
                  En attente de l’acquisition du signal GPS, ne partez pas.
                </Text>
                <Text
                  style={{color: 'white', textAlign: 'center', marginTop: 10}}>
                  Si ce message ne disparait pas : verifier votre paramètres
                  d'économie d'energie, de localisation etc...
                </Text>
                <TouchableOpacity
                  onPress={() => this.openBatteryModal()}
                  style={{zIndex: 200}}>
                  <Text
                    style={{
                      color: 'white',
                      textAlign: 'center',
                      marginTop: 10,
                      textDecorationLine: 'underline',
                    }}>
                    En savoir plus
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ) : null}

        {!this.props.isGpsNotOk && !this.props.isRecording ? (
          <TouchableOpacity
            style={{
              justifyContent: 'center',
              display: 'flex',
              flexDirection: 'row',
              zIndex: 99,
            }}>
            <View
              style={[
                {
                  zIndex: 12,
                  backgroundColor: '#39F800',
                  position: 'absolute',
                  top: 100,
                  width: '70%',
                  paddingVertical: 30,
                  paddingHorizontal: 15,
                  borderRadius: 30,
                },
              ]}>
              <Text
                style={[
                  styles.liveNameText,
                  {color: 'black', textTransform: 'uppercase'},
                ]}>
                Position GPS captée, c’est parti ! Démarrez votre activité
              </Text>
            </View>
          </TouchableOpacity>
        ) : null}

            {/* Point d'interet  */}

            <ModalSmall
          style={{marginTop: 22, paddingTop: 22, borderRadius: 10}}
          isVisible={this.state.isModalInterestVisible}
          onSwipeComplete={() => this.setState({isModalInterestVisible: false})}
        >
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
              <IconElement
                name="times-circle"
                type="font-awesome"
              />
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
              this.state.currentInteret?.photoInteret != '' &&
              this.state.currentInteret?.photoInteret.length > 0 ? (
                <Image
                  style={{height: 200, width: '100%'}}
                  source={{
                    uri: ApiUtils.getPhotoUrl(
                      this.state.currentInteret?.idStation,
                      this.state.currentInteret?.photoInteret,
                    ),
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
                    <Text >
                      {this.state.currentInteret?.telephoneInteret}
                    </Text>
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
                        this.state.currentInteret?.lienInteret
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
            latitude: 45.1667, // 44.843884,
            longitude: 5.55,
            latitudeDelta: LATITUDE_DELTA,
            longitudeDelta: LONGITUDE_DELTA,
          }}
          toolbarEnabled={false}>
            {
              this.props.coordinatesString != "" ?
              <Polyline
              key="polyline"
              coordinates={JSON.parse(this.props.coordinatesString)}
              geodesic={true}
              strokeColor="rgba(0,0,0, 1)"
              strokeWidth={6}
              zIndex={0}
            />
               :null
            }
      

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
        {/******** modal5 : Traces list  *****************/}
        <ModalSmall
          isVisible={this.state.isModalTraceVisible}
          onSwipeComplete={() => this.setState({isModalTraceVisible: false})}
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
              {/* {this.props.nomStation != "" && this.props.nomStation != null ?
                <View>
                  <Text style={{ marginTop: 0, textAlign: "center", }}>Vous êtes actuellement sur la station  : </Text> 
                   <Text style={{ marginTop: 10, textAlign: "center", fontWeight: "bold" }}>{this.props.nomStation} </Text> 
                   <Text style={{ marginTop: 10, paddingLeft: 10, paddingRight: 10 }}>{this.props.descriptionStation} </Text>
                </View>
                : null} */}

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
                      <View style={{}}>
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
                              {' '}
                              {item.nomTrace}{' '}
                            </Text>
                            <Text
                              style={{fontSize: 14}}
                              numberOfLines={1}
                              ellipsizeMode="tail">
                              {' '}
                              {item.sportTrace} - {item.distanceTrace}km -{' '}
                              {item.dplusTrace}D+{' '}
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
                    </View>
                  </TouchableHighlight>
                )}
                keyExtractor={(item, index) => index.toString()}
              />
            </View>
          </ScrollView>
        </ModalSmall>
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
            onclose={this.closeModalBattery}
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
    zIndex: 1,
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

export default connect(mapStateToProps,null,null,{ forwardRef: true })(Map);
