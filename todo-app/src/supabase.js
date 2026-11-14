import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// 수강생 번호 (1 ~ 100). 강사 공용 DB에서 내 할 일만 구분하는 값
export const studentNo = Number(import.meta.env.VITE_STUDENT_NO)

export const isConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl.startsWith('https://') &&
  !supabaseUrl.includes('your-project') &&
  Number.isInteger(studentNo) &&
  studentNo >= 1 &&
  studentNo <= 100
)

export const supabase = isConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null
