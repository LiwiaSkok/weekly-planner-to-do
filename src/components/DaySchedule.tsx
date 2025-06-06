import React, { useState } from "react";

// Typ dla pojedynczego zadania – co zawiera i jak go rozpoznać
export type Task = {
  id: string;
  title: string;
  start: string;
  end: string;
  color: string;
};

export default function DaySchedule({
  tasks,
  onEdit,
}: {
  tasks: Task[];
  onEdit: (id: string) => void;
}) {
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [checkedTasks, setCheckedTasks] = useState<string[]>([]);

  // Przełączanie odhaczenia zadania
  const toggleCheck = (id: string) => {
    setCheckedTasks((prev) =>
      prev.includes(id) ? prev.filter((tid) => tid !== id) : [...prev, id]
    );
  };

  // Parsowanie czasu (np. "09:00") na minuty od północy
  const parseTime = (time: string | null | undefined) => {
    if (!time || !time.includes(":")) return 0;
    const [h, m] = time.split(":").map(Number);
    return h * 60 + m;
  };

  // Sortuję zadania według godziny rozpoczęcia, a potem długości
  const sortedTasks = [...tasks].sort((a, b) => {
    const startA = parseTime(a.start);
    const startB = parseTime(b.start);
    if (startA !== startB) return startA - startB;
    const durationA = parseTime(a.end) - startA;
    const durationB = parseTime(b.end) - startB;
    return durationA - durationB;
  });

  // Opisuję czas trwania jako np. "1 godz. i 30 min"
  const getDurationText = (start: string, end: string) => {
    const dur = parseTime(end) - parseTime(start);
    const h = Math.floor(dur / 60);
    const m = dur % 60;
    if (h && m) return `${h} godz. i ${m} min`;
    if (h) return `${h} godz.`;
    return `${m} min`;
  };

  // Usuwanie zadania z potwierdzeniem
  const deleteTask = async (id: string) => {
    const confirmed = confirm("Czy na pewno chcesz usunąć to zadanie?");
    if (!confirmed) return;

    const res = await fetch(`/api/tasks?id=${id}`, {
      method: "DELETE",
    });

    if (res.ok) {
      location.reload();
    } else {
      alert("Nie udało się usunąć zadania");
    }
  };

  return (
    <div className="p-6 space-y-10 relative">
      {sortedTasks.map((task) => {
        const startMin = parseTime(task.start);
        const endMin = parseTime(task.end);
        const duration = endMin - startMin;

        // Obliczam wysokość słupka na podstawie długości zadania
        const getVisualHeight = (duration: number) => {
          if (duration <= 15) return 48;
          return Math.min(40 + Math.sqrt(duration) * 10.0, 300);
        };

        const heightPx = getVisualHeight(duration);
        const isChecked = checkedTasks.includes(task.id);
        const isShortTask = duration <= 15;

        return (
          <div
            key={task.id}
            // 🔄 Zmieniono układ: flex-wrap pozwala zawijać elementy na małych ekranach
            className="flex flex-wrap sm:flex-nowrap items-start gap-4 sm:gap-6 cursor-pointer relative"
            onClick={() =>
              setActiveTaskId(activeTaskId === task.id ? null : task.id)
            }
          >
            {/* Godzina rozpoczęcia */}
            <div className="min-w-[56px] text-right text-base text-gray-600 flex flex-col items-end">
              <span>{task.start}</span>
            </div>

            {/* Pasek kolorowy reprezentujący zadanie */}
            <div className="relative min-w-[40px] flex justify-center">
              <div
                className={`w-10 shadow ${
                  isShortTask ? "rounded-full" : "rounded-t-full rounded-b-full"
                }`}
                style={{
                  backgroundColor: task.color,
                  height: `${heightPx}px`,
                  transition: "height 0.2s ease",
                }}
              />
            </div>

            {/* Szczegóły zadania: godziny + tytuł */}
            <div className="flex-1 min-w-0">
              <div
                className={`text-base ${
                  isChecked ? "line-through text-gray-400" : "text-gray-500"
                }`}
              >
                {task.start}–{task.end} ({getDurationText(task.start, task.end)})
              </div>
              <div
                className={`text-2xl font-semibold ${
                  isChecked ? "line-through text-gray-400" : ""
                }`}
              >
                {task.title}
              </div>
            </div>

            {/* Odhaczanie, Edytuj i Usuń */}
            <div className="flex items-center gap-2 mt-2">
              {/* Kółko do odhaczania */}
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  toggleCheck(task.id);
                }}
                className="w-6 h-6 border-2 rounded-full cursor-pointer"
                style={{
                  borderColor: task.color,
                  backgroundColor: isChecked ? task.color : "transparent",
                }}
              />
              {/* Pokazuję przyciski tylko dla aktywnego zadania */}
              {activeTaskId === task.id && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(task.id);
                    }}
                    className="text-white px-3 py-1 rounded text-sm shadow hover:opacity-90"
                    style={{ backgroundColor: task.color }}
                  >
                    Edytuj
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteTask(task.id);
                    }}
                    className="text-white px-3 py-1 rounded text-sm shadow hover:opacity-90"
                    style={{ backgroundColor: task.color }}
                  >
                    Usuń
                  </button>
                </>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
