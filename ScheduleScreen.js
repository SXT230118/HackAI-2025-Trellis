import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  Button,
  Pressable,
  
} from 'react-native';

const courses = [
  { id: 'cs101', name: 'cs101' },
  { id: 'math2413', name: 'math 2413' },
  { id: 'hist1301', name: 'history 1301' },
  { id: 'bio1306', name: 'biology 1306' },
  { id: 'chem1411', name: 'chemistry 1411' },
  { id: 'phil1301', name: 'philosophy 1301' },
  { id: 'engl1301', name: 'english 1301' },
  { id: 'econ2301', name: 'economics 2301' },
];

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

const wateredImages = [
  require('./assets/homescreen/a_watered.png'),
  require('./assets/homescreen/b_watered.png'),
  require('./assets/homescreen/c_watered.png'),
  require('./assets/homescreen/d_watered.png'),
  require('./assets/homescreen/e_watered.png'),
  require('./assets/homescreen/f_watered.png'),
  require('./assets/homescreen/g_watered.png'),
  require('./assets/homescreen/h_watered.png'),
];

const ScheduleScreen = ({
  droplets,
  watered,
  growthStages,
  handleAttendanceCheckIn,
}) => {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.heading}>course 🌱 garden</Text>
      {courses.map((course, index) => {
        const progress = Math.min(droplets[course.id] ?? 0, 100);
        const stage = growthStages[course.id] ?? 0;
        const plantSize = 80 + stage * 20;

        const plantImage = watered[course.id]
          ? wateredImages[index % wateredImages.length]
          : plantImages[index % plantImages.length];

        return (
          <View key={course.id} style={styles.courseCard}>
            <Text style={styles.courseName}>{course.name}</Text>
            <View style={styles.waterBarOuter}>
              <View style={[styles.waterBarInner, { width: `${progress}%` }]} />
            </View>
            <View style={styles.plantContainer}>
              <Image
                source={plantImage}
                style={[styles.plantImage, { width: plantSize * 2, height: plantSize * 2 }]}
              />
            </View>
            <Pressable
                    onPress={() => handleAttendanceCheckIn(course.id)}
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
                        check-in
                      </Text>
                    )}
                  </Pressable>
          </View>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f5fff5',
  },

  // course garden title
  heading: {
    fontFamily: 'HyningsHandwriting',
    fontSize: 45,
    textTransform: 'lowercase',
    marginBottom: 20,
    textAlign: 'center',
    color: '#7b8d6a',
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
   color: '#f1e9db',
  },

  //check in boxes
  courseCard: {
    padding: 15,
    marginBottom: 20,
    borderRadius: 15,
    borderWidth: 3,
    borderColor: '#9caf88',
  },

  courseName: {
    fontFamily: 'HyningsHandwriting',
    fontSize: 25,
    textTransform: 'lowercase',
    marginBottom: 5,
  },


  waterBarOuter: {
    height: 12,
    backgroundColor: '#d0f0d0',
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 10,
  },
  waterBarInner: {
    height: '100%',
    backgroundColor: '#76c893',
  },

  plantContainer: {
    alignItems: 'center',
    marginBottom: 10,
  },

  plantImage: {
    resizeMode: 'contain',
  },
});

export default ScheduleScreen;
