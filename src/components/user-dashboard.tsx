// components/user-dashboard.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../lib/auth-context';
import { collection, query, where, getDocs, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface Task {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  createdAt: Date;
  userId: string;
}

const UserDashboard: React.FC = () => {
  const { user, userProfile, logout } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchTasks = async () => {
    if (!user) return;

    try {
      const q = query(collection(db, 'tasks'), where('userId', '==', user.uid));
      const querySnapshot = await getDocs(q);
      const userTasks: Task[] = [];

      querySnapshot.forEach((doc) => {
        userTasks.push({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt.toDate()
        } as Task);
      });

      setTasks(userTasks.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()));
    } catch (error) {
      console.warn('Firestore connection error - tasks feature unavailable:', error);
      // You could show a message to the user here if needed
      setTasks([]);
    }
  };

  const addTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newTaskTitle.trim()) return;

    setLoading(true);
    try {
      const newTask = {
        title: newTaskTitle,
        description: newTaskDescription,
        completed: false,
        createdAt: new Date(),
        userId: user.uid
      };

      await addDoc(collection(db, 'tasks'), newTask);
      setNewTaskTitle('');
      setNewTaskDescription('');
      await fetchTasks();
    } catch (error) {
      console.warn('Firestore connection error - unable to add task:', error);
      // You could show a toast notification here
    } finally {
      setLoading(false);
    }
  };

  const toggleTask = async (taskId: string, completed: boolean) => {
    try {
      const taskRef = doc(db, 'tasks', taskId);
      await updateDoc(taskRef, { completed: !completed });
      await fetchTasks();
    } catch (error) {
      console.warn('Firestore connection error - unable to update task:', error);
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      await deleteDoc(doc(db, 'tasks', taskId));
      await fetchTasks();
    } catch (error) {
      console.warn('Firestore connection error - unable to delete task:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [user]);

  if (!user || !userProfile) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black text-white">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
          <p>Please sign in to view your dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0d0d1f] via-[#1b1b3a] to-[#0d0d1f] text-gray-100">
      <header className="bg-[#1e1e2f] shadow border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-white">Dashboard</h1>
              <p className="text-gray-400">Welcome back, {userProfile.displayName}!</p>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile and Stats */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-[#252538] rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Profile Information</h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-400">Display Name</p>
                  <p className="text-white">{userProfile.displayName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-400">Email</p>
                  <p className="text-white">{userProfile.email}</p>
                </div>
              </div>
            </div>

            <div className="bg-[#252538] rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Task Statistics</h2>
              <div className="space-y-3">
                <div className="flex justify-between text-gray-300">
                  <span>Total Tasks</span>
                  <span className="font-semibold">{tasks.length}</span>
                </div>
                <div className="flex justify-between text-green-400">
                  <span>Completed</span>
                  <span className="font-semibold">
                    {tasks.filter(task => task.completed).length}
                  </span>
                </div>
                <div className="flex justify-between text-yellow-400">
                  <span>Pending</span>
                  <span className="font-semibold">
                    {tasks.filter(task => !task.completed).length}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Tasks Manager */}
          <div className="lg:col-span-2">
            <div className="bg-[#252538] rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Task Manager</h2>

              <form onSubmit={addTask} className="mb-6 p-4 bg-[#1e1e2f] rounded-lg border border-gray-700">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label htmlFor="taskTitle" className="block text-sm font-medium text-gray-300 mb-1">
                      Task Title
                    </label>
                    <input
                      type="text"
                      id="taskTitle"
                      value={newTaskTitle}
                      onChange={(e) => setNewTaskTitle(e.target.value)}
                      className="w-full px-3 py-2 bg-[#2c2c3e] text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Enter task title..."
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="taskDescription" className="block text-sm font-medium text-gray-300 mb-1">
                      Description (Optional)
                    </label>
                    <textarea
                      id="taskDescription"
                      value={newTaskDescription}
                      onChange={(e) => setNewTaskDescription(e.target.value)}
                      className="w-full px-3 py-2 bg-[#2c2c3e] text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Enter task description..."
                      rows={3}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-gradient-to-r from-purple-600 to-blue-500 text-white px-4 py-2 rounded-md hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50"
                  >
                    {loading ? 'Adding...' : 'Add Task'}
                  </button>
                </div>
              </form>

              <div className="space-y-3">
                {tasks.length === 0 ? (
                  <p className="text-gray-400 text-center py-8">
                    No tasks yet. Add your first task above!
                  </p>
                ) : (
                  tasks.map((task) => (
                    <div
                      key={task.id}
                      className={`p-4 border rounded-lg ${
                        task.completed
                          ? 'bg-green-900/30 border-green-600'
                          : 'bg-[#2a2a3d] border-gray-600'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          <input
                            type="checkbox"
                            checked={task.completed}
                            onChange={() => toggleTask(task.id, task.completed)}
                            className="mt-1 h-4 w-4 text-blue-500 focus:ring-blue-400 border-gray-300 rounded"
                          />
                          <div>
                            <h3 className={`font-medium ${
                              task.completed ? 'text-gray-400 line-through' : 'text-white'
                            }`}>
                              {task.title}
                            </h3>
                            {task.description && (
                              <p className={`text-sm mt-1 ${
                                task.completed ? 'text-gray-500' : 'text-gray-300'
                              }`}>
                                {task.description}
                              </p>
                            )}
                            <p className="text-xs text-gray-500 mt-2">
                              Created: {task.createdAt.toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => deleteTask(task.id)}
                          className="text-red-500 hover:text-red-700 text-sm font-medium"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
