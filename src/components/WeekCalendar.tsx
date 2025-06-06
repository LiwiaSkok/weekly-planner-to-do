import React from "react";

export default function WeekCalendar({
  selectedDate,
  onSelect,
  tasks,
  weekStart,
  onNextWeek,
  onPrevWeek,
}: {
  selectedDate: Date;
  onSelect: (date: Date) => void;
  tasks: { date: string; color: string }[];
  weekStart: Date;
  onNextWeek: () => void;
  onPrevWeek: () => void;
}) {
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    return d;
  });

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-2">
        <button onClick={onPrevWeek} className="text-lg font-bold">
          ←
        </button>

        <h2 className="text-lg font-semibold">
          <span className="text-pink-500 uppercase font-bold">
            {weekStart.toLocaleString("pl-PL", { month: "long" })}
          </span>{" "}
          <span className="text-black font-bold">
            {weekStart.getFullYear()}
          </span>
        </h2>

        <button onClick={onNextWeek} className="text-lg font-bold">
          →
        </button>
      </div>

      <div className="flex justify-between gap-2">
        {days.map((day) => {
          const isSelected = day.toDateString() === selectedDate.toDateString();
          const dayTasks = tasks.filter(
            (t) => new Date(t.date).toDateString() === day.toDateString()
          );

          const weekday = day.toLocaleDateString("pl-PL", { weekday: "short" });
          const dayNumber = day.getDate();

          return (
            <button
              key={day.toDateString()}
              onClick={() => onSelect(day)}
              className={`flex flex-col items-center w-full py-2 rounded-md transition border ${
                isSelected
                  ? "bg-pink-500 hover:bg-pink-600 text-white font-bold"
                  : "text-pink-500 hover:text-pink-600 font-bold text-xl"
              }`}
            >
              {/* Dzień tygodnia (np. "pon.") nad numerem dnia na małych ekranach */}
              <div className="flex flex-col sm:flex-row items-center sm:gap-1 text-sm capitalize">
                <span>{weekday}</span>
                <span>{dayNumber}</span>
              </div>

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
