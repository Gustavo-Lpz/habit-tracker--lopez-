interface ExerciseValue {
  exercise_name: string
  muscle_group: string
  weight: string
}

interface ExerciseRowProps {
  index: number
  value: ExerciseValue
  onChange: (index: number, field: keyof ExerciseValue, value: string) => void
  onRemove: (index: number) => void
}

export default function ExerciseRow({ index, value, onChange, onRemove }: ExerciseRowProps) {
  return (
    <div className="flex gap-2 items-start">
      <div className="flex flex-col gap-1 flex-1">
        <input
          placeholder="Ejercicio"
          value={value.exercise_name}
          onChange={(e) => onChange(index, 'exercise_name', e.target.value)}
          maxLength={100}
          className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-violet-600"
        />
      </div>
      <div className="flex flex-col gap-1 flex-1">
        <input
          placeholder="Grupo muscular"
          value={value.muscle_group}
          onChange={(e) => onChange(index, 'muscle_group', e.target.value)}
          maxLength={100}
          className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-violet-600"
        />
      </div>
      <div className="flex flex-col gap-1 w-24">
        <input
          placeholder="Peso kg"
          type="number"
          min="0"
          step="0.5"
          value={value.weight}
          onChange={(e) => onChange(index, 'weight', e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-violet-600"
        />
      </div>
      <button
        type="button"
        onClick={() => onRemove(index)}
        className="px-2 py-2 text-red-600 hover:text-red-700 text-lg font-bold mt-0.5"
        aria-label="Eliminar ejercicio"
      >
        ×
      </button>
    </div>
  )
}
