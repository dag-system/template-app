import React, {Component} from 'react';
import {Image, View} from 'react-native';

import {TemplateArrayImagesSponsorPath} from './../globalsModifs';

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
          {TemplateArrayImagesSponsorPath.map((sponsor) => {
            <View style={{width: '25%', height: 50}}>
              <Image
                source={sponsor}
                resizeMethod="resize"
                resizeMode="contain"
                style={{height: '100%', width: '100%'}}
              />
            </View>;
          })}
        </View>
      </View>
    );
  }
}
