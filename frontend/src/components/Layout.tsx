import React, { useState, useRef, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'

interface LayoutProps {
  children: React.ReactNode
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const navRef = useRef<HTMLElement>(null)
  const scrollIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const navigation = [
    { name: '首页', href: '/', icon: '🏠', short: '首页' },
    { name: '读书助手', href: '/books', icon: '📚', short: '读书' },
    { name: '论文助手', href: '/papers', icon: '📄', short: '论文' },
    { name: '金句生成', href: '/quotes', icon: '✨', short: '金句' },
    { name: '解题助手', href: '/problems', icon: '🧮', short: '解题' },
    { name: '番茄专注', href: '/pomodoro', icon: '🍅', short: '专注' },
    { name: '心灵放松', href: '/relaxation', icon: '🌿', short: '放松' },
    { name: '文档协作', href: '/documents', icon: '📋', short: '文档' },
    { name: '头脑风暴', href: '/brainstorm', icon: '🧠', short: '风暴' },
    { name: '作文批改', href: '/essays', icon: '✍️', short: '作文' },
    { name: '错题整理', href: '/error-questions', icon: '📊', short: '错题' },
    { name: '笔记助手', href: '/notes', icon: '📓', short: '笔记' },
  ]

  const handleNavClick = () => {
    setMobileMenuOpen(false)
  }

  const startScrolling = (direction: 'left' | 'right') => {
    if (scrollIntervalRef.current) return
    
    scrollIntervalRef.current = setInterval(() => {
      if (navRef.current) {
        const scrollAmount = direction === 'left' ? -5 : 5
        navRef.current.scrollLeft += scrollAmount
      }
    }, 16) // ~60fps
  }

  const stopScrolling = () => {
    if (scrollIntervalRef.current) {
      clearInterval(scrollIntervalRef.current)
      scrollIntervalRef.current = null
    }
  }

  useEffect(() => {
    return () => {
      if (scrollIntervalRef.current) {
        clearInterval(scrollIntervalRef.current)
      }
    }
  }, [])

  const isFullWidth = location.pathname === '/documents'

  return (
    <div className={`min-h-screen overflow-x-hidden ${isFullWidth ? 'bg-[#212121]' : 'bg-gradient-to-br from-surface-50 via-primary-50/40 to-accent-50/30'}`}>
      {/* Header */}
      <header className="glass-strong shadow-soft-sm sticky top-0 z-40" style={{ paddingTop: 'var(--safe-area-inset-top)' }}>
        <div className="max-w-full mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-2.5 sm:py-3 gap-2 sm:gap-4">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 flex-shrink-0 min-w-0" onClick={handleNavClick}>
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-soft-sm flex-shrink-0">
                <span className="text-white text-sm sm:text-base font-bold">AI</span>
              </div>
              <span className="text-base sm:text-lg lg:text-xl font-semibold text-gradient truncate">
                智学平台
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center nav-scroll-container">
              <div
                className="absolute left-0 top-0 w-6 h-full z-10 cursor-pointer"
                onMouseEnter={() => startScrolling('left')}
                onMouseLeave={stopScrolling}
              />

              <nav
                ref={navRef}
                className="flex items-center gap-1 overflow-x-auto scrollbar-hide max-w-4xl px-6"
                style={{ scrollBehavior: 'smooth' }}
              >
                {navigation.map((item) => {
                  const isActive = location.pathname === item.href
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`${
                        isActive
                          ? 'bg-primary-500 text-white shadow-soft-sm'
                          : 'text-surface-600 hover:bg-white/70 hover:text-surface-800'
                      } px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap flex-shrink-0 flex items-center gap-1.5`}
                    >
                      <span className="text-base">{item.icon}</span>
                      <span className="hidden xl:inline">{item.short}</span>
                    </Link>
                  )
                })}
              </nav>

              <div
                className="absolute right-0 top-0 w-6 h-full z-10 cursor-pointer"
                onMouseEnter={() => startScrolling('right')}
                onMouseLeave={stopScrolling}
              />
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2.5 -m-2.5 rounded-xl text-surface-500 hover:text-surface-700 hover:bg-white/60 focus:outline-none focus:ring-2 focus:ring-primary-400 transition-all duration-200 touch-target"
              aria-label="Toggle menu"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="lg:hidden border-t border-surface-200/60 glass-strong"
            >
              <nav className="px-3 py-2 space-y-0.5 max-h-[calc(100vh-64px)] overflow-y-auto">
                {navigation.map((item) => {
                  const isActive = location.pathname === item.href
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={handleNavClick}
                      className={`${
                        isActive
                          ? 'bg-primary-500 text-white shadow-soft-sm'
                          : 'text-surface-600 hover:bg-white/60 hover:text-surface-800'
                      } flex items-center px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 touch-target min-h-[44px]`}
                    >
                      <span className="mr-3 text-lg">{item.icon}</span>
                      {item.name}
                    </Link>
                  )
                })}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Main Content */}
      <main className={isFullWidth ? 'w-full overflow-x-hidden' : 'w-full max-w-7xl mx-auto overflow-x-hidden'}>
        {children}
      </main>

      {/* Footer */}
      {!isFullWidth && (
      <footer className="glass border-t border-surface-200/40 mt-16 sm:mt-24" style={{ paddingBottom: 'max(2rem, env(safe-area-inset-bottom))' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="text-center text-surface-400 text-xs sm:text-sm">
            <p>© 2026 智学平台 · AI赋能，让学习更高效</p>
          </div>
        </div>
      </footer>
      )}
    </div>
  )
}

export default Layout