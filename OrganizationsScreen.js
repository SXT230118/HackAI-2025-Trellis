import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions,
  Modal,
  TextInput,
  Button,
  Alert,
  Pressable
} from 'react-native';
import organizations from './organizations.json';
import { memoryStorage, boostDropletsForAllCourses } from './memoryStore';

const windowWidth = Dimensions.get('window').width;

const normalizeCategory = (category) => {
  const lower = category.toLowerCase().trim();
  if (lower === 'arts and music') return 'art and music';
  if (lower === 'academic interests' || lower === 'academic interest') return 'academic interest';
  if (lower === 'services') return 'service';
  if (lower === 'social ') return 'social';
  if (lower === 'educational') return 'educational/departmental';
  return lower;
};

const OrganizationsScreen = ({ setRefreshKey }) => {
  const [orgs, setOrgs] = useState([]);
  const [filteredOrgs, setFilteredOrgs] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showDropdown, setShowDropdown] = useState(false);
  const [uniqueCategories, setUniqueCategories] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [reflection, setReflection] = useState('');

  useEffect(() => {
    setOrgs(organizations);
    setFilteredOrgs(organizations);

    const categoriesSet = new Set();
    organizations.forEach(org => {
      org.categories?.forEach(cat => {
        cat
          .split(/[;,]/)
          .map(s => normalizeCategory(s))
          .filter(Boolean)
          .forEach(c => categoriesSet.add(c));
      });
    });

    const formattedCategories = Array.from(categoriesSet)
      .sort()
      .map(cat => cat.charAt(0).toUpperCase() + cat.slice(1));

    setUniqueCategories(['All', ...formattedCategories]);
  }, []);

  useEffect(() => {
    if (selectedCategory === 'All') {
      setFilteredOrgs(orgs);
    } else {
      const filtered = orgs.filter(org =>
        org.categories?.some(cat =>
          cat
            .split(/[;,]/)
            .map(s => normalizeCategory(s))
            .includes(selectedCategory.toLowerCase())
        )
      );
      setFilteredOrgs(filtered);
    }
  }, [selectedCategory, orgs]);

  const openReflectionModal = (org) => {
    const key = `org-reflection-${org.title}`;
    setSelectedOrg(org);
    setReflection(memoryStorage[key] || '');
    setModalVisible(true);
  };

  const saveReflection = () => {
    if (selectedOrg) {
      const key = `org-reflection-${selectedOrg.title}`;
      memoryStorage[key] = reflection;
      boostDropletsForAllCourses(() => {
        setRefreshKey(prev => prev + 1);
      });
      Alert.alert('reflection saved', 'your thoughts were saved and all plants were boosted!');
      setModalVisible(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#f5fff5' }}>
      <View style={styles.header}>
        <Text style={styles.heading}>student 🤝 orgs</Text>
        <Text style={styles.filterLabel}>filter by category:</Text>
        <TouchableOpacity
          onPress={() => setShowDropdown(!showDropdown)}
          style={styles.dropdownButton}
        >
          <Text style={styles.dropdownText}>{selectedCategory.toLowerCase()}</Text>
        </TouchableOpacity>
        {showDropdown && (
          <ScrollView style={styles.dropdownList}>
            {uniqueCategories.map((category, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => {
                  setSelectedCategory(category);
                  setShowDropdown(false);
                }}
                style={styles.dropdownItem}
              >
                <Text style={styles.dropdownItemText}>{category.toLowerCase()}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {filteredOrgs.map((org, index) => (
          <TouchableOpacity key={index} onPress={() => openReflectionModal(org)} style={styles.card}>
            <Text style={styles.title}>{org.title}</Text>
            <Text style={styles.description}>{org.description}</Text>
            <Text style={styles.info}>President: {org.president_name}</Text>
            <Text style={styles.info}>Email: {org.emails?.join(', ')}</Text>
            <Text style={styles.categories}>
              Categories:{' '}
              {org.categories
                ?.map(cat => normalizeCategory(cat))
                .filter((v, i, a) => a.indexOf(v) === i)
                .map(cat => cat.charAt(0).toUpperCase() + cat.slice(1))
                .join(', ')}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Modal visible={modalVisible} animationType="slide">
        <ScrollView contentContainerStyle={styles.modalContainer}>
          <Text style={styles.modalTitle}>
            reflection: {selectedOrg?.title?.toLowerCase()}
          </Text>
          <TextInput
            multiline
            style={styles.textInput}
            value={reflection}
            onChangeText={setReflection}
            placeholder="write your thoughts here..."
            placeholderTextColor='#a9c191'
          />
          <Pressable
            onPress={saveReflection}
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
                save reflection
              </Text>
            )}
          </Pressable>
          <View style={{ height: 10 }} />
          <Pressable
            onPress={() => setModalVisible(false)}
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
                cancel
              </Text>
            )}
          </Pressable>
        </ScrollView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    padding: 20,
    zIndex: 2,
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
  filterLabel: {
    fontFamily: 'HyningsHandwriting',
    fontSize: 16,
    marginBottom: 5,
    textTransform: 'lowercase',
  },
  dropdownButton: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 5,
    backgroundColor: '#fff',
    marginBottom: 10,
  },
  dropdownText: {
    fontFamily: 'HyningsHandwriting',
    fontSize: 20,
    textTransform: 'lowercase',
  },
  dropdownList: {
    maxHeight: 200,
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#fff',
    borderRadius: 5,
    marginBottom: 10,
  },
  dropdownItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  dropdownItemText: {
    fontFamily: 'HyningsHandwriting',
    fontSize: 20,
    textTransform: 'lowercase',
  },
  scrollContent: {
    padding: 10,
    paddingBottom: 80,
  },
  card: {
    backgroundColor: '#fff',
    marginBottom: 15,
    padding: 15,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#ddd',
    alignItems: 'center',
    borderColor: '#7b8d6a',
  },
  image: {
    width: windowWidth - 60,
    height: 200,
    borderRadius: 10,
    resizeMode: 'cover',
    marginBottom: 10,
  },
  title: {
    fontFamily: 'HyningsHandwriting',
    fontSize: 25,
    marginBottom: 5,
    textTransform: 'lowercase',
    color: '#7b8d6a',
    textAlign: 'center',
  },
  description: {
    fontFamily: 'HyningsHandwriting',
    fontSize: 20,
    marginBottom: 5,
    textAlign: 'center',
  },
  info: {
    fontFamily: 'HyningsHandwriting',
    fontSize: 16,
    marginBottom: 3,
    textTransform: 'lowercase',
    textAlign: 'center',
    color: '#7b8d6a',
  },
  categories: {
    fontFamily: 'HyningsHandwriting',
    fontSize: 14,
    color: '#555',
    textTransform: 'lowercase',
  },
  modalContainer: {
    padding: 20,
    backgroundColor: '#f0fff0',
    flexGrow: 1,
  },
  modalTitle: {
    fontFamily: 'HyningsHandwriting',
    fontSize: 30,
    marginBottom: 10,
    marginTop: 100,
    textTransform: 'lowercase',
    textAlign: 'center',
    color: '#7b8d6a',
  },
  textInput: {
    height: 150,
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
    backgroundColor: '#7b8d6a',
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
    color: '#f5fff5',
    fontSize: 24,
    fontWeight: 'bold',
    fontFamily: 'HyningsHandwriting',
  },

  // when button gets pressed
  customButtonPressed: {
    backgroundColor: '#f5fff5',
  },

  // text of pressed button
  customButtonTextPressed: {
   color: '#7b8d6a',
  },
  dcustomButton: {
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
  dcustomButtonText: {
    color: '#7b8d6a',
    fontSize: 24,
    fontWeight: 'bold',
    fontFamily: 'HyningsHandwriting',
  },

  // when button gets pressed
  dcustomButtonPressed: {
    backgroundColor: '#7b8d6a',
  },

  // text of pressed button
  dcustomButtonTextPressed: {
   color: '#f5fff5',
  },
});

export default OrganizationsScreen;
