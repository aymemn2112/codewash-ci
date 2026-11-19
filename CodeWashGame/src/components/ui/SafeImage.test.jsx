import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import SafeImage from './SafeImage'

describe('SafeImage', () => {
  it('renders the fallback when no source is provided', () => {
    render(<SafeImage alt="Missing art" className="w-4" />)
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
    expect(screen.getByText('Missing art')).toBeInTheDocument()
  })

  it('renders an image when a source is provided', () => {
    render(<SafeImage src="assets/item.png" alt="An item" className="w-4" />)
    const image = screen.getByRole('img', { name: 'An item' })
    expect(image).toHaveAttribute('src', 'assets/item.png')
  })

  it('falls back when the image fails to load', () => {
    render(<SafeImage src="broken.png" alt="Broken art" className="w-4" />)
    fireEvent.error(screen.getByRole('img', { name: 'Broken art' }))
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
    expect(screen.getByText('Broken art')).toBeInTheDocument()
  })
})