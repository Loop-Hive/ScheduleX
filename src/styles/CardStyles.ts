import {StyleSheet, Dimensions} from 'react-native';
const {width} = Dimensions.get('window');
const styles = StyleSheet.create({
  cardContainer: {
    borderRadius: 10,
    paddingHorizontal: 18,
    paddingVertical: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'relative',
    width: '92%',
    margin: 'auto',
    // maxWidth: 500,
  },
  cardWrapper: {
    width: '100%',
  },

  closeButton: {
    position: 'absolute',
    top: 7,
    right: 10,
  },
  closeButtonText: {
    color: '#ffffff',
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  miniHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  indicator: {
    width: 4,
    height: 24,
    marginRight: 11,
  },
  miniIndicator: {
    position: 'absolute',
    top: 5,
    left: -9,
    width: 3,
    height: 18,
    marginRight: 6,
  },
  headerTitle: {
    fontSize: 21,
    fontWeight: '900',
    color: '#fff',
  },
  miniHeaderTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#fff',
  },
  ratioBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  attendanceText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  attendanceCountBox: {
    position: 'relative',
    minWidth: 80,
    height: 24,
  },
  attendanceCount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    position: 'absolute',
    top: -6,
    left: -8,
    width: 200,
  },
  miniAttendanceCount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    minWidth: 80,
    textAlign: 'center',
  },
  statusText: {
    fontSize: 14,
    color: '#fff',
    maxWidth: width > 550 ? 500 - 150 : width * 0.92 - 150,
  },
  leftBox: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  rightBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 15,
    marginRight: 0,
  },
  circularContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    width: 80,
    height: 75,
  },
  miniCircularContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 40,
  },
  circularProgress: {
    width: 50,
    height: 50,
    borderRadius: 50,
    position: 'absolute',
    zIndex: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniCircularProgress: {
    width: 40,
    height: 40,
    borderRadius: 50,
    position: 'absolute',
    zIndex: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  percentageText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
  },
  miniPercentageText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#fff',
  },
  actionButtons: {
    flexDirection: 'row',
  },
  actionButtonCover: {
    // backgroundColor: '#000',
    paddingHorizontal: 5,
  },
  miniActionButtons: {
    flexDirection: 'row',
    gap: 12,
    paddingTop: 10,
  },
  actionButtonText: {
    fontSize: 18,
    color: '#fff',
  },

  logo: {
    width: 24,
    height: 22,
    objectFit: 'contain',
    marginBottom: 10,
  },
  miniThreeDot: {
    position: 'absolute',
    top: 3,
    right: 18,
  },
  threeDotBig: {
    position: 'absolute',
    top: -15,
    right: -18,
    width: 40,
    height: 40,
    // backgroundColor: '#000',
    zIndex: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  threeDotBigIcon: {
    width: 20,
    height: 20,
    objectFit: 'contain',
  },
  miniLogo: {
    width: 24,
    height: 24,
    objectFit: 'contain',
  },
  threeDot: {
    width: 15,
    objectFit: 'contain',
  },
});

export default styles;
