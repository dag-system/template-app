import React, {Component, useEffect, useState} from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  View,
  Platform,
  Alert,
  Modal,
  LayoutChangeEvent,
  LayoutRectangle,
} from 'react-native';
import {
  Header,
  Body,
  Toast,
  Root,
  Icon,
  Text,
  Left,
  Right,
  Button,
  Switch,
  Picker,
  Spinner,
  Footer,
} from 'native-base';
import ApiUtils from '../ApiUtils';
import {useDispatch, useSelector} from 'react-redux';
import {Sponsors} from '../home/Sponsors';
import BackgroundGeolocation from 'react-native-background-geolocation';
import ErrorMessage from '../home/ErrorMessage';
import {ScrollView, TextInput} from 'react-native-gesture-handler';
import {buildGPX, GarminBuilder} from 'gpx-builder';
import {Point} from 'gpx-builder/dist/builder/BaseBuilder/models';
import VersionCheck from 'react-native-version-check';
import {
  TemplateBackgroundColor,
  TemplateSportLive,
  textAutoBackgroundColor,
} from '../globalsModifs';
import * as Animated from 'react-native-animatable';
import AppState from '../models/AppState';
import {useNavigation} from '@react-navigation/core';
import StopActivity from './StopLive';

import tradRes from './../lang/traduction.json';

import {connect} from 'react-redux';
const mapStateToProps = (state) => {
  return {
    lang: state.lang,
  };
};

interface Props {
  openTraceModal(isDemo: boolean): void;
  onCenter(): void;
  onStart(): void;
}
function MapButtons(props: Props) {
  const [modalStopVisible, setModalStopVisible] = useState(false);

  const [libelleLive, setLibelleLive] = useState('');
  const [libelleLiveIsModified, setLibelleLiveIsModified] = useState(false);

  const [selectedSport, setSelectedSport] = useState(-1);
  const [comments, setComments] = useState('');
  const [spinner, setSpinner] = useState(false);
  const [extraButtonPosition, setExtraButtonPosition] =
    useState<LayoutRectangle>();

  const [acceptChallengeNameUtilisateur, setAcceptChallengeNameUtilisateur] =
    useState(false);

  const [modalChooseSportVisible, setModalChooseSportVisible] = useState(false);
  const [isOpenExtraButtons, setIsOpenExtraButtons] = useState(false);

  const dispatch = useDispatch();
  const navigation = useNavigation();

  const {
    phoneData,

    isRecording,
    currentLive,
    isMoving,
    userData,
    coordinatesString,
    currentMapStyle,
    isGpsNotOk,
    lang,
  } = useSelector((state: AppState) => state);

  useEffect(() => {
    if (currentLive != null) {
      setLibelleLive(currentLive.libelleLive);
      setSelectedSport(currentLive.idSport);
    }
    setAcceptChallengeNameUtilisateur(userData.acceptChallengeNameUtilisateur);
  }, [currentLive]);

  const getLibelleLive = () => {
    var date = new Date();
    var hour = date.getHours();

    if (hour <= 11) {
      return 'Activité matinale';
    }
    if (hour > 11 && hour < 19) {
      return "Activité de l'après-midi";
    }

    if (hour >= 19) {
      return 'Activité du soir';
    }
  };

  const toggleModalChooseSport = () => {
    setModalChooseSportVisible((value) => !value);
  };

  const onCreateLive = () => {
    if (TemplateSportLive.length == 1) {
      onClickCreateLiveOk();
    } else {
      setModalChooseSportVisible(true);
    }
  };
  const onClickCreateLiveOk = () => {
    setModalChooseSportVisible(false);

    let formData = new FormData();
    formData.append('method', 'createLive');
    formData.append('auth', ApiUtils.getAPIAuth());
    formData.append('idUtilisateur', userData.idUtilisateur.toString());
    formData.append('idversion', VersionCheck.getCurrentVersion());
    let idSport = -1;
    if (TemplateSportLive.length == 1) {
      idSport = TemplateSportLive[0].idSport;
      formData.append('idSport', TemplateSportLive[0].idSport.toString());
    } else {
      formData.append('idSport', selectedSport.toString());
    }

    formData.append('os', Platform.OS);
    formData.append('phoneData', JSON.stringify(phoneData));

    var libelleLive = getLibelleLive();

    formData.append('libelleLive', libelleLive);
    setSpinner(true);
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
        if (responseJson.codeErreur == 'SUCCESS') {
          //SaveData

          var live = {
            idLive: responseJson.idLive,
            codeLive: responseJson.codeLive,
            libelleLive: libelleLive,
            dateCreationLive: responseJson.dateCreationLive,
            idSport: idSport,
            invites: [],
            statsInfos: {},
          };

          var action = {type: 'CREATE_LIVE', data: live};
          dispatch(action);
          setSpinner(false);
          onstart();
        } else {
          setSpinner(false);
          Alert.alert(responseJson.message);
        }
      })
      .catch((e) => {
        setSpinner(false);
        ApiUtils.logError('CreateNewLive onClickCreateLive', e.message);
      })
      .then();
  };

  const onstart = () => {
    BackgroundGeolocation.destroyLocations(
      () => {
        saveRecordingState(true);
        onTimerStartPause();
      },
      () => {
        saveRecordingState(true);
        onTimerStartPause();
      },
    );

    props.onStart();
  };

  const saveRecordingState = (isrecording: boolean) => {
    var action = {type: 'SAVE_IS_RECORDING', data: isrecording};
    dispatch(action);
  };

  const onStop = () => {
    Alert.alert(
      "Arrêter l'activité",
      "Etes vous sûr d'arrêter ?",
      [
        {
          text: 'Annuler',
          style: 'cancel',
        },
        {text: 'Arrêter', onPress: () => onStopOk()},
      ],
      {cancelable: false},
    );
  };

  const onStopOk = () => {
    toggleStopModal();
  };

  const onCancelStop = () => {
    onTimerStartPause();
    setModalStopVisible(false);
  };

  const stopConfirmed = () => {
    setModalStopVisible(false);
  };

  const onTimerStartPause = () => {
    var now = new Date().getTime();

    var action = {type: 'ADD_DATE', data: now};
    dispatch(action);

    var actionIsMoving = {type: 'IS_MOVING', data: !isMoving};
    dispatch(actionIsMoving);

    onToggleEnabled(isMoving, isRecording);
  };

  const onToggleEnabled = (isMoving: boolean, isRecording: boolean) => {
    if (isMoving) {
      // clearInterval(interval);
      // interval = setInterval(() => setState({time: Date.now()}), 15000);
      BackgroundGeolocation.start(
        () => {
          // NOTE:  We tell react-native-maps to show location only AFTER BackgroundGeolocation
          // has requested location authorization.  If react-native-maps requests authorization first,
          // it will request WhenInUse -- "Permissions Tug-of-war"

          BackgroundGeolocation.changePace(true);
        },
        (state) => {
          ApiUtils.logError('failure geoloc', JSON.stringify(state));
        },
      );
    } else {
      if (isRecording) {
        BackgroundGeolocation.changePace(false);
      } else {
        BackgroundGeolocation.stop();
      }

      //  clearInterval(interval);
    }
  };

  const toggleStopModal = () => {
    if (isMoving) {
      onTimerStartPause();
    }
    setModalStopVisible((value) => !value);
  };

  const onValueSportChange = (value: number) => {
    setSelectedSport(value);
  };

  const onToggleExtrasButtonLayout = (event: LayoutChangeEvent) => {
    const layout = event.nativeEvent.layout;
    setExtraButtonPosition(layout);
  };

  const onClickGetCurrentPosition = () => {
    props.onCenter();
  };

  const toggleExtraButtons = () => {
    setIsOpenExtraButtons((value) => !value);
  };

  const saveCurrentMapStyle = () => {
    let nextStyle = 'standard';

    if (Platform.OS == 'android') {
      if (currentMapStyle == 'standard') {
        nextStyle = 'terrain';
      } else if (currentMapStyle == 'terrain') {
        nextStyle = 'hybrid';
      } else if (currentMapStyle == 'hybrid') {
        nextStyle = 'standard';
      } else {
        nextStyle = 'standard';
      }
    }

    if (Platform.OS == 'ios') {
      if (currentMapStyle == 'standard') {
        nextStyle = 'hybrid';
      } else if (currentMapStyle == 'hybrid') {
        nextStyle = 'standard';
      } else {
        nextStyle = 'standard';
      }
    }

    var action = {type: 'UPDATE_MAP_STYLE', data: nextStyle};
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

  const onOpenTraceModal = (isDemo: boolean) => {
    props.openTraceModal(isDemo);
  };

  const isErrorFormCreate = () => {
    return selectedSport == -1;
  };

  return (
    <View
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: Platform.OS == 'ios' ? 110 : 70,
        paddingTop: isOpenExtraButtons ? 100 : 0,
        zIndex: 1000,
        justifyContent: 'center',
        // borderBottomColor : 'black',
        // borderWidth :1
      }}>
      <View key="gpsInfoMessage">
        {isGpsNotOk ? (
          <View
            style={{
              justifyContent: 'center',
              display: 'flex',
              flexDirection: 'row',
              zIndex: 5,
              width: '100%',
              marginLeft: 'auto',
            }}>
            <View
              style={[
                {
                  backgroundColor: '#FE3C03',
                  marginLeft: 'auto',
                  marginRight: 'auto',
                  paddingVertical: 5,
                  paddingHorizontal: 15,
                  borderRadius: 30,
                  marginBottom: 10,
                },
              ]}>
              <View>
                <Text style={{color: 'white'}}>
                  {isGpsNotOk}
                  {tradRes[lang].utils.waitingGps}
                </Text>
              </View>
            </View>
          </View>
        ) : null}

        {!isGpsNotOk && !isRecording ? (
          <TouchableOpacity
            style={{
              justifyContent: 'center',
              display: 'flex',
              flexDirection: 'row',
              marginBottom: 10,
            }}>
            <Animated.View
              animation="bounceOutRight"
              delay={2000}
              style={[
                {
                  backgroundColor: '#44E660',
                  paddingVertical: 5,
                  paddingHorizontal: 15,
                  borderRadius: 30,
                },
              ]}>
              <Text style={{color: 'white', textAlign: 'center'}}>
                {tradRes[lang].utils.gpsFound}
              </Text>
            </Animated.View>
          </TouchableOpacity>
        ) : null}
      </View>

      <View
        style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'center',
        }}>
        <View>
          {isOpenExtraButtons ? (
            <View
              key="extraButtons"
              style={{
                marginBottom: 0,
                position: 'absolute',
                left: extraButtonPosition != null ? extraButtonPosition?.x : 0,
                bottom: 80,
              }}>
              {isRecording ? null : (
                <TouchableOpacity
                  onPress={() => onClickGetCurrentPosition()}
                  style={{
                    alignSelf: 'center',
                    backgroundColor: 'white',
                    width: 40,
                    height: 40,
                    borderRadius: 300,
                    marginBottom: 10,
                    justifyContent: 'center',
                    display: 'flex',
                    flexDirection: 'row',
                    elevation: 20,
                  }}>
                  {Platform.OS == 'ios' ? (
                    <View style={{justifyContent: 'center'}}>
                      <Icon
                        name="location-arrow"
                        style={[{fontSize: 20}]}
                        type="FontAwesome5"
                      />
                    </View>
                  ) : (
                    <View style={{justifyContent: 'center'}}>
                      <Icon
                        name="locate-outline"
                        style={[{fontSize: 22}]}
                        type="Ionicons"
                      />
                    </View>
                  )}
                </TouchableOpacity>
              )}
              <TouchableOpacity
                onPress={() => onOpenTraceModal(false)}
                style={{
                  flexDirection: 'row',
                  width: 40,
                  height: 40,
                  borderRadius: 300,
                  backgroundColor: 'white',
                  zIndex: 1000,
                  marginBottom: 10,
                  justifyContent: 'center',
                  elevation: 20,
                  shadowColor: '#000',
                  shadowOffset: {
                    width: 0,
                    height: 5,
                  },
                  shadowOpacity: 0.34,
                  shadowRadius: 6.27,
                }}>
                <View style={{justifyContent: 'center'}}>
                  <Icon
                    type="FontAwesome5"
                    name="filter"
                    style={[{fontSize: 16}]}
                  />
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 300,
                  display: 'flex',
                  flexDirection: 'row',
                  justifyContent: 'center',
                  backgroundColor: 'white',
                  shadowColor: '#000',
                  shadowOffset: {
                    width: 0,
                    height: 5,
                  },
                  shadowOpacity: 0.34,
                  shadowRadius: 6.27,

                  elevation: 20,
                }}
                onPress={() => saveCurrentMapStyle()}>
                <View style={{justifyContent: 'center'}}>
                  <Icon
                    style={[{fontSize: 19}]}
                    name={getFabDefaultLogo()}
                    color="black"
                    type="FontAwesome5"
                  />
                </View>
              </TouchableOpacity>
            </View>
          ) : null}

          <TouchableOpacity
            onLayout={(event: LayoutChangeEvent) =>
              onToggleExtrasButtonLayout(event)
            }
            onPress={() => toggleExtraButtons()}
            style={{
              alignSelf: 'center',
              backgroundColor: 'white',
              marginTop: 20,
              padding: 10,
              borderRadius: 300,
              justifyContent: 'center',
              marginRight: 20,
              width: 40,
              height: 40,
              elevation: 20,
              display: 'flex',
              flexDirection: 'row',
            }}>
            <View style={{justifyContent: 'center'}}>
              <Icon
                name={isOpenExtraButtons ? 'times' : 'ellipsis-v'}
                style={[{fontSize: 20}]}
                type="FontAwesome5"
              />
            </View>
          </TouchableOpacity>
        </View>
        {isRecording ? (
          <TouchableOpacity
            onPress={() => onStop()}
            style={{
              alignSelf: 'center',
              backgroundColor: '#E6444B',
              width: 80,
              height: 80,
              elevation: 20,
              borderRadius: 300,
              justifyContent: 'center',
            }}>
            <Text
              style={[
                styles.buttonText,
                {color: 'white', textAlign: 'center'},
              ]}>
              Stop
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={() => onCreateLive()}
            style={{
              alignSelf: 'center',
              backgroundColor: isGpsNotOk ? '#B9B9B9' : '#44E660',
              width: 80,
              height: 80,
              borderRadius: 300,
              justifyContent: 'center',
              elevation: 20,
            }}
            disabled={isGpsNotOk}>
            {spinner ? (
              <Spinner color="white" style={{alignSelf: 'center'}} />
            ) : (
              <Text
                style={[
                  styles.buttonText,
                  {color: 'white', textAlign: 'center'},
                ]}>
                Start
              </Text>
            )}
          </TouchableOpacity>
        )}

        {isRecording ? (
          <TouchableOpacity
            onPress={() => onClickGetCurrentPosition()}
            style={{
              alignSelf: 'center',
              backgroundColor: 'white',
              width: 40,
              height: 40,
              borderRadius: 300,
              justifyContent: 'center',
              display: 'flex',
              flexDirection: 'row',
              marginLeft: 20,
            }}>
            {Platform.OS == 'ios' ? (
              <View style={{justifyContent: 'center'}}>
                <Icon
                  name="location-arrow"
                  style={[{fontSize: 20}]}
                  type="FontAwesome5"
                />
              </View>
            ) : (
              <View style={{justifyContent: 'center'}}>
                <Icon
                  name="locate-outline"
                  style={[{fontSize: 22}]}
                  type="Ionicons"
                />
              </View>
            )}
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={() => onOpenTraceModal(true)}
            style={{
              alignSelf: 'center',
              backgroundColor: 'white',
              paddingVertical: 5,
              paddingHorizontal: 10,
              borderRadius: 300,
              justifyContent: 'center',
              display: 'flex',
              flexDirection: 'row',
              marginLeft: 20,
              elevation: 20,
            }}>
            <Icon name="eye" style={[{fontSize: 22}]} type="FontAwesome5" />
            <Text style={{marginLeft: 10}}>{tradRes[lang].utils.demo}</Text>
            {/* </View> */}
          </TouchableOpacity>
        )}
      </View>
      {/******** modal3 : finish LIVE *****************/}
      <Modal
        animationType={'none'}
        transparent={false}
        visible={modalStopVisible}
        onRequestClose={() => {
          toggleStopModal();
        }}>
        <Root>
          <View>
            <StopActivity
              onCancel={onCancelStop}
              onIgnore={stopConfirmed}
              onSuccess={stopConfirmed}
            />
          </View>
        </Root>
        <Footer style={{backgroundColor: 'white', paddingBottom: 64}}>
          <Sponsors />
        </Footer>
      </Modal>

      {/******** modal : choose sport for new LIVE *****************/}
      <Modal
        animationType={'none'}
        transparent={false}
        visible={modalChooseSportVisible}
        onRequestClose={() => {
          toggleModalChooseSport();
        }}>
        <Root>
          <View>
            <Header style={styles.headerModal}>
              <Left>
                <Button
                  style={styles.drawerButton}
                  onPress={() => {
                    toggleModalChooseSport();
                  }}>
                  <Icon
                    name="chevron-left"
                    type="FontAwesome5"
                    style={{color: 'black'}}
                  />
                </Button>
              </Left>
              <Body style={{justifyContent: 'center', flex: 1}}>
                <Text style={{fontWeight: 'bold'}}>
                  {tradRes[lang].utils.startActivity}
                </Text>
              </Body>
              <Right style={{flex: 1}} />
            </Header>

            <ScrollView scrollEnabled={true}>
              <View>
                <View>
                  <Picker
                    mode="dropdown"
                    accessibilityLabel={'Choisissez votre sport'}
                    iosHeader={'Choisissez votre sport'}
                    iosIcon={<Icon name="chevron-down" type="FontAwesome5" />}
                    style={{marginTop: 0}}
                    selectedValue={selectedSport.toString()}
                    onValueChange={(value) => onValueSportChange(value)}
                    placeholder={tradRes[lang].utils.chooseSport}
                    placeholderStyle={{
                      color: 'black',
                    }}
                    placeholderIconColor={'black'}
                    textStyle={{color: 'black'}}
                    itemStyle={{
                      color: 'black',
                      marginLeft: 0,
                      paddingLeft: 10,
                      borderBottomColor: 'black',
                      borderBottomWidth: 1,
                    }}
                    itemTextStyle={{
                      color: 'black',
                      borderBottomColor: 'black',
                      borderBottomWidth: 1,
                    }}>
                    <Picker.Item
                      label={tradRes[lang].utils.chooseSport}
                      value="-1"
                    />
                    {TemplateSportLive.map((sport, index) => {
                      return (
                        <Picker.Item
                          label={sport.sportName}
                          value={sport.idSport.toString()}
                          key={index}
                        />
                      );
                    })}
                  </Picker>

                  {selectedSport == -1 ? (
                    <Text
                      style={{
                        marginTop: 10,
                        color: 'red',
                        fontSize: 14,
                        paddingLeft: 5,
                        fontStyle: 'italic',
                      }}>
                      {tradRes[lang].utils.typeSportNeeded}
                    </Text>
                  ) : null}
                </View>

                <Button
                  style={{
                    marginTop: 10,
                    paddingHorizontal: 50,
                    elevation: 0,
                    alignSelf: 'center',
                    borderColor: textAutoBackgroundColor,
                    borderWidth: 1,
                    backgroundColor: TemplateBackgroundColor,
                  }}
                  onPress={() => onClickCreateLiveOk()}
                  disabled={isErrorFormCreate()}>
                  <Text
                    style={{
                      color: isErrorFormCreate() ? 'black' : 'white',
                    }}>
                    {tradRes[lang].utils.letsgo}
                  </Text>
                </Button>

                <View style={{marginTop: -5}}>
                  <Text
                    style={styles.ignoreActivityLink}
                    onPress={() => toggleModalChooseSport()}>
                    {tradRes[lang].utils.cancel}
                  </Text>
                </View>

                <View style={{marginBottom: 300}} />
              </View>
            </ScrollView>
            <View
              style={{
                marginBottom: 0,
                position: 'absolute',
                bottom: Platform.OS == 'ios' ? 80 : 50,
                zIndex: 12,
                width: '100%',
                backgroundColor: 'white',
              }}
            />
          </View>
        </Root>
        <Sponsors />
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  ignoreActivityLink: {
    marginTop: 10,
    marginBottom: 20,
    alignSelf: 'center',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  headerModal: {
    backgroundColor: 'white',
    paddingLeft: 10,
    paddingTop: 0,
    paddingBottom: 5,
    // height: 50
  },
  drawerButton: {
    backgroundColor: 'transparent',
    width: '100%',
    marginTop: 0,
    paddingTop: 10,
    shadowOffset: {height: 0, width: 0},
    shadowOpacity: 0,
    elevation: 0,
    marginLeft: 0,
    paddingLeft: 0,
  },
  inputCode: {
    borderBottomColor: '#DDDDDD',
    borderBottomWidth: 1,
    paddingTop: 10,
    paddingBottom: 10,
    marginLeft: 10,
    marginRight: 10,
    marginBottom: 0,
    marginTop: 5,
    fontSize: 16,
  },
  picker: {
    marginTop: 0,
    padding: 10,
  },
  buttonText: {
    fontWeight: 'bold',
    fontSize: 18,
    paddingBottom: 5,
  },
});

export default connect(mapStateToProps)(MapButtons);
