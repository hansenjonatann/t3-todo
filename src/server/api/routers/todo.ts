import * as z from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { db } from "~/server/db";

export const todoRoutes = createTRPCRouter({
  getAll: publicProcedure.query(async () => {
    return db.todo.findMany();
  }),

  store: publicProcedure
    .input(
      z.object({
        title: z.string(),
        content: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      const todo = await db.todo.create({
        data: {
          title: input.title,
          content: input.content,
          status: "UNCOMPLETED",
        },
      });
      return todo;
    }),

  detail: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const todo = await db.todo.findFirst({
        where: {
          id: input.id,
        },
      });
      return todo;
    }),

  update: publicProcedure
    .input(z.object({ id: z.string(), title: z.string(), content: z.string() }))
    .mutation(async ({ input }) => {
      const updatedtodo = await db.todo.update({
        data: {
          title: input.title,
          content: input.content,
        },
        where: {
          id: input.id,
        },
      });
      return updatedtodo;
    }),

  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      await db.todo.delete({
        where: {
          id: input.id,
        },
      });
    }),

  handleComplete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      await db.todo.update({
        data: {
          status: "COMPLETED",
        },
        where: {
          id: input.id,
        },
      });
    }),
});
