import React, { useState, useEffect } from 'react'
import { supabase, isConfigured } from './supabase'

export default function App() {
  const [todos, setTodos] = useState([])
  const [inputTitle, setInputTitle] = useState('')
  const [filter, setFilter] = useState('all') // 'all' | 'active' | 'completed'
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState(null)

  // 1. [Read] 할 일 목록 가져오기
  const fetchTodos = async () => {
    if (!isConfigured) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('todos')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setTodos(data || [])
      setErrorMessage(null)
    } catch (err) {
      console.error('Fetch error:', err)
      setErrorMessage('데이터를 불러오지 못했습니다: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTodos()
  }, [])

  // 2. [Create] 할 일 추가하기
  const handleAddTodo = async (e) => {
    e.preventDefault()
    const trimmed = inputTitle.trim()
    if (!trimmed || submitting) return

    if (!isConfigured) {
      alert('.env 파일에 Supabase URL과 KEY를 먼저 설정해주세요!')
      return
    }

    try {
      setSubmitting(true)
      const { data, error } = await supabase
        .from('todos')
        .insert([{ title: trimmed, is_completed: false }])
        .select()

      if (error) throw error

      if (data && data.length > 0) {
        setTodos([data[0], ...todos])
      } else {
        await fetchTodos()
      }
      setInputTitle('')
    } catch (err) {
      console.error('Add error:', err)
      alert('추가 실패: ' + err.message)
    } finally {
      setSubmitting(false)
    }
  }

  // 3. [Update] 완료 토글
  const handleToggle = async (todo) => {
    if (!isConfigured) return

    const updatedStatus = !todo.is_completed
    // 낙관적 업데이트 (UI 즉시 반영)
    setTodos(todos.map((t) => (t.id === todo.id ? { ...t, is_completed: updatedStatus } : t)))

    try {
      const { error } = await supabase
        .from('todos')
        .update({ is_completed: updatedStatus })
        .eq('id', todo.id)

      if (error) throw error
    } catch (err) {
      console.error('Toggle error:', err)
      // 실패 시 롤백
      setTodos(todos.map((t) => (t.id === todo.id ? { ...t, is_completed: todo.is_completed } : t)))
      alert('상태 변경 실패: ' + err.message)
    }
  }

  // 4. [Delete] 할 일 삭제
  const handleDelete = async (id) => {
    if (!isConfigured) return

    // 낙관적 삭제
    const prevTodos = [...todos]
    setTodos(todos.filter((t) => t.id !== id))

    try {
      const { error } = await supabase.from('todos').delete().eq('id', id)
      if (error) throw error
    } catch (err) {
      console.error('Delete error:', err)
      setTodos(prevTodos) // 롤백
      alert('삭제 실패: ' + err.message)
    }
  }

  // 필터링 적용
  const filteredTodos = todos.filter((todo) => {
    if (filter === 'active') return !todo.is_completed
    if (filter === 'completed') return todo.is_completed
    return true
  })

  const remainingCount = todos.filter((t) => !t.is_completed).length

  return (
    <div className="app-container">
      {/* 헤더 */}
      <header className="header">
        <div className="badge">Supabase × Vibe Coding</div>
        <h1 className="title">오늘의 할 일</h1>
        <p className="subtitle">클라우드 데이터베이스에 실시간으로 동기화되는 투두리스트</p>
      </header>

      {/* 환경변수 미설정 시 안내 배너 */}
      {!isConfigured && (
        <div className="config-warning">
          <h3>⚠️ Supabase 연결 필요</h3>
          <p>
            <code>todo-app/.env</code> 파일에 Supabase <strong>URL</strong>과 <strong>ANON_KEY</strong>를 입력하면 바로 실시간 연동됩니다.
          </p>
          <p style={{ margin: 0, fontSize: '0.82rem', color: '#94a3b8' }}>
            Supabase 대시보드 &gt; Project Settings &gt; API 메뉴에서 확인하실 수 있습니다.
          </p>
        </div>
      )}

      {/* 에러 메시지 배너 */}
      {errorMessage && (
        <div className="config-warning" style={{ borderColor: 'rgba(244, 63, 94, 0.4)', background: 'rgba(244, 63, 94, 0.1)' }}>
          <h3 style={{ color: '#fb7185' }}>에러 발생</h3>
          <p style={{ margin: 0 }}>{errorMessage}</p>
        </div>
      )}

      {/* 입력 폼 (Create) */}
      <form className="todo-form" onSubmit={handleAddTodo}>
        <input
          type="text"
          className="todo-input"
          placeholder="새로운 할 일을 입력하세요..."
          value={inputTitle}
          onChange={(e) => setInputTitle(e.target.value)}
          disabled={submitting}
        />
        <button type="submit" className="btn-add" disabled={submitting || !inputTitle.trim()}>
          {submitting ? '추가 중...' : '추가'}
        </button>
      </form>

      {/* 필터 탭 & 상태 요약 */}
      <div className="tab-bar">
        <div className="filter-group">
          <button
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            전체
          </button>
          <button
            className={`filter-btn ${filter === 'active' ? 'active' : ''}`}
            onClick={() => setFilter('active')}
          >
            진행 중
          </button>
          <button
            className={`filter-btn ${filter === 'completed' ? 'active' : ''}`}
            onClick={() => setFilter('completed')}
          >
            완료
          </button>
        </div>
        <div className="stats-count">{remainingCount}개 남음</div>
      </div>

      {/* 투두 리스트 (Read, Update, Delete) */}
      {loading ? (
        <div className="empty-state">데이터를 동기화하고 있습니다...</div>
      ) : filteredTodos.length === 0 ? (
        <div className="empty-state">
          {todos.length === 0 ? '등록된 할 일이 없습니다. 첫 할 일을 추가해보세요!' : '해당 조건의 할 일이 없습니다.'}
        </div>
      ) : (
        <ul className="todo-list">
          {filteredTodos.map((todo) => (
            <li key={todo.id} className={`todo-item ${todo.is_completed ? 'completed' : ''}`}>
              <div className="todo-content" onClick={() => handleToggle(todo)}>
                <div className="custom-checkbox">
                  <span className="check-icon">✓</span>
                </div>
                <span className="todo-text">{todo.title}</span>
              </div>
              <button
                className="btn-delete"
                onClick={() => handleDelete(todo.id)}
                title="삭제"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
