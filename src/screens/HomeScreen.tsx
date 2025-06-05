import React, {useState, useEffect} from 'react';
import Card from '../components/Cards/Card';
import Spacer from '../components/Spacer';
import {
  View,
  StyleSheet,
  ScrollView,
  Dimensions,
  Text,
  TouchableOpacity,
  Image,
} from 'react-native';
import MiniCard from '../components/Cards/MiniCard';
import useStore from '../store/store';
import {CardInterface} from '../types/cards';
import Header from '../components/Header';
interface HomeScreenProps {
  toggleSidebar: () => void;
  handleMenuOpen: (r: number, c: number) => void;
}

const HomeScreen: React.FC<HomeScreenProps> = ({
  navigation,
  toggleSidebar,
  handleMenuOpen,
}: any) => {
  const {registers, activeRegister, updatedAt} = useStore();
  const [currentRegister, setCurrentRegister] = useState<CardInterface[]>([]);
  useEffect(() => {
    setCurrentRegister(registers[activeRegister]?.cards || []);
    console.log(registers[activeRegister]?.card_size);
  }, [updatedAt, activeRegister, registers]);

  useEffect(() => {
    currentRegister.forEach(card => {
      console.log(card.id);
    });
  }, [currentRegister]);

  // const toggleSort = () => {
  //   if (cardSize == 'small') setRegisterCardSize(activeRegister, 'normal');
  //   else setRegisterCardSize(activeRegister, 'small');
  // };
  const handleViewDetails = (r: number, c: number) => {
    navigation.navigate('CardDetails', {
      card_register: r,
      card_id: c,
    });
  };

  return (
    <View style={styles.homeView}>
      <Header
        toggler={toggleSidebar}
        changeStack={navigation.navigate}
        registerName={registers[activeRegister]?.name}
      />
      {currentRegister.length === 0 && (
        <View style={styles.emptyContainer}>
          <TouchableOpacity onPress={() => navigation.navigate('Add')}>
            <Image
              source={require('../assets/images/add-icon.png')}
              style={styles.addIcon}
            />
          </TouchableOpacity>
          <Text style={styles.emptyText}>Click Add Button to Add Subject</Text>
        </View>
      )}
      {/* Custom Drawer */}
      {/* Cards  */}
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}>
        {/* <Card />
        <Card />
        <Card />
        <Card />
        <Card /> */}
        {registers[activeRegister].card_size === 'normal' &&
          currentRegister.map((card, index) => (
            <Card
              key={card.id}
              id={card.id}
              title={card.title}
              present={card.present}
              total={card.total}
              target_percentage={card.target_percentage}
              tagColor={card.tagColor}
              cardRegister={activeRegister}
              handleMenuOpen={handleMenuOpen}
              hasLimit={card.hasLimit}
              limitFreq={card.limit}
              limitType={card.limitType}
              handleViewDetails={handleViewDetails}
              delay={150 * index}
            />
          ))}
        {registers[activeRegister].card_size === 'small' &&
          currentRegister.map(card => (
            <MiniCard
              key={card.id}
              id={card.id}
              title={card.title}
              present={card.present}
              total={card.total}
              target_percentage={card.target_percentage}
              tagColor={card.tagColor}
              cardRegister={activeRegister}
              handleMenuOpen={handleMenuOpen}
            />
          ))}

        <Spacer />
      </ScrollView>

      {/* <Footer navigate={navigate} /> */}
    </View>
  );
};

const styles = StyleSheet.create({
  homeView: {
    flex: 1,
    backgroundColor: '#18181B',
  },
  addIcon: {width: 80, height: 80},

  scrollView: {
    flex: 1,
  },
  logo: {
    width: 50,
    height: 50,
    marginLeft: '50%',
  },
  emptyContainer: {
    color: '#fff',
    height: Dimensions.get('window').height - 200,
    gap: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: '#5A5A5A',
    fontSize: 20,
  },

  contentContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 15,
    paddingTop: 20,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  homeScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212',
  },
  title: {
    fontSize: 24,
    color: '#fff',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  drawerContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    width: Dimensions.get('window').width * 0.8, // 80% of screen width
    backgroundColor: '#1e1e1e',
    padding: 20,
  },
  drawerContent: {
    flex: 1,
  },
  drawerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
  },
  registerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#333',
    marginVertical: 5,
    padding: 7,
    borderRadius: 5,
  },
  registerText: {
    flex: 1,
    color: '#fff',
  },
  editButton: {
    marginHorizontal: 5,
  },
  editText: {
    color: '#00ff00',
  },
  deleteButton: {
    marginHorizontal: 5,
  },
  deleteText: {
    color: '#ff0000',
  },
  addButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#4caf50',
    borderRadius: 5,
    alignItems: 'center',
  },
  addText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  sidebar: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    width: Dimensions.get('window').width * 0.8, // 80% of screen width
    backgroundColor: '#1e1e1e',
    padding: 20,
    zIndex: 1000000,
  },
  sidebarText: {
    color: '#fff',
    fontSize: 18,
  },
});

export default HomeScreen;
