interface CardResumoProps {
  titulo: string
  valor: string
  cor?: 'verde' | 'vermelho' | 'azul' | 'cinza'
  icone?: React.ReactNode
}

const cores = {
  verde: 'bg-emerald-50 border-emerald-200 text-emerald-700',
  vermelho: 'bg-red-50 border-red-200 text-red-600',
  azul: 'bg-indigo-50 border-indigo-200 text-indigo-700',
  cinza: 'bg-gray-50 border-gray-200 text-gray-700',
}

export default function CardResumo({
  titulo,
  valor,
  cor = 'cinza',
  icone,
}: CardResumoProps) {
  return (
    <div className={`rounded-xl border p-4 ${cores[cor]}`}>
      <div className="flex items-center gap-2 mb-1">
        {icone}
        <span className="text-xs font-medium uppercase tracking-wide opacity-75">
          {titulo}
        </span>
      </div>
      <p className="text-xl font-bold">{valor}</p>
    </div>
  )
}
