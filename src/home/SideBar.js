import React, {Component} from 'react';
import {
  StyleSheet,
  Linking,
  View,
  Modal,
  Image,
  TouchableOpacity,
  TouchableHighlight,
  ScrollView,
} from 'react-native';
import {
  Container,
  Header,
  Left,
  Body,
  Right,
  Text,
  Button,
  Icon,
} from 'native-base';
import ApiUtils from '../ApiUtils';
import WebviewJetCode from './WebviewJetCode';
import Logo from '../assets/logo.png';
import VersionCheck from 'react-native-version-check';

import {
  TemplateHasAppDonation,
  TemplateAppName,
  isDemo,
} from '../globalsModifs';

export default class Sidebar extends Component {
  constructor(props) {
    super(props);

    let navigation = props.navigation;
    this.state = {
      isVisibleDonateModal: false,
    };
  }

  componentDidMount() {}

  onClickNavigate(routeName) {
    // this.props.drawer.close()
    if (this.props.drawer != null && this.props.drawer._root != null) {
      console.log('close')
      this.props.drawer._root.close();
    }

    this.props.navigation.navigate(routeName);
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

  onStartDonate = () => {
    this.setState({isVisibleDonateModal: true});
  };

  onCloseDonate = () => {
    this.setState({isVisibleDonateModal: false});
  };

  render() {
    return (
      <Container>
        <ScrollView style={styles.body}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'center',
              marginLeft: 0,
            }}>
            <Image
              resizeMode="contain"
              source={require('../assets/logo.png')}
              style={styles.logo}
            />
          </View>

          <TouchableHighlight
            underlayColor="rgba(255,255,255,1,0.6)"
            onPress={() => this.onClickNavigate('SimpleMap')}
            style={{
              width: '100%',
              backgroundColor:
                this.props.selected == 'Map' ? '#E9E9E9' : 'transparent',
            }}>
            <View
              style={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'flex-start',
                padding: 10,
              }}>
              <Icon
                name="map"
                type="FontAwesome5"
                style={[styles.icon, {color: 'black'}]}
              />
              <Text style={[styles.menuText, {color: 'black'}]}>
              Carte
              </Text>
            </View>
          </TouchableHighlight>

          <TouchableHighlight
            underlayColor="rgba(255,255,255,1,0.6)"
            onPress={() => this.onClickNavigate('Lives')}
            style={{
              width: '100%',
              backgroundColor:
                this.props.selected == 'Lives' ? '#E9E9E9' : 'transparent',
            }}>
            <View
              style={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'flex-start',
                padding: 10,
              }}>
              <Icon
                name="running"
                type="FontAwesome5"
                style={[styles.icon, {color: 'black'}]}
              />
              <Text style={[styles.menuText, {color: 'black'}]}>
                Mes activités
              </Text>
            </View>
          </TouchableHighlight>

          <TouchableHighlight
            underlayColor="rgba(255,255,255,1,0.6)"
            onPress={() => this.onClickNavigate('Preferences')}
            style={{
              width: '100%',
              backgroundColor:
                this.props.selected == 'Preferences'
                  ? '#E9E9E9'
                  : 'transparent',
            }}>
            <View
              style={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'flex-start',
                padding: 10,
              }}>
              <Icon
                name="user"
                type="FontAwesome5"
                style={[
                  styles.icon,
                  {
                    color:
                      this.props.selected == 'Preferences' ? 'black' : 'black',
                  },
                ]}
              />
              <Text
                style={[
                  styles.menuText,
                  {
                    color:
                      this.props.selected == 'Preferences' ? 'black' : 'black',
                  },
                ]}>
                Mon profil
              </Text>
            </View>
          </TouchableHighlight>

          <TouchableHighlight
            underlayColor="rgba(255,255,255,1,0.6)"
            onPress={() => this.onClickNavigate('Classement')}
            style={{
              width: '100%',
              backgroundColor:
                this.props.selected == 'Classement' ? '#E9E9E9' : 'transparent',
            }}>
            <View
              style={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'flex-start',
                padding: 10,
              }}>
              <Icon
                name="trophy"
                type="FontAwesome5"
                style={[
                  styles.icon,
                  {
                    color:
                      this.props.selected == 'Classement' ? 'black' : 'black',
                  },
                ]}
              />
              <Text
                style={[
                  styles.menuText,
                  {
                    color:
                      this.props.selected == 'Classement' ? 'black' : 'black',
                  },
                ]}>
                Classement
              </Text>
            </View>
          </TouchableHighlight>

          <TouchableHighlight
            underlayColor="rgba(255,255,255,1,0.6)"
            onPress={() => this.onClickNavigate('Replay')}
            style={{
              width: '100%',
              backgroundColor:
                this.props.selected == 'Replay' ? '#E9E9E9' : 'transparent',
            }}>
            <View
              style={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'flex-start',
                flexWrap: 'wrap',
                padding: 10,
              }}>
              <Icon
                name="chart-line"
                type="FontAwesome5"
                style={[
                  styles.icon,
                  {color: this.props.selected == 'Replay' ? 'black' : 'black'},
                ]}
              />
              <Text
                style={[
                  styles.menuText,
                  {
                    color: this.props.selected == 'Replay' ? 'black' : 'black',
                  },
                ]}>
                Comparateur
              </Text>
            </View>
          </TouchableHighlight>

          <TouchableHighlight
            underlayColor="rgba(255,255,255,1,0.6)"
            onPress={() => this.onClickNavigate('Partenaires')}
            style={{
              width: '100%',
              backgroundColor:
                this.props.selected == 'Partenaires'
                  ? '#E9E9E9'
                  : 'transparent',
            }}>
            <View
              style={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'flex-start',
                flexWrap: 'wrap',
                padding: 10,
              }}>
              <Icon
                name="handshake"
                type="FontAwesome5"
                style={[
                  styles.icon,
                  {
                    color:
                      this.props.selected == 'Partenaires' ? 'black' : 'black',
                  },
                ]}
              />
              <Text
                style={[
                  styles.menuText,
                  {
                    color:
                      this.props.selected == 'Partenaires' ? 'black' : 'black',
                  },
                ]}>
                Partenaires
              </Text>
            </View>
          </TouchableHighlight>

          {TemplateHasAppDonation ? (
            <TouchableOpacity
              onPress={() => this.onStartDonate()}
              style={{width: '100%'}}>
              <View
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  justifyContent: 'flex-start',
                  padding: 10,
                }}>
                <Icon
                  name="euro-sign"
                  type="FontAwesome5"
                  style={[styles.icon, {color: 'black'}]}
                />
                <Text style={[styles.menuText, {color: 'black'}]}>
                  Faire un don
                </Text>
              </View>
            </TouchableOpacity>
          ) : null}

          <TouchableHighlight
            underlayColor="rgba(255,255,255,1,0.6)"
            onPress={() => this.onClickNavigate('Help')}
            style={{
              width: '100%',
              backgroundColor:
                this.props.selected == 'Help' ? '#E9E9E9' : 'transparent',
            }}>
            <View
              style={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'flex-start',
                flexWrap: 'wrap',
                padding: 10,
              }}>
              <Icon
                name="question-circle"
                type="FontAwesome5"
                style={[
                  styles.icon,
                  {color: this.props.selected == 'Help' ? 'black' : 'black'},
                ]}
              />
              <Text
                style={[
                  styles.menuText,
                  {
                    color: this.props.selected == 'Help' ? 'black' : 'black',
                  },
                ]}>
                Guide d'utilisation
              </Text>
            </View>
          </TouchableHighlight>

          <TouchableHighlight
            underlayColor="rgba(255,255,255,1,0.6)"
            onPress={() => this.onClickNavigate('Logout')}
            style={{width: '100%'}}>
            <View
              style={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'flex-start',
                padding: 10,
              }}>
              <Icon
                name="power-off"
                type="FontAwesome5"
                style={[styles.icon, {color: 'black'}]}
              />
              <Text style={[styles.menuText, {color: 'black'}]}>
                Se déconnecter
              </Text>
            </View>
          </TouchableHighlight>

          <View
            style={{
              width: '100%',
              marginTop: 50,
            }}>
            <TouchableHighlight
              underlayColor="rgba(255,255,255,1,0.6)"
              onPress={() =>
                this.openLink(
                  isDemo === true
                    ? 'http://dag-system.com/externalcontent/templatetest/service.pdf'
                    : 'http://dag-system.com/externalcontent/' +
                        TemplateAppName +
                        '/confidentialite.pdf',
                )
              }
              style={{width: '100%', height: 35}}>
              <Text
                style={[
                  {
                    color: 'black',
                    textDecorationLine: 'underline',
                    textAlign: 'center',
                  },
                ]}>
                Politique de confidentialité
              </Text>
            </TouchableHighlight>
            <TouchableHighlight
              underlayColor="rgba(255,255,255,1,0.6)"
              onPress={() =>
                this.openLink(
                  isDemo === true
                    ? 'http://dag-system.com/externalcontent/templatetest/service.pdf'
                    : 'http://dag-system.com/externalcontent/' +
                        TemplateAppName +
                        '/service.pdf',
                )
              }
              style={{width: '100%', height: 35}}>
              <Text
                style={[
                  {
                    color: 'black',
                    textDecorationLine: 'underline',
                    textAlign: 'center',
                  },
                ]}>
                Conditions de service
              </Text>
            </TouchableHighlight>
            <TouchableHighlight
              underlayColor="rgba(255,255,255,1,0.6)"
              onPress={() => this.openLink('https://www.dag-system.com/')}
              style={{width: '100%', height: 35}}>
              <Text
                style={[
                  {
                    color: 'black',
                    textDecorationLine: 'underline',
                    textAlign: 'center',
                  },
                ]}>
                Powered by DAG System
              </Text>
            </TouchableHighlight>
            <Text
              style={[
                {
                  color: 'black',
                  textAlign: 'center',
                  fontSize: 13,
                },
              ]}>
              Version V {VersionCheck.getCurrentVersion()}
            </Text>
          </View>

      <View style={{height : 100}}></View>
        </ScrollView>

        <Modal
            visible={this.state.isVisibleDonateModal}
            onRequestClose={() => this.onCloseDonate()}>
            <Header style={styles.header}>
              <Left>
                <Button
                  style={styles.drawerButton}
                  onPress={() => this.onCloseDonate()}>
                  <Icon
                    style={styles.saveText}
                    name="chevron-left"
                    type="FontAwesome5"
                  />
                </Button>
              </Left>
              <Body style={{flex: 0}} />
              <Right style={{flex: 1}}>
                <Image
                  resizeMode="contain"
                  source={Logo}
                  style={styles.logoHeader}
                />
              </Right>
            </Header>
            <WebviewJetCode
              uri={
                'http://dag-system.com/externalcontent/' +
                TemplateAppName +
                '/jetcode_don.html'
              }
            />
          </Modal>
      </Container>
    );
  }
}

const styles = StyleSheet.create({
  body: {
    width: '100%',
    backgroundColor: ApiUtils.getBackgroundColor(), //E9E069
    height: '140%',
    paddingTop: 50,
    //  justifyContent: 'center',
  },
  logo: {
    width: '50%',
    height: 80,
    marginLeft: 25,
    marginRight: 25,
    marginBottom: 20,
  },
  menuText: {
    marginLeft: 30,
    maxWidth: '100%',
  },
  versionInfo: {
    fontSize: 11,
    marginBottom: 4,
  },
  icon: {
    width: 30,
    height: 30,
    fontSize: 24,
  },
  header: {
    backgroundColor: 'white',
    // backgroundColor: ApiUtils.getBackgroundColor(),
    width: '100%',
  },
  drawerButton: {
    backgroundColor: 'transparent',
    width: 120,
    marginTop: 0,
    paddingTop: 10,
    shadowOffset: {height: 0, width: 0},
    shadowOpacity: 0,
    elevation: 0,
    paddingLeft: 0,
  },
  saveText: {
    color: 'black',
    paddingLeft: 0,
    marginLeft: 5,
    marginRight: -5,
  },
  logoHeader: {
    width: '100%',
    height: 50,
    marginRight: '20%',
  },
});
