import React, { useState, useEffect, useRef } from "react";

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
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const popupRef = useRef<HTMLDivElement | null>(null);

  const toggleCheck = (id: string) => {
    setCheckedTasks((prev) =>
      prev.includes(id) ? prev.filter((tid) => tid !== id) : [...prev, id]
    );
  };

  const parseTime = (time: string | null | undefined) => {
    if (!time || !time.includes(":")) return 0;
    const [h, m] = time.split(":").map(Number);
    return h * 60 + m;
  };

  const sortedTasks = [...tasks].sort((a, b) => {
    const startA = parseTime(a.start);
    const startB = parseTime(b.start);
    if (startA !== startB) return startA - startB;
    const durationA = parseTime(a.end) - startA;
    const durationB = parseTime(b.end) - startB;
    return durationA - durationB;
  });

  const getDurationText = (start: string, end: string) => {
    const dur = parseTime(end) - parseTime(start);
    const h = Math.floor(dur / 60);
    const m = dur % 60;
    if (h && m) return `${h} godz. i ${m} min`;
    if (h) return `${h} godz.`;
    return `${m} min`;
  };

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

  // Zamykaj popup po kliknięciu poza zadanie
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        setActiveTaskId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="p-6 space-y-10">
      {sortedTasks.map((task) => {
        const startMin = parseTime(task.start);
        const endMin = parseTime(task.end);
        const duration = endMin - startMin;
        const heightPx = Math.min(40 + Math.sqrt(duration) * 10.0, 300);
        const isChecked = checkedTasks.includes(task.id);
        const isShortTask = duration <= 15;

        return (
          <div key={task.id} className="w-full flex justify-center">
            <div
              className="w-full max-w-[520px] flex gap-4 items-start sm:gap-6 cursor-pointer relative"
              onClick={() =>
                setActiveTaskId(activeTaskId === task.id ? null : task.id)
              }
              ref={activeTaskId === task.id ? popupRef : null}
            >
              {/* Godzina rozpoczęcia */}
              <div className="min-w-[56px] text-right text-base text-gray-600 flex flex-col items-end">
                <span>{task.start}</span>
              </div>

              {/* Pasek kolorowy */}
              <div className="relative min-w-[40px] flex justify-center">
                <div
                  className={`w-10 shadow ${
                    isShortTask
                      ? "rounded-full"
                      : "rounded-t-full rounded-b-full"
                  }`}
                  style={{
                    backgroundColor: task.color,
                    height: `${heightPx}px`,
                    transition: "height 0.2s ease",
                  }}
                />
              </div>

              {/* Szczegóły zadania */}
              <div className="flex-1 min-w-0">
                <div
                  className={`text-base ${
                    isChecked ? "line-through text-gray-400" : "text-gray-500"
                  }`}
                >
                  <div className="block sm:hidden">
                    <div>{task.start}–{task.end}</div>
                    <div>({getDurationText(task.start, task.end)})</div>
                  </div>
                  <div className="hidden sm:block">
                    {task.start}–{task.end} ({getDurationText(task.start, task.end)})
                  </div>
                </div>

                <div
                  className={`text-2xl font-semibold ${
                    isChecked ? "line-through text-gray-400" : ""
                  }`}
                >
                  {task.title}
                </div>

                {/* Popup z przyciskami */}
                {activeTaskId === task.id && (
                  <div className="flex justify-end gap-2 mt-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingTask(task);
                        setActiveTaskId(null);
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
                  </div>
                )}
              </div>

              {/* Checkbox */}
              <div className="flex items-center gap-2 mt-2 sm:mt-0">
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
              </div>
            </div>
          </div>
        );
      })}

      {/* MODAL: edycja */}
      {editingTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Edytuj zadanie</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                onEdit(editingTask.id);
                setEditingTask(null);
              }}
            >
              <div className="mb-4">
                <label className="block text-sm font-medium">Tytuł</label>
                <input
                  type="text"
                  className="w-full border p-2 rounded"
                  defaultValue={editingTask.title}
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  className="px-4 py-2 bg-gray-200 rounded"
                  onClick={() => setEditingTask(null)}
                >
                  Anuluj
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-pink-500 text-white rounded"
                >
                  Zapisz
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
