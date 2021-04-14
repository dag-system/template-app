import React, {Component} from 'react';
import {StyleSheet} from 'react-native';
import {Container, Drawer, Footer} from 'native-base';
import {connect} from 'react-redux';
import MapHeader from './MapHeader';
import MapButtons from './MapButtons';
import Map from './Map';
import GeolocComponent from './GeolocComponent';
import DefaultProps from '../models/DefaultProps';
import BackgroundGeolocation from 'react-native-background-geolocation';
import Sidebar from '../home/SideBar';
import TraceModal from '../home/TraceModal';

const mapStateToProps = (state) => {
  return {
    currentLive: state.currentLive,
  };
};

interface Props extends DefaultProps {
  currentLive: any;
}

interface State {
  isModalTraceVisible: boolean;
}

class MapContainer extends Component<Props, State> {
  map: React.RefObject<unknown>;
  constructor(props) {
    super(props);
    this.map = React.createRef();
    this.state = {
      isModalTraceVisible : false
    };
    this._unsubscribe = this.props.navigation.addListener('focus', () => {
      this.componentDidMount();
    });
  }

  componentDidMount() {
    setTimeout(() => this.didMount(), 300);
  }
  didMount() {
    // if (this.props.currentLive == null) {
    //   this.props.navigation.navigate('Lives');
    // }
  }

  onUpdatePosition = (pos) => {
    if (this.map != null && this.map.current != null) {
      this.map.current.onUpdatePosition(pos);
    }
  };

  onCenter = () => {
    if (this.map != null && this.map.current != null) {
      this.map.current.onCenter();
    }
  };

  closeDrawer = () => {
    this.drawer._root.close();
  };

  onDrawer = () => {
    this.drawer._root.open();
  };

  openTraceModal = () =>  {
    this.setState({isModalTraceVisible: true});
  }

  closeTraceModal = () => {
    this.setState({isModalTraceVisible: false});
  }

  centerOnTrace = (trace :any) => {
    this.closeTraceModal();
    if (this.map != null && this.map.current != null) {
      this.map.current.centerMapOnTrace(trace);
    }
  }

  render() {
    return (
      <Drawer
        ref={(ref) => {
          this.drawer = ref;
        }}
        content={
          <Sidebar
            navigation={this.props.navigation}
            drawer={this.drawer}
            selected="Map"
          />
        }>
        <Container style={styles.container}>
          <GeolocComponent
            onUpdatePosition={(pos) => this.onUpdatePosition(pos)}
          />
          <MapHeader
            navigation={this.props.navigation}
            ondrawer={() => this.onDrawer()}
          />
          <Map ref={this.map} />

          <MapButtons
            navigation={this.props.navigation}
            onCenter={() => this.onCenter()}
            openTraceModal={() => this.openTraceModal()}
            closeTraceModal={() => this.closeTraceModal()}
          />
          <TraceModal isVisible={this.state.isModalTraceVisible} onClose={() => this.closeTraceModal()} centerOnTrace={(trace) => this.centerOnTrace(trace)}/>
        </Container>
      </Drawer>
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
