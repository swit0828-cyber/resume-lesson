import React, { useEffect, useState } from 'react'
import QRCode from 'qrcode'
import { supabase, isConfigured } from './supabase'
import { useClassState } from './classCheck'

const studentUrl = `${window.location.origin}/check.html`

export default function Teacher() {
  const { session, checks, error, refresh } = useClassState()
  const [totalInput, setTotalInput] = useState('')
  const [qr, setQr] = useState(null)
  const [showQr, setShowQr] = useState(false)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    QRCode.toDataURL(studentUrl, { width: 480, margin: 1 }).then(setQr)
  }, [])

  useEffect(() => {
    if (session && totalInput === '') setTotalInput(String(session.total_students || ''))
  }, [session])

  const saveTotal = async (e) => {
    e.preventDefault()
    const n = parseInt(totalInput, 10)
    if (!Number.isFinite(n) || n < 1) return alert('1 이상의 숫자를 입력하세요')
    setBusy(true)
    const { error } = await supabase
      .from('class_session')
      .update({ total_students: n, updated_at: new Date().toISOString() })
      .eq('id', 1)
    setBusy(false)
    if (error) alert('저장 실패: ' + error.message)
    refresh()
  }

  // 클리어: 지금까지 누른 완료 체크를 모두 비움
  const clearChecks = async () => {
    setBusy(true)
    const { error } = await supabase.from('class_checks').delete().gte('step', 0)
    setBusy(false)
    if (error) alert('클리어 실패: ' + error.message)
    refresh()
  }

  if (!isConfigured) return <div className="cc-wrap"><p>.env에 Supabase 설정이 필요합니다.</p></div>
  if (error) return <div className="cc-wrap"><p className="cc-error">에러: {error}<br />class_check_setup.sql을 먼저 실행했는지 확인하세요.</p></div>
  if (!session) return <div className="cc-wrap"><p className="cc-muted">불러오는 중...</p></div>

  const total = session.total_students
  const done = checks.length
  const pct = total > 0 ? Math.min(100, Math.round((done / total) * 100)) : 0
  const full = total > 0 && done >= total

  return (
    <div className="cc-wrap">
      <div className="cc-label">강사용</div>

      <div className={`cc-count ${full ? 'full' : ''}`}>
        {done}<span> / {total || '?'}</span>
      </div>
      <div className="cc-bar"><div style={{ width: `${pct}%` }} /></div>
      <div className="cc-muted">{full ? '전원 완료!' : `${Math.max(0, total - done)}명 남음`}</div>

      <button className="cc-btn primary" disabled={busy} onClick={clearChecks}>
        클리어
      </button>

      <form className="cc-row" onSubmit={saveTotal}>
        <input
          type="number"
          inputMode="numeric"
          min="1"
          value={totalInput}
          onChange={(e) => setTotalInput(e.target.value)}
          placeholder="학생 수"
        />
        <button className="cc-btn small" disabled={busy}>학생 수 저장</button>
      </form>

      <button className="cc-btn ghost" onClick={() => setShowQr(!showQr)}>
        {showQr ? 'QR 닫기' : '학생용 QR 보기'}
      </button>
      {showQr && qr && (
        <div className="cc-qr">
          <img src={qr} alt="학생용 QR" />
          <div className="cc-muted">{studentUrl}</div>
        </div>
      )}
    </div>
  )
}
