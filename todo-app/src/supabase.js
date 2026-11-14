import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// 번호 (0 = 강사 데모, 1 ~ 100 = 수강생). 공용 DB에서 내 할 일만 구분하는 값
const rawStudentNo = import.meta.env.VITE_STUDENT_NO
export const studentNo = Number(rawStudentNo)

// URL · 키만 확인 (진도 체크 페이지 등 번호가 필요 없는 곳)
export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl.startsWith('https://') &&
  !supabaseUrl.includes('your-project')
)

// 투두 앱: URL · 키 + 번호까지 확인
export const isConfigured =
  isSupabaseConfigured &&
  rawStudentNo !== undefined &&
  rawStudentNo !== '' &&
  Number.isInteger(studentNo) &&
  studentNo >= 0 &&
  studentNo <= 100

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null
