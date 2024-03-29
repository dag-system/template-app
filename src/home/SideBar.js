import React, {Component} from 'react';
import {
  Platform,
  StyleSheet,
  Alert,
  Linking,
  View,
  Modal,
  TextInput,
  Image,
  ScrollView,TouchableOpacity,
  TouchableHighlight,
} from 'react-native';
import {
  Container,
  Header,
  Content,
  Footer,
  Left,
  Body,
  Right,
  Card,
  CardItem,
  Text,
  H1,
  Button,
  Icon,
  Title,
  Form,
  Item,
  Input,
  Label,
  H3,
} from 'native-base';
import ApiUtils from '../ApiUtils';
import {colors} from 'react-native-elements';
import WebviewJetCode from './WebviewJetCode';
import Logo from '../assets/logo_header.png';

export default class Sidebar extends Component {
  constructor(props) {
    super(props);

    let navigation = props.navigation;
    this.state = {
      isVisibleDonateModal : false
    };
  }

  componentDidMount() {}

  onClickNavigate(routeName) {
    // this.props.drawer.close()
    if (this.props.drawer != null && this.props.drawer._root != null) {
      this.props.drawer._root.close();
    }

    this.props.navigation.navigate(routeName);
  }

  onStartDonate = () => {
    this.setState({isVisibleDonateModal: true});
  };

  onCloseDonate = () => {
    this.setState({isVisibleDonateModal: false});
  };

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
      <Container>
        <Body style={styles.body}>
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
                  {color: this.props.selected == 'Lives' ? 'black' : 'white'},
                ]}
              />
              <Text
                style={[
                  styles.menuText,
                  {color: this.props.selected == 'Lives' ? 'black' : 'white'},
                ]}>
                Mes activités
              </Text>
            </View>
          </TouchableHighlight>

          {/* <TouchableHighlight
            underlayColor="rgba(255,255,255,1,0.6)"
            onPress={() => this.onClickNavigate('CreateNewLive')}
            style={{width: '100%'}}>
            <View
              style={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'flex-start',
                padding: 10,
              }}>
               <Icon
                name="plus-circle"
                type="FontAwesome5"
                style={[styles.icon, {color: 'white'}]}
              />
              <Text style={[styles.menuText, {color: 'white'}]}>
                Ajouter une activité
              </Text>
            </View>
          </TouchableHighlight> */}

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
                      this.props.selected == 'Preferences' ? 'black' : 'white',
                  },
                ]}
              />
              <Text
                style={[
                  styles.menuText,
                  {
                    color:
                      this.props.selected == 'Preferences' ? 'black' : 'white',
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
                      this.props.selected == 'Classement' ? 'black' : 'white',
                  },
                ]}
              />
              <Text
                style={[
                  styles.menuText,
                  {
                    color:
                      this.props.selected == 'Classement' ? 'black' : 'white',
                  },
                ]}>
                Classement
              </Text>
            </View>
          </TouchableHighlight>

          {/*
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
                  {color: this.props.selected == 'Replay' ? 'black' : 'white'},
                ]}
              />
              <Text
                style={[
                  styles.menuText,
                  {
                    color: this.props.selected == 'Replay' ? 'black' : 'white',
                  },
                ]}>
                Comparateur
              </Text>
            </View>
              </TouchableHighlight>*/}

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
                      this.props.selected == 'Partenaires' ? 'black' : 'white',
                  },
                ]}
              />
              <Text
                style={[
                  styles.menuText,
                  {
                    color:
                      this.props.selected == 'Partenaires' ? 'black' : 'white',
                  },
                ]}>
                Partenaires
              </Text>
            </View>
          </TouchableHighlight>

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
                  {color: this.props.selected == 'Help' ? 'black' : 'white'},
                ]}
              />
              <Text
                style={[
                  styles.menuText,
                  {
                    color: this.props.selected == 'Help' ? 'black' : 'white',
                  },
                ]}>
                Guide d'utilisation
              </Text>
            </View>
          </TouchableHighlight>

          <TouchableOpacity
            onPress={() => this.onStartDonate()}
            style={{width: '100%' }}
            >
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
                style={[styles.icon, {color: 'white'}]}
              />
              <Text style={[styles.menuText, {color: 'white'}]}>
                Faire un don
              </Text>
            </View>
          </TouchableOpacity>

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
                style={[styles.icon, {color: 'white'}]}
              />
              <Text style={[styles.menuText, {color: 'white'}]}>
                Se déconnecter
              </Text>
            </View>
          </TouchableHighlight>

          <TouchableHighlight
            underlayColor="rgba(255,255,255,1,0.6)"
            onPress={() => this.openLink('https://www.dag-system.com/')}
            style={{width: '100%', position: 'absolute', bottom: 30}}>
            {/* <View
              style={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'center',
                padding: 0,
              }}> */}
              {/* <Icon
                name="power-off"
                type="FontAwesome5"
                style={[styles.icon, {color: 'black'}]}
              /> */}
              <Text
                style={[
                  {color: 'white', textDecorationLine: 'underline', textAlign :'center'},
                ]}>
                Powered by DAG System
              </Text>
            {/* </View> */}
          </TouchableHighlight>


   

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
              <Image resizeMode="contain" source={Logo} style={styles.logoHeader} />
            </Right>
          </Header>
            <WebviewJetCode uri="http://dag-system.com/externalcontent/diytacrun/jetcode_don.html" />
          </Modal>
        </Body>
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
