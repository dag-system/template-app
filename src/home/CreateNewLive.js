import React, {Component} from 'react';
import {
  Platform,
  StyleSheet,
  Alert,
  Linking,
  View,
  TextInput,
  Image,
  FlatList,
  TouchableHighlight,
  ActivityIndicator,
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
  Title,
  Form,
  Item,
  Input,
  Label,
  H3,
} from 'native-base';
import {connect} from 'react-redux';
import ApiUtils from '../ApiUtils';
import Logo from '../assets/logo.png';
const mapStateToProps = (state) => {
  return {
    userData: state.userData,
    recordingState: state.recordingState,
    lives: state.lives,
    sports: state.sports,
  };
};

class CreateNewLive extends Component {
  constructor(props) {
    super(props);

    this.state = {
      userdata: {
        nom: '',
        prenom: '',
        folocode: '',
        urlResultats: '',
        idUtilisateur: '',
      },
      rowID: 0,
      lives: [],
    };
  }

  componentDidMount() {
    this.onClickCreateLive(this.props.userData.idUtilisateur);
  }

  onClickCreateLive(userId) {
    let formData = new FormData();
    formData.append('method', 'createLive');
    formData.append('auth', ApiUtils.getAPIAuth());
    formData.append('idUtilisateur', userId);

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
      .then((response) => response.json())
      .then((responseJson) => {
        // alert("success http");
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
          };

          var action = {type: 'CREATE_LIVE', data: live};
          this.props.dispatch(action);

          this.onClickNavigate('SimpleMap');
        } else {
          alert(responseJson.message);
        }
      })
      .catch((e) => {
        ApiUtils.logError('CreateNewLive onClickCreateLive', e.message);
        this.onClickNavigate('Lives');
      })
      .then();
  }

  onClickNavigate(routeName) {
    this.props.navigation.navigate(routeName);
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

  static navigationOptions = {
    drawerLabel: 'Ajouter une activité',
    drawerIcon: ({tintColor}) => (
      <Image
        source={require('../assets/startLive.png')}
        style={[styles.icon, {tintColor: tintColor}]}
      />
    ),
  };

  render() {
    return (
      <Content style={{backgroundColor: ApiUtils.getBackgroundColor()}}>
        <View
          style={{
            alignItems: 'center',
            paddingTop: '40%',
          }}>
          <Image
            resizeMode="contain"
            source={Logo}
            style={{
              width: '100%',
              height: 130,
              alignSelf: 'center',
            }}
          />
          <ActivityIndicator
            style={{height: 40, width: 40, color: 'white'}}
            color="white"
          />
          <Text style={{textAlign: 'center', color: 'white'}}>
            Chargement en cours
          </Text>
        </View>
      </Content>
    );
  }
}

const styles = StyleSheet.create({
  icon: {
    width: 24,
    height: 24,
  },
});

export default connect(mapStateToProps)(CreateNewLive);
