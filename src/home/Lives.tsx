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
  H1,
  Toast,
  Root,
  Fab,
  Button,
  Spinner,
  Picker,
} from 'native-base';
import Swipeout from 'react-native-swipeout';
// import { Icon } from 'react-native-elements';
import ApiUtils from '../ApiUtils';
import Logo from '../assets/logo_header.png';
import Sidebar from './SideBar';
// import Geolocation from 'react-native-geolocation-service';
import {connect} from 'react-redux';
import GlobalStyles from '../styles';
import {Modal} from 'react-native';
import BatteryModal from './BatteryModal';
import {Sponsors} from './Sponsors';
import UploadGpx from './UploadGpx';
import {Platform} from 'react-native';
import {Linking} from 'react-native';
import {Alert} from 'react-native';
import DefaultProps from '../models/DefaultProps';
import VersionCheck from 'react-native-version-check';


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
    };

    this._unsubscribe = this.props.navigation.addListener('focus', () => {
      this.componentDidMount();
    });
  }

  componentDidMount() {
    setTimeout(() => this.componentDidMountOk(), 100);
  }

  async componentDidMountOk() {
    if (this.props.isRecording) {
      this.goToMap();
    } else {
      this.downloadData();
    }
  }
  async downloadData() {
    await this.getNewVersion();
    await this.getLives(this.props.userData.idUtilisateur);

    await this.getinformationStation();
  }

  onRefresh() {
    this.getLives(this.props.userData.idUtilisateur);
    this.getNewVersion();
  }
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
      this.setState({modalChooseSportVisible: true});
    }
  }

  onClickCreateLiveOk() {
    this.setState({spinner: true, modalChooseSportVisible: false});
    let formData = new FormData();
    formData.append('method', 'createLive');
    formData.append('auth', ApiUtils.getAPIAuth());
    formData.append('idUtilisateur', this.props.userData.idUtilisateur);
    formData.append('idversion', ApiUtils.VersionNumberInt().toString());
    formData.append('idSport', "16");
    formData.append('os', Platform.OS);
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
            idSport: "16",
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
      this.props.navigation.navigate('LiveSummary');
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
      return infos.duree;
    }

    return 0;
  }

  async getNewVersion() {
    VersionCheck.needUpdate({
      depth: Platform.OS == 'android' ? 3 : 2,
    }).then((res) => {
      if (res.isNeeded) {
        Alert.alert(
          'Nouvelle version disponible',
          "Une nouvelle version de l'application est disponible",
          [
            {
              text: 'Annuler',
              style: 'cancel',
            },
            {text: 'Télécharger', onPress: () => this.openStorePage()},
          ],
          {cancelable: false},
        );
      }
    });
  }

  openStorePage() {
    let url =
      Platform.OS === 'android'
        ? 'https://play.google.com/store/apps/details?id=com.dag.digiraidinp.app'
        : 'https://apps.apple.com/fr/app/la-foul%C3%A9e-blanche/id1546257921';
    Linking.openURL(url);
  }

  async getinformationStation() {
    const formData = new FormData();
    formData.append('method', 'getInformationStation');
    formData.append('auth', ApiUtils.getAPIAuth());
    formData.append('idStation', '51');
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
        //save values in cache

        var result = responseJson;

        if (result.traces != null && result.traces.length != 0) {
          var tracesArray = Object.values(result.traces);

          var finalTraceArray = []; // new Object(this.props.polylines);
          var finalinterestArray = [];
          if (tracesArray != null && tracesArray.length != 0) {
            tracesArray.forEach((trace) => {
              var finalTrace = trace;

              var positionArray = Object.values(trace.positionsTrace);
              trace.positionsTrace = positionArray;

              finalTrace = {
                positionsTrace: positionArray,
                couleurTrace: trace.couleurTrace,
                nomTrace: trace.nomTrace,
                isActive: true,
                sportTrace: trace.sportTrace,
                distanceTrace: trace.distanceTrace,
                dplusTrace: trace.dplusTrace,
              };
              finalTraceArray.push(finalTrace);
            });
          }
          if (result.interets != null && result.interets.length != 0) {
            var interestArray = Object.values(result.interets);
            var count = 0;
            interestArray.forEach((interest) => {
              var coordinate = {
                latitude: parseFloat(interest.latitudeInteret),
                longitude: parseFloat(interest.longitudeInteret),
              };

              var finalInterest = {
                id: 'interest' + count,
                idInteret: interest.idInteret,
                idStation: interest.idStation,
                coordinates: coordinate,
                libelleInteret: interest.libelleInteret,
                couleurTrace: interest.couleurTrace,
                descriptionInteret: interest.descriptionInteret,
                telephoneInteret: interest.telephoneInteret,
                lienInteret: interest.lienInteret,
                photoInteret: interest.photoInteret,
                description: '',
              };

              if (
                finalInterest.descriptionInteret == null &&
                interest.externalData != null
              ) {
                var extraData = JSON.parse(interest.externalData);
                if (
                  extraData.hasDescription.length > 0 &&
                  extraData.hasDescription[0] != null
                ) {
                  if (
                    extraData.hasDescription[0].shortDescription != null &&
                    extraData.hasDescription[0].shortDescription.length > 1
                  ) {
                    finalInterest.description =
                      extraData.hasDescription[0].shortDescription[1];
                  } else {
                    finalInterest.description =
                      extraData.hasDescription[0].shortDescription[0];
                  }
                }
              }
              if (interest.actifInteret == '1') {
                finalinterestArray.push(finalInterest);
                count++;
              }
            });
          }

          var station = {
            nomStation: result.nomStation,
            descriptionStation: result.descriptionStation,
            polylines: finalTraceArray,
            pointsInterets: finalinterestArray,
          };

          var action = {type: 'UPDATE_STATION_DATA', data: station};
          this.props.dispatch(action);
        }
      })
      // .catch(e => alert('test', JSON.stringify(e)))
      .then();
  }

  getSport(idSport) {
    return 'RAID';
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
    // if (this.props.isRecording) {
    //   return <Text>erroe</Text>;
    // }

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
              <Left style={{flex: 1, width: '20%'}}>
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
              <Right style={{flex: 1, width: '80%'}}>
                <Image resizeMode="contain" source={Logo} style={styles.logo} />
              </Right>
            </Header>

            <Content
              style={styles.body}
              scrollEnabled={true}
              refreshControl={
                <RefreshControl
                  refreshing={this.state.isLoading}
                  onRefresh={() => this.onRefresh()}
                />
              }>
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
                    key={(item) => item.idLive}
                    renderItem={({item}) =>
                      this.state.isLoadingDeleting &&
                      this.state.deletingIds.filter((d) => d == item.idLive)
                        .length > 0 ? (
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
                                      color: ApiUtils.getBackgroundColor(),
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
                          rowID={item.idLive}
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
                                          color={ApiUtils.getBackgroundColor()}
                                          fontSize={13}
                                          style={{
                                            fontSize: 12,
                                            marginLeft: 10,
                                            alignSelf: 'center',
                                            color: ApiUtils.getBackgroundColor(),
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
                                      {this.getLiveStatusLibelle(item.etatLive)}
                                    </Text>
                                  ) : item.isImportedFromGpx != 1 ? (
                                    <View style={[GlobalStyles.row]}>
                                      <Text
                                        style={{
                                          fontWeight: 'bold',
                                        }}>
                                        {this.getStatsInfo(item.statsLive)}
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
                                            color: ApiUtils.getBackgroundColor(),
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
            <TouchableHighlight
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
            </TouchableHighlight>

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
              visible={
                !this.props.isOkPopupBAttery2 && this.props.isOkPopupBAttery
              }>
              <Container style={{flex: 1}}>
                <View style={{flex: 1}}>
                  <BatteryModal noHeader={true} />

                  {/* <View style={{height: 300}} /> */}
                </View>
              </Container>
            </Modal>

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
                      <Text style={{fontWeight: 'bold', color: 'white'}}>
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
                          accessibilityLabel={"Choisissez le type d'activité"}
                          iosHeader={"Choisissez le type d'activité"}
                          iosIcon={
                            <Icon name="chevron-down" type="FontAwesome5" />
                          }
                          style={{marginTop: 0}}
                          selectedValue={"16"}
                          onValueChange={this.onValueSportChange.bind(this)}
                          placeholder={"Choisissez le type d'activité"}
                          placeholderStyle={{
                            color: ApiUtils.getBackgroundColor(),
                          }}
                          placeholderIconColor={ApiUtils.getBackgroundColor()}
                          textStyle={{color: ApiUtils.getBackgroundColor()}}
                          itemStyle={{
                            color: ApiUtils.getBackgroundColor(),
                            marginLeft: 0,
                            paddingLeft: 10,
                            borderBottomColor: ApiUtils.getBackgroundColor(),
                            borderBottomWidth: 1,
                          }}
                          itemTextStyle={{
                            color: ApiUtils.getBackgroundColor(),
                            borderBottomColor: ApiUtils.getBackgroundColor(),
                            borderBottomWidth: 1,
                          }}>
                          <Picker.Item label={'RAID'} value="16" />
                        </Picker>
{/* 
                        {this.state.selectedSport == -1 ? (
                          <Text
                            style={{
                              marginTop: 10,
                              color: 'red',
                              fontSize: 14,
                              paddingLeft: 5,
                              fontStyle: 'italic',
                            }}>
                            Le type d'activité doit être renseigné
                          </Text>
                        ) : null} */}
                      </View>

                      <Button
                        style={{
                          marginTop: 10,
                          paddingHorizontal: 50,
                          elevation: 0,
                          alignSelf: 'center',
                          borderColor:
                             ApiUtils.getBackgroundColor(),
                          borderWidth: 1,
                          backgroundColor:
                             ApiUtils.getBackgroundColor(),
                        }}
                        onPress={() => this.onClickCreateLiveOk()}
                        >
                        <Text
                          style={{
                            color: 'white',
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
          </Container>
        </Drawer>
      </Root>
    );
  }
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#2B3990',
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
    // marginTop: 0,
    // paddingTop: 0,
    shadowOffset: {height: 0, width: 0},
    shadowOpacity: 0,
    elevation: 0,
  },
  saveText: {
    color: 'white',
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
    //  justifyContent: 'center',
    backgroundColor: 'white',
  },
  logo: {
    width: '100%',
    height: 70,
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
    backgroundColor: ApiUtils.getBackgroundColor(),
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
    color: 'white',
    // marginLeft: -3,
    alignSelf: 'center',
    zIndex: 10,
  },
  footer: {
    backgroundColor: 'transparent',
    height: 215,
  },
  headerModal: {
    backgroundColor: '#2B3990',
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
