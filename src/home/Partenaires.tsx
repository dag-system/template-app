import React, {Component} from 'react';
import {
  StyleSheet,
  Image,
  TouchableOpacity,
  View,
  Linking,
  Platform,
  Dimensions,
} from 'react-native';
import {
  Container,
  Header,
  Body,
  Toast,
  Root,
  Drawer,
  Icon,
  Text,
  Content,
  Left,
  Right,
} from 'native-base';
import md5 from 'md5';
import ApiUtils from '../ApiUtils';
import {connect} from 'react-redux';
import Sidebar from './SideBar';
import moment from 'moment';
import Logo from '../assets/logo_header.png';
import GlobalStyles from '../styles';

import Cnr from '../assets/CNR.png';
import Fondation from '../assets/Logo-FONDATION.png';
import Dag from '../assets/dag.png';
import mycross from '../assets/mycross.png';

const mapStateToProps = (state) => {
  return {
    userData: state.userData,
  };
};
class Partenaires extends Component {
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
    };
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
            selected="Partenaires"
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
                <Right style={{flex: 1}} />
              </Header>
            )}

            <Content style={{padding: 10, paddingTop: 20}} scrollEnabled={true}>
              <Text style={{fontWeight: 'bold'}}>Nos partenaires</Text>

              <View
                style={{
                  width: '100%',
                  height: 100,
                  flex: 1,
                  marginTop: 40,
                  marginBottom: 40,
                }}>
                <Image
                  source={mycross}
                  resizeMethod="resize"
                  resizeMode="contain"
                  style={{
                    height: '100%',
                    width: '30%',
                    alignSelf: 'center',
                    marginHorizontal: 'auto',
                  }}
                />
              </View>

              <View
                style={{
                  borderBottomWidth: 1,
                  borderBottomColor: '#DDDDDD',
                  width: Dimensions.get('screen').width,
                  marginTop: 0,
                }}>
                <Text />
              </View>

              <View
                style={{
                  width: '100%',
                  height: 100,
                  flex: 1,
                  marginTop: 40,
                  marginBottom: 40,
                }}>
                <Image
                  source={Cnr}
                  resizeMethod="resize"
                  resizeMode="contain"
                  style={{
                    height: '100%',
                    width: '30%',
                    alignSelf: 'center',
                    marginHorizontal: 'auto',
                  }}
                />
              </View>

              <View
                style={{
                  borderBottomWidth: 1,
                  borderBottomColor: '#DDDDDD',
                  width: Dimensions.get('screen').width,
                  marginTop: 0,
                }}>
                <Text />
              </View>

              <View
                style={{
                  width: '100%',
                  height: 100,
                  flex: 1,
                  marginTop: 40,
                  marginBottom: 40,
                }}>
                <Image
                  source={Fondation}
                  resizeMethod="resize"
                  resizeMode="contain"
                  style={{
                    height: '100%',
                    width: '30%',
                    alignSelf: 'center',
                    marginHorizontal: 'auto',
                  }}
                />
              </View>

              <View
                style={{
                  borderBottomWidth: 1,
                  borderBottomColor: '#DDDDDD',
                  width: Dimensions.get('screen').width,
                  marginTop: 0,
                }}>
                <Text />
              </View>

              <View
                style={{
                  width: '100%',
                  height: 100,
                  flex: 1,
                  marginTop: 40,
                  marginBottom: 40,
                }}>
                <Image
                  source={Dag}
                  resizeMethod="resize"
                  resizeMode="contain"
                  style={{
                    height: '100%',
                    width: '30%',
                    alignSelf: 'center',
                    marginHorizontal: 'auto',
                  }}
                />
              </View>

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
    // width: 100,
    width : '100%',
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
    alignSelf: 'center',
  },
});

export default connect(mapStateToProps)(Partenaires);
