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
import {connect} from 'react-redux';
import Sidebar from './SideBar';
import ApiUtils from '../ApiUtils';
import Logovdm from '../assets/sponsor_logo4.png';
import {TemplateArrayImagesPartenairesPath, textAutoBackgroundColor} from './../globalsModifs';
import {Dispatch} from 'redux';

const mapStateToProps = (state) => {
  return {
    userData: state.userData,
  };
};

interface Props {
  dispatch: Dispatch;
  navigation: any;
  onclose: Function;
  onMap: boolean;
  noHeader: boolean;
}

interface State {}

class Partenaires extends Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {};
  }

  drawer;

  componentDidMount() {}

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
                 <Right style={{flex: 1}}>
                   <Text style={{color: textAutoBackgroundColor}}>
                     Course des Jeux du Val-de-Marne
                   </Text>
                   <Image
                     resizeMode="contain"
                     source={Logovdm}
                     style={{
                       width: '50%',
                       height: 50,
                       marginRight: '10%',
                       marginLeft: 15,
                     }}
                   />
                 </Right>
               </Header>
            )}

            <Content style={{padding: 10, paddingTop: 20}} scrollEnabled={true}>

              <Text style={{fontWeight: 'bold', marginBottom: 15}}>
                Les Jeux du Val-de-Marne, c'est quoi ?
              </Text>
              <Text style={{textAlign: 'justify', marginBottom: 10}}>
                100 000 participants chaque année, les Jeux du Val-de-Marne sont
                organisés par le Conseil départemental du Val-de-Marne en
                partenariat avec le CDOS du Val-de-Marne, les comités sportifs
                départementaux, les associations sportives locales, les communes
                du Val-de-Marne, l'inspection académique (UNSS - USEP - le
                Service départemental à la Jeunesse, à l'engagement et aux
                sports).
              </Text>
              <Text style={{textAlign: 'justify', marginBottom: 10}}>
                Les Jeux permettent l'expression et la promotion de toutes les
                disciplines tout en réaffirmant les valeurs et l'éthique
                sportive. Ils offrent à tous les Val-de-Marnais, la possibilité
                de pratiquer gratuitement du sport.
              </Text>
              <Text style={{textAlign: 'justify', marginBottom: 100}}>
                Pourquoi pas vous ?
              </Text>

              {TemplateArrayImagesPartenairesPath.map((image) => {
                return (
                  <View>
                    <View
                      style={{
                        width: '100%',
                        height: 100,
                        flex: 1,
                        marginTop: 40,
                        marginBottom: 40,
                      }}>
                      <Image
                        source={image}
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
                  </View>
                );
              })}

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
    // width: 100,
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
    alignSelf: 'center',
  },
});

export default connect(mapStateToProps)(Partenaires);
