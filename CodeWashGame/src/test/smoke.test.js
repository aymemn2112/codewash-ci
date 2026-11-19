import { describe, it, expect } from 'vitest'
import { getDefaultStats } from '../utils/achievementUtils'

describe('test harness', () => {
  it('runs in a jsdom environment', () => {
    expect(typeof window).toBe('object')
    expect(document).toBeDefined()
  })

  it('can import application modules', () => {
    const stats = getDefaultStats()
    expect(stats).toMatchObject({
      phantomsCaught: 0,
      totalMobsDefeated: 0,
      achievementsUnlocked: [],
    })
  })
})