import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    const tasks = await prisma.task.findMany({
      orderBy: { createdAt: "asc" },
    });
    return res.status(200).json(tasks);
  }

  if (req.method === "POST") {
    const { title, date, duration, color, alert, start, end } = req.body;

    if (!title || !date || !duration) {
      return res.status(400).json({ error: "Brakuje wymaganych pól." });
    }

    const newTask = await prisma.task.create({
      data: {
        title,
        date,
        duration: Number(duration),
        color,
        start,
        end,
        alert: alert ?? true,
      },
    });

    return res.status(201).json(newTask);
  }

  if (req.method === "PUT") {
    const { id, title, date, duration, color, start, end } = req.body;

    if (!id || !title || !date || !duration || !start || !end) {
      return res.status(400).json({ error: "Brakuje wymaganych pól do aktualizacji." });
    }

    try {
      const updated = await prisma.task.update({
        where: { id },
        data: {
          title,
          date,
          duration: Number(duration),
          color,
          start,
          end,
        },
      });
      return res.status(200).json(updated);
    } catch (error) {
      return res.status(500).json({ error: "Nie udało się zaktualizować zadania." });
    }
  }

  if (req.method === "DELETE") {
    const { id } = req.query;

    try {
      await prisma.task.delete({
        where: { id: id as string },
      });
      return res.status(204).end();
    } catch (error) {
      return res.status(500).json({ error: "Nie udało się usunąć zadania" });
    }
  }

  res.setHeader("Allow", ["GET", "POST", "PUT", "DELETE"]);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
