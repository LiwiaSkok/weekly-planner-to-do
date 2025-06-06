import { useState, useEffect } from "react";
import Header from "../components/header";
import WeekCalendar from "../components/WeekCalendar";
import DaySchedule, { Task } from "../components/DaySchedule";
import AddTaskModal from "../components/AddTaskModal";
import Footer from "../components/Footer";

// Pełny typ zadania – zawiera wszystkie dane z bazy
type FullTask = {
  id: string;
  title: string;
  date: string;
  duration: number;
  color: string;
  start: string;
  end: string;
};

export default function Home() {
  // Stany formularza – głównie do rezerwacji, ale aktualnie niewykorzystywane
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [duration, setDuration] = useState(15);
  const [color, setColor] = useState("#f87171");

  // Lista zadań z serwera
  const [tasks, setTasks] = useState<FullTask[]>([]);

  // Aktualnie wybrana data w kalendarzu
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Czy pokazujemy modal dodawania/edycji
  const [showModal, setShowModal] = useState(false);

  // Zadanie, które aktualnie edytujemy – jeśli null, tworzymy nowe
  const [taskToEdit, setTaskToEdit] = useState<FullTask | null>(null);

  // Lista zadań na konkretny dzień (z mapowaniem do uproszczonego typu)
  const dayTasks: Task[] = tasks
    .filter((t) => new Date(t.date).toDateString() === selectedDate.toDateString())
    .map((t) => ({
      id: t.id,
      title: t.title,
      start: t.start,
      end: t.end,
      color: t.color,
    }));

  // Dodaje nowe zadanie do bazy przez POST
  const createTask = async (task: any) => {
    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(task),
    });
    if (res.ok) {
      const updated = await fetch("/api/tasks").then((r) => r.json());
      setTasks(updated);
      setShowModal(false); // zamknij modal po dodaniu
    } else {
      alert("Błąd przy dodawaniu zadania");
    }
  };

  // Aktualizuje istniejące zadanie – wysyła PUT do API
  const updateTask = async (task: FullTask) => {
    const res = await fetch("/api/tasks", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(task),
    });

    if (res.ok) {
      const updated = await fetch("/api/tasks").then((r) => r.json());
      setTasks(updated);
      setShowModal(false);
      setTaskToEdit(null); // resetuj tryb edycji
    } else {
      alert("Nie udało się zaktualizować zadania");
    }
  };

  // Uruchamiane po kliknięciu „Edytuj” w DaySchedule
  const handleEdit = (id: string) => {
    const task = tasks.find((t) => t.id === id);
    if (task) {
      setTaskToEdit(task);
      setShowModal(true);
    }
  };

  // Oblicz początek aktualnego tygodnia (poniedziałek)
  const [weekStart, setWeekStart] = useState(() => {
    const now = new Date();
    const day = now.getDay(); // 0 = niedziela
    const diff = (day === 0 ? -6 : 1) - day;
    const monday = new Date(now);
    monday.setDate(now.getDate() + diff);
    monday.setHours(0, 0, 0, 0);
    return monday;
  });

  // Przejdź do następnego tygodnia
  const nextWeek = () => {
    const newStart = new Date(weekStart);
    newStart.setDate(newStart.getDate() + 7);
    setWeekStart(newStart);
  };

  // Przejdź do poprzedniego tygodnia
  const prevWeek = () => {
    const newStart = new Date(weekStart);
    newStart.setDate(newStart.getDate() - 7);
    setWeekStart(newStart);
  };

  // Pobieram wszystkie zadania po załadowaniu komponentu
  useEffect(() => {
    fetch("/api/tasks")
      .then((res) => res.json())
      .then((data) => setTasks(data));
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <main className="flex-grow p-6">
        {/* Nagłówek z przyciskiem „+ Dodaj zadanie” */}
        <Header onAdd={() => setShowModal(true)} />

        {/* Pokazuje modal dodawania lub edycji zadania */}
        {showModal && (
          <AddTaskModal
            onClose={() => {
              setShowModal(false);
              setTaskToEdit(null);
            }}
            onCreate={createTask}
            onUpdate={updateTask}
            initialDate={selectedDate}
            taskToEdit={taskToEdit || undefined}
          />
        )}

        {/* Kalendarz tygodniowy z przyciskami nawigacyjnymi */}
        <WeekCalendar
          selectedDate={selectedDate}
          onSelect={setSelectedDate}
          tasks={tasks}
          weekStart={weekStart}
          onNextWeek={nextWeek}
          onPrevWeek={prevWeek}
        />

        {/* Lista zadań na wybrany dzień */}
        <DaySchedule tasks={dayTasks} onEdit={handleEdit} />
      </main>

      {/* Stopka strony */}
      <Footer />
    </div>
  );
}
