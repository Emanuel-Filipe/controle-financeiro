'use client'

import { useRef, useState } from 'react'
import { Camera, ImageIcon, Clipboard, X, ChevronDown } from 'lucide-react'

interface SeletorComprovanteProps {
  preview: string | null
  onArquivo: (file: File) => void
  onRemover: () => void
}

export default function SeletorComprovante({
  preview,
  onArquivo,
  onRemover,
}: SeletorComprovanteProps) {
  const [menuAberto, setMenuAberto] = useState(false)
  const [erroColar, setErroColar] = useState('')

  // Dois inputs separados: um força câmera, outro abre galeria
  const inputCameraRef = useRef<HTMLInputElement>(null)
  const inputGaleriaRef = useRef<HTMLInputElement>(null)

  function handleArquivo(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    onArquivo(file)
    setMenuAberto(false)
    // Limpa o input para permitir reselecionar o mesmo arquivo
    e.target.value = ''
  }

  async function handleColar() {
    setErroColar('')
    try {
      // API Clipboard — suportada no iOS 16+ e Android Chrome
      const items = await navigator.clipboard.read()
      let encontrou = false
      for (const item of items) {
        const tipoImagem = item.types.find((t) => t.startsWith('image/'))
        if (tipoImagem) {
          const blob = await item.getType(tipoImagem)
          const ext = tipoImagem.split('/')[1] ?? 'png'
          const file = new File([blob], `comprovante-colado.${ext}`, { type: tipoImagem })
          onArquivo(file)
          encontrou = true
          setMenuAberto(false)
          break
        }
      }
      if (!encontrou) {
        setErroColar('Nenhuma imagem na área de transferência.')
      }
    } catch {
      setErroColar('Permissão negada ou nenhuma imagem copiada.\nNo iPhone: copie a foto na galeria e tente novamente.')
    }
  }

  if (preview) {
    return (
      <div className="relative mt-2 animate-scale-in">
        <img
          src={preview}
          alt="Comprovante"
          className="w-full max-h-52 object-cover rounded-xl"
        />
        <div className="absolute top-2 right-2 flex gap-2">
          {/* Trocar */}
          <button
            type="button"
            onClick={() => setMenuAberto(true)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
          >
            Trocar <ChevronDown size={12} />
          </button>
          {/* Remover */}
          <button
            type="button"
            onClick={onRemover}
            className="w-8 h-8 rounded-full flex items-center justify-center transition-all"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
          >
            <X size={15} />
          </button>
        </div>

        {menuAberto && (
          <OpcoesSeletor
            onCamera={() => inputCameraRef.current?.click()}
            onGaleria={() => inputGaleriaRef.current?.click()}
            onColar={handleColar}
            onFechar={() => setMenuAberto(false)}
            erro={erroColar}
          />
        )}

        <Inputs
          cameraRef={inputCameraRef}
          galeriaRef={inputGaleriaRef}
          onChange={handleArquivo}
        />
      </div>
    )
  }

  return (
    <div className="mt-2">
      {/* Botão principal — abre o menu */}
      <button
        type="button"
        onClick={() => setMenuAberto(!menuAberto)}
        className="w-full py-5 rounded-xl flex flex-col items-center gap-2 border-2 border-dashed transition-all active:scale-[0.98]"
        style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
      >
        <div className="flex items-center gap-3">
          <Camera size={20} />
          <ImageIcon size={20} />
          <Clipboard size={20} />
        </div>
        <span className="text-sm font-medium">Anexar comprovante</span>
        <span className="text-xs" style={{ color: 'var(--text-muted)', opacity: 0.6 }}>
          Câmera · Galeria · Colar
        </span>
      </button>

      {menuAberto && (
        <OpcoesSeletor
          onCamera={() => inputCameraRef.current?.click()}
          onGaleria={() => inputGaleriaRef.current?.click()}
          onColar={handleColar}
          onFechar={() => setMenuAberto(false)}
          erro={erroColar}
        />
      )}

      <Inputs
        cameraRef={inputCameraRef}
        galeriaRef={inputGaleriaRef}
        onChange={handleArquivo}
      />
    </div>
  )
}

// ─── Subcomponentes ───────────────────────────────────────────────────────────

function OpcoesSeletor({
  onCamera, onGaleria, onColar, onFechar, erro,
}: {
  onCamera: () => void
  onGaleria: () => void
  onColar: () => void
  onFechar: () => void
  erro: string
}) {
  return (
    <>
      {/* Overlay para fechar */}
      <div className="fixed inset-0 z-40" onClick={onFechar} />

      <div
        className="relative z-50 mt-2 card p-2 animate-scale-in space-y-1"
        style={{ borderRadius: '1rem' }}
      >
        <OpcaoBtn icon={<Camera size={18} />} label="Tirar foto" sub="Abre a câmera" onClick={onCamera} />
        <OpcaoBtn icon={<ImageIcon size={18} />} label="Escolher da galeria" sub="Fotos e arquivos" onClick={onGaleria} />
        <OpcaoBtn icon={<Clipboard size={18} />} label="Colar imagem" sub="Da área de transferência" onClick={onColar} />

        {erro && (
          <p
            className="text-xs px-3 py-2 rounded-lg whitespace-pre-line"
            style={{ background: 'var(--red-soft)', color: 'var(--red)' }}
          >
            {erro}
          </p>
        )}
      </div>
    </>
  )
}

function OpcaoBtn({
  icon, label, sub, onClick,
}: {
  icon: React.ReactNode
  label: string
  sub: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all active:scale-[0.97] text-left"
      style={{ color: 'var(--text-primary)' }}
      onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-card-hover)')}
      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
    >
      <span style={{ color: 'var(--accent)' }}>{icon}</span>
      <div>
        <p className="text-sm font-semibold">{label}</p>
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{sub}</p>
      </div>
    </button>
  )
}

function Inputs({
  cameraRef, galeriaRef, onChange,
}: {
  cameraRef: React.RefObject<HTMLInputElement | null>
  galeriaRef: React.RefObject<HTMLInputElement | null>
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}) {
  return (
    <>
      {/* Câmera — capture força abertura da câmera */}
      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={onChange}
        className="hidden"
      />
      {/* Galeria — sem capture, abre seletor de arquivos/galeria */}
      <input
        ref={galeriaRef}
        type="file"
        accept="image/*"
        onChange={onChange}
        className="hidden"
      />
    </>
  )
}
