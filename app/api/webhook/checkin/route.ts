import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Crea cliente con service role — solo se usa en esta ruta servidor, nunca en el cliente
function createServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function POST(req: NextRequest) {
  // Validar secreto del webhook
  const secret = req.headers.get('x-webhook-secret')
  if (!secret || secret !== process.env.WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const userId = process.env.WEBHOOK_USER_ID
  if (!userId) {
    return NextResponse.json({ error: 'WEBHOOK_USER_ID no configurado' }, { status: 500 })
  }

  let body: { ejercicio?: string; fecha?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 })
  }

  const { ejercicio, fecha } = body
  if (!ejercicio || !fecha) {
    return NextResponse.json({ error: 'Faltan campos: ejercicio, fecha' }, { status: 400 })
  }

  // Fecha en formato YYYY-MM-DD desde el ISO del calendario
  const date = fecha.slice(0, 10)

  const supabase = createServiceClient()

  // Buscar o crear hábito con el nombre del grupo muscular
  const habitName = ejercicio.charAt(0).toUpperCase() + ejercicio.slice(1).toLowerCase()

  let { data: habit } = await supabase
    .from('habits')
    .select('id')
    .eq('user_id', userId)
    .eq('name', habitName)
    .is('deleted_at', null)
    .maybeSingle()

  if (!habit) {
    const { data: newHabit, error: habitError } = await supabase
      .from('habits')
      .insert({
        user_id: userId,
        name: habitName,
        frequency_type: 'weekly',
        description: `Entrenamiento de ${habitName.toLowerCase()}`,
      })
      .select('id')
      .single()

    if (habitError || !newHabit) {
      return NextResponse.json({ error: 'No se pudo crear el hábito' }, { status: 500 })
    }
    habit = newHabit
  }

  // Verificar si ya existe un check-in para esta fecha + hábito
  const { data: existing } = await supabase
    .from('check_ins')
    .select('id')
    .eq('user_id', userId)
    .eq('habit_id', habit.id)
    .eq('date', date)
    .maybeSingle()

  if (existing) {
    return NextResponse.json({
      ok: true,
      message: 'Check-in ya existía para esta fecha',
      check_in_id: existing.id,
    })
  }

  // Crear check-in de entrenamiento
  const { data: checkIn, error: checkInError } = await supabase
    .from('check_ins')
    .insert({ user_id: userId, habit_id: habit.id, date, type: 'training' })
    .select('id')
    .single()

  if (checkInError || !checkIn) {
    return NextResponse.json({ error: 'No se pudo crear el check-in' }, { status: 500 })
  }

  // Crear ejercicio base con el grupo muscular (peso 0 — se actualiza desde el historial)
  await supabase.from('session_exercises').insert({
    check_in_id: checkIn.id,
    exercise_name: habitName,
    muscle_group: habitName,
    weight: 0,
  })

  return NextResponse.json({
    ok: true,
    check_in_id: checkIn.id,
    habit_id: habit.id,
    habit_name: habitName,
    date,
  })
}
