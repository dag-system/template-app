import React, {Component} from 'react';
import {StyleSheet, View, Text} from 'react-native';
import {WebView} from 'react-native-webview';

// For dispatching back to HomeScreen
import {connect} from 'react-redux';
// Import native-base UI components
import {Container, Button, Icon, Header, Body} from 'native-base';
import ApiUtils from '../ApiUtils';

import tradRes from './../lang/traduction.json';

const mapStateToProps = (state) => {
  return {
    lang: state.lang,
  };
};

class GetFolocode extends Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {}

  onDisconnect() {
    // App.goHome(this.props.navigation);
    this.onClickNavigate('Home');
  }

  goBack() {
    this.onClickNavigate('Home');
  }

  onClickNavigate(routeName) {
    this.props.navigation.navigate(routeName);
  }

  render() {
    return (
      <Container style={styles.container}>
        <View style={styles.header}>
          <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
            <Button
              style={{height: 50, width: '30%'}}
              transparent
              onPress={this.goBack.bind(this)}>
              <Icon name="arrow-back" style={styles.title} />
            </Button>
            <Text style={{marginTop: 15, width: '70%', fontSize: 18}}>
              {tradRes[this.props.lang].utils.getFolo}
            </Text>
          </View>
        </View>

        <WebView
          source={{uri: 'https://www.reperret.fr/folocode/'}}
          style={{marginTop: 0}}
        />
      </Container>
    );
  }
}

var styles = StyleSheet.create({
  container: {
    backgroundColor: 'transparent',
    //fontFamily: 'Roboto'
  },
  header: {
    backgroundColor: ApiUtils.getBackgroundColor(),
    paddingTop: 30,
    paddingBottom: 0,
  },
  dossard: {
    fontWeight: 'bold',
  },
  timeText: {
    fontWeight: 'bold',
    fontSize: 20,
  },
  title: {
    color: '#000',
  },
  icon: {
    color: '#fff',
  },
});

export default connect(mapStateToProps)(GetFolocode);
