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
  IsDemo,
  textAutoBackgroundColor,
  textAutoSecondColor,
  TemplateArrayImagesPartenairesPath,
} from './../globalsModifs';

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
      this.props.drawer._root.close();
    }

    if (this.props.closeDrawer) {
      this.props.closeDrawer();
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
              style={[
                styles.icon,
                {
                  color:
                    this.props.selected == 'Map'
                      ? textAutoSecondColor
                      : textAutoBackgroundColor,
                },
              ]}
            />
            <Text
              style={[
                styles.menuText,
                {
                  color:
                    this.props.selected == 'Map'
                      ? textAutoSecondColor
                      : textAutoBackgroundColor,
                },
              ]}>
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
              style={[
                styles.icon,
                {
                  color:
                    this.props.selected == 'Lives'
                      ? textAutoSecondColor
                      : textAutoBackgroundColor,
                },
              ]}
            />
            <Text
              style={[
                styles.menuText,
                {
                  color:
                    this.props.selected == 'Lives'
                      ? textAutoSecondColor
                      : textAutoBackgroundColor,
                },
              ]}>
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
              this.props.selected == 'Preferences' ? '#E9E9E9' : 'transparent',
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
                    this.props.selected == 'Preferences'
                      ? textAutoSecondColor
                      : textAutoBackgroundColor,
                },
              ]}
            />
            <Text
              style={[
                styles.menuText,
                {
                  color:
                    this.props.selected == 'Preferences'
                      ? textAutoSecondColor
                      : textAutoBackgroundColor,
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
                    this.props.selected == 'Classement'
                      ? textAutoSecondColor
                      : textAutoBackgroundColor,
                },
              ]}
            />
            <Text
              style={[
                styles.menuText,
                {
                  color:
                    this.props.selected == 'Classement'
                      ? textAutoSecondColor
                      : textAutoBackgroundColor,
                },
              ]}>
              Résultats
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
                {
                  color:
                    this.props.selected == 'Replay'
                      ? textAutoSecondColor
                      : textAutoBackgroundColor,
                },
              ]}
            />
            <Text
              style={[
                styles.menuText,
                {
                  color:
                    this.props.selected == 'Replay'
                      ? textAutoSecondColor
                      : textAutoBackgroundColor,
                },
              ]}>
              Comparateur
            </Text>
          </View>
        </TouchableHighlight>
        {TemplateArrayImagesPartenairesPath.length > 0 ? (
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
                      this.props.selected == 'Partenaires'
                        ? textAutoSecondColor
                        : textAutoBackgroundColor,
                  },
                ]}
              />
              <Text
                style={[
                  styles.menuText,
                  {
                    color:
                      this.props.selected == 'Partenaires'
                        ? textAutoSecondColor
                        : textAutoBackgroundColor,
                  },
                ]}>
                Partenaires
              </Text>
            </View>
          </TouchableHighlight>
        ) : null}
        {/* {TemplateHasAppDonation ? (
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
                style={[styles.icon, {color: textAutoBackgroundColor}]}
              />
              <Text style={[styles.menuText, {color: textAutoBackgroundColor}]}>
                Faire un don
              </Text>
            </View>
          </TouchableOpacity>
        ) : null} */}
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
                {
                  color:
                    this.props.selected == 'Help'
                      ? textAutoSecondColor
                      : textAutoBackgroundColor,
                },
              ]}
            />
            <Text
              style={[
                styles.menuText,
                {
                  color:
                    this.props.selected == 'Help'
                      ? textAutoSecondColor
                      : textAutoBackgroundColor,
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
              style={[styles.icon, {color: textAutoBackgroundColor}]}
            />
            <Text style={[styles.menuText, {color: textAutoBackgroundColor}]}>
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
                IsDemo === true
                  ? 'http://dag-system.com/externalcontent/templatetest/service.pdf'
                  : 'http://dag-system.com/externalcontent/' +
                      TemplateAppName +
                      '/confidentialite.pdf',
              )
            }
            style={{width: '100%', height: 30}}>
            <Text
              style={[
                {
                  color: textAutoBackgroundColor,
                  textDecorationLine: 'underline',
                  textAlign: 'center',
                  fontSize: 12,
                },
              ]}>
              Politique de confidentialité
            </Text>
          </TouchableHighlight>
          <TouchableHighlight
            underlayColor="rgba(255,255,255,1,0.6)"
            onPress={() =>
              this.openLink(
                IsDemo === true
                  ? 'http://dag-system.com/externalcontent/templatetest/service.pdf'
                  : 'http://dag-system.com/externalcontent/' +
                      TemplateAppName +
                      '/service.pdf',
              )
            }
            style={{width: '100%', height: 30}}>
            <Text
              style={[
                {
                  color: textAutoBackgroundColor,
                  textDecorationLine: 'underline',
                  textAlign: 'center',
                  fontSize: 12,
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
                  color: textAutoBackgroundColor,
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
                color: textAutoBackgroundColor,
                textAlign: 'center',
                fontSize: 13,
                marginBottom: 20,
              },
            ]}>
            Version V {VersionCheck.getCurrentVersion()}
          </Text>
        </View>
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
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  body: {
    width: '100%',
    backgroundColor: ApiUtils.getBackgroundColor(), //E9E069
    height: '100%',
    //  justifyContent: 'center',
  },
  logo: {
    width: '50%',
    height: 80,
    marginLeft: 25,
    marginRight: 25,
    marginBottom: 20,
    marginTop: 50,
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
    backgroundColor: ApiUtils.getBackgroundColor(),
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
    color: textAutoBackgroundColor,
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
