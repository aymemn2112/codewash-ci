import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from './App'

describe('App', () => {
  it('renders the main menu', () => {
    render(<App />)
    expect(screen.getAllByRole('heading', { name: /level up/i }).length).toBeGreaterThan(0)
  })

  it('renders the main menu controls', () => {
    render(<App />)
    expect(screen.getByRole('button', { name: /enter fullscreen/i })).toBeInTheDocument()
  })
})