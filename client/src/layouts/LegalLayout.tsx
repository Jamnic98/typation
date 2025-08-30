import { type ReactNode } from 'react'

interface PageLayoutProps {
  title: string
  children: ReactNode
}

export const LegalLayout = ({ title, children }: PageLayoutProps) => (
  <div className="max-w-3xl mx-auto px-6 py-12">
    <h1 className="text-3xl font-bold mb-6">{title}</h1>
    {children}
  </div>
)
