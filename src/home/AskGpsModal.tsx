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
  isOkPopupGps: boolean;
  onValidate(): void;
}

interface State {
  spinner: boolean;
  isOpenModalHelp: boolean;
}

class AskGpsModal extends Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      spinner: false,
      isOpenModalHelp: false,
    };
  }

  onAcceptGps = () => {
    var action = {type: 'VIEW_POPUPGPS', data: null};
    this.props.dispatch(action);

    this.props.onValidate();
  };

  render = () => {
    return (
      // <ModalSmall isVisible={true} >
      <View
        style={{
          backgroundColor: 'white',
          padding: 40,
          elevation: 20,
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: 5,
          },
          shadowOpacity: 0.34,
          shadowRadius: 6.27,
        }}>
        <Text
          style={{
            textAlign: 'center',
            fontWeight: 'bold',
            marginTop: 0,
            marginBottom: 20,
          }}>
          Accès à votre position GPS en arrière plan
        </Text>
        <Text style={{textAlign: 'justify'}}>
          L'application a besoin d'accèder à votre position en arrière plan pour
          pouvoir enregistrer la totalité de votre activité. Nous enregistrons
          votre position GPS même quand l'application est arretée ou en arrière
          plan.
        </Text>
        <TouchableOpacity
          onPress={this.onAcceptGps}
          style={{justifyContent: 'flex-end', marginTop: 30}}>
          <Text style={{textAlign: 'right'}}>Ok</Text>
        </TouchableOpacity>
      </View>
      // </ModalSmall>
    );
  };
}

export default connect(mapStateToProps)(AskGpsModal);
