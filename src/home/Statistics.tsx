import React, { useEffect } from 'react';
import {StyleSheet, View, Image} from 'react-native';
import {useSelector} from 'react-redux';
import {useDispatch} from 'react-redux';
import {
  Container,
  Header,
  Left,
  Body,
  Right,
  Button,
  Icon,
  Content,
  Drawer,
} from 'native-base';
import Logo from '../assets/logo.png';
import AppState from '../models/AppState';
import {useNavigation} from '@react-navigation/core';
import Sidebar from './SideBar';
import ApiUtils from '../ApiUtils';

export default function Statistics() {
  const {lives} = useSelector((state: AppState) => state);
  const navigation = useNavigation();
  const dispatch = useDispatch();

  let drawer: any;

  const onDrawer = () => {
    drawer._root.open();
  };

  const closeDrawer = () => {
    drawer._root.close();
  };

  return (
    <Drawer
      ref={(ref) => {
        drawer = ref;
      }}
      
      content={
        <Sidebar
          navigation={navigation}
          drawer={drawer}
          closeDrawer={closeDrawer}
          selected="Statistics"
        />
      }>
      <Container>
        <Header style={styles.header}>
          <Left>
            <Button style={styles.drawerButton} onPress={() => onDrawer()}>
              <Icon style={styles.saveText} name="bars" type="FontAwesome5" />
            </Button>
          </Left>
          <Body>
          <Image resizeMode="contain" source={Logo} style={styles.logo} />
          </Body>
          <Right></Right>
        </Header>
        <Content>
          <View>
            {/* <Text>statistics</Text>
            <Text>{JSON.stringify(lives)}</Text> */}
          </View>
        </Content>
      </Container>
    </Drawer>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: ApiUtils.getBackgroundColor(),
  },
  title: {
    width: '25%',
  },
  saveButton: {
    backgroundColor: 'transparent',
    marginTop: 0,
    paddingTop: 0,
    shadowOffset: {height: 0, width: 0},
    shadowOpacity: 0,
    elevation: 0,
  },
  saveText:{
    color : 'black'
  },
  drawerButton: {
    backgroundColor: 'transparent',
    color : 'black',
    width: '100%',
    marginTop: 0,
    paddingTop: 0,
    shadowOffset: {height: 0, width: 0},
    shadowOpacity: 0,
    elevation: 0,
  },
  logo: {
    width: '100%',
    height: 50,
    // marginRight: '50%',
  },
});
