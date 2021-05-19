import React, {Component} from 'react';
import {Dimensions, Image, View} from 'react-native';
import {TemplateArrayImagesSponsorPath} from './../globalsModifs';
export class Sponsors extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  componentDidMount() {}
  render() {
    return (
      <View style={{backgroundColor : 'white'}}>
        {TemplateArrayImagesSponsorPath.length > 0 ? (
          <>
            <View
              style={{
                borderBottomWidth: 1,
                borderBottomColor: '#DDDDDD',
                width: Dimensions.get('screen').width - 30,
                marginLeft: 15,
                marginRight: 10,
                marginTop: 0,
              }}></View>
            <View
              style={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginTop: 10,
                width: '100%',
                paddingHorizontal: 10,
                marginBottom: 20,
              }}>
              {TemplateArrayImagesSponsorPath.map((sponsor, index) => {
                return (
                  <View style={{width: '25%', height: 50}}>
                    <Image
                      source={sponsor}
                      resizeMethod="resize"
                      resizeMode="contain"
                      style={{height: '100%', width: '100%'}}
                    />
                  </View>
                );
              })}
            </View>
          </>
        ) : null}
      </View>
    );
  }
}