import React, {Component} from 'react';
import {
  StyleSheet,
  View,
  Image,
  FlatList,
  TouchableHighlight,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import {
  Container,
  Header,
  Content,
  Left,
  Body,
  Right,
  Text,
  Icon,
  Drawer,
  Toast,
  Root,
  Button,
  Picker,
  H3,
} from 'native-base';
import Swipeout from 'react-native-swipeout';
import ApiUtils from '../ApiUtils';
import Logo from '../assets/logo.png';
import Sidebar from './SideBar';
import {connect} from 'react-redux';
import GlobalStyles from '../styles';
import {Modal} from 'react-native';
import BatteryModal from './BatteryModal';
import {Sponsors} from './Sponsors';
import UploadGpx from './UploadGpx';
import {Platform} from 'react-native';
import {Alert} from 'react-native';
import DefaultProps from '../models/DefaultProps';
import VersionCheck from 'react-native-version-check';
import RNPusherPushNotifications from 'react-native-pusher-push-notifications';
import NotificationModal from './NotificationModal';
import Help from './Help';

import {
  TemplateBackgroundColor,
  TemplateSportLive,
  textAutoBackgroundColor,
} from '../globalsModifs';

const mapStateToProps = (state) => {
  return {
    userData: state.userData,
    isRecording: state.isRecording,
    lives: state.lives,
    sports: state.sports,
    currentLive: state.currentLive,
    isOkPopupGps: state.isOkPopupGps,
    isOkPopupBAttery: state.isOkPopupBAttery,
    isOkPopupBAttery2: state.isOkPopupBAttery2,
    notifications: state.notifications,
    phoneData: state.phoneData,
  };
};

interface Props extends DefaultProps {
  userData: any;
  isRecording: boolean;
  lives: any[];
  sports: any[];
  currentLive: any;
  isOkPopupGps: boolean;
  isOkPopupBAttery: boolean;
  isOkPopupBAttery2: boolean;
  notifications: any[];
  phoneData: any;
}

interface State {
  spinner: boolean;
  isOpenModalHelp: boolean;
  deletingIds: number[];
  isLoadingDeleting: boolean;
  isLoading: boolean;

  sectionID: any;
  rowID: any;
  uploadGpxVisible: boolean;
  selectedSport: number;
  modalChooseSportVisible: boolean;

  lives: any[];
  sports: any[];
  refresh: boolean;
  isVisibleNotifcationModal: boolean;
  idLiveNotif: number;

  listSport: {
    idSport: number;
    sportName: string;
  }[];
}

class Lives extends Component<Props, State> {
  drawer: Drawer;
  private _unsubscribe: any;
  constructor(props) {
    super(props);

    this.state = {
      spinner: false,
      isOpenModalHelp: false,
      sports: [],
      deletingIds: [],
      rowID: 0,
      lives: [],
      isLoading: true,
      isLoadingDeleting: false,
      uploadGpxVisible: false,
      modalChooseSportVisible: false,
      selectedSport: -1,
      sectionID: -1,
      refresh: false,
      isVisibleNotifcationModal: false,
      idLiveNotif: -1,
      listSport: TemplateSportLive,
    };

    this._unsubscribe = this.props.navigation.addListener('focus', () => {
      this.componentDidMount();
    });
  }

  componentDidMount() {
    setTimeout(() => this.componentDidMountOk(), 100);
  }

  async componentDidMountOk() {
    this.getLives(this.props.userData.idUtilisateur);
    // if (this.props.isRecording) {
    //   this.goToMap();
    // } else {
    //   BackgroundGeolocation.stop();
    //   if (ApiUtils.isExpired()) {
    //     this.onClickNavigate('IsExpired')
    //     return;
    //   }
    //   this.downloadData();
    // }
  }
  // async downloadData() {
  //   this.init();
  //   this.getPhoneData();
  //   await this.getNewVersion();
  //   await this.getLives(this.props.userData.idUtilisateur);

  //   await this.getinformationStation();
  // }

  init = () => {
    RNPusherPushNotifications.setInstanceId(
      '653e46e5-9ff8-48ae-9591-feaa4054023e',
    );

    RNPusherPushNotifications.on('registered', () => {
      this.subscribe('debug-' + this.props.userData.idUtilisateur);
      RNPusherPushNotifications.on('notification', this.handleNotification);
    });
  };

  subscribe = (interest) => {
    console.log(`Subscribing to "${interest}"`);
    RNPusherPushNotifications.subscribe(
      interest,
      (statusCode, response) => {
        console.error(statusCode, response);
      },
      () => {
        console.log(`CALLBACK: Subscribed to ${interest}`);
      },
    );
  };

  isCurrentRecordingLive(idLive) {
    return (
      this.props.isRecording &&
      this.props.currentLive != null &&
      this.props.currentLive.idLive == idLive
    );
  }
  handleNotification = (notification) => {
    console.log('LALA');

    if (notification.data != null) {
      if (notification.data.TSLocationManager == 'true') {
        return;
      }
    }
    if (Platform.OS == 'ios') {
      let actionData = notification.userInfo.data.notification;
      var action = {
        type: 'ADD_NOTIFICATION',
        data: actionData,
      };
      let idLive = actionData.idLive;

      let live = {
        idLive: idLive,
      };

      switch (notification.appState) {
        case 'inactive':
          this.setState({
            isVisibleNotifcationModal: true,
            idLiveNotif: actionData.idLive,
          });
          this.props.dispatch(action);

        // inactive: App came in foreground by clicking on notification.
        //           Use notification.userInfo for redirecting to specific view controller
        case 'background':
        // background: App is in background and notification is received.
        //             You can fetch required data here don't do anything with UI
        case 'active':
          // App is foreground and notification is received. Show a alert or something.
          this.setState({
            isVisibleNotifcationModal: true,
            idLiveNotif: actionData.idLive,
          });
          this.props.dispatch(action);

        default:
          break;
      }
    } else {
      if (notification.data != '') {
        let datastring = notification.data.notification;
        let data = JSON.parse(datastring);

        let idLive = data.idLive;
        let live = {
          idLive: idLive,
        };

        let actionData = JSON.parse(notification.data.notification);
        var action = {
          type: 'ADD_NOTIFICATION',
          data: actionData,
        };

        if (notification.data.collapse_key != null) {
          //from notification click
          if (!this.props.isRecording) {
            var actionSaveLive = {type: 'SAVE_CURRENT_LIVE', data: live};

            this.props.dispatch(actionSaveLive);

            this.onClickNavigate('LiveSummary');
          } else {
            this.props.dispatch(action);
          }
        } else {
          this.setState({
            isVisibleNotifcationModal: true,
            idLiveNotif: data.idLive,
          });
          this.props.dispatch(action);
        }
      }
    }
  };

  seeNotificationLive = (notif) => {
    let live = {
      idLive: notif.idLive,
    };
    var actionSaveLive = {type: 'SAVE_CURRENT_LIVE', data: live};

    this.props.dispatch(actionSaveLive);

    var deleteNotif = {type: 'DELETE_NOTIFICATION', data: notif.idLive};

    this.props.dispatch(deleteNotif);

    this.onClickNavigate('LiveSummary');
  };

  onSubscriptionsChanged = (interests) => {};

  onRefresh = () => {
    // this.init();
    // this.getPhoneData();
    this.getLives(this.props.userData.idUtilisateur);
    //this.getNewVersion();
  };

  componentWillUnmount() {
    this._unsubscribe();
  }

  closeDrawer = () => {
    this.drawer._root.close();
  };

  onDrawer() {
    this.drawer._root.open();
  }

  // Buttons
  swipeoutBtns = [
    {
      text: 'Supprimer',
      backgroundColor: 'red',
      // underlayColor: 'rgba(0, 0, 0, 1, 0.6)',
      onPress: () => {
        this.deleteLive();
      },
    },
  ];

  onClickNavigate(routeName) {
    this.props.navigation.navigate(routeName);
  }
  ongoHome() {
    this.props.navigation.navigate('Home');
    //  App.goHome(this.props.navigation)
  }

  async getLives(idUtilisateur) {
    console.log('la');
    this.setState({isLoading: true});
    let formData = new FormData();
    formData.append('method', 'getLives');
    formData.append('auth', ApiUtils.getAPIAuth());
    formData.append('idUtilisateur', idUtilisateur);

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
        var action = {type: 'GET_LIVES', data: responseJson};
        this.props.dispatch(action);

        this.setState({isLoading: false});
      })
      .catch((e) => {
        console.log(e);
        this.setState({isLoading: false});
        ApiUtils.logError('getLives', e.message);
      })
      .then(() => this.setState({isLoading: false}));
  }

  getLibelleLive() {
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
  }

  openGpxModal = () => {
    this.setState({uploadGpxVisible: true});
  };

  closeGpxModal = () => {
    this.setState({uploadGpxVisible: false});
  };

  finishUploadGpx = () => {
    this.closeGpxModal();
    this.onClickNavigate('LiveSummary');
  };

  onClickCreateLive() {
    if (this.props.lives.filter((l) => l.etatLive == 0).length > 0) {
      let currentLive = this.props.lives.filter((l) => l.etatLive == 0)[0];
      this.viewLive(currentLive);
    } else {
      this.onClickCreateLiveOk();
      // this.setState({modalChooseSportVisible: true});
    }
  }

  onClickCreateLiveOk() {
    this.setState({spinner: true, modalChooseSportVisible: false});
    let formData = new FormData();
    formData.append('method', 'createLive');
    formData.append('auth', ApiUtils.getAPIAuth());
    formData.append('idUtilisateur', this.props.userData.idUtilisateur);
    formData.append('idversion', VersionCheck.getCurrentVersion());
    formData.append('idSport', this.state.selectedSport);
    formData.append('os', Platform.OS);
    formData.append('phoneData', JSON.stringify(this.props.phoneData));
    var libelleLive = this.getLibelleLive();

    formData.append('libelleLive', libelleLive);
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
        // alert("success http");
        this.setState({spinner: false});
        //save values in cache
        if (responseJson.codeErreur == 'SUCCESS') {
          //SaveData

          var live = {
            idLive: responseJson.idLive,
            codeLive: responseJson.codeLive,
            libelleLive: responseJson.libelleLive,
            dateCreationLive: responseJson.dateCreationLive,
            idSport: this.state.selectedSport,
            invites: [],
            statsInfos: {},
            etatLive: 0,
          };

          var action = {type: 'CREATE_LIVE', data: live};
          this.props.dispatch(action);
          this.setState({spinner: false});
          this.goToMap();
        } else {
          alert(responseJson.message);
        }
      })
      .catch((e) => {
        console.log(e);
        this.setState({spinner: false});
        ApiUtils.logError('create live', JSON.stringify(e.message));
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

  viewLive(live) {
    var action = {type: 'SAVE_CURRENT_LIVE', data: live};

    this.props.dispatch(action);

    if (live.etatLive == 0 || live.etatLive == 1) {
      if (!this.props.isRecording) {
        this.goToMap();
      } else {
        this.goToMap();
      }
    } else {
      this.onClickNavigate('LiveSummary');
    }
  }
  goToMap = () => {
    if (this.props.isOkPopupGps) {
      this.onClickNavigate('SimpleMap');
    } else {
      this.onClickNavigate('AskGpsModal');
    }
  };

  onPressDeleteLive = (item) => {
    Alert.alert(
      "Supprimer l'activité",
      "Etes-vous sûr de supprimer l'activité ?",
      [
        {
          text: 'Annuler',
          style: 'cancel',
        },
        {
          text: 'Supprimer',
          onPress: () => this.deleteLiveLongPressOk(item.idLive),
        },
      ],
      {cancelable: false},
    );
  };

  deleteLiveLongPressOk(idLive) {
    var deletingIds = this.state.deletingIds;
    if (deletingIds.filter((d) => d == idLive).length == 0) {
      deletingIds.push(idLive);
    }
    this.setState(
      {isLoading: true, isLoadingDeleting: true, deletingIds: deletingIds},
      () => this.deleteLiveOk(idLive),
    );
  }

  deleteLive() {
    var idLive = this.state.rowID;
    var deletingIds = this.state.deletingIds;
    if (deletingIds.filter((d) => d == idLive).length == 0) {
      deletingIds.push(idLive);
    }
    this.setState(
      {isLoading: true, isLoadingDeleting: true, deletingIds: deletingIds},
      () => this.deleteLiveOk(this.state.rowID),
    );
  }

  deleteLiveOk(idLive) {
    let formData = new FormData();
    formData.append('method', 'deleteLive');
    formData.append('auth', ApiUtils.getAPIAuth());
    formData.append('idLive', idLive);
    //fetch followCode API
    fetch(ApiUtils.getAPIUrl(), {
      method: 'POST',
      headers: {
        // Accept: 'application/jsjhon',
        // 'Content-Type': 'application/json',
      },
      body: formData,
    })
      .then(ApiUtils.checkStatus)
      .then((response) => response.json())
      .then((responseJson) => {
        // alert("success http");
        //save values in cache

        if (responseJson.codeErreur == 'SUCCESS') {
          //SaveData
          // this.setState({
          //   lives: this.state.lives.filter(function (live) {
          //     return live.idLive != idLive
          //   })
          // });

          var action = {type: 'DELETE_LIVE', data: idLive};
          this.props.dispatch(action);

          var deletingIds = this.state.deletingIds;
          deletingIds = deletingIds.filter((d) => d != idLive);

          this.setState({
            isLoading: false,
            isLoadingDeleting: false,
            deletingIds: deletingIds,
          });
        } else {
          //alert('error');

          // this.setState({ isLoading: false })
          alert('erreur : ' + responseJson.message);
        }
        this.setState({isLoadingDeleting: false});
      })
      .catch((e) => {
        console.log(e);
        var deletingIds = this.state.deletingIds;
        deletingIds = deletingIds.filter((d) => d != idLive);

        this.setState({
          isLoading: false,
          isLoadingDeleting: false,
          deletingIds: deletingIds,
        });

        this.setState({spinner: false});
        ApiUtils.logError('create live', JSON.stringify(e.message));
        // alert('Une erreur est survenue : ' + JSON.stringify(e.message));
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

  getLiveStatusLibelle(status) {
    if (status == 0) {
      return 'En attente';
    } else if (status == 1) {
      return 'En cours';
    } else {
      return 'Terminé';
    }
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
      var justDate = date.substr(10);
      var splitDate = justDate.split(':');
      var hour = splitDate[0];
      var minutes = splitDate[1];
      return hour + 'H' + minutes;
    } else {
      return '';
    }
  }
  getStatusColor(status) {
    if (status == 2 || status == 3) {
      return 'green';
    } else if (status == 0) {
      return '#A7A7A7';
    } else {
      return 'black';
    }
  }

  getStatsInfo(json) {
    if (json != undefined) {
      var infos = JSON.parse(json);
      return infos.distance + ' km';
    }

    return 0;
  }

  getStatsTimeInfo(json) {
    if (json != undefined) {
      var infos = JSON.parse(json);
      if (infos.duree == '0') {
        return '00:00:00';
      }
      return infos.duree;
    }

    return '00:00:00';
  }

  getSport(idSport) {
    const jsonSport = this.state.listSport;
    for (let i = 0; i < jsonSport.length; i++) {
      if (idSport == jsonSport[i].idSport) {
        return jsonSport[i].sportName;
      }
    }
  }

  getnbInvites(live) {
    var invites = live.invites;
    var finalInvites = [];
    invites.forEach((i) => {
      if (i.idUtilisateur != this.props.userData.idUtilisateur) {
        if (
          finalInvites.filter((f) => f.idUtilisateur == i.idUtilisateur)
            .length == 0
        ) {
          finalInvites.push(i);
        }
      }
    });
    return finalInvites.length;
  }

  getInviteLabel(nbInvite) {
    if (nbInvite > 1) {
      return 'invités';
    } else {
      return 'invité';
    }
  }

  onValueSportChange = (value) => {
    this.setState({selectedSport: value});
  };

  onCloseNotificationModal = () => {
    this.setState({isVisibleNotifcationModal: false});
  };

  toggleModalChooseSport = () => {
    this.setState({
      modalChooseSportVisible: !this.state.modalChooseSportVisible,
    });
  };

  static navigationOptions = {
    drawerLabel: 'Mes activités',
    drawerIcon: ({tintColor}) => (
      <Image
        source={require('../assets/mesActivites.png')}
        style={[styles.icon, {tintColor: tintColor}]}
      />
    ),
  };

  isErrorFormCreate = () => {
    return this.state.selectedSport == -1;
  };

  render() {
    return (
      <Root>
        <Drawer
          ref={(ref) => {
            this.drawer = ref;
          }}
          content={
            <Sidebar
              navigation={this.props.navigation}
              drawer={this.drawer}
              selected="Lives"
            />
          }>
          <Container>
            <Header style={styles.header}>
              <Left style={{flex: 1, width: '30%'}}>
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
              <Right style={{flex: 1, width: '100%'}}>
                <Image resizeMode="contain" source={Logo} style={styles.logo} />
              </Right>
            </Header>

            <Content
              style={styles.body}
              scrollEnabled={true}
              refreshControl={
                <RefreshControl
                  refreshing={this.state.isLoading}
                  onRefresh={this.onRefresh}
                />
              }>
              {this.props.notifications != null &&
              this.props.notifications.length > 0 ? (
                <View>
                  <H3
                    style={{
                      textAlign: 'center',
                      marginTop: 10,
                      marginBottom: 10,
                    }}>
                    Nouveaux résultats
                  </H3>
                  {this.props.notifications?.map((notification) => {
                    return (
                      <View style={{paddingHorizontal: 10}}>
                        <TouchableOpacity
                          onPress={() =>
                            this.seeNotificationLive(notification)
                          }>
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
                                {notification.nomSegment}
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
                                <Text>{notification.distanceSegment} km</Text>
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
                                <Text>{notification.tempsSegmentString}</Text>
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
                                  {notification.vitesseMoyenneSegment}/km
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
                          </View>
                        </TouchableOpacity>
                      </View>
                    );
                  })}
                </View>
              ) : null}
              {/* <Text>{JSON.stringify(this.props.notifications)}</Text> */}
              <H3 style={{textAlign: 'center', marginTop: 10}}>
                Mes activités
              </H3>
              <View style={styles.loginButtonSection}>
                {this.props.lives == null || this.props.lives.length == 0 ? (
                  <Text
                    style={{
                      paddingTop: 100,
                      paddingLeft: 15,
                      paddingRight: 15,
                      color: 'black',
                    }}>
                    Vous n'avez pas encore créé d'activités
                  </Text>
                ) : (
                  <FlatList
                    style={{height: '100%', width: '100%', marginBottom: 100}}
                    data={this.props.lives.sort(function (a, b) {
                      return b.idLive - a.idLive;
                    })}
                    extraData={this.props.lives}
                    renderItem={({item}) =>
                      this.state.isLoadingDeleting &&
                      this.state.deletingIds.filter((d) => d == item.idLive)
                        .length > 0 ? ( //en cours de suppression
                        <TouchableOpacity
                          onPress={this.viewLive.bind(this, item)}>
                          <View style={[styles.rowContainer]}>
                            <View style={styles.line}>
                              <Text style={{width: 135}}>
                                {this.getShortDate(item.dateCreationLive)} -
                                {this.getShortTime(item.dateCreationLive)}
                              </Text>

                              <View
                                style={{
                                  alignContent: 'center',
                                }}>
                                <ActivityIndicator />
                              </View>
                            </View>
                            <View style={styles.line}>
                              <View
                                style={{
                                  flexDirection: 'row',
                                  justifyContent: 'flex-start',
                                  width: '60%',
                                }}>
                                {/* {item.etatLive > ? ( */}
                                <Text style={{width: 200}}>
                                  <Text
                                    style={{
                                      fontWeight: 'bold',
                                      color: ApiUtils.getColor(),
                                    }}>
                                    {this.getSport(item.idSport)}
                                  </Text>
                                </Text>
                                {/* ) : null} */}
                              </View>
                            </View>
                            <Text
                              style={{width: '60%'}}
                              numberOfLines={1}
                              ellipsizeMode="tail">
                              {item.libelleLive}
                            </Text>
                          </View>
                        </TouchableOpacity>
                      ) : (
                        <Swipeout
                          right={this.swipeoutBtns}
                          autoClose={true}
                          backgroundColor="transparent"
                          onOpen={(sectionID, rowID) => {
                            this.setState({
                              sectionID,
                              rowID,
                            });
                          }}>
                          <TouchableOpacity
                            delayLongPress={500}
                            onLongPress={this.onPressDeleteLive.bind(
                              this,
                              item,
                            )}
                            onPress={this.viewLive.bind(this, item)}>
                            <View>
                              <View style={styles.rowContainer}>
                                <View style={styles.line}>
                                  <View
                                    style={[
                                      GlobalStyles.row,
                                      {
                                        justifyContent: 'flex-start',
                                        width: 200,
                                      },
                                    ]}>
                                    <Text>
                                      <Text
                                        style={{
                                          width: 135,
                                          fontWeight: 'bold',
                                        }}>
                                        {this.getShortDate(
                                          item.dateCreationLive,
                                        )}{' '}
                                        <Text style={{fontWeight: 'normal'}}>
                                          |
                                        </Text>
                                        {this.getShortTime(
                                          item.dateCreationLive,
                                        )}
                                      </Text>
                                    </Text>
                                    {item.nombreChallenges > 0 ? (
                                      <View style={{justifyContent: 'center'}}>
                                        <Icon
                                          name="trophy"
                                          type="FontAwesome5"
                                          color={ApiUtils.getColor()}
                                          fontSize={13}
                                          style={{
                                            fontSize: 12,
                                            marginLeft: 10,
                                            alignSelf: 'center',
                                            color: ApiUtils.getColor(),
                                          }}
                                        />
                                      </View>
                                    ) : null}
                                  </View>
                                  {item.etatLive <= 1 && item.etatLive >= 0 ? (
                                    <Text
                                      style={{
                                        color: this.getStatusColor(
                                          item.etatLive,
                                        ),
                                      }}>
                                      {this.isCurrentRecordingLive(item.idLive)
                                        ? "En cours d'enregistrement"
                                        : this.getLiveStatusLibelle(
                                            item.etatLive,
                                          )}
                                    </Text>
                                  ) : item.isImportedFromGpx != 1 ? (
                                    <View style={[GlobalStyles.row]}>
                                      <Text
                                        style={{
                                          fontWeight: 'bold',
                                        }}>
                                        {this.isCurrentRecordingLive(
                                          item.idLive,
                                        )
                                          ? 'en cours'
                                          : this.getStatsInfo(item.statsLive)}
                                      </Text>
                                      <Text> | </Text>
                                      <Text
                                        style={{
                                          fontWeight: 'bold',
                                        }}>
                                        {this.getStatsTimeInfo(item.statsLive)}
                                      </Text>
                                    </View>
                                  ) : (
                                    <View style={[GlobalStyles.row]}>
                                      <Text
                                        style={{
                                          fontWeight: 'bold',
                                        }}>
                                        Fichier Gpx importé
                                      </Text>
                                    </View>
                                  )}
                                </View>
                                <View style={styles.line}>
                                  <View
                                    style={{
                                      flexDirection: 'row',
                                      justifyContent: 'flex-start',
                                      width: '60%',
                                    }}>
                                    {/* {item.etatLive > 1 ? ( */}
                                    <View>
                                      <Text style={{width: 200}}>
                                        <Text
                                          style={{
                                            color: ApiUtils.getColor(),
                                            fontWeight: 'bold',
                                          }}>
                                          {this.getSport(item.idSport)}
                                        </Text>
                                      </Text>
                                    </View>
                                    {/* ) : null} */}
                                  </View>
                                </View>
                                <Text
                                  style={{
                                    width: '100%',
                                  }}
                                  numberOfLines={1}
                                  ellipsizeMode="tail">
                                  {item.libelleLive}
                                </Text>
                              </View>
                            </View>
                          </TouchableOpacity>
                        </Swipeout>
                      )
                    }
                    keyExtractor={(item, index) => index.toString()}
                  />
                )}
              </View>
            </Content>
            {/* <TouchableHighlight
              underlayColor="rgba(255,255,255,1,0.6)"
              disabled={this.state.spinner}
              style={[styles.buttonok, {zIndex: 12}]}
              onPress={() => this.onClickCreateLive()}>
              {this.state.spinner ? (
                <ActivityIndicator
                  color={'white'}
                  style={{
                    alignSelf: 'center',
                    height: 20,
                    width: 20,
                  }}
                />
              ) : (
                <Icon
                  active
                  name="plus"
                  type="AntDesign"
                  style={styles.plusButtonLogo}
                />
              )}
            </TouchableHighlight> */}

            <TouchableHighlight
              underlayColor="rgba(255,255,255,1,0.6)"
              disabled={this.state.spinner}
              style={[
                styles.buttonok,
                {
                  zIndex: 12,
                  left: 10,
                  justifyContent: 'center',
                },
              ]}
              onPress={() => this.openGpxModal()}>
              {
                <Icon
                  active
                  name="file-upload"
                  type="FontAwesome5"
                  style={[styles.plusButtonLogo, {textAlign: 'center'}]}
                />
              }
            </TouchableHighlight>

            <Sponsors />

            <Modal
              visible={this.state.uploadGpxVisible}
              onRequestClose={() => this.closeGpxModal()}>
              <UploadGpx
                onclose={this.closeGpxModal}
                finish={() => this.finishUploadGpx()}
              />
            </Modal>
            {/******** modal : choose sport for new LIVE *****************/}
            <Modal
              animationType={'none'}
              transparent={false}
              visible={this.state.modalChooseSportVisible}
              onRequestClose={() => {
                this.toggleModalChooseSport();
              }}>
              {/* {this.state.modal3Visible ? ( */}
              <Root>
                <View>
                  <Header style={styles.headerModal}>
                    <Left>
                      <Button
                        style={styles.drawerButton}
                        onPress={() => {
                          this.toggleModalChooseSport();
                        }}>
                        <Icon
                          style={styles.saveText}
                          name="chevron-left"
                          type="FontAwesome5"
                        />
                      </Button>
                    </Left>
                    <Body style={{justifyContent: 'center', flex: 1}}>
                      <Text style={{fontWeight: 'bold'}}>
                        Démarrer une activité
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
                          iosIcon={
                            <Icon name="chevron-down" type="FontAwesome5" />
                          }
                          style={{marginTop: 0}}
                          selectedValue={this.state.selectedSport}
                          onValueChange={this.onValueSportChange.bind(this)}
                          placeholder={'Choisissez votre sport'}
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
                          <Picker.Item
                            label="Choisissez votre sport"
                            value="-1"
                          />
                          {this.state.listSport.map((sport, index) => {
                            return (
                              <Picker.Item
                                label={sport.sportName}
                                value={sport.idSport}
                                key={index}
                              />
                            );
                          })}
                        </Picker>

                        {this.state.selectedSport == -1 ? (
                          <Text
                            style={{
                              marginTop: 10,
                              color: 'red',
                              fontSize: 14,
                              paddingLeft: 5,
                              fontStyle: 'italic',
                            }}>
                            Le type de sport doit être renseigné
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
                        onPress={() => this.onClickCreateLiveOk()}
                        disabled={this.isErrorFormCreate()}>
                        <Text
                          style={{
                            color: this.isErrorFormCreate() ? 'black' : 'white',
                          }}>
                          C'est parti
                        </Text>
                      </Button>

                      <View style={{marginTop: -5}}>
                        <Text
                          style={styles.ignoreActivityLink}
                          onPress={() => this.toggleModalChooseSport()}>
                          Annuler
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
              {/* ) : null} */}
            </Modal>
            <NotificationModal
              isVisible={this.state.isVisibleNotifcationModal}
              idLive={this.state.idLiveNotif}
              onClose={() => this.onCloseNotificationModal()}
              navigation={this.props.navigation}
              dispatch={this.props.dispatch}
            />
          </Container>
        </Drawer>
      </Root>
    );
  }
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: ApiUtils.getBackgroundColor(),
    width: '100%',
    borderBottomColor: '#D3D3D3',
    borderBottomWidth: 1,
    // height: 70
  },
  title: {
    width: '25%',
  },
  saveButton: {
    backgroundColor: 'transparent',
    width: '38%',
    marginTop: 0,
    paddingTop: 0,
  },
  drawerButton: {
    backgroundColor: 'transparent',
    width: '100%',
    // width: '10%',
    // marginTop: 0,
    // paddingTop: 0,
    shadowOffset: {height: 0, width: 0},
    shadowOpacity: 0,
    elevation: 0,
  },
  saveText: {
    color: textAutoBackgroundColor,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'stretch',
    height: 590,
  },
  rowContainer: {
    padding: 10,
    // height: 80,
    paddingTop: 10,
    backgroundColor: 'white',
    borderBottomWidth: 0.5,
    borderBottomColor: '#B9B9B9',
  },
  line: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingRight: 0,
    paddingLeft: 2,
    marginBottom: 3,
    marginTop: 3,
  },
  text: {
    fontFamily: 'Roboto',
  },
  body: {
    flex: 1,
    width: '100%',
    backgroundColor: 'white',
  },
  logo: {
    width: '100%',
    height: 50,
    marginRight: '50%',
  },
  p: {
    fontSize: 12,
    marginBottom: 5,
  },
  url: {
    fontSize: 12,
    textAlign: 'center',
  },
  button: {
    marginBottom: 10,
  },
  loginButtonSection: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },

  buttonok: {
    // paddingTop: 13,

    width: 60,
    height: 60,
    backgroundColor:
      ApiUtils.getBackgroundColor() === '#FFFFFF'
        ? 'black'
        : ApiUtils.getBackgroundColor(),

    borderRadius: 30,
    textAlign: 'center',
    padding: 0,
    fontSize: 30,
    // paddingLeft: 18,
    position: 'absolute',
    right: 20,
    bottom: 90,
    justifyContent: 'center',
  },
  plusButtonLogo: {
    height: 30,
    width: 30,
    fontSize: 30,
    color:
      ApiUtils.getBackgroundColor() === '#FFFFFF'
        ? 'white'
        : textAutoBackgroundColor,
    // marginLeft: -3,
    alignSelf: 'center',
    zIndex: 10,
  },
  footer: {
    backgroundColor: 'transparent',
    height: 215,
  },
  headerModal: {
    backgroundColor: 'white',
    paddingLeft: 10,
    paddingTop: 0,
    paddingBottom: 5,
    // height: 50
  },
  ignoreActivityLink: {
    marginTop: 10,
    marginBottom: 20,
    alignSelf: 'center',
    textAlign: 'center',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  userInfo: {
    padding: 10,
  },
  icon: {
    width: 24,
    height: 24,
  },
});

export default connect(mapStateToProps)(Lives);
