import React, {Component} from 'react';
import {
  StyleSheet,
  Image,
  TouchableOpacity,
  View,
  Linking,
  Modal,
  Platform,
} from 'react-native';
import {
  Container,
  Header,
  Body,
  Root,
  Drawer,
  Icon,
  Text,
  Content,
  Left,
  Right,
} from 'native-base';
import ApiUtils from '../ApiUtils';
import {connect} from 'react-redux';
import Sidebar from './SideBar';
import Logo from '../assets/logo.png';
import GlobalStyles from '../styles';
import {Sponsors} from './Sponsors';
import BatteryModalContent from './BatteryModalContent';
import VideoModal from './VideoModal';
import Video from 'react-native-video';
import VideoPrez from '../assets/tuto.mp4';

import {
  TemplateBackgroundColor,
  textAutoBackgroundColor,
} from '../globalsModifs';
import HeaderComponent from './HeaderComponent';
const mapStateToProps = (state) => {
  return {
    userData: state.userData,
  };
};

class Help extends Component {
  drawer: any;
  constructor(props) {
    super(props);

    this.state = {
      userdata: {
        nomUtilisateur: '',
        prenomUtilisateur: '',
        telUtilisateur: '',
        folocodeUtilisateur: '',
        idUtilisateur: '',
      },
      newPassword: '',
      newPasswordConfirmation: '',
      isErrorName: false,
      lives: [],
      isLoading: false,
      toasterMessage: '',
      showDefaultDdn: false,
      isVideoFullScreen: false,
    };
  }

  componentDidMount() {
    setTimeout(() => this.didMount(), 300);

    // alert(this.props.userData.ddnUtilisateur)
    //   alert(new Date(this.props.userData.ddnUtilisateur))

    // setTimeout(() => this.setState({ userdata: { ...this.state.userdata, ddnUtilisateur: this.state.userdata.ddnUtilisateur) }} ), 100)
  }
  didMount() {}

  closeDrawer = () => {
    this.drawer._root.close();
  };

  onDrawer() {
    this.drawer._root.open();
  }

  ongoHome() {
    this.props.navigation.navigate('Home');
  }

  getClubs() {
    this.setState({isLoading: true});
    let formData = new FormData();
    formData.append('method', 'getClubs');
    formData.append('auth', ApiUtils.getAPIAuth());

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
        var action = {type: 'GET_CLUBS', data: responseJson};
        this.props.dispatch(action);

        this.setState({isLoading: false});
      })
      .catch((e) => {
        this.setState({isLoading: false});
        ApiUtils.logError('getCLUBS', e.message);
      })
      .then(() => this.setState({isLoading: false}));
  }

  onPopupOk() {
    var action = {type: 'VIEW_POPUPAIDE', data: null};
    this.props.dispatch(action);

    this.props.onValidate && this.props.onValidate();
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

  openVideo() {
    this.setState({isVideoFullScreen: true});
  }

  closeVideo = () => {
    this.setState({isVideoFullScreen: false});
  };
  render() {
    return (
      <Drawer
        ref={(ref) => {
          this.drawer = ref;
        }}
        content={
          <Sidebar
            navigation={this.props.navigation}
            drawer={this.drawer}
            selected="Help"
          />
        }>
        <Container>
          <Root>
            {this.props.noHeader ? null : (
                 <HeaderComponent onPressBack={() => this.onDrawer()} mode="drawer" />
      
            )}

            <Content style={{padding: 5, paddingTop: 20}} scrollEnabled={true}>
              <View style={[GlobalStyles.row, {justifyContent: 'center'}]}>
                <Image resizeMode="contain" source={Logo} style={styles.logo} />
              </View>
              <Text
                style={{
                  textAlign: 'center',
                  fontWeight: 'bold',
                  color: ApiUtils.getColor(),
                  marginTop: 10,
                }}>
                Bienvenue sur votre application sportive !
              </Text>

              <Text style={{marginTop: 10}}>
                Entrainez-vous et affrontez vos amis et collègues en toute
                sécurité, et sans jamais vous croiser !
              </Text>

              <Text style={{marginTop: 10}}>
                Découvrez le fonctionnement de l'application dans la vidéo
                ci-dessous :
              </Text>

              <Modal visible={this.state.isVideoFullScreen} style={{flex: 1}}>
                <TouchableOpacity
                  style={{
                    position: 'absolute',
                    top: Platform.OS == 'ios' ? 90 : 20,
                    zIndex: 30,
                  }}
                  onPress={() => this.closeVideo()}>
                  <Icon
                    name="times"
                    type="FontAwesome5"
                    style={{color: 'white', marginLeft: 15}}
                  />
                </TouchableOpacity>

                <VideoModal />
              </Modal>

              <TouchableOpacity
                style={{
                  position: 'relative',
                  top: Platform.OS == 'ios' ? 60 : 40,
                  zIndex: 100,
                  marginLeft: 10,
                }}
                onPress={() => this.openVideo()}>
                <View
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                  }}>
                  <Icon
                    style={{marginTop: -5, color: 'black'}}
                    name="expand-alt"
                    type="FontAwesome5"
                  />
                  <Text style={{textAlign: 'center', color: 'white'}}>
                    {' '}
                    Voir en grand
                  </Text>
                </View>
              </TouchableOpacity>

              {!this.state.isVideoFullScreen ? (
                <Video
                  source={VideoPrez} // Can be a URL or a local file.
                  ref={(ref) => {
                    this.player = ref;
                  }} // Store reference
                  repeat={true}
                  onBuffer={this.onBuffer} // Callback when remote video is buffering
                  onError={this.videoError} // Callback when video cannot be loaded
                  style={[styles.video, {}]}
                  // style={[this.state.isFullScreen ? styles.video : styles.fullScreenVideo,{height : 10}]}
                />
              ) : null}

              {/* {!this.props.noHeader ? ( */}
              {!this.props.noHeader ? (
                <View style={{height: '100%'}}>
                  <BatteryModalContent noHeader={false} isInline={true} />
                </View>
              ) : null}

              {/* // ) : null} */}

              {this.props.noHeader ? (
                <Text style={{textAlign: 'center', marginTop: 10}}>
                  Vous retrouverez ces informations dans le menu d'aide
                </Text>
              ) : null}
              <Text style={{textAlign: 'center', marginTop: 10}}>
                Bonne course !
              </Text>
              {this.props.noHeader ? (
                <TouchableOpacity
                  onPress={() => this.onPopupOk()}
                  style={{
                    // paddingBottom: 200,
                    marginTop: 10,
                    justifyContent: 'center',
                    borderColor: textAutoBackgroundColor,
                    backgroundColor: TemplateBackgroundColor,
                    padding: 10,
                    borderWidth: 1,
                    marginBottom: 75,
                  }}>
                  <Text
                    style={{
                      textAlign: 'center',
                      textTransform: 'uppercase',
                      color: textAutoBackgroundColor,
                    }}>
                    C'est parti
                  </Text>
                </TouchableOpacity>
              ) : null}
            </Content>
            <Sponsors />
          </Root>
        </Container>
      </Drawer>
    );
  }
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: ApiUtils.getBackgroundColor(),
    // width: '100%'
  },
  title: {
    width: '25%',
  },
  saveButton: {
    backgroundColor: 'transparent',
    // width: '100%',
    marginTop: 0,
    paddingTop: 0,
    shadowOffset: {height: 0, width: 0},
    shadowOpacity: 0,
    elevation: 0,
  },
  drawerButton: {
    backgroundColor: 'transparent',
    width: '100%',
    marginTop: 0,
    paddingTop: 0,
    shadowOffset: {height: 0, width: 0},
    shadowOpacity: 0,
    elevation: 0,
  },
  saveText: {
    color: textAutoBackgroundColor,
  },
  body: {
    width: '100%',
    backgroundColor: 'white',
  },
  inputCode: {
    borderBottomColor: 'black',
    borderBottomWidth: 1,
    fontStyle: 'italic',
    height: 20,
    padding: 0,
    marginLeft: 5,
    marginRight: 5,
    marginBottom: 5,
    marginTop: 5,
    fontSize: 12,
  },
  label: {
    padding: 5,
    paddingLeft: 15,
    marginTop: 10,
    marginBottom: 10,
    color: 'gray',
    fontSize: 16,
  },
  p: {
    fontSize: 12,
    marginBottom: 5,
  },
  url: {
    fontSize: 12,
    //  textAlign: 'center'
  },
  button: {
    marginBottom: 10,
  },
  loginButtonSection: {
    width: '100%',
    marginTop: 5,
    height: '200%',
  },
  scrollcontent: {
    height: '80%',
  },
  container: {
    width: '100%',
  },
  icon: {
    width: 24,
    height: 24,
  },
  plusButtonLogo: {
    height: 30,
    width: 30,
    fontSize: 30,
    color: 'white',
    // marginLeft: -3,
    alignSelf: 'center',
  },

  logo: {
    width: '60%',
    height: 50,
    alignSelf: 'center',
  },

  video: {
    width: '100%',
    height: 750,
  },

  fullScreenVideo: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    zIndex: 1,
  },
});

export default connect(mapStateToProps)(Help);
