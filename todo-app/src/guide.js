// 실습 안내 페이지: 번호를 고르면 .env 내용을 만들어 준다.
// URL과 키는 빌드 시점의 환경변수(강사 공용 Supabase)에서 가져온다.
const url = import.meta.env.VITE_SUPABASE_URL || ''
const key = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

const MAX_STUDENTS = 100
const select = document.getElementById('studentNo')
const envBox = document.getElementById('envBox')

for (let i = 1; i <= MAX_STUDENTS; i++) {
  const opt = document.createElement('option')
  opt.value = String(i)
  opt.textContent = `${i}번`
  select.appendChild(opt)
}

try {
  const saved = localStorage.getItem('studentNo')
  if (saved) select.value = saved
} catch (e) {}

const envInPrompt = document.getElementById('envInPrompt')

function renderEnv() {
  const lines = [
    `VITE_SUPABASE_URL=${url}`,
    `VITE_SUPABASE_ANON_KEY=${key}`,
    `VITE_STUDENT_NO=${select.value}`,
  ]
  envBox.textContent = lines.join('\n')
  envInPrompt.textContent = lines.map((l) => `  ${l}`).join('\n')
}

select.addEventListener('change', () => {
  try { localStorage.setItem('studentNo', select.value) } catch (e) {}
  renderEnv()
})
renderEnv()

if (!url || !key) document.getElementById('notReady').hidden = false

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text)
  } catch (e) {
    // http 접속 등 clipboard API를 못 쓰는 환경
    const ta = document.createElement('textarea')
    ta.value = text
    document.body.appendChild(ta)
    ta.select()
    document.execCommand('copy')
    ta.remove()
  }
}

document.querySelectorAll('button.copy').forEach((btn) => {
  btn.addEventListener('click', async () => {
    await copyText(document.getElementById(btn.dataset.target).textContent)
    btn.textContent = '복사됨'
    btn.classList.add('done')
    setTimeout(() => {
      btn.textContent = '복사'
      btn.classList.remove('done')
    }, 1500)
  })
})
