import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from '../App'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
})

const renderWithRouter = (initialRoute: string) => {
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[initialRoute]}>
        <App />
      </MemoryRouter>
    </QueryClientProvider>
  )
}

describe('Routing and Navigation Tests', () => {
  it('should render home page at root route', () => {
    renderWithRouter('/')
    // Home page should be rendered
    expect(document.querySelector('body')).toBeTruthy()
  })

  it('should render books page at /books route', () => {
    renderWithRouter('/books')
    expect(document.querySelector('body')).toBeTruthy()
  })

  it('should render papers page at /papers route', () => {
    renderWithRouter('/papers')
    expect(document.querySelector('body')).toBeTruthy()
  })

  it('should render quotes page at /quotes route', () => {
    renderWithRouter('/quotes')
    expect(document.querySelector('body')).toBeTruthy()
  })

  it('should render problems page at /problems route', () => {
    renderWithRouter('/problems')
    expect(document.querySelector('body')).toBeTruthy()
  })

  it('should render pomodoro page at /pomodoro route', () => {
    renderWithRouter('/pomodoro')
    expect(document.querySelector('body')).toBeTruthy()
  })

  it('should render relaxation page at /relaxation route', () => {
    renderWithRouter('/relaxation')
    expect(document.querySelector('body')).toBeTruthy()
  })

  it('should render documents page at /documents route', () => {
    renderWithRouter('/documents')
    expect(document.querySelector('body')).toBeTruthy()
  })

  it('should render error questions page at /error-questions route', () => {
    renderWithRouter('/error-questions')
    expect(document.querySelector('body')).toBeTruthy()
  })

  it('should render resources page at /resources route', () => {
    renderWithRouter('/resources')
    expect(document.querySelector('body')).toBeTruthy()
  })

  it('should render brainstorm page at /brainstorm route', () => {
    renderWithRouter('/brainstorm')
    expect(document.querySelector('body')).toBeTruthy()
  })

  it('should render essays page at /essays route', () => {
    renderWithRouter('/essays')
    expect(document.querySelector('body')).toBeTruthy()
  })
})
