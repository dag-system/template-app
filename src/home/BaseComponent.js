
import React, { Component } from 'react';
import {
  Platform,
  StyleSheet,
  Alert,
  Linking,
  View,
  TextInput,
  Image, ScrollView,
  FlatList, TouchableHighlight
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
export default connect(mapStateToProps)(BatteryModal);


export default class BaseComponent extends Component {

  constructor(props) {
    super(props);

    let navigation = props.navigation;
    this.state = {

    }
  }

  render() {

    return (

   <Container>
     <View style={{backgroundColor : ApiUtils.getColor()}}></View>
   </Container>

    );
  }
}

const styles = StyleSheet.create({

})