import React, {Component} from 'react';
import {View} from 'react-native';
import {Container} from 'native-base';
import ApiUtils from '../ApiUtils';

export default class BaseComponent extends Component {
  constructor(props) {
    super(props);

    let navigation = props.navigation;
    this.state = {};
  }

  render() {
    return (
      <Container>
        <View style={{backgroundColor: ApiUtils.getColor()}}></View>
      </Container>
    );
  }
}
