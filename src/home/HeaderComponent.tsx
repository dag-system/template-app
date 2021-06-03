import React from 'react';
import {Image, StyleSheet} from 'react-native';
import {Body, Button, Header, Icon, Left, View, Right} from 'native-base';
import Logo from '../assets/logo.png';

import {textAutoBackgroundColor} from '../globalsModifs';
import ApiUtils from '../ApiUtils';
interface HeaderComponentProps {
  onPressBack(): void;
  mode: 'back' | 'drawer';
}
export default function HeaderComponent(props: HeaderComponentProps) {
  return (
    <Header style={styles.header}>
      <Left style={{flex: 1}}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'flex-start',
            width: '100%',
            paddingRight: 0,
            paddingLeft: 0,
            marginTop: 20,
            marginBottom: 20,
          }}>
          <Button
            style={styles.drawerButton}
            onPress={() => props.onPressBack()}>
            <Icon
              style={styles.saveText}
              name="chevron-left"
              type="FontAwesome5"
            />
            {/* <Text style={styles.saveText}>Précedent</Text> */}
          </Button>
        </View>
      </Left>
      <Body style={{flex: 0}} />
      <Right style={{flex: 1}}>
        <Image resizeMode="contain" source={Logo} style={styles.logo} />
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
  title: {
    width: '25%',
  },
  map: {
    height: 200,
  },
  buttonok: {
    marginTop: 20,
    marginBottom: 0,
    alignSelf: 'center',
    // width: 150,
    height: 30,
    borderRadius: 10,
    // marginRight: 40,
    backgroundColor: 'black',
  },
  saveButton: {
    backgroundColor: 'transparent',
    width: '38%',
    marginTop: 0,
    paddingTop: 0,
  },
  logo: {
    width: '100%',
    height: 50,
    alignSelf: 'center',
    marginRight: '50%',
  },
  bold: {
    fontWeight: 'bold',
  },
  drawerButton: {
    backgroundColor: 'transparent',
    width: '100%',
    marginTop: 0,
    paddingTop: 10,
    shadowOffset: {height: 0, width: 0},
    shadowOpacity: 0,
    elevation: 0,
    paddingLeft: 0,
  },
  resultCol: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    width: '30%',
  },
  resultNumber: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  saveText: {
    color: textAutoBackgroundColor,
    paddingLeft: 0,
    marginLeft: 5,
    marginRight: -5,
  },
  inputCode: {
    borderBottomColor: '#DDDDDD',
    borderBottomWidth: 1,
    paddingTop: 10,
    paddingBottom: 10,
    marginLeft: 10,
    marginRight: 10,
    marginBottom: 0,
    marginTop: 5,
    fontSize: 16,
  },

  errorMessage: {
    marginLeft: 10,
    marginTop: 10,
    fontStyle: 'italic',
  },
  body: {
    width: '100%',
    backgroundColor: 'white',
    flex: 1,
    paddingBottom: 200,
  },
  loginButtonSection: {
    width: '100%',
    // height: '120%',
    flex: 1,
    padding: 10,
    paddingBottom: 100,

    // marginTop: 5,
  },
  centerLogo: {
    color: '#000',
  },
  container: {
    width: '100%',
  },
  textLink: {
    fontWeight: 'bold',
    fontSize: 15,
    marginTop: 16,
    marginRight: 10,
    alignContent: 'center',
    textAlign: 'center',
  },
});
