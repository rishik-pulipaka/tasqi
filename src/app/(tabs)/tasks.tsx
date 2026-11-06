import {
  CalendarDays,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CirclePlus,
  Clock3,
  MapPin,
  Trash2,
  X,
} from "lucide-react-native";
import { useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Circle } from "react-native-svg";
import Button from "../../components/Button";
import Pet from "../../components/Pet";
import Screen from "../../components/Screen";
import Text from "../../components/Text";
import TopBar from "../../components/TopBar";
import { useApp } from "../../context/AppContext";
import { colors, fonts, shadow, type } from "../../theme";
import type { Period } from "../../types";
import { dayKey, parseDayKey, scopeKeys } from "../../utils/dates";

const cap = (s: string) => s[0].toUpperCase() + s.slice(1);

// --- Backend classes (from the class diagram, trimmed to what we need for now) ---
type TaskType = "meeting" | "class" | "assignment" | "chore" | "other";
const TASK_TYPES: TaskType[] = [
  "meeting",
  "class",
  "assignment",
  "chore",
  "other",
];

// Matches the Location class in the diagram (lat/lng come back from Google Maps)
type Place = { name: string; lat: number; lng: number };

type UiTask = {
  id: number;
  title: string;
  time: string;
  date: string;
  done: boolean;
  type?: TaskType; // add `type?: TaskType; location?: Place` to Task in ../../types too
  location?: Place;
};

class Task {
  constructor(
    public taskId: string,
    public title: string,
    public dueDate: Date,
    public time: string,
    public isCompleted = false,
    public type: TaskType = "other",
    public location?: Place
  ) {}

  markAsCompleted() {
    this.isCompleted = true;
  }

  static fromUi(t: UiTask) {
    return new Task(
      String(t.id),
      t.title,
      parseDayKey(t.date),
      t.time,
      t.done,
      t.type,
      t.location
    );
  }

  toUi(): UiTask {
    return {
      id: Number(this.taskId),
      title: this.title,
      time: this.time,
      date: dayKey(this.dueDate),
      done: this.isCompleted,
      type: this.type,
      location: this.location,
    };
  }
}

class User {
  constructor(public tasks: Task[] = []) {}

  addTask(task: Task) {
    this.tasks.push(task);
  }

  removeTaskOfId(taskId: string) {
    const before = this.tasks.length;
    this.tasks = this.tasks.filter((t) => t.taskId !== taskId);
    return this.tasks.length < before;
  }

  getTaskOfId(taskId: string) {
    return this.tasks.find((t) => t.taskId === taskId);
  }

  getPendingTasks() {
    return this.tasks.filter((t) => !t.isCompleted);
  }
}

// ============================ PLACEHOLDERS (API / SERVER) ============================

// PLACEHOLDER (Google Places API): replace with Places Autocomplete + Place Details to get lat/lng.
async function searchPlaces(query: string): Promise<Place[]> {
  return [{ name: query, lat: 0, lng: 0 }];
}

// PLACEHOLDER (our backend): save the task, including location lat/lng and time.
async function saveTaskToServer(_task: Task): Promise<void> {}

// PLACEHOLDER (our backend): delete the task. Locations are NOT deleted here.
async function deleteTaskOnServer(_taskId: string): Promise<void> {}

// PLACEHOLDER (our backend): persist a newly saved location so it's reused instead of re-searched.
async function saveLocationToServer(_place: Place): Promise<void> {}

// Saved locations live outside any task, so deleting a task never removes them.
// (Module-level so they survive leaving/re-opening this screen. Swap for server data later.)
let savedLocations: Place[] = [];

const toInputDate = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;

const fromInputDate = (s: string) => {
  const m = s.trim().match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return null;
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return d.getMonth() === Number(m[2]) - 1 ? d : null;
};

function ProgressRing({ done, total }: { done: number; total: number }) {
  const size = 43;
  const stroke = 5;
  const r = (size - stroke) / 2;
  const circumference = 2 * Math.PI * r;
  const fraction = total ? done / total : 0;

  return (
    <View
      style={{
        width: size,
        height: size,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Svg height={size} style={StyleSheet.absoluteFill} width={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          fill="none"
          r={r}
          stroke="#dedbe8"
          strokeWidth={stroke}
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          fill="none"
          origin={`${size / 2}, ${size / 2}`}
          r={r}
          rotation={-90}
          stroke={colors.lavender}
          strokeDasharray={`${circumference * fraction} ${circumference}`}
          strokeLinecap="butt"
          strokeWidth={stroke}
        />
      </Svg>
      <Text style={{ fontFamily: fonts.bold, fontSize: 11.5 }}>{total}</Text>
    </View>
  );
}

export default function TasksScreen() {
  const insets = useSafeAreaInsets();
  const { tasks: contextTasks, setTasks } = useApp();
  // Treat context tasks as UiTask so the new optional `type` / `location` fields type-check
  // without editing ../../types. (Adding them to Task in ../../types is the cleaner long-term fix.)
  const tasks = contextTasks as UiTask[];

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [period, setPeriod] = useState<Period>("day");
  const [periodMenuOpen, setPeriodMenuOpen] = useState(false);
  const [deleteMode, setDeleteMode] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newTime, setNewTime] = useState("9:00 AM");
  const [newDate, setNewDate] = useState("");
  const [newType, setNewType] = useState<TaskType>("other");
  const [newLocation, setNewLocation] = useState<Place | undefined>();
  const [places, setPlaces] = useState<Place[]>(savedLocations);
  const [locMenuOpen, setLocMenuOpen] = useState(false);
  const [locQuery, setLocQuery] = useState("");
  const [results, setResults] = useState<Place[]>([]);
  const [searching, setSearching] = useState(false);

  const keys = useMemo(
    () => scopeKeys(selectedDate, period),
    [selectedDate, period]
  );
  const visibleTasks = tasks.filter((task) => keys.includes(task.date));
  const doneCount = visibleTasks.filter((task) => task.done).length;

  const dateLabel =
    period === "day"
      ? selectedDate.toLocaleDateString("en-US", {
          weekday: "long",
          month: "long",
          day: "numeric",
        })
      : period === "week"
      ? `Week of ${parseDayKey(keys[0]).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        })}`
      : selectedDate.toLocaleDateString("en-US", {
          month: "long",
          year: "numeric",
        });

  const moveDate = (direction: number) => {
    const next = new Date(selectedDate);
    if (period === "day") next.setDate(next.getDate() + direction);
    if (period === "week") next.setDate(next.getDate() + direction * 7);
    if (period === "month") next.setMonth(next.getMonth() + direction);
    setSelectedDate(next);
  };

  const closeAdd = () => setAddOpen(false);

  // Build a User from the current tasks, let the class do the work, then save the result back to state
  const withUser = (change: (user: User) => void) => {
    const user = new User(tasks.map(Task.fromUi));
    change(user);
    setTasks(user.tasks.map((t) => t.toUi()));
  };

  const openAdd = () => {
    setNewDate(toInputDate(selectedDate));
    setAddOpen(true);
  };

  // Save a location once; later tasks pick it from the dropdown instead of calling the Places API again
  const rememberPlace = (place: Place) => {
    if (
      savedLocations.some(
        (p) => p.name.toLowerCase() === place.name.toLowerCase()
      )
    )
      return;
    savedLocations = [...savedLocations, place];
    setPlaces(savedLocations);
    saveLocationToServer(place);
  };

  const pickPlace = (place: Place) => {
    setNewLocation(place);
    rememberPlace(place);
    setResults([]);
    setLocQuery("");
    setLocMenuOpen(false);
  };

  const runSearch = async () => {
    const q = locQuery.trim();
    if (!q) return;
    // Check saved locations first so we only hit the Places API for new places
    const cached = places.filter((p) =>
      p.name.toLowerCase().includes(q.toLowerCase())
    );
    if (cached.length) return setResults(cached);
    setSearching(true);
    try {
      setResults(await searchPlaces(q));
    } catch {
      setResults([]);
    } finally {
      setSearching(false);
    }
  };

  const parsedDate = fromInputDate(newDate);

  const addTask = () => {
    if (!newTitle.trim() || !parsedDate) return;
    const task = new Task(
      String(Date.now()),
      newTitle.trim(),
      parsedDate,
      newTime.trim() || "Anytime",
      false,
      newType,
      newLocation
    );
    withUser((user) => user.addTask(task));
    saveTaskToServer(task);
    setNewTitle("");
    setNewTime("9:00 AM");
    setNewType("other");
    setNewLocation(undefined);
    closeAdd();
  };

  const toggleTask = (id: number) =>
    withUser((user) => {
      const task = user.getTaskOfId(String(id));
      if (task) task.isCompleted = !task.isCompleted;
    });

  // The list updates immediately; saved locations are left alone on purpose.
  const deleteTask = (id: number) => {
    withUser((user) => user.removeTaskOfId(String(id)));
    deleteTaskOnServer(String(id));
  };

  return (
    <Screen>
      <TopBar detail="Plan your progress" title="My tasks" />

      <View style={styles.dateControl}>
        <Pressable
          accessibilityLabel="Previous period"
          onPress={() => moveDate(-1)}
          style={styles.round}
        >
          <ChevronLeft color={colors.ink} size={21} />
        </Pressable>
        <Pressable
          accessibilityState={{ expanded: periodMenuOpen }}
          onPress={() => setPeriodMenuOpen((open) => !open)}
          style={styles.picker}
        >
          <CalendarDays color={colors.lavender} size={17} />
          <View style={{ flex: 1 }}>
            <Text numberOfLines={1} style={styles.pickerTitle}>
              {dateLabel}
            </Text>
            <Text style={styles.pickerSub}>{period} view</Text>
          </View>
          <ChevronDown color={colors.ink} size={16} />
        </Pressable>
        <Pressable
          accessibilityLabel="Next period"
          onPress={() => moveDate(1)}
          style={styles.round}
        >
          <ChevronRight color={colors.ink} size={21} />
        </Pressable>
      </View>

      {/* Menu sits in normal flow (not absolute) so taps work on iOS and Android */}
      {periodMenuOpen && (
        <View style={styles.menu}>
          {(["day", "week", "month"] as Period[]).map((option) => (
            <Pressable
              key={option}
              onPress={() => {
                setPeriod(option);
                setPeriodMenuOpen(false);
              }}
              style={[
                styles.menuOption,
                period === option && { backgroundColor: colors.lavenderSoft },
              ]}
            >
              <Text
                style={[
                  styles.menuText,
                  period === option && { color: colors.lavender },
                ]}
              >
                {cap(option)}
              </Text>
              {period === option && <Check color={colors.lavender} size={16} />}
            </Pressable>
          ))}
        </View>
      )}

      <View style={styles.panel}>
        <View style={styles.panelHeading}>
          <View>
            <Text style={type.eyebrow}>
              {doneCount}/{visibleTasks.length} completed
            </Text>
            <Text style={type.h2}>
              {period === "day" ? "Today's list" : `${cap(period)} overview`}
            </Text>
          </View>
          <ProgressRing done={doneCount} total={visibleTasks.length} />
        </View>

        <View style={styles.list}>
          {visibleTasks.length ? (
            visibleTasks.map((task) => (
              <View key={task.id} style={styles.row}>
                <Pressable
                  accessibilityLabel={
                    task.done
                      ? `Mark ${task.title} incomplete`
                      : `Complete ${task.title}`
                  }
                  onPress={() => toggleTask(task.id)}
                  style={[styles.check, task.done && styles.checkDone]}
                >
                  {task.done && (
                    <Check color="#fff" size={15} strokeWidth={3} />
                  )}
                </Pressable>
                <View style={{ flex: 1, gap: 3 }}>
                  <Text
                    style={[styles.rowTitle, task.done && styles.rowTitleDone]}
                  >
                    {task.title}
                  </Text>
                  <View style={styles.rowMeta}>
                    <Clock3 color={colors.muted} size={13} />
                    <Text style={styles.rowMetaText}>
                      {task.time}
                      {period !== "day" &&
                        ` · ${parseDayKey(task.date).toLocaleDateString(
                          "en-US",
                          {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                          }
                        )}`}
                    </Text>
                  </View>
                  {(task.type || task.location) && (
                    <View style={styles.rowMeta}>
                      <MapPin color={colors.muted} size={13} />
                      <Text numberOfLines={1} style={styles.rowMetaText}>
                        {[task.type && cap(task.type), task.location?.name]
                          .filter(Boolean)
                          .join(" · ")}
                      </Text>
                    </View>
                  )}
                </View>
                {deleteMode && (
                  <Pressable
                    accessibilityLabel={`Delete ${task.title}`}
                    onPress={() => deleteTask(task.id)}
                    style={styles.deleteBtn}
                  >
                    <Trash2 color={colors.coralDark} size={17} />
                  </Pressable>
                )}
              </View>
            ))
          ) : (
            <View style={styles.empty}>
              <Pet small />
              <Text style={styles.emptyTitle}>No tasks here yet</Text>
              <Text style={styles.emptyText}>
                Add one and give Tasqi something to cheer for.
              </Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.actions}>
        <Button
          icon={(c) => <CirclePlus color={c} size={19} />}
          label="Add task"
          onPress={openAdd}
          style={{ flex: 1.5 }}
        />
        <Button
          active={deleteMode}
          icon={(c) => <Trash2 color={c} size={18} />}
          label={deleteMode ? "Done" : "Delete"}
          onPress={() => setDeleteMode((active) => !active)}
          style={{ flex: 1 }}
          variant="secondary"
        />
      </View>

      <Modal
        animationType="slide"
        onRequestClose={closeAdd}
        transparent
        visible={addOpen}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={{ flex: 1 }}
        >
          <Pressable onPress={closeAdd} style={styles.backdrop}>
            {/* inner Pressable swallows taps so tapping the sheet doesn't close it */}
            <Pressable
              onPress={() => {}}
              style={[styles.modal, { paddingBottom: 22 + insets.bottom }]}
            >
              <View style={styles.modalHeading}>
                <View>
                  <Text style={type.eyebrow}>A small step forward</Text>
                  <Text style={type.h2}>Add a new task</Text>
                </View>
                <Pressable
                  accessibilityLabel="Close"
                  onPress={closeAdd}
                  style={styles.round}
                >
                  <X color={colors.ink} size={19} />
                </Pressable>
              </View>

              <ScrollView
                keyboardShouldPersistTaps="handled"
                style={{ maxHeight: 460 }}
              >
                <Text style={styles.modalLabel}>Title</Text>
                <TextInput
                  autoFocus
                  onChangeText={setNewTitle}
                  placeholder="e.g. Read chapter five"
                  placeholderTextColor="#aaa6b2"
                  style={styles.modalInput}
                  value={newTitle}
                />

                <Text style={styles.modalLabel}>Date (YYYY-MM-DD)</Text>
                <TextInput
                  onChangeText={setNewDate}
                  placeholder="2026-11-05"
                  placeholderTextColor="#aaa6b2"
                  style={[
                    styles.modalInput,
                    !parsedDate && { borderColor: colors.coralDark },
                  ]}
                  value={newDate}
                />

                <Text style={styles.modalLabel}>Time</Text>
                <TextInput
                  onChangeText={setNewTime}
                  style={styles.modalInput}
                  value={newTime}
                />

                <Text style={styles.modalLabel}>Type</Text>
                <View style={styles.chips}>
                  {TASK_TYPES.map((t) => (
                    <Pressable
                      key={t}
                      onPress={() => setNewType(t)}
                      style={[
                        styles.chip,
                        newType === t && {
                          backgroundColor: colors.lavenderSoft,
                          borderColor: colors.lavender,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          newType === t && { color: colors.lavender },
                        ]}
                      >
                        {cap(t)}
                      </Text>
                    </Pressable>
                  ))}
                </View>

                <Text style={styles.modalLabel}>Location</Text>
                <Pressable
                  onPress={() => setLocMenuOpen((o) => !o)}
                  style={[styles.modalInput, styles.locPicker]}
                >
                  <MapPin color={colors.lavender} size={16} />
                  <Text numberOfLines={1} style={{ flex: 1 }}>
                    {newLocation?.name ?? "No location"}
                  </Text>
                  <ChevronDown color={colors.ink} size={16} />
                </Pressable>

                {locMenuOpen && (
                  <View style={styles.locMenu}>
                    <Pressable
                      onPress={() => {
                        setNewLocation(undefined);
                        setLocMenuOpen(false);
                      }}
                      style={styles.menuOption}
                    >
                      <Text style={styles.menuText}>No location</Text>
                    </Pressable>
                    {places.map((p) => (
                      <Pressable
                        key={p.name}
                        onPress={() => pickPlace(p)}
                        style={styles.menuOption}
                      >
                        <Text style={styles.menuText}>{p.name}</Text>
                      </Pressable>
                    ))}
                    <View style={styles.searchRow}>
                      <TextInput
                        onChangeText={setLocQuery}
                        onSubmitEditing={runSearch}
                        placeholder="Search for a place"
                        placeholderTextColor="#aaa6b2"
                        returnKeyType="search"
                        style={[styles.modalInput, { flex: 1, height: 42 }]}
                        value={locQuery}
                      />
                      <Button
                        label="Search"
                        onPress={runSearch}
                        style={{ height: 42 }}
                        variant="secondary"
                      />
                    </View>
                    {searching && (
                      <Text style={styles.rowMetaText}>Searching…</Text>
                    )}
                    {results.map((p) => (
                      <Pressable
                        key={`${p.name}-${p.lat}-${p.lng}`}
                        onPress={() => pickPlace(p)}
                        style={styles.menuOption}
                      >
                        <Text style={styles.menuText}>{p.name}</Text>
                      </Pressable>
                    ))}
                  </View>
                )}

                <Button
                  disabled={!newTitle.trim() || !parsedDate}
                  label="Add to my list"
                  onPress={addTask}
                  style={{ marginTop: 20 }}
                />
              </ScrollView>
            </Pressable>
          </Pressable>
        </KeyboardAvoidingView>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  dateControl: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    marginBottom: 18,
  },
  round: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 13,
  },
  picker: {
    flex: 1,
    minHeight: 58,
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    paddingVertical: 9,
    paddingHorizontal: 12,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 16,
  },
  pickerTitle: { fontFamily: fonts.bold, fontSize: 12.5 },
  pickerSub: {
    fontSize: 10.5,
    color: colors.muted,
    textTransform: "capitalize",
  },
  menu: {
    marginHorizontal: 51,
    marginTop: -6,
    marginBottom: 18,
    padding: 6,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 15,
    ...shadow(colors.ink, 0.14, 17, 16, 6),
  },
  menuOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 10,
    borderRadius: 10,
  },
  menuText: { fontFamily: fonts.bold, fontSize: 12 },
  panel: {
    padding: 18,
    backgroundColor: colors.panel,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 24,
  },
  panelHeading: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  list: { minHeight: 258, gap: 9, paddingTop: 14 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    padding: 12,
    backgroundColor: colors.white,
    borderRadius: 15,
  },
  check: {
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: "#c8c4d0",
    borderRadius: 8,
  },
  checkDone: { backgroundColor: colors.mint, borderColor: "#83ad87" },
  rowTitle: { fontFamily: fonts.bold, fontSize: 13.8 },
  rowTitleDone: { color: "#99959f", textDecorationLine: "line-through" },
  rowMeta: { flexDirection: "row", alignItems: "center", gap: 4 },
  rowMetaText: { fontSize: 11.5, color: colors.muted },
  deleteBtn: {
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.coralSoft,
    borderRadius: 10,
  },
  empty: { alignItems: "center", paddingVertical: 28, paddingHorizontal: 10 },
  emptyTitle: { marginTop: -7, fontFamily: fonts.display, fontSize: 15 },
  emptyText: {
    maxWidth: 230,
    marginTop: 5,
    fontSize: 12,
    lineHeight: 17,
    color: colors.muted,
    textAlign: "center",
  },
  actions: { flexDirection: "row", gap: 10, marginTop: 13 },
  backdrop: {
    flex: 1,
    justifyContent: "flex-end",
    padding: 12,
    backgroundColor: "rgba(39,36,61,0.36)",
  },
  modal: {
    padding: 22,
    backgroundColor: colors.paper,
    borderRadius: 26,
    ...shadow(colors.ink, 0.25, 30, 20, 12),
  },
  modalHeading: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  modalLabel: {
    marginTop: 14,
    marginBottom: 7,
    color: colors.muted,
    fontFamily: fonts.bold,
    fontSize: 11.5,
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    paddingVertical: 7,
    paddingHorizontal: 12,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 999,
  },
  chipText: { fontFamily: fonts.bold, fontSize: 12 },
  locPicker: { flexDirection: "row", alignItems: "center", gap: 8 },
  locMenu: {
    marginTop: 6,
    padding: 6,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 13,
  },
  searchRow: { flexDirection: "row", alignItems: "center", gap: 8, padding: 4 },
  modalInput: {
    height: 48,
    paddingHorizontal: 14,
    color: colors.ink,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 13,
    fontFamily: fonts.body,
    fontSize: 14,
  },
});
