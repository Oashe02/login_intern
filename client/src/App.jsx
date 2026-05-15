import { useState, useEffect } from 'react'
import './index.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5005/api/auth'

function App() {
  const [isLogin, setIsLogin] = useState(true)
  const [formData, setFormData] = useState({ name: '', email: '', password: '' })
  const [user, setUser] = useState(null)
  const [tasks, setTasks] = useState([])
  const [newTask, setNewTask] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Check token on load
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      fetchUser(token)
    }
  }, [])

  useEffect(() => {
    if (user) fetchTasks()
  }, [user])

  const fetchUser = async (token) => {
    try {
      setLoading(true)
      const res = await fetch(`${API_URL.replace('/api/auth', '/api/auth')}/me`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      if (res.ok) {
        setUser(data.user)
      } else {
        localStorage.removeItem('token')
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const fetchTasks = async () => {
    const token = localStorage.getItem('token')
    const res = await fetch(`${API_URL.replace('/api/auth', '/api/tasks')}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    const data = await res.json()
    if (res.ok) setTasks(data)
  }

  const addTask = async (e) => {
    e.preventDefault()
    if (!newTask.trim()) return
    const token = localStorage.getItem('token')
    const res = await fetch(`${API_URL.replace('/api/auth', '/api/tasks')}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ text: newTask })
    })
    if (res.ok) {
      setNewTask('')
      fetchTasks()
    }
  }

  const toggleTask = async (id) => {
    const token = localStorage.getItem('token')
    await fetch(`${API_URL.replace('/api/auth', '/api/tasks')}/${id}`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` }
    })
    fetchTasks()
  }

  const deleteTask = async (id) => {
    const token = localStorage.getItem('token')
    await fetch(`${API_URL.replace('/api/auth', '/api/tasks')}/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    })
    fetchTasks()
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    try {
      const endpoint = isLogin ? '/login' : '/register'
      const res = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      
      const data = await res.json()
      
      if (!res.ok) {
        throw new Error(data.error || 'Something went wrong')
      }
      
      if (!isLogin) {
        setIsLogin(true);
        setFormData({ ...formData, password: '' });
      } else {
        localStorage.setItem('token', data.token)
        setUser(data.user)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    setUser(null)
    setTasks([])
    setFormData({ name: '', email: '', password: '' })
  }

  return (
    <>
      <div className="app-container">
        <div className="glass-card">
          {user ? (
            <div className="dashboard">
              <div className="avatar">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="header">
                <h1>Hi, {user.name.split(' ')[0]}</h1>
                <p>Manage your tasks below</p>
              </div>

              <form onSubmit={addTask} className="task-form">
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="New task..."
                  value={newTask}
                  onChange={(e) => setNewTask(e.target.value)}
                />
                <button type="submit" className="btn small-btn">Add</button>
              </form>

              <div className="task-list">
                {tasks.map(task => (
                  <div key={task.id} className={`task-item ${task.completed ? 'completed' : ''}`}>
                    <span onClick={() => toggleTask(task.id)}>{task.text}</span>
                    <button onClick={() => deleteTask(task.id)} className="delete-btn">&times;</button>
                  </div>
                ))}
              </div>

              <button className="btn logout-btn" onClick={handleLogout}>
                Logout
              </button>
            </div>
          ) : (
            <>
              <div className="header">
                <h1>{isLogin ? 'Welcome Back' : 'Create Account'}</h1>
                <p>{isLogin ? 'Enter your details to access your account.' : 'Join us to get started today.'}</p>
              </div>

              <div className="tabs">
                <div 
                  className={`tab ${isLogin ? 'active' : ''}`} 
                  onClick={() => { setIsLogin(true); setError(''); }}
                >
                  Login
                </div>
                <div 
                  className={`tab ${!isLogin ? 'active' : ''}`} 
                  onClick={() => { setIsLogin(false); setError(''); }}
                >
                  Register
                </div>
              </div>

              {error && (
                <div className="error-msg">
                  <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                {!isLogin && (
                  <div className="form-group">
                    <label>Full Name</label>
                    <input 
                      type="text" 
                      name="name" 
                      className="form-control" 
                      placeholder="John Doe"
                      value={formData.name}
                      onChange={handleChange}
                    />
                  </div>
                )}
                <div className="form-group">
                  <label>Email Address</label>
                  <input 
                    type="email" 
                    name="email" 
                    className="form-control" 
                    placeholder="name@example.com"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label>Password</label>
                  <input 
                    type="password" 
                    name="password" 
                    className="form-control" 
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                  />
                </div>
                <button type="submit" className="btn" disabled={loading}>
                  {loading ? <div className="loader"></div> : (isLogin ? 'Sign In' : 'Sign Up')}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </>
  )
}

export default App
