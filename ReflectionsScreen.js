import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  ScrollView,
  Alert,
  Pressable
} from 'react-native';
import { memoryStorage, boostDropletsForAllCourses } from './memoryStore';

const dailyPrompts = [
  "What is one thing you're grateful for today and why?",
  "Describe a small act of kindness you witnessed or performed.",
  "What is a challenge you faced today and how did you approach it?",
  "What is a goal you have for tomorrow?",
  "Describe a moment today that made you smile.",
  "What is something you learned today?",
  "How are you feeling emotionally right now?",
  "What is one thing you did today to take care of yourself?",
];

const ReflectionsScreen = ({ navigateToTimeline, overrideDate, setRefreshKey }) => {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [demoDayOffset, setDemoDayOffset] = useState(0);
  const [currentDemoDate, setCurrentDemoDate] = useState('');
  const [savedResponse, setSavedResponse] = useState('');

  const getDemoDate = (offset) => {
    const today = new Date();
    const demoDate = new Date(today);
    demoDate.setDate(today.getDate() + offset);
    return demoDate.toLocaleDateString();
  };

  useEffect(() => {
    const dateToUse = overrideDate || getDemoDate(demoDayOffset);
    setCurrentDemoDate(dateToUse);
    loadDailyPrompt(dateToUse);
    loadResponse(dateToUse);
  }, [demoDayOffset, overrideDate]);

  const loadDailyPrompt = (dateKey) => {
    if (memoryStorage[`prompt-${dateKey}`]) {
      setPrompt(memoryStorage[`prompt-${dateKey}`]);
    } else {
      const randomIndex = Math.floor(Math.random() * dailyPrompts.length);
      const newPrompt = dailyPrompts[randomIndex];
      setPrompt(newPrompt);
      memoryStorage[`prompt-${dateKey}`] = newPrompt;
    }
  };

  const loadResponse = (dateKey) => {
    if (memoryStorage[`response-${dateKey}`]) {
      setResponse(memoryStorage[`response-${dateKey}`]);
      setSavedResponse(memoryStorage[`response-${dateKey}`]);
    } else {
      setResponse('');
      setSavedResponse('');
    }
  };

  const saveResponse = () => {
    memoryStorage[`response-${currentDemoDate}`] = response;
    setSavedResponse(response);

    boostDropletsForAllCourses(() => {
      setRefreshKey((prev) => prev + 1);
    });

    Alert.alert('response saved', 'your reflection has been saved. all plants boosted!');
  };

  const goToNextDayDemo = () => {
    setDemoDayOffset((prevOffset) => prevOffset + 1);
  };

  const goToPreviousDayDemo = () => {
    setDemoDayOffset((prevOffset) => Math.max(0, prevOffset - 1));
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.heading}>daily 💭 reflection</Text>
      <Text style={styles.date}>{currentDemoDate}</Text>
      <Text style={styles.prompt}>{prompt}</Text>
      <TextInput
        style={styles.input}
        multiline
        placeholder="your reflection here..."
        placeholderTextColor= '#a9c191'
        value={response}
        onChangeText={setResponse}
      />
      <Pressable
        onPress={saveResponse}
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
            {savedResponse ? 'update reflection' : 'save reflection'};
          </Text>
        )}
      </Pressable>
      <View style={[styles.demoControls, { flexDirection: 'row', justifyContent: 'space-between' }]}>
        <View style={{ flex: 1, marginRight: 10 }}>
            <Pressable
            onPress={goToPreviousDayDemo}
            style={({ pressed }) => [
              styles.dcustomButton,
              pressed && styles.dcustomButtonPressed,
            ]}
          >
            {({ pressed }) => (
              <Text
                style={[
                  styles.dcustomButtonText,
                  pressed && styles.dcustomButtonTextPressed,
                ]}
              >
                 &lt; prev day
              </Text>
            )}
          </Pressable>
        </View>
        <View style={{ flex: 1 }}>
            <Pressable
            onPress={goToNextDayDemo}
            style={({ pressed }) => [
              styles.dcustomButton,
              pressed && styles.dcustomButtonPressed,
            ]}
          >
            {({ pressed }) => (
              <Text
                style={[
                  styles.dcustomButtonText,
                  pressed && styles.dcustomButtonTextPressed,
                ]}
              >
                next day &gt;
              </Text>
            )}
          </Pressable>
        </View>
      </View>
      <View style={styles.timelineButtonContainer}>
                  <Pressable
            onPress={navigateToTimeline}
            style={({ pressed }) => [
              styles.dcustomButton,
              pressed && styles.dcustomButtonPressed,
            ]}
          >
            {({ pressed }) => (
              <Text
                style={[
                  styles.dcustomButtonText,
                  pressed && styles.dcustomButtonTextPressed,
                ]}
              >
                previous reflections
              </Text>
            )}
          </Pressable>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f5fff5',
  },
  heading: {
    fontFamily: 'HyningsHandwriting',
    fontSize: 45,
    textTransform: 'lowercase',
    marginBottom: 20,
    textAlign: 'center',
    color: '#7b8d6a',
  },
  date: {
    fontSize: 20,
    fontFamily: 'HyningsHandwriting',
    marginBottom: 10,
    textAlign: 'center',
    textTransform: 'lowercase',
  },
  prompt: {
    fontSize: 25,
    fontFamily: 'HyningsHandwriting',
    marginBottom: 10,
    textTransform: 'lowercase',
    textAlign: 'center',
  },
  input: {
    height: 120,
    borderColor: '#7b8d6a',
    borderWidth: 2,
    borderRadius: 20,
    padding: 10,
    marginBottom: 20,
    textAlignVertical: 'top',
    textAlign: 'center',
    backgroundColor: '#fff',
    fontFamily: 'HyningsHandwriting',
    fontSize: 20,
  },
  // button
  customButton: {
    backgroundColor: '#f5fff5',
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
   color: '#f5fff5',
  },

  //for prev and next
  // button
  dcustomButton: {
    backgroundColor: '#7b8d6a',
    borderWidth: 3,
    borderColor: '#7b8d6a',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 20,
    marginVertical: 10,
    alignItems: 'center',
  },

  // button text
  dcustomButtonText: {
    color: '#f5fff5',
    fontSize: 24,
    fontWeight: 'bold',
    fontFamily: 'HyningsHandwriting',
  },

  // when button gets pressed
  dcustomButtonPressed: {
    backgroundColor: '#f5fff5',
  },

  // text of pressed button
  dcustomButtonTextPressed: {
   color: '#7b8d6a',
  },
  
  demoControls: {
    marginVertical: 10,
  },
  timelineButtonContainer: {
    marginTop: 20,
  },
});

export default ReflectionsScreen;