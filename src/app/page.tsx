"use client";

import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "~/components/ui/sheet";

import { Button } from "~/components/ui/button";
import { api } from "~/trpc/react";
import { Card, CardContent, CardFooter } from "~/components/ui/card";
import { Label } from "~/components/ui/label";
import { Input } from "~/components/ui/input";
import { CheckCheck, Edit, Trash } from "lucide-react";

export default function HomePage() {
  const [currentTodo, setCurrentTodo] = useState<{
    id: string;
    title: string;
    content: string;
  } | null>(null);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const { data: todos = [] } = api.todo.getAll.useQuery();
  const utils = api.useUtils();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);

  const addTodo = api.todo.store.useMutation({
    onSuccess: async () => {
      await utils.todo.getAll.invalidate();
      setIsSheetOpen(false);
    },
  });

  const deleteTodo = api.todo.delete.useMutation({
    onSuccess: async () => {
      await utils.todo.getAll.invalidate();
    },
  });

  const updateTodo = api.todo.update.useMutation({
    onSuccess: async () => {
      await utils.todo.getAll.invalidate();
      setIsEditSheetOpen(false);
    },
  });

  const checkTodo = api.todo.handleComplete.useMutation({
    onSuccess: async () => {
      await utils.todo.getAll.invalidate();
    },
  });

  const handleOpenSheet = () => setIsSheetOpen(true);
  const handleOpenEditSheet = (todo: {
    id: string;
    title: string;
    content: string;
  }) => {
    setCurrentTodo(todo);
    setTitle(todo.title);
    setContent(todo.content);
    setIsEditSheetOpen(true);
  };

  return (
    <>
      <main className="flex h-screen items-center justify-center">
        <div className="flex flex-col">
          {/* Todo List */}

          <div
            className={
              todos.length < 1
                ? "hidden"
                : "h-full w-[400px] rounded-lg border border-black"
            }
          >
            <div className="m-4">
              <div className="flex flex-col gap-y-3">
                {todos.map((todo) => (
                  <Card
                    key={todo.id}
                    className="w-full rounded-lg border border-blue-800"
                  >
                    <CardContent>
                      <div className="grid grid-cols-2">
                        <div className="flex flex-col">
                          <h1>{todo.title}</h1>
                          <p>{todo.content}</p>
                        </div>
                        <div className="flex items-center justify-end">
                          <div
                            className={
                              todo.status == "UNCOMPLETED"
                                ? "w-[120px] rounded-md bg-red-600 py-2 text-center text-sm text-white"
                                : "w-[120px] rounded-md bg-blue-600 py-2 text-center text-sm text-white"
                            }
                          >
                            {todo.status}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-end gap-x-2">
                      <Button
                        onClick={() =>
                          handleOpenEditSheet({
                            id: todo.id,
                            title: todo.title,
                            content: String(todo.content),
                          })
                        }
                        className="bg-blue-600 hover:bg-blue-400"
                        size={"icon"}
                      >
                        <Edit />
                      </Button>
                      <Button
                        disabled={todo.status == "COMPLETED" ? true : false}
                        onClick={() => checkTodo.mutate({ id: todo.id })}
                        className={
                          todo.status == "UNCOMPLETED"
                            ? "bg-gray-900"
                            : "bg-green-900"
                        }
                        size="icon"
                      >
                        <CheckCheck />
                      </Button>
                      <Button
                        onClick={() => deleteTodo.mutate({ id: todo.id })}
                        variant={"destructive"}
                        size="icon"
                      >
                        <Trash />
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-4">
            <Button onClick={handleOpenSheet}>Add Todo</Button>
          </div>
        </div>
      </main>

      {isSheetOpen ? (
        <Sheet open={isSheetOpen} onOpenChange={() => setIsSheetOpen(false)}>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Todo Form</SheetTitle>
              <SheetDescription>
                Fill the all fields to create a new Todo
              </SheetDescription>
            </SheetHeader>
            <div className="m-4">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (title && content) addTodo.mutate({ title, content });
                }}
              >
                <div className="my-3">
                  <Label>Title</Label>
                  <Input
                    onChange={(e) => setTitle(e.target.value)}
                    className="mt-2 border-2 border-black"
                    type="text"
                  />
                </div>
                <div className="my-3">
                  <Label>Content</Label>
                  <textarea
                    onChange={(e) => setContent(e.target.value)}
                    className="mt-2 w-full rounded-md border border-black p-2"
                  ></textarea>
                </div>
                <Button type={"submit"} className="w-full bg-blue-600">
                  Save Changes
                </Button>
              </form>
            </div>
          </SheetContent>
        </Sheet>
      ) : null}

      {isEditSheetOpen ? (
        <Sheet
          open={isEditSheetOpen}
          onOpenChange={() => setIsEditSheetOpen(false)}
        >
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Edit Todo Form</SheetTitle>
              <SheetDescription>
                Fill the all fields to update current todo
              </SheetDescription>
            </SheetHeader>
            <div className="m-4">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (currentTodo && title && content) {
                    updateTodo.mutate({ id: currentTodo.id, title, content });
                  }
                }}
              >
                <div className="my-3">
                  <Label>Title</Label>
                  <Input
                    onChange={(e) => setTitle(e.target.value)}
                    className="mt-2 border-2 border-black"
                    type="text"
                  />
                </div>
                <div className="my-3">
                  <Label>Content</Label>
                  <textarea
                    onChange={(e) => setContent(e.target.value)}
                    className="mt-2 w-full rounded-md border border-black p-2"
                  ></textarea>
                </div>
                <Button type={"submit"} className="w-full bg-blue-600">
                  Save Changes
                </Button>
              </form>
            </div>
          </SheetContent>
        </Sheet>
      ) : null}
    </>
  );
}
