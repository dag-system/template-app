
import React, { Component } from 'react';
import {
  Platform,
  StyleSheet,
  Alert,
  Linking,
  View,
  TextInput,
  Image, ScrollView,
  FlatList, TouchableHighlight, ActivityIndicator
} from 'react-native';
import {
  Container, Header, Content, Footer,
  Left, Body, Right,
  Card, CardItem,
  Text, H1, Icon,
  Button, Toast, Root,
  Title, Spinner,
  Form, Item, Input, Label, H3
} from 'native-base';
import ApiUtils from '../ApiUtils';
import Logo from '../assets/logo.png';
export default class Loading extends Component {

  constructor(props) {
    super(props);

    let navigation = props.navigation;
    this.state = {

    }
  }

  render() {

    return (

      <Container>
        <View style={{ backgroundColor: ApiUtils.getColor(), height: '100%', paddingTop: '30%' }}>
          <Image resizeMode='contain' source={Logo} style={{
            width: '100%',
            height: 130,
            alignSelf :'center'
          }} />
          <ActivityIndicator color='black' />
          <Text style={{ color: 'black', textAlign: "center" }}>Chargement</Text>
        </View>
      </Container>

    );
  }
}

const styles = StyleSheet.create({

})