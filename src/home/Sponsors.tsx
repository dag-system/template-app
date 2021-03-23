import React, {Component} from 'react';
import {Image, View} from 'react-native';

import partOne from '../assets/partenaire_one.png';
import partTwo from '../assets/partenaire_two.png';
import partThree from '../assets/partenaire_three.png';
import partFour from '../assets/partenaire_four.png';

export class Sponsors extends Component {
  constructor(props) {
    super(props);

    this.state = {};
  }

  componentDidMount() {}

  render() {
    return (
      <View>
        <View
          style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-around',
            marginTop: 10,
            width: '100%',
            paddingHorizontal: 10,
            marginBottom: 20,
          }}>
          <View style={{width: '25%', height: 50}}>
            <Image
              source={partOne}
              resizeMethod="resize"
              resizeMode="contain"
              style={{height: '100%', width: '100%'}}
            />
          </View>
          <View style={{width: '25%', height: 50}}>
            <Image
              source={partTwo}
              resizeMethod="resize"
              resizeMode="contain"
              style={{height: '100%', width: '100%'}}
            />
          </View>
          <View style={{width: '25%', height: 50}}>
            <Image
              source={partThree}
              resizeMethod="resize"
              resizeMode="contain"
              style={{height: '100%', width: '100%'}}
            />
          </View>
          <View style={{width: '25%', height: 50}}>
            <Image
              source={partFour}
              resizeMethod="resize"
              resizeMode="contain"
              style={{height: '100%', width: '100%'}}
            />
          </View>
        </View>
      </View>
    );
  }
}
