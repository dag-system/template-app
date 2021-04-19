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
import AutoHeightWebView from 'react-native-autoheight-webview';
import WebView from 'react-native-webview';

import MapView, {Polyline} from 'react-native-maps';
import ApiUtils from '../ApiUtils';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {connect} from 'react-redux';
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

import {TemplateSportLive} from './../globalsModifs';
import Interest from '../models/Interest';

const mapStateToProps = (state) => {
  return {
    userData: state.userData,
    currentLive: state.currentLive,
    currentMapStyle: state.currentMapStyle,
    polylines: state.polylines,
    sports: state.sports,
    pointsInterets: state.pointsInterets,
  };
};

class TraceModal extends Component {
  constructor(props) {
    super(props);

    this.state = {
      tabVisible: 'traces',
    };
  }

  componentDidMount() {
    console.log(this.props.pointsInterets.length);
  }

  closeTraceModal = () => {
    this.props.onClose();
  };

  toggleTrace(traceName) {
    var action = {type: 'TOGGLE_TRACE', data: traceName};
    this.props.dispatch(action);
    this.setState({refresh: !this.state.refresh});
  }

  render() {
    return (
      /******** modal5 : Traces list  *****************/

      <ModalSmall
        isVisible={this.props.isVisible}
        // onSwipeComplete={() => this.setState({isVisible: false})}
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

        <View
          style={{
            backgroundColor: 'white',
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-around',
            // paddingHorizontal: 20,
          }}>
          <TouchableOpacity
            style={{
              justifyContent: 'center',
              width: '50%',
              borderBottomColor: 'black',
              borderBottomWidth: this.state.tabVisible == 'traces' ? 1 : 0,
              paddingBottom: 10,
            }}
            onPress={() => this.setState({tabVisible: 'traces'})}>
            <Text
              style={{
                textAlign: 'center',
              }}>
              Parcours
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              justifyContent: 'center',
              width: '50%',
              borderBottomColor: 'black',
              borderBottomWidth: this.state.tabVisible == 'interests' ? 1 : 0,
              paddingBottom: 10,
            }}
            onPress={() => this.setState({tabVisible: 'interests'})}>
            <Text
              style={{
                textAlign: 'center',
              }}>
              Points d'interets
            </Text>
          </TouchableOpacity>
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
            {this.state.tabVisible == 'traces' ? (
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
                            this.props.centerOnTrace(item);
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
            ) : (
              <FlatList
                style={{
                  height: '100%',
                  width: '100%',
                  padding: 0,
                  marginTop: 5,
                  paddingBottom: 200,
                }}
                data={this.props.pointsInterets}
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
                            width: '70%',
                            paddingTop: 10,
                            display: 'flex',
                            flexDirection: 'row',
                          }}>
                          {item.photoInteret != null &&
                          item.photoInteret != '' ? (
                            <Image
                              style={{height: 100, width: 100, marginRight : 10,}}
                              source={{
                                uri: `data:image/png;base64,${item.photoInteret}`,
                              }}
                            />
                          ) : null}
                          <View style={{justifyContent: 'center'}}>
                            <Text
                              style={{fontWeight: 'bold'}}
                              numberOfLines={1}
                              ellipsizeMode="tail">
                              {item.libelleInteret}
                            </Text>
                            <Text
                            style={{fontSize: 14}}
                            numberOfLines={1}
                            ellipsizeMode="tail">
                            {item.descriptionInteret}
                          </Text>
                          </View>

                       
                        </View>

                        {/* <Button
                          style={styles.buttonHideTrace}
                          onPress={() => {
                            this.toggleTrace(item.nomTrace);
                          }}>
                          {!item.isActive ? (
                            <IconElement name="eye-slash" type="font-awesome" />
                          ) : (
                            <IconElement name="eye" type="font-awesome" />
                          )}
                        </Button> */}

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
                            this.props.centerOnPoi(item);
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
                          </View>
                        </Button>
                      </View>
                    </View>
                  </TouchableHighlight>
                )}
                keyExtractor={(item, index) => index.toString()}
              />
            )}
          </View>
        </ScrollView>
      </ModalSmall>
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

export default connect(mapStateToProps)(TraceModal);
