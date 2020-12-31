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
} from 'native-base';
import Swipeout from 'react-native-swipeout';
// import { Icon } from 'react-native-elements';
import ApiUtils from '../ApiUtils';
import Logo from '../assets/logo_header.png';
import LogoHome from '../assets/logo.png';
import Sidebar from './SideBar';
import AsyncStorage from '@react-native-community/async-storage';
// import Geolocation from 'react-native-geolocation-service';
import {connect} from 'react-redux';
import GlobalStyles from '../styles';
import {Modal} from 'react-native';
import Help from './Help';
import {Sponsors} from './Sponsors';
import Autrans from '../assets/autrans.svg';
import { PermissionsAndroid } from 'react-native';
import DocumentPicker from 'react-native-document-picker';
const mapStateToProps = state => {
  return {
    userData: state.userData,
    isRecording: state.isRecording,
    lives: state.lives,
    sports: state.sports,
    currentLive: state.currentLive,
    isOkPopupGps: state.isOkPopupGps,
    isOkPopupBAttery: state.isOkPopupBAttery,
  };
};

class Lives extends Component {
  constructor(props) {
    super(props);

    this.state = {
      spinner: false,

      isOpenModalHelp: false,
      //   username: navigation.state.params.username,
      // url: TRACKER_HOST + navigation.state.params.username,
      userdata: {
        nom: '',
        prenom: '',
        folocode: '',
        urlResultats: '',
        idUtilisateur: '',
      },
      sports: [],
      deletingIds: [],
      rowID: 0,
      lives: [],
      isLoading: true,
      isRecording: true,
      isLoadingDeleting: false,
    };

    this._unsubscribe = this.props.navigation.addListener('focus', () => {
      this.componentDidMount();
    });
  }

  componentDidMount() {
    setTimeout(() => this.componentDidMountOk(), 100);
  }

  componentDidMountOk() {
    if (this.props.isRecording) {
      this.onClickNavigate('SimpleMap');
    } else {
      this.getLives(this.props.userData.idUtilisateur);
      this.getSports();
      this.getinformationStation();
    }
  }

  onRefresh() {
    this.getSports();
    this.getLives(this.props.userData.idUtilisateur);
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

  getLives(idUtilisateur) {
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
      .then(response => response.json())
      .then(responseJson => {
        var action = {type: 'GET_LIVES', data: responseJson};
        this.props.dispatch(action);

        this.setState({isLoading: false});
      })
      .catch(e => {
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

  getSports() {
    let formData = new FormData();
    formData.append('method', 'getSports');
    formData.append('auth', ApiUtils.getAPIAuth());

    //fetch followCode API
    return fetch(ApiUtils.getAPIUrl(), {
      method: 'POST',
      headers: {},
      body: formData,
    })
      .then(ApiUtils.checkStatus)
      .then(response => response.json())
      .then(responseJson => {
        var result = [];
        for (var i in responseJson) {
          result.push(responseJson[i]);
        }
        // var selectableSports = [];
        // result.forEach(function (element, index) {
        //   var newSelectableSport = {
        //     value: index,
        //     label: element
        //   };
        //   selectableSports.push(newSelectableSport);
        // });

        var action = {type: 'GET_SPORTS', data: result};

        this.props.dispatch(action);
      })
      .catch(e => ApiUtils.logError('Lives getSports', e.message))
      .then(this.setState({isLoading: false}));
  }




  checkPermissions() {
    if (Platform.OS == 'android') {
      try {
        PermissionsAndroid.request(
          'android.permission.READ_EXTERNAL_STORAGE',
        ).then(res => {
          console.warn(res);
          if (res == 'granted') {
          } else {
            // alert('error')
            this.requestStoragePermission();
          }
        });
      } catch (error) {
        console.warn('location set error:', error);
      }
    }
  }


  requestStoragePermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        'android.permission.READ_EXTERNAL_STORAGE',
        {
          title: 'Accèder à vos fichiers',
          message: '',
          buttonNeutral: 'Plus tard',
          buttonNegative: 'Annuler',
          buttonPositive: 'OK',
        },
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.warn('You can use the camera');
      } else {
        // console.log("location permission denied");
      }
    } catch (err) {
      // console.warn(err);
    }
  };

  async onClickCreateLiveNew()
  {
    this.checkPermissions();

       // Pick a single file
       try {
        const res = await DocumentPicker.pick({
          // type: 'application/gpx+xml',
        });
        console.log(
          res.uri,
          res.type, // mime type
          res.name,
          res.size,
        );
  
        var uri = res.uri;
        var filePath = uri;
  
        if (res.name.includes('.gpx')) {
          setTimeout(() => this.sendFile(res), 100);
        } else {
          alert("Le fichier n'est pas un fichier gpx");
        }
      } catch (err) {
        // alert(err)
        if (DocumentPicker.isCancel(err)) {
          // User cancelled the picker, exit any dialogs or menus and move on
        } else {
          throw err;
        }
      }
  }

  normalize(path) {
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      const filePrefix = 'file://';
      if (path.startsWith(filePrefix)) {
        path = path.substring(filePrefix.length);
        try {
          path = decodeURI(path);
        } catch (e) {}
      }
    }
    return path;
  }

async  sendFile(fileToUpload) {
    // var path = this.normalize(filePath);
    var _this = this;

    // const file = {
    //   uri  :path ,             // e.g. 'file:///path/to/file/image123.jpg'
    //   name : 'test',            // e.g. 'image123.jpg',
    //   type : 'gpx'             // e.g. 'image/jpg'
    // }
    
    let formData = new FormData();
    // body.append('file', file)
    formData.append('file_attachment', fileToUpload);

    formData.append('method', 'createLive');
    formData.append('auth', ApiUtils.getAPIAuth());
    formData.append('idUtilisateur', this.props.userData.idUtilisateur);

    // console.log(fileToUpload);
    
    // fetch('https://folomi.fr/api/uploadgpx.php', {
    //   method: 'POST',
    //   body : body,
    //   headers: {
    //     'Content-Type': 'multipart/form-data; ',
    //   },
    // })

    let res = await fetch(
      'https://www.folomi.fr/api/uploadgpx.php',
      {
        method: 'post',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data; ',
        },
      }
    );

    let responseJson = await res.json();
    console.log(responseJson);
    if (responseJson.status == 1) {
      alert('Upload Successful');
    }else{
      console.log(responseJson);
    }


    // .then(ApiUtils.checkStatus)
    // .then(response=> {
    //   console.log(response)
    // })
    // .catch(e => console.log(e))
  }

  onClickCreateLive() {
    this.setState({spinner: true});
    let formData = new FormData();
    formData.append('method', 'createLive');
    formData.append('auth', ApiUtils.getAPIAuth());
    formData.append('idUtilisateur', this.props.userData.idUtilisateur);

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
      .then(response => response.json())
      .then(responseJson => {
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
            invites: [],
            statsInfos: {},
            etatLive: 0,
          };

          var action = {type: 'CREATE_LIVE', data: live};
          this.props.dispatch(action);
          this.setState({spinner: false});
          this.onClickNavigate('SimpleMap');
        } else {
          alert(responseJson.message);
        }
      })
      .catch(e => {
        this.setState({spinner: false});
        ApiUtils.logError('create live', JSON.stringify(e.message));
          // alert('Une erreur est survenue : ' + JSON.stringify(e.message));
        console.log(e)
          if (e.message == 'Timeout'
          || e.message == 'Network request failed') {
          this.setState({ noConnection: true });


          Toast.show({
            text: "Vous n'avez pas de connection internet, merci de réessayer",
            buttonText: 'Ok',
            type: 'danger',
            position: 'bottom',
            duration : 5000
          });
          }
      });
  }

  initTimer(idLive) {
    try {
      var timerIntString = JSON.stringify(0);
      AsyncStorage.setItem('@followme:timer' + idLive, timerIntString);
    } catch (error) {
      ApiUtils.logError('saveTimer', error.message);
    }

    try {
      return AsyncStorage.setItem('@followme:timerString' + idLive, '00:00:00');
    } catch (error) {
      ApiUtils.logError('saveTimerstring', error.message);
    }
  }

  viewLive(live) {
    var action = {type: 'SAVE_CURRENT_LIVE', data: live};

    this.props.dispatch(action);

    if (live.etatLive == 0 || live.etatLive == 1) {
      if (!this.props.isRecording) {
        //set time à zero pour la map
        this.initTimer(live.idLive).then(() => {
          this.props.navigation.navigate('SimpleMap');
        });
      } else {
        this.props.navigation.navigate('SimpleMap');
      }
    } else {
      this.props.navigation.navigate('LiveSummary');
    }
  }

  deleteLive() {
    var idLive = this.state.rowID;
    var deletingIds = this.state.deletingIds;
    if (deletingIds.filter(d => d == idLive).length == 0) {
      deletingIds.push(idLive);
    }
    this.setState(
      {isLoading: true, isLoadingDeleting: true, deletingIds: deletingIds},
      () => this.deleteLiveOk(),
    );
  }

  deleteLiveOk() {
    var idLive = this.state.rowID;
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
      .then(response => response.json())
      .then(responseJson => {
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
          deletingIds = deletingIds.filter(d => d != idLive);

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
      .catch(e => {

        console.log(e);
        var deletingIds = this.state.deletingIds;
        deletingIds = deletingIds.filter(d => d != idLive);

        this.setState({
          isLoading: false,
          isLoadingDeleting: false,
          deletingIds: deletingIds,
        });
      
        this.setState({spinner: false});
        ApiUtils.logError('create live', JSON.stringify(e.message));
          // alert('Une erreur est survenue : ' + JSON.stringify(e.message));
        console.log(e);
          if (e.message == 'Timeout'
          || e.message == 'Network request failed') {
          this.setState({ noConnection: true });


          Toast.show({
            text: "Vous n'avez pas de connection internet, merci de réessayer",
            buttonText: 'Ok',
            type: 'danger',
            position: 'bottom',
            duration : 5000
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

  getinformationStation() {
    const formData = new FormData();
    formData.append('method', 'getInformationStation');
    formData.append('auth', ApiUtils.getAPIAuth());
    formData.append('idStation', '36');
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
        //save values in cache

        var result = responseJson;

        if (result.traces != null && result.traces.length != 0) {
          this.setState({nomStation: result.nomStation});

          this.setState({descriptionStation: result.descriptionStation});
          var tracesArray = Object.values(result.traces);

          var finalTraceArray = []; // new Object(this.props.polylines);
          var finalinterestArray = [];
          if ((tracesArray != null) & (tracesArray.length != 0)) {
            tracesArray.forEach(trace => {
              var finalTrace = trace;

              var positionArray = Object.values(trace.positionsTrace);
              trace.positionsTrace = positionArray;

              var finalTrace = {
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
            interestArray.forEach(interest => {
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
                    finalData.description =
                      extraData.hasDescription[0].shortDescription[1];
                  } else {
                    finalData.description =
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

          console.log('pointsInterets', finalinterestArray);

          var action = {type: 'UPDATE_STATION_DATA', data: station};
          this.props.dispatch(action);
        }
      })
      // .catch(e => alert('test', JSON.stringify(e)))
      .then();
  }

  getSport(idSport) {
    if (this.props.sports.filter(s => s.idSport == idSport).length > 0) {
      return this.props.sports.filter(s => s.idSport == idSport)[0]
        .libelleSport;
    } else {
      ApiUtils.logError('lives lists', 'unknow id sport : ' + idSport);
      return '';
    }
    return '';
  }
  getnbInvites(live) {
    var invites = live.invites;
    var finalInvites = [];
    invites.forEach(i => {
      if (i.idUtilisateur != this.props.userData.idUtilisateur) {
        if (
          finalInvites.filter(f => f.idUtilisateur == i.idUtilisateur).length ==
          0
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

  static navigationOptions = {
    drawerLabel: 'Mes activités',
    drawerIcon: ({tintColor}) => (
      <Image
        source={require('../assets/mesActivites.png')}
        style={[styles.icon, {tintColor: tintColor}]}
      />
    ),
  };

  render() {
    // if (this.props.isRecording) {
    //   return <Text>erroe</Text>;
    // }

    return (
      <Root>
      <Drawer
        ref={ref => {
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
            <Left style={{flex: 1}}>
              <TouchableOpacity
                style={styles.drawerButton}
                onPress={() => this.onDrawer()}>
                <Icon style={styles.saveText} name="bars" type="FontAwesome5" />
              </TouchableOpacity>
            </Left>
            <Body style={{flex: 0}}>
           
            </Body>
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
              {this.props.lives.length == 0 ? (
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
                  data={this.props.lives.sort(function(a, b) {
                    return b.idLive - a.idLive;
                  })}
                  extraData={this.props.lives}
                  key={({item}) => item.idLive}
                  renderItem={({item}) =>
                    this.state.isLoadingDeleting &&
                    this.state.deletingIds.filter(d => d == item.idLive)
                      .length > 0 ? (
                      <TouchableOpacity
                        underlayColor="rgba(255,255,255,1,0.6)"
                        onPress={this.viewLive.bind(this, item)}>
                        <View style={[styles.rowContainer]}>
                          <View style={styles.line}>
                            <Text style={{width: 135}}>
                              {this.getShortDate(item.dateCreationLive)} -
                              {this.getShortTime(item.dateCreationLive)}
                            </Text>

                            <View
                              style={{color: 'black', alignContent: 'center'}}>
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
                              {item.etatLive > 1 ? (
                                <Text style={{width: 200}}>
                                  <Text
                                    style={{
                                      fontWeight: 'bold',
                                      color: ApiUtils.getBackgroundColor(),
                                    }}>
                                    {this.getSport(item.idSport)}
                                  </Text>
                                </Text>
                              ) : null}
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
                          onPress={this.viewLive.bind(this, item)}>
                          <View>
                            <View style={styles.rowContainer}>
                              <View style={styles.line}>
                                <View
                                  style={[
                                    GlobalStyles.row,
                                    {justifyContent: 'flex-start', width: 200},
                                  ]}>
                                  <Text>
                                    <Text
                                      style={{width: 135, fontWeight: 'bold'}}>
                                      {this.getShortDate(item.dateCreationLive)}{' '}
                                      <Text style={{fontWeight: 'normal'}}>
                                        |
                                      </Text>
                                      {this.getShortTime(item.dateCreationLive)}
                                    </Text>
                                  </Text>
                                  {item.nombreChallenges > 1 ? (
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
                                {item.etatLive <= 1 ? (
                                  <Text
                                    style={{
                                      color: this.getStatusColor(item.etatLive),
                                    }}>
                                    {this.getLiveStatusLibelle(item.etatLive)}
                                  </Text>
                                ) : (
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
                                )}
                              </View>
                              <View style={styles.line}>
                                <View
                                  style={{
                                    flexDirection: 'row',
                                    justifyContent: 'flex-start',
                                    width: '60%',
                                  }}>
                                  {item.etatLive > 1 ? (
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
                                  ) : null}
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
                  color: 'white',
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

          <Sponsors />

          <Modal
            visible={
              !this.props.isOkPopupBAttery || this.state.isOpenModalHelp
            }>
            <Container style={{flex: 1}} scrollEnabled={true}>
              <View style={{flex: 1}}>
                <Help noHeader={true} />

                {/* <View style={{height: 300}} /> */}
              </View>
            </Container>
          </Modal>
        </Container>
      </Drawer>
      </Root>
    );
  }
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: 'white',
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
    // backgroundColor: 'transparent',
    // width: '10%',
    // marginTop: 0,
    // paddingTop: 0,
    shadowOffset: {height: 0, width: 0},
    shadowOpacity: 0,
    elevation: 0,
  },
  saveText: {
    color: 'black',
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
    alignSelf: 'center',
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
    bottom: 120,
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
  container: {
    // flex: 1,
    //  justifyContent: 'center',
    //   alignItems: 'center',
    backgroundColor: ApiUtils.getBackgroundColor(),
  },
  footer: {
    backgroundColor: 'transparent',
    height: 215,
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
