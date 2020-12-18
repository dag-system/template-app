
import React, { Component } from 'react';
import {
  Platform,
  StyleSheet,
  Alert,
  Linking,
  View,
  TextInput,
  Image,
  FlatList, TouchableHighlight, RefreshControl, ActivityIndicator
} from 'react-native';
import {
  Container, Header, Content, Footer,
  Left, Body, Right,
  Card, CardItem,
  Text, H1,
  Button,
  Title, Icon, Drawer,
  Form, Item, Input, Label, H3, Spinner
} from 'native-base';
import * as Animated from 'react-native-animatable';
import Swipeout from 'react-native-swipeout';
// import { Icon } from 'react-native-elements';
import ApiUtils from '../ApiUtils';
import Logo from '../assets/logo.png';
import Sidebar from './SideBar';
import AsyncStorage from '@react-native-community/async-storage';
// import Geolocation from 'react-native-geolocation-service';
import { connect } from 'react-redux'
import { isPointWithinRadius } from 'geolib';



const mapStateToProps = (state) => {
  return {
    userData: state.userData,
    isRecording: state.isRecording,
    lives: state.lives,
    sports: state.sports,
    currentLive: state.currentLive,
  }
}

class Lives extends Component {


  constructor(props) {
    super(props);

    let navigation = props.navigation;
    this.state = {
      spinner: false,
      //   username: navigation.state.params.username,
      // url: TRACKER_HOST + navigation.state.params.username,
      userdata: {
        nom: "",
        prenom: "",
        folocode: "",
        urlResultats: "",
        idUtilisateur: "",
      },
      sports: [],
      deletingIds: [],
      rowID: 0,
      lives: [],
      isLoading: true,
      isRecording: true,
      isLoadingDeleting: false
    }


    this._unsubscribe = this.props.navigation.addListener(
      'focus',
      payload => {
        this.componentDidMount();
      }
    );

  }


  componentDidMount() {

    setTimeout(() => this.componentDidMountOk(), 100);

    

  }

  componentDidMountOk() {

    if (this.props.isRecording) {
      this.onClickNavigate('SimpleMap')
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
    this.drawer._root.close()
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
      onPress: () => { this.deleteLive() }
    }
  ];


  onClickNavigate(routeName) {
    this.props.navigation.navigate(routeName);
  }
  ongoHome() {
    this.props.navigation.navigate('Home');
    //  App.goHome(this.props.navigation)
  }

  getLives(idUtilisateur) {

    this.setState({ isLoading: true });
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
      body: formData
    })
      .then(ApiUtils.checkStatus)
      .then(response => response.json())
      .then((responseJson) => {

        var action = { type: 'GET_LIVES', data: responseJson }
        this.props.dispatch(action);


        this.setState({ isLoading: false });

      })
      .catch(e => {
        this.setState({ isLoading: false });
        ApiUtils.logError("getLives", e.message);



      }).then(() => this.setState({ isLoading: false })

      );

  }

  getLibelleLive() {
    var date = new Date();
    var hour = date.getHours();

    if (hour <= 11) {
      return "Activité matinale";
    }
    if (hour > 11 && hour < 19) {
      return "Activité de l'après-midi";
    }

    if (hour >= 19) {
      return "Activité du soir";
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
      body: formData
    })
      .then(ApiUtils.checkStatus)
      .then(response => response.json())
      .then((responseJson) => {
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


        var action = { type: 'GET_SPORTS', data: result }

        this.props.dispatch(action);

     
      }

      )
      .catch(e => ApiUtils.logError('Lives getSports', e.message)).then(
        this.setState({ isLoading: false })
      );
  }

  onClickCreateLive() {

    this.setState({ spinner: true });
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
      body: formData
    })
      .then(ApiUtils.checkStatus)
      .then(response => response.json())
      .then((responseJson) => {
        // alert("success http");
        this.setState({ spinner: false });
        //save values in cache 
        if (responseJson.codeErreur == "SUCCESS") {
          //SaveData

          var live = {
            idLive: responseJson.idLive,
            codeLive: responseJson.codeLive,
            libelleLive: responseJson.libelleLive,
            dateCreationLive: responseJson.dateCreationLive,
            invites: [],
            statsInfos: {},
            etatLive: 0
          };


          var action = { type: 'CREATE_LIVE', data: live }
          this.props.dispatch(action);
          this.setState({ spinner: false });
          this.onClickNavigate('SimpleMap')
        } else {
          alert(responseJson.message);
        }
      })
      .catch(e => {
        this.setState({ spinner: false });
        ApiUtils.logError("create live", JSON.stringify(e.message)),
          alert("Une erreur est survenue : " + JSON.stringify(e.message))
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

      return AsyncStorage.setItem('@followme:timerString' + idLive, "00:00:00");
    } catch (error) {
      ApiUtils.logError('saveTimerstring', error.message);
    }
  }

  viewLive(live) {

    var action = { type: 'SAVE_CURRENT_LIVE', data: live }

    this.props.dispatch(action);

    if (live.etatLive == 0 || live.etatLive == 1) {


      if (!this.props.isRecording) {
        //set time à zero pour la map
        this.initTimer(live.idLive).then(r => {
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
    this.setState({ isLoading: true, isLoadingDeleting: true, deletingIds: deletingIds }, () => this.deleteLiveOk());

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
      body: formData
    })
      .then(ApiUtils.checkStatus)
      .then(response => response.json())
      .then((responseJson) => {
        // alert("success http");
        //save values in cache 


        if (responseJson.codeErreur == "SUCCESS") {
          //SaveData
          // this.setState({
          //   lives: this.state.lives.filter(function (live) {
          //     return live.idLive != idLive
          //   })
          // });

          var action = { type: 'DELETE_LIVE', data: idLive }
          this.props.dispatch(action);


          var deletingIds = this.state.deletingIds;
          deletingIds = deletingIds.filter(d => d != idLive);

          this.setState({ isLoading: false, isLoadingDeleting: false, deletingIds: deletingIds });

        } else {

          //alert('error');

          // this.setState({ isLoading: false })
          alert('erreur : ' + responseJson.message);
        }
        this.setState({ isLoadingDeleting: false })
      })
      .catch(e => {
        var deletingIds = this.state.deletingIds;
        deletingIds = deletingIds.filter(d => d != idLive);

        this.setState({ isLoading: false, isLoadingDeleting: false, deletingIds: deletingIds });
      }

        // this.setState({ isLoadingDeleting: false })
      );


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
    var justDate = date.substr(0, 10);
    var splitDate = justDate.split("-");
    var year = splitDate[0].substr(2, 2);
    var month = splitDate[1];
    var day = splitDate[2];
    return day + '/' + month + '/' + year;
  }

  getShortTime(date) {
    var justDate = date.substr(10);
    var splitDate = justDate.split(":");
    var hour = splitDate[0];
    var minutes = splitDate[1];
    var secondes = splitDate[2];
    return hour + 'h' + minutes;
  }
  getStatusColor(status) {

    if (status == 2 || status == 3) {
      return 'green';
    } else if (status == 0) {
      return '#A7A7A7';
    }
    else {
      return 'black';
    }
  }

  getStatsInfo(json) {



    if (json != undefined) {
      var infos = JSON.parse(json);
      return infos.distance + ' km / ' + infos.duree;
    }

    return 0;


  }

  getinformationStation() {
    const formData = new FormData();
    formData.append('method', 'getInformationStation');
    formData.append('auth', ApiUtils.getAPIAuth());
    formData.append('idStation', "36");
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
  
            if (
              result.traces != null &&
              result.traces.length != 0
            ) {
        
              this.setState({nomStation: result.nomStation});

              this.setState({descriptionStation: result.descriptionStation});
              var tracesArray = Object.values(result.traces);

              var finalTraceArray = []; // new Object(this.props.polylines);
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

        

              var station = {
                nomStation: result.nomStation,
                descriptionStation: result.descriptionStation,
                polylines: finalTraceArray,
                // pointsInterets: finalinterestArray
              };

              console.log(finalTraceArray)

              var action = {type: 'UPDATE_STATION_DATA', data: station};
              this.props.dispatch(action);
            }
          }
      )
      .catch(e => alert('test',JSON.stringify(e)))
      .then();
  }

  getSport(idSport) {
    if (this.props.sports.filter(s => s.idSport == idSport).length > 0) {
      return this.props.sports.filter(s => s.idSport == idSport)[0].libelleSport;
    } else {
      ApiUtils.logError('lives lists', "unknow id sport : " + idSport);
      return "";
    }
    return "";

  }
  getnbInvites(live) {
    var invites = live.invites;
    var finalInvites = [];
    invites.forEach(i => {
      if (i.idUtilisateur != this.props.userData.idUtilisateur) {
        if (finalInvites.filter(f => f.idUtilisateur == i.idUtilisateur).length == 0) {
          finalInvites.push(i);
        }
      }

    })
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
    drawerIcon: ({ tintColor }) => (
      <Image
        source={require('../assets/mesActivites.png')}
        style={[styles.icon, { tintColor: tintColor }]}
      />
    ),
  };


  render() {


    // if (this.props.isRecording) {
    //   return <Text>erroe</Text>;
    // }


    return (



      <Drawer ref={(ref) => { this.drawer = ref; }}

        content={<Sidebar navigation={this.props.navigation} drawer={this.drawer} selected="Lives" />}
      >
        <Container>
          <Header style={styles.header}>
            <Left style={{ flex: 1 }}>
              <TouchableHighlight underlayColor='rgba(255,255,255,1,0.6)' style={styles.drawerButton} onPress={() => this.onDrawer()}>
                <Icon style={styles.saveText} name="bars" type='FontAwesome' />
              </TouchableHighlight>
            </Left>
            <Body style={{ flex: 1 }}>
              <Animated.Image  resizeMode='contain' source={Logo} style={styles.logo} />
            </Body>
            <Right style={{ flex: 1 }} />
          </Header>

          <Content style={styles.body} scrollEnabled={true}
            refreshControl={
              <RefreshControl refreshing={this.state.isLoading} onRefresh={() => this.onRefresh()} />}
          >


            <View style={styles.loginButtonSection}>


              {this.props.lives.length == 0 ?

                <Text style={{ paddingTop: 100, paddingLeft: 15, paddingRight: 15, color : 'black' }}>Vous n'avez pas encore créé d'activités</Text>
                :

                <FlatList style={{ height: '100%', width: '100%', marginBottom: 100 }}
                  data={this.props.lives.sort(function (a, b) {
                    return b.idLive - a.idLive;
                  })}
                  extraData={this.props.lives}
                  key={({ item }) => item.idLive}
                  renderItem={({ item }) =>

                    this.state.isLoadingDeleting && this.state.deletingIds.filter(d => d == item.idLive).length > 0 ?

                      <TouchableHighlight underlayColor='rgba(255,255,255,1,0.6)'
                        // underlayColor='yellow'
                        onPress={this.viewLive.bind(this, item)}
                      >

                        <View style={[styles.rowContainer]}>
                          <View style={styles.line}>
                            <Text style={{ width: '60%', fontWeight: 'bold' }} numberOfLines={1} ellipsizeMode='tail'> {item.libelleLive} </Text>

                            <View style={{ color: 'black', alignContent: 'center' }}><ActivityIndicator></ActivityIndicator></View>

                          </View>
                          <View style={styles.line}>
                            <View style={{ flexDirection: 'row', justifyContent: 'flex-start', width: '60%', }}>
                              <Text style={{ width: 135 }}> {this.getShortDate(item.dateCreationLive)} -{this.getShortTime(item.dateCreationLive)}  </Text>
                              {item.etatLive > 1 ? <Text style={{ width: 200 }}><Text> | </Text> <Text style={{ color: '#7D7322' }}>{this.getSport(item.idSport)}</Text></Text>
                                :
                                null}
                            </View>

                            {/* {item.nombreChallenges > 1 ?

                          <View style={{ width: 26, height: 26, borderRadius: 13, paddingTop: 2, color: 'white', backgroundColor: ApiUtils.getBackgroundColor(), textAlign: 'center', alignContent: 'center' }}>
                            <Text style={{ color: 'white', textAlign: 'center', fontSize: 14 }}>{item.nombreChallenges}</Text>
                          </View>
                          : null
                        } */}


                            {this.getnbInvites(item) > 0 ?
                              <View style={{ flexDirection: 'row', justifyContent: 'flex-start' }}>
                                <View style={{ width: 26, height: 26, borderRadius: 13, paddingTop: 2, color: 'white', backgroundColor: '#7D7322', textAlign: 'center', alignContent: 'center' }}>
                                  <Text style={{ color: 'white', textAlign: 'center', fontSize: 14 }}>{this.getnbInvites(item)}</Text>
                                </View>
                                <View>

                                  <Text style={{ color: '#7D7322' }}> {this.getInviteLabel(this.getnbInvites(item))}</Text>
                                </View>

                              </View>
                              : null}


                          </View>

                        </View>

                      </TouchableHighlight>
                      :
                      <Swipeout right={this.swipeoutBtns}
                        autoClose={true}
                        backgroundColor='transparent'
                        rowID={item.idLive}
                        onOpen={(sectionID, rowID) => {
                          this.setState({
                            sectionID,
                            rowID,
                          })
                        }}>
                        <TouchableHighlight underlayColor='rgba(255,255,255,1,0.6)'
                          // underlayColor='yellow'
                          onPress={this.viewLive.bind(this, item)}
                        >
                          <View>
                            <View style={styles.rowContainer}>
                              <View style={styles.line}>
                                <Text style={{ width: '60%', fontWeight: 'bold' }} numberOfLines={1} ellipsizeMode='tail'> {item.libelleLive} </Text>

                                {item.etatLive <= 1 ? <Text style={{ color: this.getStatusColor(item.etatLive) }}> {this.getLiveStatusLibelle(item.etatLive)} </Text>
                                  :
                                  <Text style={{ fontWeight: 'bold', fontSize: 13, fontStyle: 'italic' }}> {this.getStatsInfo(item.statsLive)} </Text>
                                }

                              </View>
                              <View style={styles.line}>
                                <View style={{ flexDirection: 'row', justifyContent: 'flex-start', width: '60%', }}>
                                  <Text style={{ width: 135 }}> {this.getShortDate(item.dateCreationLive)} -{this.getShortTime(item.dateCreationLive)}  </Text>
                                  {item.etatLive > 1 ? <Text style={{ width: 200 }}><Text> | </Text> <Text style={{ color: '#7D7322' }}>{this.getSport(item.idSport)}</Text></Text>
                                    :
                                    null}
                                </View>

                                {/* {item.nombreChallenges > 1 ?

                              <View style={{ width: 26, height: 26, borderRadius: 13, paddingTop: 2, color: 'white', backgroundColor: ApiUtils.getBackgroundColor(), textAlign: 'center', alignContent: 'center' }}>
                                <Text style={{ color: 'white', textAlign: 'center', fontSize: 14 }}>{item.nombreChallenges}</Text>
                              </View>
                              : null
                            } */}


                                {this.getnbInvites(item) > 0 ?
                                  <View style={{ flexDirection: 'row', justifyContent: 'flex-start' }}>
                                    <View style={{ width: 26, height: 26, borderRadius: 13, paddingTop: 2, color: 'white', backgroundColor: '#7D7322', textAlign: 'center', alignContent: 'center' }}>
                                      <Text style={{ color: 'white', textAlign: 'center', fontSize: 14 }}>{this.getnbInvites(item)}</Text>
                                    </View>
                                    <View>

                                      <Text style={{ color: '#7D7322' }}> {this.getInviteLabel(this.getnbInvites(item))}</Text>
                                    </View>

                                  </View>
                                  : null}


                              </View>
                            </View>
                          </View>
                        </TouchableHighlight>
                      </Swipeout>

                  } keyExtractor={(item, index) => index.toString()}
                />

              }


            </View>

          </Content>
          <TouchableHighlight underlayColor='rgba(255,255,255,1,0.6)' disabled={this.state.spinner} style={styles.buttonok} onPress={() => this.onClickCreateLive()}>
            {this.state.spinner ? <ActivityIndicator color={'black'} style={{ alignSelf: 'center', color: 'black', height: 20, width: 20 }} /> :
              <Icon active name="plus" type='AntDesign' style={styles.plusButtonLogo} />}

          </TouchableHighlight>

        </Container >
      </Drawer>

    );
  }
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: ApiUtils.getBackgroundColor(),
    width: '100%',
    // height: 70
  },
  title: {
    width: '25%',
  },
  saveButton: {
    backgroundColor: 'transparent',
    width: '38%',
    marginTop: 0,
    paddingTop: 0
  },
  drawerButton: {
    // backgroundColor: 'transparent',
    // width: '10%',
    // marginTop: 0,
    // paddingTop: 0,
    shadowOffset: { height: 0, width: 0 },
    shadowOpacity: 0,
    elevation: 0
  },
  saveText: {
    color: 'black'
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
    borderBottomColor: '#B9B9B9'
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
    fontFamily: 'Roboto'
  },
  body: {
    width: '100%',
    //  justifyContent: 'center',
    backgroundColor: 'white',
  },
  logo: {
    width: '100%',
    height: 50,
    alignSelf: 'center'
  },
  p: {
    fontSize: 12,
    marginBottom: 5
  },
  url: {
    fontSize: 12,
    textAlign: 'center'
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
    textAlign: "center",
    padding: 0,
    fontSize: 30,
    // paddingLeft: 18,
    position: 'absolute',
    right: 20,
    bottom: 40,
    justifyContent: 'center'
  },
  plusButtonLogo: {
    height: 30,
    width: 30,
    fontSize: 30,
    // marginLeft: -3,
    alignSelf: 'center'
  },
  container: {
    // flex: 1,
    //  justifyContent: 'center',
    //   alignItems: 'center',
    backgroundColor: ApiUtils.getBackgroundColor(),
  },
  footer: {
    backgroundColor: "transparent",
    height: 215
  },
  userInfo: {
    padding: 10
  },
  icon: {
    width: 24,
    height: 24,
  },
});


export default connect(mapStateToProps)(Lives);
