import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Button,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Pressable
} from 'react-native';
import { memoryStorage } from './memoryStore';

const TimelineScreen = ({ navigateBackToReflections, openReflection }) => {
  const [reflections, setReflections] = useState([]);

  const loadPreviousReflections = () => {
    const responseKeys = Object.keys(memoryStorage).filter(key => key.startsWith('response-'));

    const reflectionsData = responseKeys
      .map(key => ({
        date: key.replace('response-', ''),
        response: memoryStorage[key]
      }))
      .sort((a, b) => new Date(b.date) - new Date(a.date));

    setReflections(reflectionsData);
  };

  useEffect(() => {
    loadPreviousReflections();
  }, []);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.heading}>previous reflections</Text>
      {reflections.length > 0 ? (
        reflections.map(item => (
          <TouchableOpacity
            key={item.date}
            style={styles.reflectionItem}
            onPress={() => openReflection(item.date)}
          >
            <Text style={styles.date}>{item.date}</Text>
            <Text style={styles.response} numberOfLines={3}>{item.response}</Text>
          </TouchableOpacity>
        ))
      ) : (
        <Text style={styles.response}>no previous reflections saved (in memory).</Text>
      )}
      <Pressable
                    onPress={navigateBackToReflections}
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
                        back
                      </Text>
                    )}
                  </Pressable>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5fff5',
  },
 heading: {
    fontFamily: 'HyningsHandwriting',
    fontSize: 30,
    textTransform: 'lowercase',
    marginBottom: 20,
    textAlign: 'center',
    color: '#7b8d6a',
  },
  reflectionItem: {
    backgroundColor: '#f5fff5',
    padding: 15,
    marginBottom: 10,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#7b8d6a',
  },
  date: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#555',
    marginBottom: 5,
    fontFamily: 'HyningsHandwriting',
    textTransform: 'lowercase',
  },
  response: {
    fontSize: 20,
    color: '#777',
    lineHeight: 22,
    fontFamily: 'HyningsHandwriting',
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
});

export default TimelineScreen;