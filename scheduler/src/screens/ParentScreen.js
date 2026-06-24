import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, TextInput,
  StyleSheet, SafeAreaView, Alert, Modal, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { loadTasks, saveTasks } from '../storage/storage';

const EMOJIS = ['🦷','🍳','🏫','📚','🍽️','🚿','😴','⚽','🎮','🎨','🏊','🎵','🐾','🛁','🌙'];

function generateId() {
  return Math.random().toString(36).slice(2, 10);
}

export default function ParentScreen({ navigation }) {
  const [tasks, setTasks] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editing, setEditing] = useState(null);
  const [title, setTitle] = useState('');
  const [time, setTime] = useState('');
  const [emoji, setEmoji] = useState('📚');

  useFocusEffect(
    useCallback(() => {
      loadTasks().then(setTasks);
    }, [])
  );

  function openAdd() {
    setEditing(null);
    setTitle('');
    setTime('');
    setEmoji('📚');
    setModalVisible(true);
  }

  function openEdit(task) {
    setEditing(task);
    setTitle(task.title);
    setTime(task.time);
    setEmoji(task.emoji);
    setModalVisible(true);
  }

  async function save() {
    if (!title.trim()) { Alert.alert('Please enter a task name'); return; }
    const timeValid = /^\d{2}:\d{2}$/.test(time);
    if (!timeValid) { Alert.alert('Enter time as HH:MM, e.g. 07:30'); return; }

    let updated;
    if (editing) {
      updated = tasks.map(t => t.id === editing.id ? { ...t, title, time, emoji } : t);
    } else {
      updated = [...tasks, { id: generateId(), title, time, emoji }]
        .sort((a, b) => a.time.localeCompare(b.time));
    }
    setTasks(updated);
    await saveTasks(updated);
    setModalVisible(false);
  }

  async function deleteTask(id) {
    Alert.alert('Delete task?', 'This will remove it from the schedule.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          const updated = tasks.filter(t => t.id !== id);
          setTasks(updated);
          await saveTasks(updated);
        },
      },
    ]);
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Edit Schedule</Text>
        <TouchableOpacity onPress={openAdd} style={styles.addBtn}>
          <Text style={styles.addBtnText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={tasks}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.task}>
            <Text style={styles.taskEmoji}>{item.emoji}</Text>
            <View style={styles.taskInfo}>
              <Text style={styles.taskTitle}>{item.title}</Text>
              <Text style={styles.taskTime}>{item.time}</Text>
            </View>
            <TouchableOpacity onPress={() => openEdit(item)} style={styles.editBtn}>
              <Text style={styles.editText}>✏️</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => deleteTask(item.id)} style={styles.deleteBtn}>
              <Text style={styles.deleteText}>🗑️</Text>
            </TouchableOpacity>
          </View>
        )}
      />

      <Modal visible={modalVisible} transparent animationType="slide">
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>{editing ? 'Edit Task' : 'New Task'}</Text>

            <Text style={styles.label}>Task name</Text>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="e.g. Do homework"
              maxLength={40}
            />

            <Text style={styles.label}>Time (HH:MM)</Text>
            <TextInput
              style={styles.input}
              value={time}
              onChangeText={setTime}
              placeholder="07:30"
              keyboardType="numbers-and-punctuation"
              maxLength={5}
            />

            <Text style={styles.label}>Pick an emoji</Text>
            <View style={styles.emojiRow}>
              {EMOJIS.map(e => (
                <TouchableOpacity key={e} onPress={() => setEmoji(e)} style={[styles.emojiBtn, emoji === e && styles.emojiBtnSelected]}>
                  <Text style={styles.emojiOption}>{e}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.cancelBtn}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={save} style={styles.saveBtn}>
                <Text style={styles.saveBtnText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F7FF' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12,
  },
  backBtn: { padding: 4 },
  backText: { fontSize: 16, color: '#5C5CFF', fontWeight: '600' },
  title: { fontSize: 22, fontWeight: '800', color: '#333' },
  addBtn: { backgroundColor: '#5C5CFF', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 7 },
  addBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  list: { paddingHorizontal: 20, paddingBottom: 20 },
  task: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff', borderRadius: 14,
    padding: 14, marginBottom: 10,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  taskEmoji: { fontSize: 26, marginRight: 12 },
  taskInfo: { flex: 1 },
  taskTitle: { fontSize: 16, fontWeight: '600', color: '#333' },
  taskTime: { fontSize: 13, color: '#888', marginTop: 2 },
  editBtn: { padding: 8 },
  editText: { fontSize: 20 },
  deleteBtn: { padding: 8 },
  deleteText: { fontSize: 20 },
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' },
  modal: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 },
  modalTitle: { fontSize: 20, fontWeight: '800', color: '#333', marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', color: '#888', marginBottom: 6, marginTop: 12 },
  input: {
    borderWidth: 1.5, borderColor: '#E0E0E0', borderRadius: 10,
    padding: 12, fontSize: 16, color: '#333',
  },
  emojiRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 4 },
  emojiBtn: { padding: 6, borderRadius: 8, margin: 3 },
  emojiBtnSelected: { backgroundColor: '#EEF', borderWidth: 2, borderColor: '#5C5CFF' },
  emojiOption: { fontSize: 24 },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 24, gap: 12 },
  cancelBtn: { paddingHorizontal: 20, paddingVertical: 12 },
  cancelText: { fontSize: 16, color: '#888', fontWeight: '600' },
  saveBtn: { backgroundColor: '#5C5CFF', borderRadius: 12, paddingHorizontal: 28, paddingVertical: 12 },
  saveBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
