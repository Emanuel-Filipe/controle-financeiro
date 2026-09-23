'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, PlusCircle, List, Receipt, ListChecks, LogOut } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

const links = [
  { href: '/',             label: 'Início',       icon: LayoutDashboard },
  { href: '/lancar',       label: 'Lançar',       icon: PlusCircle },
  { href: '/historico',    label: 'Histórico',    icon: List },
  { href: '/comprovantes', label: 'Comprovantes', icon: Receipt },
  { href: '/lista',        label: 'Lista',        icon: ListChecks },
]

export default function BottomNav() {
  const pathname = usePathname()
  const { sair } = useAuth()

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 safe-area-pb"
      style={{
        background: 'var(--nav-bg)',
        borderTop: '1px solid var(--nav-border)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
      }}
    >
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {links.map(({ href, label, icon: Icon }) => {
          const ativo = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className="flex flex-col items-center gap-0.5 py-2.5 px-2 flex-1 transition-all duration-200"
              style={{ color: ativo ? 'var(--accent)' : 'var(--text-muted)' }}
            >
              <div
                className="transition-all duration-200"
                style={ativo ? {
                  filter: 'drop-shadow(0 0 6px var(--accent-glow))',
                  transform: 'scale(1.1)',
                } : {}}
              >
                <Icon size={22} strokeWidth={ativo ? 2.5 : 1.8} />
              </div>
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          )
        })}

        {/* Sair */}
        <button
          onClick={sair}
          className="flex flex-col items-center gap-0.5 py-2.5 px-2 flex-1 transition-colors"
          style={{ color: 'var(--text-muted)' }}
        >
          <LogOut size={22} strokeWidth={1.8} />
          <span className="text-[10px] font-medium">Sair</span>
        </button>
      </div>
    </nav>
  )
}
