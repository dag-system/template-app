import React, {Component} from 'react';
import {
  Platform,
  StyleSheet,
  Alert,
  Linking,
  View,
  TextInput,
  Image,
  ScrollView,
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

export default class Sidebar extends Component {
  constructor(props) {
    super(props);

    let navigation = props.navigation;
    this.state = {};
  }

  componentDidMount() {}

  onClickNavigate(routeName) {
    // this.props.drawer.close()
    this.props.drawer._root.close();
    this.props.navigation.navigate(routeName);
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
              <Image
                source={require('../assets/mesActivites.png')}
                style={[styles.icon]}
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

          <TouchableHighlight
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
              <Image
                source={require('../assets/startLive.png')}
                style={[styles.icon]}
              />
              <Text style={[styles.menuText, {color: 'white'}]}>
                Ajouter une activité
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
              <Image
                source={require('../assets/profil.png')}
                style={[styles.icon]}
              />
              <Text  style={[
                  styles.menuText,
                  {color: this.props.selected == 'Preferences' ? 'black' : 'white'},
                ]}>Mon profil</Text>
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
              <Image
                source={require('../assets/deconnexion.png')}
                style={[styles.icon]}
              />
              <Text  style={[
                  styles.menuText,
                  {color: 'white'},
                ]}>Se déconnecter</Text>
            </View>
          </TouchableHighlight>
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
  },
  versionInfo: {
    fontSize: 11,
    marginBottom: 4,
  },
  icon: {
    width: 24,
    height: 24,
  },
});
