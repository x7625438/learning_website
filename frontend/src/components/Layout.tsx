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
    { name: '首页', href: '/', icon: '🏠' },
    { name: 'AI读书助手', href: '/books', icon: '📚' },
    { name: 'AI论文助手', href: '/papers', icon: '📄' },
    { name: 'AI金句生成器', href: '/quotes', icon: '✨' },
    { name: 'AI解题助手', href: '/problems', icon: '🧮' },
    { name: 'AI番茄钟', href: '/pomodoro', icon: '🍅' },
    { name: 'AI精神放松', href: '/relaxation', icon: '🌸' },
    { name: 'AI文档协作', href: '/documents', icon: '📋' },
    { name: 'AI头脑风暴', href: '/brainstorm', icon: '🧠' },
    { name: 'AI作文批改', href: '/essays', icon: '✍️' },
    { name: 'AI错题整理', href: '/error-questions', icon: '📝' },
    { name: 'AI笔记助手', href: '/notes', icon: '📓' },
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 overflow-x-hidden">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-40 border-b border-white/20" style={{ paddingTop: 'var(--safe-area-inset-top)' }}>
        <div className="max-w-full mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-3 sm:py-4 gap-2 sm:gap-4">
            {/* Logo - responsive text sizing */}
            <Link to="/" className="flex items-center space-x-2 flex-shrink-0 min-w-0" onClick={handleNavClick}>
              <span className="text-xl sm:text-2xl flex-shrink-0">🎓</span>
              <span className="text-base xs:text-lg sm:text-xl lg:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 truncate">
                AI赋能学习平台
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center nav-scroll-container">
              {/* Left scroll trigger */}
              <div 
                className="absolute left-0 top-0 w-6 h-full z-10 cursor-pointer"
                onMouseEnter={() => startScrolling('left')}
                onMouseLeave={stopScrolling}
              />
              
              {/* Navigation container */}
              <nav 
                ref={navRef}
                className="flex items-center gap-1 overflow-x-auto scrollbar-hide max-w-4xl px-6"
                style={{ scrollBehavior: 'smooth' }}
              >
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`${
                      location.pathname === item.href
                        ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                        : 'text-gray-700 hover:bg-white/60 hover:text-gray-900'
                    } px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 whitespace-nowrap backdrop-blur-sm border border-white/20 hover:shadow-sm flex-shrink-0`}
                  >
                    <span className="mr-1 text-base">{item.icon}</span>
                    <span className="hidden xl:inline">{item.name}</span>
                  </Link>
                ))}
              </nav>
              
              {/* Right scroll trigger */}
              <div 
                className="absolute right-0 top-0 w-6 h-full z-10 cursor-pointer"
                onMouseEnter={() => startScrolling('right')}
                onMouseLeave={stopScrolling}
              />
            </div>

            {/* Mobile menu button - touch friendly */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-3 -m-3 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-white/60 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 transition-all duration-300 touch-target"
              aria-label="Toggle menu"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {mobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
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
              className="lg:hidden border-t border-gray-200 bg-white/90 backdrop-blur-md"
            >
              <nav className="px-4 py-2 space-y-1 max-h-[calc(100vh-80px)] overflow-y-auto">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={handleNavClick}
                    className={`${
                      location.pathname === item.href
                        ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                        : 'text-gray-600 hover:bg-white/60 hover:text-gray-900'
                    } flex items-center px-3 py-3 rounded-lg text-base font-medium transition-all duration-300 touch-target min-h-[44px]`}
                  >
                    <span className="mr-3 text-lg">{item.icon}</span>
                    {item.name}
                  </Link>
                ))}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Main Content - responsive max-width, padding from page children */}
      <main className="w-full max-w-7xl mx-auto overflow-x-hidden">
        {children}
      </main>

      {/* Footer - safe area for mobile */}
      <footer className="bg-white/80 backdrop-blur-md border-t border-white/20 mt-12 sm:mt-20" style={{ paddingBottom: 'max(2.5rem, env(safe-area-inset-bottom))' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          <div className="text-center text-gray-600 text-sm sm:text-base font-medium">
            <p className="px-2">© 2024 AI赋能学习平台. 让AI成为您最好的学习伙伴.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Layout