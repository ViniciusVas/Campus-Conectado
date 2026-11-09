import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator, BackHandler, Modal, Pressable, ScrollView, StatusBar,
  StyleSheet, Text, TextInput, View,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { decodeTasks, emptyDraft, selectTasks, validate } from './src/tasks';
import type { Draft, Filter, Task } from './src/tasks';

const storageKey = 'campus-conectado/tasks/v1';
const filters: { value: Filter; label: string }[] = [
  { value: 'all', label: 'Todas' },
  { value: 'pending', label: 'Pendentes' },
  { value: 'done', label: 'Concluídas' },
];
const fields: { key: keyof Draft; label: string; placeholder: string; limit: number }[] = [
  { key: 'title', label: 'Título', placeholder: 'Ex. Entregar relatório', limit: 100 },
  { key: 'course', label: 'Disciplina', placeholder: 'Ex. Banco de Dados', limit: 80 },
  { key: 'description', label: 'Descrição', placeholder: 'O que precisa ser feito?', limit: 1000 },
  { key: 'deadline', label: 'Prazo', placeholder: 'DD/MM/AAAA', limit: 10 },
];
type Screen = 'home' | 'list' | 'form';
type Tone = 'primary' | 'secondary' | 'danger';

function Button({ label, onPress, tone = 'primary', disabled = false }: {
  label: string; onPress: () => void; tone?: Tone; disabled?: boolean;
}) {
  return (
    <Pressable accessibilityRole="button" disabled={disabled} onPress={onPress}
      style={({ pressed }) => [styles.button, styles[tone], (pressed || disabled) && styles.dim]}>
      <Text style={[styles.buttonText, tone === 'secondary' && styles.secondaryText]}>{label}</Text>
    </Pressable>
  );
}

export default function App() {
  return <SafeAreaProvider><Campus /></SafeAreaProvider>;
}

function Campus() {
  const [screen, setScreen] = useState<Screen>('home');
  const [returnScreen, setReturnScreen] = useState<Screen>('home');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState<Filter>('all');
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [editing, setEditing] = useState<Task | null>(null);
  const [deleting, setDeleting] = useState<Task | null>(null);
  const [attempted, setAttempted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadFailed, setLoadFailed] = useState(false);
  const [error, setError] = useState('');
  const writing = useRef(false);

  async function load() {
    setLoading(true);
    setLoadFailed(false);
    try {
      setTasks(decodeTasks(await AsyncStorage.getItem(storageKey)));
    } catch {
      setLoadFailed(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, []);

  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (writing.current) return true;
      if (screen === 'home') return false;
      setError('');
      setScreen(screen === 'form' ? returnScreen : 'home');
      return true;
    });
    return () => subscription.remove();
  }, [screen, returnScreen]);

  async function persist(next: Task[], onSuccess?: () => void) {
    if (writing.current) return;
    writing.current = true;
    setSaving(true);
    setError('');
    try {
      await AsyncStorage.setItem(storageKey, JSON.stringify(next));
      setTasks(next);
      onSuccess?.();
    } catch {
      setError('Não foi possível salvar a alteração. Tente novamente.');
    } finally {
      writing.current = false;
      setSaving(false);
    }
  }

  function showList(nextFilter: Filter = 'all') {
    setError('');
    setFilter(nextFilter);
    setScreen('list');
  }

  function openForm(task: Task | null = null) {
    setError('');
    setReturnScreen(screen);
    setEditing(task);
    setDraft(task ? {
      title: task.title, course: task.course, description: task.description, deadline: task.deadline,
    } : emptyDraft);
    setAttempted(false);
    setScreen('form');
  }

  const validation = validate(draft);
  function submit() {
    setAttempted(true);
    if (Object.keys(validation.errors).length > 0) return;
    const next = editing
      ? tasks.map(task => task.id === editing.id ? { ...task, ...validation.clean } : task)
      : [...tasks, {
          ...validation.clean,
          id: Date.now().toString(36) + '-' + Math.random().toString(36).slice(2),
          done: false,
        }];
    void persist(next, () => showList(editing ? filter : 'pending'));
  }

  const doneCount = tasks.filter(task => task.done).length;
  const visibleTasks = selectTasks(tasks, filter);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <View style={styles.headerInner}>
          <View style={styles.mark}><Text style={styles.markText}>CC</Text></View>
          <View style={styles.brandText}>
            <Text style={styles.brand}>Campus Conectado</Text>
            <Text style={styles.muted}>Agenda acadêmica</Text>
          </View>
          {screen !== 'home' && (
            <Button label="Voltar" tone="secondary" disabled={saving} onPress={() => {
              setError('');
              setScreen(screen === 'form' ? returnScreen : 'home');
            }} />
          )}
        </View>
      </View>

      <ScrollView key={screen} keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content}>
        {loading ? <ActivityIndicator accessibilityLabel="Carregando atividades" color="#27574b" /> : loadFailed ? (
          <View style={styles.panel}>
            <Text accessibilityRole="header" style={styles.sectionTitle}>Falha ao abrir a agenda</Text>
            <Text style={styles.muted}>Não foi possível carregar as atividades armazenadas neste dispositivo.</Text>
            <Button label="Tentar novamente" onPress={() => void load()} />
          </View>
        ) : (
          <>
            {screen === 'home' && (
              <>
                <View style={styles.hero}>
                  <Text style={styles.heroTag}>MINHA AGENDA</Text>
                  <Text accessibilityRole="header" style={styles.heroTitle}>Organize sua rotina acadêmica</Text>
                  <Text style={styles.heroBody}>Reúna trabalhos, provas e outras entregas em um só lugar.</Text>
                </View>
                <View style={styles.row}>
                  <Pressable accessibilityRole="button" onPress={() => showList('pending')} style={styles.metric}>
                    <Text style={styles.metricValue}>{tasks.length - doneCount}</Text>
                    <Text style={styles.muted}>Pendentes</Text>
                  </Pressable>
                  <Pressable accessibilityRole="button" onPress={() => showList('done')} style={styles.metric}>
                    <Text style={styles.metricValue}>{doneCount}</Text>
                    <Text style={styles.muted}>Concluídas</Text>
                  </Pressable>
                </View>
                <Button label="+ Nova atividade" onPress={() => openForm()} />
                <Button label="Ver minhas atividades" tone="secondary" onPress={() => showList()} />
              </>
            )}

            {screen === 'list' && (
              <>
                <Text style={styles.eyebrow}>MINHA AGENDA</Text>
                <Text accessibilityRole="header" style={styles.title}>Atividades</Text>
                <View style={styles.row}>
                  {filters.map(item => (
                    <Pressable key={item.value} accessibilityRole="button"
                      accessibilityState={{ selected: filter === item.value }}
                      onPress={() => setFilter(item.value)}
                      style={[styles.chip, filter === item.value && styles.chipActive]}>
                      <Text style={styles.chipText}>{item.label}</Text>
                    </Pressable>
                  ))}
                </View>
                <Button label="+ Nova atividade" disabled={saving} onPress={() => openForm()} />
                {!!error && <Text accessibilityRole="alert" style={styles.error}>{error}</Text>}
                {visibleTasks.length === 0 && (
                  <View style={styles.panel}>
                    <Text style={styles.sectionTitle}>Nenhuma atividade neste filtro</Text>
                    <Text style={styles.muted}>Cadastre uma atividade ou escolha outro filtro.</Text>
                  </View>
                )}
                {visibleTasks.map(task => (
                  <View key={task.id} style={styles.panel}>
                    <View style={styles.row}>
                      <Text style={styles.eyebrow}>{task.course}</Text>
                      <Text style={[styles.badge, task.done && styles.badgeDone]}>
                        {task.done ? 'Concluída' : 'Pendente'}
                      </Text>
                    </View>
                    <Text accessibilityRole="header" style={styles.sectionTitle}>{task.title}</Text>
                    <Text style={styles.muted}>{task.description}</Text>
                    <Text style={styles.deadline}>Prazo · {task.deadline}</Text>
                    <View style={styles.row}>
                      <Button label={task.done ? 'Reabrir' : 'Concluir'} disabled={saving}
                        onPress={() => void persist(tasks.map(item =>
                          item.id === task.id ? { ...item, done: !item.done } : item
                        ))} />
                      <Button label="Editar" tone="secondary" disabled={saving} onPress={() => openForm(task)} />
                      <Button label="Excluir" tone="secondary" disabled={saving} onPress={() => {
                        setError('');
                        setDeleting(task);
                      }} />
                    </View>
                  </View>
                ))}
              </>
            )}

            {screen === 'form' && (
              <>
                <Text style={styles.eyebrow}>MINHA AGENDA</Text>
                <Text accessibilityRole="header" style={styles.title}>
                  {editing ? 'Editar atividade' : 'Nova atividade'}
                </Text>
                <Text style={styles.muted}>Preencha todos os campos.</Text>
                <View style={styles.panel}>
                  {fields.map(field => {
                    const message = attempted && validation.errors[field.key];
                    const multiline = field.key === 'description';
                    return (
                      <View key={field.key} style={styles.field}>
                        <Text style={styles.label}>{field.label}</Text>
                        <TextInput accessibilityLabel={field.label} editable={!saving}
                          placeholder={field.placeholder} placeholderTextColor="#60736e"
                          maxLength={field.limit} multiline={multiline}
                          style={[styles.input, multiline && styles.multiline, message && styles.invalid]}
                          value={draft[field.key]}
                          onChangeText={value => setDraft(current => ({ ...current, [field.key]: value }))}
                        />
                        {!!message && <Text accessibilityRole="alert" style={styles.error}>{message}</Text>}
                      </View>
                    );
                  })}
                  {!!error && <Text accessibilityRole="alert" style={styles.error}>{error}</Text>}
                  <Button label={saving ? 'Salvando…' : 'Salvar atividade'} disabled={saving} onPress={submit} />
                </View>
              </>
            )}
          </>
        )}
      </ScrollView>

      <Modal transparent visible={!!deleting} animationType="fade"
        onRequestClose={() => { if (!writing.current) setDeleting(null); }}>
        <View style={styles.overlay}>
          <View accessibilityViewIsModal style={[styles.panel, styles.dialog]}>
            <Text accessibilityRole="header" style={styles.sectionTitle}>Excluir atividade?</Text>
            <Text style={styles.muted}>A atividade “{deleting?.title}” será removida da sua agenda.</Text>
            {!!error && <Text accessibilityRole="alert" style={styles.error}>{error}</Text>}
            <View style={styles.row}>
              <Button label="Cancelar" tone="secondary" disabled={saving} onPress={() => {
                setError('');
                setDeleting(null);
              }} />
              <Button label={saving ? 'Excluindo…' : 'Confirmar exclusão'} tone="danger" disabled={saving}
                onPress={() => void persist(tasks.filter(task => task.id !== deleting?.id), () => setDeleting(null))} />
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const ink = '#17382f';
const green = '#27574b';
const border = '#d7e4de';
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f3f7f5' },
  header: { backgroundColor: '#fff', borderBottomWidth: 1, borderColor: border },
  headerInner: { width: '100%', maxWidth: 640, alignSelf: 'center', paddingHorizontal: 20, paddingVertical: 12,
    flexDirection: 'row', alignItems: 'center', gap: 12 },
  mark: { backgroundColor: green, width: 42, height: 42, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  markText: { color: '#fff', fontSize: 15, fontWeight: '800' },
  brandText: { flex: 1 },
  brand: { fontSize: 17, fontWeight: '800', color: ink },
  content: { width: '100%', maxWidth: 640, alignSelf: 'center', padding: 20, paddingBottom: 36, gap: 14 },
  hero: { backgroundColor: '#173e34', borderRadius: 24, padding: 23, gap: 12 },
  heroTag: { color: '#b5ebc9', letterSpacing: 2, fontSize: 12, fontWeight: '800' },
  heroTitle: { color: '#fff', fontSize: 32, lineHeight: 37, fontWeight: '800' },
  heroBody: { color: '#dfefe8', fontSize: 16, lineHeight: 23 },
  title: { fontSize: 30, fontWeight: '800', color: ink },
  sectionTitle: { color: ink, fontSize: 20, fontWeight: '800' },
  eyebrow: { color: green, fontSize: 12, fontWeight: '800', letterSpacing: 1, flexShrink: 1 },
  muted: { color: '#4a625a', fontSize: 14, lineHeight: 20 },
  row: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 8 },
  metric: { flex: 1, minWidth: 110, padding: 16, backgroundColor: '#fff', borderRadius: 16,
    borderWidth: 1, borderColor: border },
  metricValue: { color: ink, fontSize: 28, fontWeight: '800' },
  panel: { backgroundColor: '#fff', padding: 16, gap: 10, borderRadius: 18, borderWidth: 1, borderColor: border },
  chip: { minHeight: 44, justifyContent: 'center', backgroundColor: '#fff', borderWidth: 1,
    borderColor: border, borderRadius: 30, paddingHorizontal: 12 },
  chipActive: { backgroundColor: '#d8eee1', borderColor: '#84b39f' },
  chipText: { color: ink, fontSize: 13, fontWeight: '700' },
  badge: { color: '#65460a', backgroundColor: '#f8edce', paddingHorizontal: 8, paddingVertical: 4,
    borderRadius: 8, fontSize: 12, fontWeight: '700' },
  badgeDone: { color: ink, backgroundColor: '#d8eee1' },
  deadline: { color: green, fontSize: 14, fontWeight: '700' },
  button: { minHeight: 44, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 9,
    justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'transparent' },
  primary: { backgroundColor: green },
  secondary: { backgroundColor: '#fff', borderColor: border },
  danger: { backgroundColor: '#a42d39' },
  dim: { opacity: 0.55 },
  buttonText: { color: '#fff', fontWeight: '800', fontSize: 14, textAlign: 'center' },
  secondaryText: { color: ink },
  field: { gap: 5 },
  label: { color: ink, fontWeight: '700', fontSize: 14 },
  input: { minHeight: 46, borderRadius: 10, borderWidth: 1, borderColor: '#b9cbc2',
    backgroundColor: '#fbfdfc', color: ink, fontSize: 16, paddingHorizontal: 12, paddingVertical: 8 },
  multiline: { minHeight: 80, textAlignVertical: 'top' },
  invalid: { borderColor: '#a42d39' },
  error: { color: '#962a37', fontWeight: '600', fontSize: 14 },
  overlay: { flex: 1, backgroundColor: '#142e28a6', alignItems: 'center', justifyContent: 'center', padding: 20 },
  dialog: { width: '100%', maxWidth: 420 },
});

