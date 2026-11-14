// 실습 안내 페이지: 번호를 고르면 프롬프트 안에 .env 값을 채워 준다.
// URL과 키는 빌드 시점의 환경변수(강사 공용 Supabase)에서 가져온다.
const url = import.meta.env.VITE_SUPABASE_URL || ''
const key = import.meta.env.VITE_SUPABASE_ANON_KEY || ''
const ready = Boolean(url && key)

const MAX_STUDENTS = 100 // 0번은 강사 데모용이라 목록에 없음
const select = document.getElementById('studentNo')

const placeholder = document.createElement('option')
placeholder.value = ''
placeholder.textContent = '번호 선택'
select.appendChild(placeholder)

for (let i = 1; i <= MAX_STUDENTS; i++) {
  const opt = document.createElement('option')
  opt.value = String(i)
  opt.textContent = `${i}번`
  select.appendChild(opt)
}

function render() {
  const no = select.value
  const lines = [
    `VITE_SUPABASE_URL=${url}`,
    `VITE_SUPABASE_ANON_KEY=${key}`,
    `VITE_STUDENT_NO=${no || '(번호를 먼저 선택하세요)'}`,
  ].join('\n')
  document.querySelectorAll('.env-lines').forEach((el) => (el.textContent = lines))
  // Vercel 프로젝트 이름: 폴더 이름(한글·공백)과 상관없이 영문으로 고정
  document.querySelectorAll('.project-name').forEach((el) => (el.textContent = `todo-${no || '번호'}`))

  const hasNumber = no !== ''
  document.body.classList.toggle('no-number', !hasNumber)
  document.querySelectorAll('.needs-number button.copy').forEach((btn) => {
    btn.disabled = !hasNumber || !ready
  })
}

select.addEventListener('change', render)
render()

if (!ready) document.getElementById('notReady').hidden = false

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch (e) {
    // http 접속 등 clipboard API를 못 쓰는 환경
    const ta = document.createElement('textarea')
    ta.value = text
    ta.style.position = 'fixed'
    ta.style.opacity = '0'
    document.body.appendChild(ta)
    ta.select()
    let ok = false
    try { ok = document.execCommand('copy') } catch (err) {}
    ta.remove()
    return ok
  }
}

document.querySelectorAll('button.copy').forEach((btn) => {
  btn.addEventListener('click', async () => {
    const ok = await copyText(document.getElementById(btn.dataset.target).textContent)
    btn.textContent = ok ? '복사됨' : '직접 선택해서 복사하세요'
    btn.classList.add(ok ? 'done' : 'fail')
    setTimeout(() => {
      btn.textContent = '복사'
      btn.classList.remove('done', 'fail')
    }, 1800)
  })
})
