import AsyncStorage from '@react-native-async-storage/async-storage';

const TASKS_KEY = 'tasks';
const STARS_KEY = 'stars';

export const defaultTasks = [
  { id: '1', title: 'Wake up & brush teeth', time: '07:00', emoji: '🦷' },
  { id: '2', title: 'Breakfast', time: '07:30', emoji: '🍳' },
  { id: '3', title: 'School', time: '08:00', emoji: '🏫' },
  { id: '4', title: 'Homework', time: '15:30', emoji: '📚' },
  { id: '5', title: 'Dinner', time: '18:30', emoji: '🍽️' },
  { id: '6', title: 'Shower', time: '19:30', emoji: '🚿' },
  { id: '7', title: 'Read & sleep', time: '20:30', emoji: '😴' },
];

export async function loadTasks() {
  const json = await AsyncStorage.getItem(TASKS_KEY);
  return json ? JSON.parse(json) : defaultTasks;
}

export async function saveTasks(tasks) {
  await AsyncStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
}

export async function loadStars() {
  const val = await AsyncStorage.getItem(STARS_KEY);
  return val ? parseInt(val, 10) : 0;
}

export async function saveStars(stars) {
  await AsyncStorage.setItem(STARS_KEY, String(stars));
}
