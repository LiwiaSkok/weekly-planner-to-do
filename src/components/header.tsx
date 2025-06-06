import React from "react";
import { Plus } from "lucide-react"; // <- import ikony

export default function Header({ onAdd }: { onAdd: () => void }) {
  return (
    <header className="flex items-center justify-between p-4 border-b">
      <h1 className="text-2xl font-bold text-gray-800">.Organizee</h1>
      <button
        onClick={onAdd}
        className="w-12 h-12 rounded-full bg-pink-500 flex items-center justify-center shadow-md"
      >
        <Plus className="text-white w-6 h-6" /> {/*Plus*/}
      </button>
    </header>
  );
}
