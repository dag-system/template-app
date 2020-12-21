import {StyleSheet} from 'react-native';
export default StyleSheet.create({
  button: {
    padding: 5,
    paddingHorizontal: 12,
    borderWidth: 1,
  },

  uppercase: {
    textTransform: 'uppercase',
  },

  //OLD
  modalTitle: {
    fontWeight: 'bold',
    fontSize: 30,
    textAlign: 'center',
  },

  modalh2: {
    textAlign: 'center',
    fontSize: 18,
    marginTop: 15,
    marginBottom: 15,
  },

  modalh3: {
    textAlign: 'center',
    fontSize: 16,
    marginTop: 10,
    marginBottom: 10,
  },
  modalBackBtn: {
    width: 50,
  },

  explanationIcon: {
    alignSelf: 'center',
    marginBottom: 5,
    marginTop: 10,
  },

  modalBackIcon: {
    marginLeft: 10,

    // position : 'absolute',
    // left : 10,
    // zIndex :2
  },

  primaryColor: {
    color: 'blue',
  },
  redText: {
    color: 'red',
  },

  h2: {
    fontWeight: 'bold',
    fontSize: 26,
  },
  h3: {
    fontWeight: 'bold',
    fontSize: 22,
  },
  h4: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  h5: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  p1: {
    fontSize: 16,
  },
  p2: {
    fontSize: 13,
  },
  row: {
    display: 'flex',
    flexDirection: 'row',
  },

  sectionTitle: {
    marginTop: 40,
    marginBottom: 20,
  },

  panelContent: {
    borderWidth: 1,
    padding: 18,
    borderColor: '#DCDCDC',
    borderBottomWidth: 0,
  },

  panelTitle: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderWidth: 1,
    padding: 18,
    borderBottomWidth: 0,
    borderColor: '#DCDCDC',
  },

  panelTitleText: {
    fontWeight: '500',
    marginBottom: 4,
  },

  validateBtn: {
    paddingHorizontal: 84,
    paddingVertical: 21,
    borderRadius: 12,
  },
  card: {
    borderRadius: 12,
    padding: 16,
    display: 'flex',
    flexDirection: 'row',
  },
  cardIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 18,
    alignContent: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  cardText: {},
});
