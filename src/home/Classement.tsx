import React, {Component} from 'react';
import {
  StyleSheet,
  Image,
  TouchableOpacity,
  View,
  Dimensions,
  Linking,
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
import Logo from '../assets/logo_header.png';
import Rotate from '../assets/rotate.png';

import AutoHeightWebView from 'react-native-autoheight-webview';
const mapStateToProps = () => {
  return {};
};
class Classement extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isPortrait: true,
    };

    Dimensions.addEventListener('change', () => {
      if (Dimensions.get('screen').width < Dimensions.get('screen').height) {
        this.setState({isPortrait: true});
      } else {
        this.setState({isPortrait: false});
      }
      // orientation has changed, check if it is portrait or landscape here
    });
  }

  componentDidMount() {
    this.setState({newPassword: true});
  }

  closeDrawer = () => {
    this.drawer._root.close();
  };

  onDrawer() {
    this.drawer._root.open();
  }

  ongoHome() {
    this.props.navigation.navigate('Home');
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
            selected="Classement"
          />
        }>
        <Container>
          <Root>
            {this.props.noHeader ? null : (
              <Header style={styles.header}>
                <Left style={{flex: 1}}>
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
                <Body style={{flex: 0}} />
                <Right style={{flex: 1}}>
                  <Image
                    resizeMode="contain"
                    source={Logo}
                    style={styles.logo}
                  />
                </Right>
              </Header>
            )}

            <Content style={{padding: 10, paddingTop: 20}} scrollEnabled={true}>
              <Text
                style={{
                  fontWeight: 'bold',
                  textAlign: 'center',
                  color: ApiUtils.getBackgroundColor(),
                  fontSize: 20,
                  marginBottom: 10,
                  textTransform: 'uppercase',
                }}>
                Classement du challenge My Cross
              </Text>

              <TouchableOpacity
                onPress={() => this.openLink('https://www.insa-lyon.fr/')}>
                <Text
                  style={{
                    textAlign: 'center',
                    color: ApiUtils.getBackgroundColor(),
                  }}>
                  Retrouvez tous les classements sur notre site internet : A
                  RENTRER
                </Text>
              </TouchableOpacity>

              {this.state.isPortrait ? (
                <View>
                  <Image
                    source={Rotate}
                    style={{height: 70, width: 100, alignSelf: 'center'}}
                    resizeMode="contain"
                  />
                  <Text style={{textAlign: 'center'}}>
                    Tourner votre écran pour voir plus d'infos
                  </Text>
                </View>
              ) : null}

              <AutoHeightWebView
                source={{
                  uri: 'https://folomi.fr/classement/insalyon/classement.html',
                }}
                style={{marginTop: 20, width: '100%'}}
                startInLoadingState={true}
                showsHorizontalScrollIndicator={true}
                scrollEnabled={true}
              />

              <View style={{marginBottom: 100}} />
            </Content>
          </Root>
        </Container>
      </Drawer>
    );
  }
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: 'white',
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
    color: 'black',
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
    width: '100%',
    height: 50,
    marginRight: '50%',
  },
});

export default connect(mapStateToProps)(Classement);
