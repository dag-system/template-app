import React, {Component} from 'react';
import {StyleSheet} from 'react-native';
import {Container, Footer} from 'native-base';
import {connect} from 'react-redux';
import MapHeader from './MapHeader';
import MapButtons from './MapButtons';
import Map from './Map';
import GeolocComponent from './GeolocComponent';
import DefaultProps from '../models/DefaultProps';
import BackgroundGeolocation from 'react-native-background-geolocation';


const mapStateToProps = state => {
  return {
    currentLive: state.currentLive,
  };
};

interface Props extends DefaultProps {
  currentLive: any;
}

interface State {}

class MapContainer extends Component<Props, State> {
  map: React.RefObject<unknown>;

  
  constructor(props) {
    super(props);
    this.map = React.createRef();
    this.state = {};

    this._unsubscribe = this.props.navigation.addListener('focus', () => {
      this.componentDidMount();
    });
  }

  componentDidMount() {
    setTimeout(() => this.didMount(), 300);
  }
  didMount() {
    if (this.props.currentLive == null) {
      this.props.navigation.navigate('Lives');
    }
  }

  onUpdatePosition = pos => {
    if (this.map != null && this.map.current != null) {
      this.map.current.onUpdatePosition(pos);
    }
  };

  render() {
    return (
      <Container style={styles.container}>
        <GeolocComponent onUpdatePosition={pos => this.onUpdatePosition(pos)} />
        <MapHeader navigation={this.props.navigation} />
        <Map ref={this.map} />
        <Footer>
          <MapButtons navigation={this.props.navigation} />
        </Footer>
      </Container>
    );
  }
}

const styles = StyleSheet.create({
  map: {
    flex: 1,
    borderColor: 'black',
    borderWidth: 0,
    zIndex: 1,
  },
  container: {
    backgroundColor: 'transparent',
    fontFamily: 'Roboto',
    flex: 1,
  },
});

export default connect(mapStateToProps)(MapContainer);
