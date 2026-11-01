import React, { useState } from 'react'
import { supabase, isConfigured } from './supabase'
import { useClassState, getClientId } from './classCheck'

const clientId = getClientId()

export default function Student() {
  const { session, checks, error, refresh } = useClassState()
  const [busy, setBusy] = useState(false)

  if (!isConfigured) return <div className="cc-wrap"><p>설정이 필요합니다. 강사에게 알려주세요.</p></div>
  if (error) return <div className="cc-wrap"><p className="cc-error">연결 오류: {error}</p></div>
  if (!session) return <div className="cc-wrap"><p className="cc-muted">불러오는 중...</p></div>

  const step = session.current_step
  const isDone = checks.includes(clientId)

  const toggle = async () => {
    setBusy(true)
    const { error } = isDone
      ? await supabase.from('class_checks').delete().eq('step', step).eq('client_id', clientId)
      : await supabase.from('class_checks').upsert({ step, client_id: clientId })
    setBusy(false)
    if (error) alert('실패: ' + error.message)
    refresh()
  }

  return (
    <div className="cc-wrap student">
      <div className="cc-label">현재 {step}단계</div>
      <p className="cc-guide">
        {isDone ? '완료했어요! 강사가 다음으로 넘어갈 때까지 기다려주세요.' : '이해했거나 따라 했다면 아래 버튼을 눌러주세요.'}
      </p>
      <button className={`cc-big ${isDone ? 'done' : ''}`} disabled={busy} onClick={toggle}>
        {isDone ? '✓ 완료됨' : '완료'}
      </button>
      {isDone && (
        <button className="cc-btn ghost" disabled={busy} onClick={toggle}>완료 취소</button>
      )}
      <div className="cc-muted">완료 {checks.length}명 / {session.total_students || '?'}명</div>
    </div>
  )
}
