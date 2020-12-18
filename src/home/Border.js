
import React, { Component } from 'react';
import {
  StyleSheet, ImageBackground, Dimensions, Platform, FlatList, ActivityIndicator,
  View, ScrollView, AsyncStorage, Image, BackHandler, TouchableHighlight
} from 'react-native';
import ApiUtils from '../ApiUtils';
import * as Animated from 'react-native-animatable';
// import FooterStrava from './Footer';
// import * as Animatable from 'react-native-animatable';


export default class Border extends Component {

  static defaultProps = {
    size: 70,
    mode : 'up',
    color : ApiUtils.getBackgroundColor(),
    color2 : '#DADADA'
  }
  constructor(props) {
    super(props);


    this.state = {
    }


  }

  componentDidMount() {

  }


  render() {

    return (

      this.props.mode == 'up' ?
        <Animated.View animation="fadeInLeft" delay={200}  style={{ zIndex :2,
          backgroundColor: this.props.color2, width: this.props.size, height: this.props.size,
          borderRadius: 0, position: 'absolute', bottom: 0, zIndex: 12, right: this.props.position == 'right' ? 0 : null
        }}>
          <View style={{
            backgroundColor: this.props.color, width: this.props.size, height: this.props.size,
            borderBottomLeftRadius: this.props.position == 'left' ? 30000 : 0,
            borderBottomRightRadius: this.props.position == 'right' ? 30000 : 0,
            position: 'absolute', bottom: 0
          }}>

          </View>

        </Animated.View> :

        <View style={{
          zIndex: 2,
          backgroundColor: this.props.color, width: this.props.size, height: this.props.size,
          borderRadius: 0, position: 'absolute', top: 0, right: 0
        }}>
          <View style={{
            backgroundColor: this.props.color2, width: this.props.size, height: this.props.size,
             borderTopLeftRadius: this.props.position == 'left' ? 30000: 0,
            borderTopRightRadius:  this.props.position == 'right' ? 30000: 0,
            position: 'absolute', top: 0
          }}>

          </View>
        </View>

    );
  }
}

const styles = StyleSheet.create({

});
