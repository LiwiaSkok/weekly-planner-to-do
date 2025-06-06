import React, { useState } from "react";

// Komponent modalny do dodawania lub edytowania zadania
export default function AddTaskModal({
  onClose,          // zamknięcie modala (✕)
  onCreate,         // funkcja tworząca nowe zadanie
  onUpdate,         // funkcja aktualizująca istniejące zadanie (opcjonalnie)
  initialDate,      // data startowa (np. kliknięty dzień w kalendarzu)
  taskToEdit,       // jeśli podane, to edytujemy zadanie zamiast tworzyć
}: {
  onClose: () => void;
  onCreate: (task: any) => void;
  onUpdate?: (task: any) => void;
  initialDate: Date;
  taskToEdit?: any;
}) {
  // Pola formularza (z wczytaniem istniejących danych, jeśli edytujemy)
  const [title, setTitle] = useState(taskToEdit?.title || "");
  const [start, setStart] = useState(taskToEdit?.start || "09:00");
  const [duration, setDuration] = useState(taskToEdit?.duration || 15);
  const [color, setColor] = useState(taskToEdit?.color || "#f87171");

  // Formatowanie daty do „yyyy-mm-dd”
  const [date, setDate] = useState(() => {
    if (taskToEdit?.date) {
      const d = new Date(taskToEdit.date);
      return d.toISOString().split("T")[0];
    }
    const localDate = new Date(initialDate.getTime() - initialDate.getTimezoneOffset() * 60000);
    return localDate.toISOString().split("T")[0];
  });

  // Własne ustawienie długości (opcjonalne suwaki)
  const [customHours, setCustomHours] = useState(0);
  const [customMinutes, setCustomMinutes] = useState(0);
  const isCustom = customHours + customMinutes > 0;

  // Obsługa kliknięcia przycisku „Zapisz” / „Stwórz”
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Rozbijam godzinę na liczby
    const [h, m] = start.split(":").map(Number);
    const startDate = new Date(`${date}T${start}`);
    startDate.setHours(h, m);

    // Obliczam czas zakończenia
    const endDate = new Date(startDate);
    const totalDuration = isCustom ? customHours * 60 + customMinutes : duration;
    endDate.setMinutes(startDate.getMinutes() + totalDuration);

    // Buduję payload do zapisu/edycji
    const payload = {
      ...taskToEdit,
      title,
      date: startDate.toISOString(),
      start,
      end: endDate.toTimeString().slice(0, 5), // tylko "HH:MM"
      duration: totalDuration,
      color,
    };

    // Wysyłam do update lub create w zależności od trybu
    if (taskToEdit && onUpdate) {
      onUpdate(payload);
    } else {
      onCreate({ ...payload, alert: true });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-lg relative">
        {/* Przycisk zamykania (✕) */}
        <button onClick={onClose} className="absolute right-4 top-4 text-gray-500 hover:text-black">
          ✕
        </button>

        {/* Nagłówek modala */}
        <h2 className="text-2xl font-bold mb-4">
          {taskToEdit ? "Edytuj" : "Nowe"} <span className="text-pink-500">zadanie</span>
        </h2>

        {/* Formularz dodawania/edycji zadania */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nazwa zadania */}
          <input
            type="text"
            placeholder="Nazwa zadania"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border rounded px-4 py-2"
            required
          />

          {/* Wybór daty */}
          <label className="block text-sm font-medium">Data</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full border rounded px-4 py-2"
            required
          />

          {/* Wybór godziny startu */}
          <label className="block text-sm font-medium">Godzina</label>
          <input
            type="time"
            value={start}
            onChange={(e) => setStart(e.target.value)}
            className="w-full border rounded px-4 py-2"
          />

          {/* Wybór długości zadania */}
          <label className="block text-sm font-medium">Jak długo?</label>
          <select
            value={isCustom ? "custom" : duration}
            onChange={(e) => {
              if (e.target.value === "custom") {
                setCustomHours(1);
                setCustomMinutes(0);
              } else {
                setCustomHours(0);
                setCustomMinutes(0);
                setDuration(Number(e.target.value));
              }
            }}
            className="w-full border rounded px-4 py-2"
          >
            <option value={15}>15 minut</option>
            <option value={30}>30 minut</option>
            <option value={45}>45 minut</option>
            <option value={60}>1 godzina</option>
            <option value="custom">Własny czas</option>
          </select>

          {/* Suwaki: własny czas trwania */}
          {isCustom && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Godziny: <span className="font-semibold">{customHours}</span>
                </label>
                <input
                  type="range"
                  min={0}
                  max={24}
                  step={1}
                  value={customHours}
                  onChange={(e) => setCustomHours(Number(e.target.value))}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Minuty (co 15): <span className="font-semibold">{customMinutes}</span>
                </label>
                <input
                  type="range"
                  min={0}
                  max={45}
                  step={15}
                  value={customMinutes}
                  onChange={(e) => setCustomMinutes(Number(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>
          )}

          {/* Wybór koloru – jako małe okrągłe przyciski */}
          <label className="block text-sm font-medium">Jaki kolor?</label>
          <div className="flex gap-2 flex-wrap">
            {[
              "#f87171", "#fb923c", "#facc15", "#FFFF33",
              "#00BFFF", "#2dd4bf", "#4ade80", "#60a5fa",
              "#a78bfa", "#FFCBDD",
            ].map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={`w-8 h-8 rounded-full ${c === color ? "ring-2 ring-pink-400" : ""}`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>

          {/* Przycisk zapisu */}
          <button type="submit" className="w-full bg-pink-500 text-white py-2 rounded hover:bg-pink-600">
            {taskToEdit ? "Zapisz zmiany" : "Stwórz zadanie"}
          </button>
        </form>
      </div>
    </div>
  );
}
