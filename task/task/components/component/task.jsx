"use client"

import { useState, useEffect } from "react"
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Plus, Edit, Trash2, Clock as ClockIcon } from "lucide-react"

function LiveClock() {
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="flex items-center text-lg font-semibold">
      <ClockIcon className="mr-2 h-5 w-5" />
      {time.toLocaleTimeString()}
    </div>
  )
}

export function Task() {
  const [tasks, setTasks] = useState({
    Srivani: { tasks: [], streak: 0, lastCompleted: null },
    Prem: { tasks: [], streak: 0, lastCompleted: null },
    Ashish: { tasks: [], streak: 0, lastCompleted: null },
    Manish: { tasks: [], streak: 0, lastCompleted: null }
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [newTaskText, setNewTaskText] = useState("")
  const [editTaskText, setEditTaskText] = useState("")
  const [currentUser, setCurrentUser] = useState("")
  const [editingTask, setEditingTask] = useState(null)

  useEffect(() => {
    fetchTasks()
    const midnightCheck = setInterval(checkMidnight, 60000) // Check every minute
    return () => clearInterval(midnightCheck)
  }, [])

  const fetchTasks = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/tasks')
      if (!response.ok) throw new Error('Failed to fetch tasks')
      const taskData = await response.json()
      const formattedTasks = formatTasks(taskData)
      setTasks(formattedTasks)
    } catch (error) {
      console.error("Failed to fetch tasks:", error)
      setError('Failed to load tasks. Please try again later.')
    } finally {
      setIsLoading(false)
    }
  }

  const formatTasks = (taskData) => {
    const formattedTasks = {
      Srivani: { tasks: [], streak: 0, lastCompleted: null },
      Prem: { tasks: [], streak: 0, lastCompleted: null },
      Ashish: { tasks: [], streak: 0, lastCompleted: null },
      Manish: { tasks: [], streak: 0, lastCompleted: null }
    }
    taskData.forEach(task => {
      formattedTasks[task.user].tasks.push(task)
      formattedTasks[task.user].streak = task.streak || 0
      formattedTasks[task.user].lastCompleted = task.lastCompleted || null
    })
    return formattedTasks
  }

  const toggleTaskCompletion = async (name, id) => {
    try {
      const response = await fetch('/api/tasks', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, completed: !tasks[name].tasks.find(t => t._id === id).completed })
      })
      if (!response.ok) throw new Error('Failed to update task')
      fetchTasks()
    } catch (error) {
      console.error("Failed to toggle task completion:", error)
    }
  }

  const deleteTask = async (name, id) => {
    try {
      const response = await fetch(`/api/tasks?id=${id}`, { method: 'DELETE' })
      if (!response.ok) throw new Error('Failed to delete task')
      fetchTasks()
    } catch (error) {
      console.error("Failed to delete task:", error)
    }
  }

  const addTask = async () => {
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user: currentUser,
          text: newTaskText,
          completed: false,
          createdAt: new Date()
        })
      })
      if (!response.ok) throw new Error('Failed to add task')
      setIsAddModalOpen(false)
      setNewTaskText("")
      fetchTasks()
    } catch (error) {
      console.error("Failed to add task:", error)
    }
  }

  const editTask = async () => {
    try {
      const response = await fetch('/api/tasks', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editingTask._id, text: editTaskText })
      })
      if (!response.ok) throw new Error('Failed to edit task')
      setIsEditModalOpen(false)
      setEditTaskText("")
      setEditingTask(null)
      fetchTasks()
    } catch (error) {
      console.error("Failed to edit task:", error)
    }
  }

  const checkMidnight = async () => {
    const now = new Date()
    if (now.getHours() === 0 && now.getMinutes() === 0) {
      try {
        const response = await fetch('/api/tasks', { method: 'DELETE' })
        if (!response.ok) throw new Error('Failed to delete tasks')
        fetchTasks()
      } catch (error) {
        console.error("Failed to perform midnight tasks:", error)
      }
    }
  }

  const openAddTaskModal = (name) => {
    setCurrentUser(name)
    setIsAddModalOpen(true)
  }

  const openEditTaskModal = (name, task) => {
    setCurrentUser(name)
    setEditingTask(task)
    setEditTaskText(task.text)
    setIsEditModalOpen(true)
  }

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen bg-background text-foreground">Loading...</div>
  }

  if (error) {
    return <div className="flex justify-center items-center h-screen bg-background text-foreground">{error}</div>
  }

  return (
    <div className="min-h-screen w-full bg-background text-foreground">
      <div className="container mx-auto p-4">
        <div className="flex flex-col items-center mb-8 mt-12">
          <div className="flex items-center gap-4 mb-4">
            <h1 className="text-3xl font-bold">Task Manager</h1>
            <LiveClock />
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Leaderboard</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(tasks).map(([name, userData]) => (
              <Card key={name} className="rounded-lg overflow-hidden">
                <CardHeader className="flex flex-row justify-between items-center">
                  <h3 className="text-lg font-semibold">{name}</h3>
                  <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
                    Streak: {userData.streak} days
                  </span>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between mb-2">
                    <span>Tasks Completed</span>
                    <span>{userData.tasks.filter(t => t.completed).length}/{userData.tasks.length}</span>
                  </div>
                  <Progress 
                    value={(userData.tasks.filter(t => t.completed).length / userData.tasks.length) * 100} 
                    className="bg-secondary"
                    indicatorClassName="bg-primary"
                  />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-4">My Tasks</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(tasks).map(([name, userData]) => (
              <Card key={name} className="rounded-lg overflow-hidden">
                <CardHeader className="flex flex-row justify-between items-center">
                  <h3 className="text-lg font-semibold">{name}'s Tasks</h3>
                  <Button 
                    size="sm" 
                    onClick={() => openAddTaskModal(name)} 
                    className="rounded-full w-8 h-8 p-0"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </CardHeader>
                <CardContent>
                  {userData.tasks.map(task => (
                    <div key={task._id} className="flex items-center justify-between py-2 border-b last:border-b-0">
                      <div className="flex items-center">
                        <Checkbox
                          id={`task-${task._id}`}
                          checked={task.completed}
                          onCheckedChange={() => toggleTaskCompletion(name, task._id)}
                        />
                        <Label htmlFor={`task-${task._id}`} className="ml-2">{task.text}</Label>
                      </div>
                      <div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => openEditTaskModal(name, task)} 
                          className="p-0 h-8 w-8"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => deleteTask(name, task._id)} 
                          className="p-0 h-8 w-8 ml-2"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Task for {currentUser}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              value={newTaskText}
              onChange={(e) => setNewTaskText(e.target.value)}
              placeholder="Enter task description"
            />
          </div>
          <DialogFooter>
            <Button onClick={addTask}>
              Add Task
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Task for {currentUser}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              value={editTaskText}
              onChange={(e) => setEditTaskText(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button onClick={editTask}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
