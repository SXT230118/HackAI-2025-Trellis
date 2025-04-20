import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  FlatList,
  Image,
  Dimensions,
  Pressable,
  ImageBackground
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Font from 'expo-font';
import AppLoading from 'expo-app-loading';

import ReflectionsScreen from './ReflectionsScreen';
import TimelineScreen from './TimelineScreen';
import OrganizationsScreen from './OrganizationsScreen';
import ScheduleScreen from './ScheduleScreen';
import { memoryStorage } from './memoryStore';
import MindGardenScreen from './MindGardenScreen';

const Tab = createBottomTabNavigator();
const windowWidth = Dimensions.get('window').width;

const courses = [
  'cs101', 'math2413', 'hist1301', 'bio1306',
  'chem1411', 'phil1301', 'engl1301', 'econ2301',
];

const courseNames = {
  cs101: 'cs101',
  math2413: 'math 2413',
  hist1301: 'history 1301',
  bio1306: 'biology 1306',
  chem1411: 'chemistry 1411',
  phil1301: 'philosophy 1301',
  engl1301: 'english 1301',
  econ2301: 'economics 2301',
};

const plantImages = [
  require('./assets/homescreen/a.png'),
  require('./assets/homescreen/b.png'),
  require('./assets/homescreen/c.png'),
  require('./assets/homescreen/d.png'),
  require('./assets/homescreen/e.png'),
  require('./assets/homescreen/f.png'),
  require('./assets/homescreen/g.png'),
  require('./assets/homescreen/h.png'),
];

const loadFonts = () => {
  return Font.loadAsync({
    'HyningsHandwriting': require('./assets/fonts/HyningsHandwritingV2-Regular.ttf'),
  });
};

// login screen logic
const LoginScreen = ({ setUsername, setLoggedIn }) => {
  const [usernameInput, setUsernameInput] = useState('');

  const handleLogin = async () => {
    if (!usernameInput) {
      return Alert.alert('please enter your name!');
    }
    await AsyncStorage.setItem('username', usernameInput);
    setUsername(usernameInput);
    setLoggedIn(true);
  };

  return (
    // imagebackground
    <ImageBackground
      source={require('./assets/background.png')} // change path if needed
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <View style={styles.loginContainer}>
        <Image
        source={require('./assets/logo.png')}
        style={{ width: 100, height: 100 }}
      />
        <Text style={styles.loginheading}>welcome! </Text>
        <TextInput
          style={styles.input}
          placeholder="your name"
          placeholderTextColor="#a9c191"
          value={usernameInput}
          onChangeText={setUsernameInput}
        />
        <Pressable
          onPress={handleLogin}
          style={({ pressed }) => [
            styles.customButton,
            pressed && styles.customButtonPressed,
          ]}
        >
          {({ pressed }) => (
            <Text
              style={[
                styles.customButtonText,
                pressed && styles.customButtonTextPressed,
              ]}
            >
              enter &gt;
            </Text>
          )}
        </Pressable>
      </View>
    </ImageBackground>
  );
};

const App = () => {
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [username, setUsername] = useState(null);
  const [mood, setMood] = useState(null);
  const [selectedMood, setSelectedMood] = useState(null);

  const [droplets, setDroplets] = useState({});
  const [growthStages, setGrowthStages] = useState({});
  const [watered, setWatered] = useState({});
  const [checkedInToday, setCheckedInToday] = useState({});
  const [refreshKey, setRefreshKey] = useState(0);
  const [isViewingTimeline, setIsViewingTimeline] = useState(false);
  const [selectedReflectionDate, setSelectedReflectionDate] = useState(null);

  const flatListRef = useRef();
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const newDroplets = {};
    const newStages = {};
    const newWatered = {};

    courses.forEach((courseId) => {
      let val = memoryStorage[`droplets-${courseId}`] || 0;
      let stage = memoryStorage[`growth-${courseId}`] || 0;

      if (val >= 100) {
        val = 0;
        stage += 1;
        newWatered[courseId] = true;
        memoryStorage[`growth-${courseId}`] = stage;

        setTimeout(() => {
          setWatered((prev) => ({ ...prev, [courseId]: false }));
        }, 1500);
      }

      memoryStorage[`droplets-${courseId}`] = val;
      newDroplets[courseId] = val;
      newStages[courseId] = stage;
    });

    setDroplets(newDroplets);
    setGrowthStages(newStages);
    setWatered((prev) => ({ ...prev, ...newWatered }));
  }, [refreshKey]);

  const handleAttendanceCheckIn = (courseId) => {
    if (checkedInToday[courseId]) {
      return Alert.alert('already checked in today! wait until next session.');
    }

    const current = droplets[courseId] ?? 0;
    const updated = Math.min(current + 10, 100);
    memoryStorage[`droplets-${courseId}`] = updated;

    if (updated >= 100) {
      setWatered((prev) => ({ ...prev, [courseId]: true }));
      setTimeout(() => {
        setWatered((prev) => ({ ...prev, [courseId]: false }));
        setGrowthStages((prev) => ({
          ...prev,
          [courseId]: (prev[courseId] || 0) + 1,
        }));
        setDroplets((prev) => ({ ...prev, [courseId]: 0 }));
        memoryStorage[`droplets-${courseId}`] = 0;
        memoryStorage[`growth-${courseId}`] = (growthStages[courseId] || 0) + 1;
      }, 1500);
    } else {
      setDroplets((prev) => ({ ...prev, [courseId]: updated }));
      setWatered((prev) => ({ ...prev, [courseId]: true }));
      setTimeout(() => {
        setWatered((prev) => ({ ...prev, [courseId]: false }));
      }, 1500);
    }

    setCheckedInToday((prev) => ({ ...prev, [courseId]: true }));
  };

  const handleMoodSelect = (emoji) => {
    if (mood !== null) return;
    setSelectedMood(emoji);
  };

  const handleMoodSubmit = () => {
    if (!selectedMood) {
      return Alert.alert('please select a mood first!');
    }
    setMood(selectedMood);
  };

  if (!fontsLoaded) {
    return (
      <AppLoading
        startAsync={loadFonts}
        onFinish={() => setFontsLoaded(true)}
        onError={console.warn}
      />
    );
  }

  if (!loggedIn) {
    return <LoginScreen setUsername={setUsername} setLoggedIn={setLoggedIn} />;
  }

  const renderPlant = ({ item, index }) => {
    const courseId = item;
    const stage = growthStages[courseId] ?? 0;
    const plantSize = 80 + stage * 20;
    const progress = droplets[courseId] ?? 0;

    return (
      <View style={styles.carouselItem}>
        <Image
          source={plantImages[index % plantImages.length]}
          style={[styles.carouselImage, { width: plantSize*2, height: plantSize*2 }]}
        />
        <Text style={styles.carouselCourseName}>{courseNames[courseId]}</Text>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
      </View>
    );
  };

  return (
    <NavigationContainer>
      <Tab.Navigator initialRouteName="home">
        <Tab.Screen
          name="home"
          children={() => (
            <ScrollView style={{ padding: 20, backgroundColor: '#f5fff5' }}>
              <Text style={styles.sun}>☀️</Text>
              <Text style={styles.greeting}>hello, {username}!</Text>
              <Text style={styles.heading}>how are you feeling today?</Text>
              {!mood ? (
                <>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginVertical: 10 }}>
                    {['😊', '😐', '😔', '😡'].map((emoji) => (
                      <TouchableOpacity key={emoji} onPress={() => handleMoodSelect(emoji)}>
                        <View style={[styles.emojiContainer, selectedMood === emoji && mood === null && styles.emojiSelected]}>
                          <Text style={styles.emojiText}>{emoji}</Text>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>
                  <Pressable
                    onPress={handleMoodSubmit}
                    style={({ pressed }) => [
                      styles.customButton,
                      pressed && styles.customButtonPressed,
                    ]}
                  >
                    {({ pressed }) => (
                      <Text
                        style={[
                          styles.customButtonText,
                          pressed && styles.customButtonTextPressed,
                        ]}
                      >
                        submit
                      </Text>
                    )}
                  </Pressable>
                </>
              ) : (
                <Text style={[styles.heading, { fontSize: 50}, {marginBottom: 30}, {borderRadius: 20}, {borderWidth: 2}, {borderColor: '#7b8d6a'}, {width: '25%'}, {alignSelf: 'center'}]}>{mood}</Text>
              )}

              <Text style={[styles.heading, { marginTop: 30 }, {fontSize: 40}, {color: '#7b8d6a'}]}>🌿 your plants🌿</Text>
              <FlatList
                ref={flatListRef}
                horizontal
                pagingEnabled
                snapToInterval={windowWidth}
                decelerationRate="fast"
                showsHorizontalScrollIndicator={false}
                data={courses}
                renderItem={renderPlant}
                keyExtractor={(item) => item}
                style={{ marginTop: 20 }}
              />
            </ScrollView>
          )}
          options={{
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="emoticon" color={color} size={size} />
            ),
          }}
        />
        <Tab.Screen
          name="check-in"
          children={() => (
            <ScheduleScreen
              droplets={droplets}
              growthStages={growthStages}
              watered={watered}
              checkedInToday={checkedInToday}
              handleAttendanceCheckIn={handleAttendanceCheckIn}
            />
          )}
          options={{
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="calendar-check" color={color} size={size} />
            ),
          }}
        />
        <Tab.Screen
          name="reflect"
          children={() =>
            isViewingTimeline ? (
              <TimelineScreen
                navigateBackToReflections={() => {
                  setIsViewingTimeline(false);
                  setSelectedReflectionDate(null);
                }}
                openReflection={(date) => {
                  setSelectedReflectionDate(date);
                  setIsViewingTimeline(false);
                }}
              />
            ) : (
              <ReflectionsScreen
                navigateToTimeline={() => setIsViewingTimeline(true)}
                overrideDate={selectedReflectionDate}
                setRefreshKey={setRefreshKey}
              />
            )
          }
          options={{
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="book-heart" color={color} size={size} />
            ),
          }}
        />
        <Tab.Screen
          name="orgs"
          children={() => (
            <OrganizationsScreen setRefreshKey={setRefreshKey} />
          )}
          options={{
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="account-group" color={color} size={size} />
            ),
          }}
        />
        <Tab.Screen
          name="mind garden"
          component={MindGardenScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="leaf" color={color} size={size} />
            ),
            title: 'mind garden',
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  // overall page
  container: {
    padding: 20,
    backgroundColor: '#f5fff5',
    flex: 1,
  },

// LOGIN PAGE!!!!

  //background image
  backgroundImage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
},

  // login page
  loginContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f1e9db',
    borderWidth: 3,
    borderColor: '#a9c191',
    borderRadius: 30,
    marginVertical: 175,
  },

  // login header
  loginheading: {
    marginBottom: 100,
    fontSize: 50,
    fontWeight: 'bold',
    fontFamily: 'HyningsHandwriting',
    color: '#7b8d6a'
  },

  // name text box
  input: {
    borderRadius: 20,
    borderWidth: 3,
    borderColor: '#7b8d6a',
    padding: 10,
    marginBottom: 20,
    fontSize: 25,
    fontFamily: 'HyningsHandwriting',
    width: 200,
    textAlign: 'center',
    fontStyle: 'italic',
    color: "#7b8d6a"
  },

  // button
  customButton: {
    backgroundColor: 'transparent',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 20,
    borderColor: '#7b8d6a',
    borderWidth: 2,
    marginVertical: 10,
    alignItems: 'center',
  },

  // button text
  customButtonText: {
    color: '#7b8d6a',
    fontSize: 24,
    fontWeight: 'bold',
    fontFamily: 'HyningsHandwriting',
  },

  // when button gets pressed
  customButtonPressed: {
    backgroundColor: '#9caf88',
  },

  // text of pressed button
  customButtonTextPressed: {
   color: '#f1e9db',
  },

  // for the home greeting
  greeting: {
    fontSize: 50,
    fontFamily: 'HyningsHandwriting',
    color:'#7b8d6a',
    textAlign: 'center',
    marginBottom: 75,
  },

  // for the sun emoji
  sun: {
    fontSize: 40,
    textAlign: 'center',
  },

  // headings
  heading: {
    fontSize: 22,
    fontWeight: 'bold',
    marginVertical: 15,
    fontFamily: 'HyningsHandwriting',
    textTransform: 'lowercase',
    textAlign: 'center',
  },

  // for selection of emojis
  emojiContainer: {
    padding: 10,
    borderRadius: 10,
  },
  emojiSelected: {
    backgroundColor: '#a9c191',
  },
  emojiText: {
    fontSize: 40,
    textAlign: 'center',
  },

  // carousel stuff
  carouselItem: {
    width: windowWidth,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    marginTop: -30,
    marginRight: 20,
    marginLeft: -20,
  },

  carouselImage: {
    resizeMode: 'contain',
    marginBottom: 10,
  },
  
  carouselCourseName: {
    fontFamily: 'HyningsHandwriting',
    fontSize: 25,
    marginBottom: 5,
    textTransform: 'lowercase',
  },
  progressBar: {
    width: '100%',
    height: 10,
    backgroundColor: '#d0f0d0',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#76c893',
  },
});

export default App;
