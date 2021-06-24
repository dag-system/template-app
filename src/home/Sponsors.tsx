import React, {Component} from 'react';
import {StyleSheet, Image, View, Dimensions, Text} from 'react-native';
import {TemplateArrayImagesSponsorPath} from '../globalsModifs';

export class Sponsors extends Component {
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

  componentDidMount() {}

  render() {
    return (
      <View style={{backgroundColor: 'transparent'}}>
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
            width: '100%',
            justifyContent:
              TemplateArrayImagesSponsorPath.length !== 1
                ? 'space-between'
                : 'center',
            alignItems: 'center',
            paddingHorizontal: 10,
          }}>
          {TemplateArrayImagesSponsorPath.map((sponsor, index) => {
            return (
              <View style={{width: '20%', height: 80}}>
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
      </View>
    );
  }
}

const styles = StyleSheet.create({});
