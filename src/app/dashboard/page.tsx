'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

type Task = {
  id: string
  title: string
  completed: boolean
  createdAt: string
}

export default function DashboardPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState<'all' | 'completed' | 'incomplete'>('all')
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const router = useRouter()
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null

  useEffect(() => {
    if (!token) {
      router.push('/login')
      return
    }

    fetch('/api/tasks', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async res => {
        if (!res.ok) {
          const err = await res.json()
          throw new Error(err.error || 'Gagal mengambil task')
        }
        return res.json()
      })
      .then(data => setTasks(data.tasks))
      .catch((err: unknown) => {
        if (err instanceof Error) {
          setError(err.message)
        } else {
          setError('Terjadi kesalahan')
        }
      })
      .finally(() => setLoading(false))
  }, [router, token])

  const toggleComplete = async (taskId: string) => {
    if (!token) return
    const res = await fetch(`/api/tasks/${taskId}/complete`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` },
    })
    if (res.ok) {
      setTasks(prev =>
        prev.map(t => (t.id === taskId ? { ...t, completed: !t.completed } : t))
      )
    }
  }

  const deleteTask = async (taskId: string) => {
    if (!token) return
    const res = await fetch(`/api/tasks/${taskId}/delete`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    })
    if (res.ok) {
      setTasks(prev => prev.filter(t => t.id !== taskId))
    }
  }

  const addTask = async () => {
    if (!token || newTaskTitle.trim() === '') return
    const res = await fetch('/api/tasks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ title: newTaskTitle }),
    })
    if (res.ok) {
      const data = await res.json()
      setTasks(prev => [data.task, ...prev])
      setNewTaskTitle('')
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    router.push('/login')
  }

  const filteredTasks =
    filter === 'all'
      ? tasks
      : tasks.filter(t => (filter === 'completed' ? t.completed : !t.completed))

  if (loading) return <p className="text-center mt-10">Loading tasks...</p>
  if (error) return <p className="text-center text-red-500 mt-10">{error}</p>

  return (
    <div className="max-w-3xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">🗂️ Task Dashboard</h1>
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-red-100 text-red-600 rounded hover:bg-red-200 transition dark:bg-red-800 dark:text-white"
        >
          Logout
        </button>
      </div>

      <div className="mb-6 flex items-center gap-2">
        <input
          value={newTaskTitle}
          onChange={e => setNewTaskTitle(e.target.value)}
          className="flex-1 px-3 py-2 border rounded-lg shadow-sm dark:bg-gray-800 dark:text-white"
          placeholder="Tambahkan task baru..."
        />
        <button
          onClick={addTask}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Tambah
        </button>
      </div>

      <div className="mb-4 flex gap-2">
        <button onClick={() => setFilter('all')} className={`px-3 py-1 rounded ${filter === 'all' ? 'bg-gray-800 text-white' : 'bg-gray-200'} dark:bg-gray-700 dark:text-white`}>
          Semua
        </button>
        <button onClick={() => setFilter('completed')} className={`px-3 py-1 rounded ${filter === 'completed' ? 'bg-gray-800 text-white' : 'bg-gray-200'} dark:bg-gray-700 dark:text-white`}>
          Selesai
        </button>
        <button onClick={() => setFilter('incomplete')} className={`px-3 py-1 rounded ${filter === 'incomplete' ? 'bg-gray-800 text-white' : 'bg-gray-200'} dark:bg-gray-700 dark:text-white`}>
          Belum
        </button>
      </div>

      {filteredTasks.length === 0 ? (
        <p className="text-center text-gray-500">Tidak ada task.</p>
      ) : (
        <div className="grid gap-4">
          {filteredTasks.map(task => (
            <div
              key={task.id}
              className="p-4 rounded-2xl shadow-md bg-white border hover:shadow-lg transition-all duration-200 dark:bg-gray-800 dark:text-white"
            >
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-lg font-semibold">{task.title}</h2>
                <span
                  className={`px-3 py-1 text-xs font-bold rounded-full ${
                    task.completed
                      ? 'bg-green-100 text-green-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}
                >
                  {task.completed ? 'Selesai' : 'Belum'}
                </span>
              </div>
              <p className="text-xs text-gray-400 mb-2">
                Dibuat: {new Date(task.createdAt).toLocaleString()}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => toggleComplete(task.id)}
                  className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                >
                  {task.completed ? 'Batalkan' : 'Selesaikan'}
                </button>
                <button
                  onClick={() => deleteTask(task.id)}
                  className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
                >
                  Hapus
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
