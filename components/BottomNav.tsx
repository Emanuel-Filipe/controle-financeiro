'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, PlusCircle, List, Receipt, LogOut } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

const links = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/lancar', label: 'Lançar', icon: PlusCircle },
  { href: '/historico', label: 'Histórico', icon: List },
  { href: '/comprovantes', label: 'Comprovantes', icon: Receipt },
]

export default function BottomNav() {
  const pathname = usePathname()
  const { sair } = useAuth()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 safe-area-pb">
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {links.map(({ href, label, icon: Icon }) => {
          const ativo = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-0.5 py-2 px-2 flex-1 transition-colors ${
                ativo ? 'text-indigo-600' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <Icon size={22} strokeWidth={ativo ? 2.5 : 1.8} />
              <span className="text-[10px] font-medium leading-tight text-center">{label}</span>
            </Link>
          )
        })}
        <button
          onClick={sair}
          className="flex flex-col items-center gap-0.5 py-2 px-2 flex-1 text-gray-400 hover:text-red-500 transition-colors"
        >
          <LogOut size={22} strokeWidth={1.8} />
          <span className="text-[10px] font-medium">Sair</span>
        </button>
      </div>
    </nav>
  )
}
