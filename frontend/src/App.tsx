import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import Layout from './components/Layout'
import ErrorBoundary from './components/ErrorBoundary'
import NotificationToast from './components/NotificationToast'
import Home from './pages/Home'
import Books from './pages/Books'
import { Papers } from './pages/Papers'
import Quotes from './pages/Quotes'
import Problems from './pages/Problems'
import Pomodoro from './pages/Pomodoro'
import Relaxation from './pages/Relaxation'
import Documents from './pages/Documents'
import Brainstorm from './pages/Brainstorm'
import Essays from './pages/Essays'
import ErrorQuestions from './pages/ErrorQuestions'
import Notes from './pages/Notes'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <ErrorBoundary>
          <Layout>
            <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/books" element={<Books />} />
            <Route path="/papers" element={<Papers />} />
            <Route path="/quotes" element={<Quotes />} />
            <Route path="/problems" element={<Problems />} />
            <Route path="/pomodoro" element={<Pomodoro />} />
            <Route path="/relaxation" element={<Relaxation />} />
            <Route path="/documents" element={<Documents />} />
            <Route path="/error-questions" element={<ErrorQuestions />} />
            <Route path="/brainstorm" element={<Brainstorm />} />
            <Route path="/essays" element={<Essays />} />
            <Route path="/notes" element={<Notes />} />
          </Routes>
          </Layout>
          <NotificationToast />
        </ErrorBoundary>
      </Router>
    </QueryClientProvider>
  )
}

export default App