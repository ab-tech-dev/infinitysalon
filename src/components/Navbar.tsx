import { Hexagon } from 'lucide-react'
import Reveal from './Reveal'

const NAV_LINKS = ['About', 'Blog', 'Contact']

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/15">
      <div className="flex items-center justify-between px-5 py-4 sm:px-8 md:px-12">
        <Reveal delay={0} className="flex items-center gap-2">
          <Hexagon size={24} strokeWidth={1.5} className="text-white" />
          <span className="text-lg sm:text-xl font-medium tracking-tight text-white drop-shadow-md">
            novaai
          </span>
        </Reveal>

        <div className="hidden items-center gap-8 lg:gap-10 md:flex">
          <Reveal delay={100}>
            <a href="#" className="inline-flex items-baseline text-sm text-white/85 transition-colors duration-300 hover:text-white">
              Projects
              <sup className="ml-0.5 font-mono text-[10px] text-white/60">6</sup>
            </a>
          </Reveal>
          {NAV_LINKS.map((label, i) => (
            <Reveal key={label} delay={100 + (i + 1) * 100}>
              <a href="#" className="text-sm text-white/85 transition-colors duration-300 hover:text-white">
                {label}
              </a>
            </Reveal>
          ))}
        </div>

        <Reveal delay={500}>
          <button
            type="button"
            className="rounded-md border border-white/20 bg-white/15 px-4 py-2 text-xs text-white backdrop-blur-md transition-colors duration-300 hover:bg-white/25 sm:px-5 sm:text-sm"
          >
            Get Free Consultation
          </button>
        </Reveal>
      </div>
    </nav>
  )
}
