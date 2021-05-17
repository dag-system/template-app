import React, {Component} from 'react';
import {View, TouchableOpacity} from 'react-native';
import {Text} from 'native-base';
import {connect} from 'react-redux';
import {ReactNativeModal as ModalSmall} from 'react-native-modal';
import {Dispatch} from 'redux';
const mapStateToProps = (state) => {
  return {
    isOkPopupGps: state.isOkPopupGps,
  };
};

interface Props {
  dispatch: Dispatch;
  navigation: any;
  onclose: Function;
  onMap: boolean;
  noHeader: boolean;
  idLive: number;
  onClose: Function;
  isVisible: boolean;
}

interface State {
  spinner: boolean;
  isOpenModal: boolean;
}

class NotificationModal extends Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      spinner: false,
      isOpenModal: true,
    };
  }

  seeNotificationLive = () => {
    // this.getFirstLocation();
    let live = {
      idLive: this.props.idLive,
    };
    var actionSaveLive = {type: 'SAVE_CURRENT_LIVE', data: live};

    this.props.dispatch(actionSaveLive);

    var deleteNotif = {type: 'DELETE_NOTIFICATION', data: this.props.idLive};

    this.props.dispatch(deleteNotif);

    this.onClose();

    this.props.navigation.navigate('LiveSummary');
  };

  onClose = () => {
    this.props.onClose();
  };

  render = () => {
    return (
      <ModalSmall isVisible={this.props.isVisible}>
        <View style={{backgroundColor: 'white', padding: 20}}>
          <Text
            style={{
              textAlign: 'center',
              fontWeight: 'bold',
              marginTop: 0,
              marginBottom: 20,
            }}>
            Bravo ! Un nouvel effort vient d'être calculé
          </Text>
          <Text style={{textAlign: 'justify'}}>
            Retrouvez votre chrono sur le résumé de l'activité
          </Text>
          <View
            style={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
            }}>
            <TouchableOpacity
              onPress={this.onClose}
              style={{justifyContent: 'flex-end', marginTop: 30}}>
              <Text style={{textAlign: 'right'}}>Fermer</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={this.seeNotificationLive}
              style={{justifyContent: 'flex-end', marginTop: 30}}>
              <Text style={{textAlign: 'right'}}>Voir</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ModalSmall>
    );
  };
}

export default connect(mapStateToProps)(NotificationModal);
