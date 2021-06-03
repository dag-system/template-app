import React from 'react';
import {Alert, Image, StyleSheet, TouchableOpacity} from 'react-native';
import {Body, Button, Header, Icon, Left, View, Right, Text} from 'native-base';
import Logo from '../assets/logo.png';
import Autrans from '../assets/autrans.svg';

import {textAutoBackgroundColor} from '../globalsModifs';
import ApiUtils from '../ApiUtils';
interface HeaderComponentProps {
  onPressBack(): void;
  mode: 'back' | 'drawer';
}
export default function HeaderComponent(props: HeaderComponentProps) {
  return (
    <Header style={styles.header}>
      <Left style={{flex:1}}>
        <TouchableOpacity style={styles.drawerButton} onPress={() => props.onPressBack() }>
          <Icon
            style={styles.saveText}
            name={props.mode == 'back' ? 'chevron-left' : 'bars'}
            type="FontAwesome5"
          />
        </TouchableOpacity>
      </Left>
      <Body style={{flex:1}}>
        {/* <Text>ffefe</Text> */}
        <Image resizeMode="contain" source={Logo} style={styles.logo} />
      </Body>
      <Right style={{flex:1}}>
        {/* <Text>ffefe</Text> */}
      </Right>
    </Header>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: ApiUtils.getBackgroundColor(),
     width: '100%',
    borderBottomColor: '#D3D3D3',
    borderBottomWidth: 1,
  },
  logo: {
    width: '100%',
    height: 50,
    alignSelf: 'center',
    // marginRight: '50%',
  },
  bold: {
    fontWeight: 'bold',
  },
  drawerButton: {
    backgroundColor: 'transparent',
    width: 80,
    marginTop: 0,
    paddingTop: 10,
    shadowOffset: {height: 0, width: 0},
    shadowOpacity: 0,
    elevation: 0,
    paddingLeft: 0,
  },
  saveText: {
    color: textAutoBackgroundColor,
    paddingLeft: 0,
    marginLeft: 5,
    marginRight: -5,
  },
});
