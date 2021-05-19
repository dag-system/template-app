import React, {Component, useEffect, useState} from 'react';
import {
  StyleSheet,
  View,
  Image,
  ScrollView,
  TouchableHighlight,
  TouchableOpacity,
} from 'react-native';
import {Text, Button} from 'native-base';

import ApiUtils from '../ApiUtils';
import {connect, useDispatch, useSelector} from 'react-redux';
import {ReactNativeModal as ModalSmall} from 'react-native-modal';
import {Icon as IconElement} from 'react-native-elements';
import {FlatList} from 'react-native';
import AppState from '../models/AppState';
import Interest from '../models/Interest';
import Polyline from '../models/Polyline';

interface Props {
  isDemo: boolean;
  onClose(): void;
  isVisible: boolean;
  centerOnTrace(trace: Polyline): void;
  centerOnPoi(poi: Interest): void;
  showDemoTrace(trace: Polyline): void;
}

export default function TraceModal(props: Props) {
  const [tabVisible, setTabVisible] = useState('traces');
  const {polylines, pointsInterets} = useSelector((state: AppState) => state);
  const dispatch = useDispatch();

  useEffect(() => {
    if (props.isDemo) setTabVisible('traces');
  }, [props.isDemo]);

  const closeTraceModal = () => {
    props.onClose();
  };

  const toggleTrace = (traceName : string) => {
    var action = {type: 'TOGGLE_TRACE', data: traceName};
    dispatch(action);
  };

  const showDemoTrace = (trace: Polyline) => {
    var action = {type: 'SET_DEMO_TRACE', data: trace};
    dispatch(action);
    props.showDemoTrace(trace);
  };

  const getDistanceTrace = (distance : number) =>{
    if(distance > 1000)
    {
      return (distance/1000).toFixed(1);
    }else{
      return distance;
    }
  }
  // render() {
  return (
    /******** modal5 : Traces list  *****************/

    <ModalSmall
      isVisible={props.isVisible}
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
            closeTraceModal();
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
            width: props.isDemo ? '100%' : '50%',
            borderBottomColor: 'black',
            borderBottomWidth: tabVisible == 'traces' ? 1 : 0,
            paddingBottom: 10,
          }}
          onPress={() => setTabVisible('traces')}>
          <Text
            style={{
              textAlign: 'center',
            }}>
            Parcours
          </Text>
        </TouchableOpacity>

        {props.isDemo ? null : (
          <TouchableOpacity
            style={{
              justifyContent: 'center',
              width: '50%',
              borderBottomColor: 'black',
              borderBottomWidth: tabVisible == 'interests' ? 1 : 0,
              paddingBottom: 10,
            }}
            onPress={() => setTabVisible('interests')}>
            <Text
              style={{
                textAlign: 'center',
              }}>
              Points d'interets
            </Text>
          </TouchableOpacity>
        )}
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

          {props.isDemo?<Text style={{marginTop : 10,textAlign : 'center'}}>Choisissez le parcours à prévisualiser :</Text> :null}
          {tabVisible == 'traces' ? (
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
                <TouchableOpacity onPress={() => props.isDemo ? showDemoTrace(item) :null}>
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
                          {getDistanceTrace(item.distanceTrace)}km -
                          {item.dplusTrace}D+
                        </Text>
                      </View>
                      {props.isDemo ? null :
                        (<Button
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
                      )}

                      {!props.isDemo ? (
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
                            props.centerOnTrace(item);
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
                      ) : null}
                    </View>
                  </View>
                </TouchableOpacity>
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
              data={pointsInterets}
              renderItem={({item}) => (
                <TouchableHighlight underlayColor="rgba(255,255,255,1,0.6)">
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
                            style={{height: 100, width: 100, marginRight: 10}}
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
                          props.centerOnPoi(item);
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

  // }
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
