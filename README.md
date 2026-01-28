# Texas Hold'em Odds Lab

App web em Vite (React + TypeScript) para calculo de odds no Poker Texas Hold'em, com UI gamificada, simulacao Monte Carlo em Web Worker e calculo exato no river (ate 3 jogadores).

## Stack
- Vite + React + TypeScript
- Web Worker para simulacao Monte Carlo
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
1. Selecione sua mao (2 cartas).
2. Selecione a mesa (flop/turn/river).
3. Ajuste numero de jogadores e opcoes de adversarios.
4. Clique em **Calcular odds**.

## Observacoes
- Cartas duplicadas sao bloqueadas automaticamente.
- O calculo exato e aplicado quando o river esta completo e ha ate 3 jogadores. Para mais jogadores, o app usa Monte Carlo por performance.
- Ranges simples aceitos: `QQ, AKs, AJo`.
# chance-poker
