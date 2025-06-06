import React from "react";

export default function WeekCalendar({
  selectedDate,       // aktualnie kliknięta data
  onSelect,           // funkcja wybierająca dzień
  tasks,              // lista zadań (z datami i kolorami)
  weekStart,          // pierwszy dzień tygodnia
  onNextWeek,         // klik → tydzień do przodu
  onPrevWeek,         // klik ← tydzień do tyłu
}: {
  selectedDate: Date;
  onSelect: (date: Date) => void;
  tasks: { date: string; color: string }[];
  weekStart: Date;
  onNextWeek: () => void;
  onPrevWeek: () => void;
}) {
  // Tworzę tablicę 7 kolejnych dni od weekStart (czyli tydzień)
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    return d;
  });

  // Formatuję dzień jako np. "pon. 3"
  const formatDay = (date: Date) =>
    date
      .toLocaleDateString("pl-PL", { weekday: "short", day: "numeric" })
      .replace(",", "");

  return (
    <div className="p-4">
      {/* Pasek nawigacji między tygodniami (strzałki + miesiąc i rok) */}
      <div className="flex justify-between items-center mb-2">
        {/* Strzałka ← cofanie tygodnia */}
        <button onClick={onPrevWeek} className="text-lg font-bold">
          ←
        </button>

        {/* Wyświetlam miesiąc (duże litery, różowy) + rok (czarny, pogrubiony) */}
        <h2 className="text-lg font-semibold">
          <span className="text-pink-500 uppercase font-bold">
            {weekStart.toLocaleString("pl-PL", { month: "long" })}
          </span>{" "}
          <span className="text-black font-bold">
            {weekStart.getFullYear()}
          </span>
        </h2>

        {/* Strzałka → przejście na kolejny tydzień */}
        <button onClick={onNextWeek} className="text-lg font-bold">
          →
        </button>
      </div>

      {/* Lista dni tygodnia (7 dni) */}
      <div className="flex justify-between gap-2">
        {days.map((day) => {
          const isSelected = day.toDateString() === selectedDate.toDateString();

          // Zbieram wszystkie zadania przypisane do danego dnia
          const dayTasks = tasks.filter(
            (t) => new Date(t.date).toDateString() === day.toDateString()
          );

          return (
            <button
              key={day.toDateString()}
              onClick={() => onSelect(day)}
              className={`flex flex-col items-center w-full py-2 rounded-md transition border ${
                isSelected
                  ? "bg-pink-500 hover:bg-pink-600 text-white font-bold" // kliknięty dzień
                  : "text-pink-500 hover:text-pink-600 font-bold text-xl" // reszta dni
              }`}
            >
              {/* Dzień tygodnia i numer (np. pon. 3) */}
              <span className="capitalize text-sm">{formatDay(day)}</span>

              {/* Kropki – każda reprezentuje jedno zadanie w danym dniu */}
              {dayTasks.length > 0 && (
                <div className="flex gap-1 mt-1 flex-wrap justify-center">
                  {dayTasks.map((t, i) => (
                    <span
                      key={i}
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: t.color }}
                    />
                  ))}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
