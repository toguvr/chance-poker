export type Suit = 's' | 'h' | 'd' | 'c'
export type Rank = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | 'T' | 'J' | 'Q' | 'K' | 'A'
export type Card = `${Rank}${Suit}`

export const SUITS: Suit[] = ['s', 'h', 'd', 'c']
export const RANKS: Rank[] = ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A']

export const ALL_CARDS: Card[] = RANKS.flatMap((rank) => SUITS.map((suit) => `${rank}${suit}` as Card))

export const RANK_VALUE: Record<Rank, number> = {
  '2': 2,
  '3': 3,
  '4': 4,
  '5': 5,
  '6': 6,
  '7': 7,
  '8': 8,
  '9': 9,
  T: 10,
  J: 11,
  Q: 12,
  K: 13,
  A: 14,
}

export const SUIT_ICON: Record<Suit, string> = {
  s: '♠',
  h: '♥',
  d: '♦',
  c: '♣',
}

export const SUIT_COLOR: Record<Suit, 'red' | 'black'> = {
  s: 'black',
  c: 'black',
  h: 'red',
  d: 'red',
}

export const cardRankValue = (card: Card) => RANK_VALUE[card[0] as Rank]
export const cardSuit = (card: Card) => card[1] as Suit

export const sortCardsByRankDesc = (cards: Card[]) =>
  [...cards].sort((a, b) => cardRankValue(b) - cardRankValue(a))

export const cardsToText = (cards: Card[]) => cards.join(' ')
