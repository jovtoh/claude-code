import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, SafeAreaView, Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { loadTasks, loadStars, saveStars } from '../storage/storage';

export default function KidScreen({ navigation }) {
  const [tasks, setTasks] = useState([]);
  const [checked, setChecked] = useState({});
  const [stars, setStars] = useState(0);

  useFocusEffect(
    useCallback(() => {
      loadTasks().then(setTasks);
      loadStars().then(setStars);
      setChecked({});
    }, [])
  );

  async function toggle(id) {
    const alreadyChecked = checked[id];
    const newChecked = { ...checked, [id]: !alreadyChecked };
    setChecked(newChecked);

    const newStars = alreadyChecked ? stars - 1 : stars + 1;
    setStars(newStars);
    await saveStars(newStars);

    if (!alreadyChecked) {
      Alert.alert('Great job! ⭐', 'You earned a star!', [{ text: 'Yay!' }]);
    }
  }

  const totalDone = Object.values(checked).filter(Boolean).length;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Day</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Parent')} style={styles.parentBtn}>
          <Text style={styles.parentBtnText}>⚙️</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.starsBar}>
        <Text style={styles.starsText}>⭐ {stars} total stars</Text>
        <Text style={styles.progressText}>{totalDone}/{tasks.length} done today</Text>
      </View>

      <FlatList
        data={tasks}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const done = !!checked[item.id];
          return (
            <TouchableOpacity
              style={[styles.task, done && styles.taskDone]}
              onPress={() => toggle(item.id)}
              activeOpacity={0.7}
            >
              <Text style={styles.taskEmoji}>{item.emoji}</Text>
              <View style={styles.taskInfo}>
                <Text style={[styles.taskTitle, done && styles.taskTitleDone]}>
                  {item.title}
                </Text>
                <Text style={styles.taskTime}>{item.time}</Text>
              </View>
              <Text style={styles.check}>{done ? '✅' : '⬜'}</Text>
            </TouchableOpacity>
          );
        }}
      />

      {totalDone === tasks.length && tasks.length > 0 && (
        <View style={styles.allDone}>
          <Text style={styles.allDoneText}>🎉 All done! Amazing work!</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF9F0' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8,
  },
  title: { fontSize: 32, fontWeight: '800', color: '#FF6B35' },
  parentBtn: { padding: 8 },
  parentBtnText: { fontSize: 24 },
  starsBar: {
    flexDirection: 'row', justifyContent: 'space-between',
    backgroundColor: '#FFE8D6', marginHorizontal: 20,
    borderRadius: 12, padding: 12, marginBottom: 12,
  },
  starsText: { fontSize: 16, fontWeight: '700', color: '#E05C00' },
  progressText: { fontSize: 16, color: '#E05C00' },
  list: { paddingHorizontal: 20, paddingBottom: 20 },
  task: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff', borderRadius: 16,
    padding: 16, marginBottom: 10,
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },
  taskDone: { backgroundColor: '#F0FFF4', opacity: 0.8 },
  taskEmoji: { fontSize: 28, marginRight: 14 },
  taskInfo: { flex: 1 },
  taskTitle: { fontSize: 17, fontWeight: '600', color: '#333' },
  taskTitleDone: { textDecorationLine: 'line-through', color: '#999' },
  taskTime: { fontSize: 13, color: '#999', marginTop: 2 },
  check: { fontSize: 24 },
  allDone: {
    backgroundColor: '#FF6B35', margin: 20, borderRadius: 16, padding: 16, alignItems: 'center',
  },
  allDoneText: { fontSize: 20, fontWeight: '800', color: '#fff' },
});
