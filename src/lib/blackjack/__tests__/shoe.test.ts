import { describe, expect, it } from 'vitest'
import { shoeCountForDecks, totalCardsInShoe } from '../shoe'

describe('blackjack shoe counts', () => {
  it('counts decks correctly', () => {
    const counts = shoeCountForDecks(2)
    expect(totalCardsInShoe(counts)).toBe(104)
    expect(counts[0]).toBe(8)
    expect(counts[9]).toBe(32)
  })
})
