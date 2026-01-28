# Texas Hold'em Odds Lab

App web em Vite (React + TypeScript) para calculo de odds no Poker Texas Hold'em e analise de decisoes no Blackjack, com UI gamificada e calculos em Web Worker.

## Stack
- Vite + React + TypeScript
- Web Worker para simulacao Monte Carlo (Poker) e EV (Blackjack)
- Vitest para testes

## Como rodar
```bash
npm install
npm run dev
```

## Testes
```bash
npm run test
```

## Como usar
1. Escolha o jogo no seletor no topo (Poker ou Blackjack).
2. Configure as cartas e regras.
3. Clique em **Calcular odds** ou **Calcular decisao**.

## Observacoes
- Poker: cartas duplicadas sao bloqueadas automaticamente.
- Poker: o calculo exato e aplicado quando o river esta completo e ha ate 3 jogadores. Para mais jogadores, o app usa Monte Carlo por performance.
- Poker: ranges simples aceitos: `QQ, AKs, AJo`.
- Blackjack: suporta multiplos baralhos, cartas descartadas e regras configuraveis (H17/S17, payout, double/split/surrender).
# chance-poker
