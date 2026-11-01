import { useEffect, useState, useCallback } from 'react'
import { supabase, isConfigured } from './supabase'

// 강의 상태(현재 단계, 학생 수)와 현재 단계 완료 수를 실시간으로 구독
export function useClassState() {
  const [session, setSession] = useState(null)
  const [checks, setChecks] = useState([])
  const [error, setError] = useState(null)

  const refresh = useCallback(async () => {
    if (!isConfigured) return
    const { data: s, error: e1 } = await supabase
      .from('class_session')
      .select('*')
      .eq('id', 1)
      .single()
    if (e1) {
      setError(e1.message)
      return
    }
    const { data: c, error: e2 } = await supabase
      .from('class_checks')
      .select('client_id')
      .eq('step', s.current_step)
    if (e2) {
      setError(e2.message)
      return
    }
    setError(null)
    setSession(s)
    setChecks(c.map((r) => r.client_id))
  }, [])

  useEffect(() => {
    if (!isConfigured) return
    refresh()

    const channel = supabase
      .channel('class-check')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'class_session' }, refresh)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'class_checks' }, refresh)
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') refresh()
      })

    // 폰 화면이 꺼졌다 켜지면 연결이 끊겼을 수 있으니 다시 불러오기
    const onVisible = () => {
      if (document.visibilityState === 'visible') refresh()
    }
    document.addEventListener('visibilitychange', onVisible)
    // 혹시 모를 실시간 누락 대비 5초 주기 동기화
    const timer = setInterval(refresh, 5000)

    return () => {
      supabase.removeChannel(channel)
      document.removeEventListener('visibilitychange', onVisible)
      clearInterval(timer)
    }
  }, [refresh])

  return { session, checks, error, refresh }
}

// 기기별 익명 ID (같은 폰에서 여러 번 눌러도 1명)
export function getClientId() {
  const key = 'class-check-client-id'
  try {
    let id = localStorage.getItem(key)
    if (!id) {
      id = crypto.randomUUID ? crypto.randomUUID() : String(Math.random()).slice(2) + Date.now()
      localStorage.setItem(key, id)
    }
    return id
  } catch {
    if (!window.__classCheckId) window.__classCheckId = String(Math.random()).slice(2) + Date.now()
    return window.__classCheckId
  }
}
