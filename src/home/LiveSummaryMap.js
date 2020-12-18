
import React, { Component } from 'react';
import {
  Platform,
  StyleSheet,
  View,

} from 'react-native';
import {
  Container, Header, Body, Text,
  Button, Fab,
  Icon
} from 'native-base';
import MapView from 'react-native-maps';
import { connect } from 'react-redux'
import ApiUtils from '../ApiUtils';
const mapStateToProps = (state) => {
  return {
    userData: state.userData,
    recordingState: state.recordingState,
    lives: state.lives,
    currentLive: state.currentLive,
    currentMapStyle: state.currentMapStyle
  }
}

class LiveSummaryMap extends Component {
  constructor(props) {
    super(props);

    this.state = {
      fabActive: false
    }


  }

  componentDidMount() {
    
   setTimeout(() => this.centerMap(),100);
  }

  onGoBack() {
    this.props.navigation.navigate('LiveSummary');
  }

  getShortDate(date) {
    if (!!date) {
      var justDate = date.substr(0, 10);
      var splitDate = justDate.split("-");
      var year = splitDate[0].substr(2, 2);
      var month = splitDate[1];
      var day = splitDate[2];
      return day + '/' + month + '/' + year;
    }

  }

  getShortTime(date) {
    if (!!date) {
      var justDate = date.substr(10, 10);
      var splitDate = justDate.split(":");
      var hour = splitDate[0];
      var minutes = splitDate[1];
      return hour + 'h' + minutes;
    }
  }

  centerMap() {
    if (this.props.currentLive !=null && this.props.currentLive.coordinates !=null && this.props.currentLive.coordinates.length != 0) {
      this.refs.map.fitToCoordinates(this.props.currentLive.coordinates, { edgePadding: { top: 10, right: 10, bottom: 10, left: 10 }, animated: true });
    }else{
      setTimeout(() => this.centerMap(),100);
    }
  }

  saveCurrentMapStyle(style) {

    var action = { type: 'UPDATE_MAP_STYLE', data: style }
    this.props.dispatch(action);

  }

  getFabDefaultLogo() {
    if (this.props.currentMapStyle == 'terrain') {
      return 'tree'
    }

    if (this.props.currentMapStyle == 'hybrid') {
      return 'satellite'
    }
    return 'map'
  }



  static navigationOptions = {
    drawerLabel: () => null
  };


  render() {
    return (

      <Container>

        <Header style={styles.header}>
          <Body>
            <View style={{ flexDirection: 'row', justifyContent: 'flex-start', width: '100%', paddingRight: 0, paddingLeft: 0, marginTop: 20, marginBottom: 20 }}>
              <Button style={styles.drawerButton} onPress={() => this.onGoBack()}>
                <Icon style={styles.saveText} name="chevron-left" type="FontAwesome5" />
                <Text style={styles.saveText}>Précedent</Text>
              </Button>
            </View>

          </Body>
        </Header>
        <Body style={styles.body}>

          <View style={styles.loginButtonSection}>

            <Button onPress={this.centerMap.bind(this)}
              style={{
                flexDirection: 'row', justifyContent: 'space-between', width: 53, height: 53, backgroundColor: 'white',
                zIndex: 5, position: 'absolute', top: 20, right: 20
              }}>
              <Icon active name="md-locate" style={styles.centerLogo} />
            </Button>

            <View style={{ flex: 1 }}    >

              <MapView
                ref="map"
                style={styles.map}
                mapType={this.props.currentMapStyle}
                showsUserLocation={false}
                followsUserLocation={false}
                showsMyLocationButton={false}
                showsPointsOfInterest={false}
                showsScale={false}
                showsTraffic={false}
                toolbarEnabled={false}
                onLayout={() => this.centerMap()}
              >
                <MapView.Polyline
                  key="polyline"
                  coordinates={this.props.currentLive.coordinates}
                  geodesic={true}
                  strokeColor='rgba(63,170,239, 1)'
                  strokeWidth={3}
                  zIndex={0}
                />
              </MapView>
              {this.props.currentMapStyle == 'standard' || this.props.currentMapStyle == 'hybrid' || this.props.currentMapStyle == 'terrain' ?
                <Fab
                  active={this.state.fabActive}
                  direction="up"
                  containerStyle={{}}
                  style={{ backgroundColor: '#5067FF' }}
                  position="bottomRight"
                  onPress={() => this.setState({ fabActive: !this.state.fabActive })}>
                  <Icon name={this.getFabDefaultLogo()} type="FontAwesome5" />


                  {
                    this.props.currentMapStyle != 'standard' ?
                      <Button style={{ backgroundColor: '#34A34F' }}
                        onPress={() => this.setState({ fabActive: false }, () => this.saveCurrentMapStyle('standard'))}
                      >
                        <Icon name="map" type="FontAwesome5" />
                      </Button>
                      : null
                  }

                  {this.props.currentMapStyle != 'hybrid' ?
                    <Button style={{ backgroundColor: '#34A34F' }} onPress={() => this.setState({ fabActive: false }, () => this.saveCurrentMapStyle('hybrid'))}>
                      <Icon name="satellite" type='FontAwesome5' />
                    </Button>
                    : null
                  }

                  {Platform.OS == 'android' && this.props.currentMapStyle != 'terrain' ?
                    <Button style={{ backgroundColor: '#34A34F' }} onPress={() => this.setState({ fabActive: false }, () => this.saveCurrentMapStyle('terrain'))}>
                      <Icon name="tree" type='FontAwesome5' />
                    </Button>
                    : null}

                </Fab> : null
              }

            </View>

          </View>
        </Body>


      </Container>
    );
  }
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: ApiUtils.getBackgroundColor(),
    width: '100%'
  },
  title: {

    width: '25%',
  },
  map: {
    flex: 1
  },
  saveButton: {
    backgroundColor: 'transparent',
    width: '38%',
    marginTop: 0,
    paddingTop: 0
  },
  bold: {
    fontWeight: 'bold',
  },
  centerLogo: {
    color: '#000'
  },
  drawerButton: {
    backgroundColor: 'transparent',
    width: 120,
    marginTop: 0,
    paddingTop: 10,
    borderWidth: 0,
    borderColor: 'transparent',
    shadowOffset: { height: 0, width: 0 },
    shadowOpacity: 0,
    elevation: 0
  },
  resultCol: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    width: '25%',
  },
  resultNumber: {
    fontWeight: 'bold',
    fontSize: 18
  },
  saveText: {
    color: 'black'
  },
  body: {
    width: '100%',
    height: '100%',
    backgroundColor: 'white',
  },
  loginButtonSection: {
    width: '100%',
    height: '100%'
  },
  container: {

    width: '100%',
  }
});

export default connect(mapStateToProps)(LiveSummaryMap);