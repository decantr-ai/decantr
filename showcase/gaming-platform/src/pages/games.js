import { tags } from 'decantr/tags';
import { createSignal } from 'decantr/state';
import { onMount } from 'decantr/core';
import { css } from 'decantr/css';
import { Badge, Button, Card, Chip, Input, Select, icon } from 'decantr/components';

const { div, span, h2, h3, p } = tags;

const genres = ['All', 'RPG', 'FPS', 'MOBA', 'Strategy', 'Survival'];
const statuses = ['All', 'Active', 'Coming Soon', 'Beta'];

const games = [
  { title: 'Nexus Legends', genre: 'RPG', players: '12,400', status: 'Active', description: 'Epic open-world RPG with guild raids and PvP arenas.', ic: 'swords' },
  { title: 'StormBreaker Arena', genre: 'FPS', players: '8,200', status: 'Active', description: 'Fast-paced competitive shooter with ranked leagues.', ic: 'crosshair' },
  { title: 'Realm Tactics', genre: 'Strategy', players: '5,800', status: 'Active', description: 'Turn-based strategy with real-time guild wars.', ic: 'map' },
  { title: 'Viper Strike', genre: 'MOBA', players: '15,300', status: 'Active', description: '5v5 competitive MOBA with 80+ heroes.', ic: 'zap' },
  { title: 'Obsidian Frontier', genre: 'Survival', players: '3,200', status: 'Active', description: 'Open-world survival crafting in a dark fantasy setting.', ic: 'mountain' },
  { title: 'Neon Drift', genre: 'RPG', players: '—', status: 'Coming Soon', description: 'Cyberpunk racing RPG with guild tournaments.', ic: 'car' },
  { title: 'Shadow Protocol', genre: 'FPS', players: '1,400', status: 'Beta', description: 'Tactical stealth shooter — early access.', ic: 'eye' },
  { title: 'Arcane Conquest', genre: 'Strategy', players: '—', status: 'Coming Soon', description: 'Magic-powered RTS with guild alliances.', ic: 'sparkles' },
];

// ─── Search + Filter Bar ────────────────────────────────────────
function SearchFilterBar() {
  const [search, setSearch] = createSignal('');
  const [genre, setGenre] = createSignal('All');
  const [status, setStatus] = createSignal('All');

  return div({ class: css('_flex _col _gap3') },
    Input({ placeholder: 'Search games...', value: search, onchange: e => setSearch(e.target.value), class: css('_wfull') }),
    div({ class: css('_flex _gap3 _aic _flexWrap') },
      Select({ value: genre, onchange: v => setGenre(v), options: genres.map(g => ({ label: g, value: g })) }),
      Select({ value: status, onchange: v => setStatus(v), options: statuses.map(s => ({ label: s, value: s })) }),
      div({ class: css('_flex1') }),
      span({ class: css('gg-data _textxs _fgmuted') }, `${games.length} GAMES`)
    )
  );
}

// ─── Game Catalog Grid ──────────────────────────────────────────
function GameCatalog() {
  return div({ class: css('_grid _gc1 _sm:gc2 _lg:gc3 _xl:gc4 _gap4 d-stagger-scale') },
    ...games.map(game =>
      Card({ hover: true, class: css(game.status === 'Active' ? '' : '_opacity70') },
        Card.Body({ class: css('_flex _col _gap3') },
          div({ class: css('_flex _center _w16 _h16 _r4 _bgprimary/10 _mb1') },
            icon(game.ic, { size: '1.5rem', class: css('_fgprimary') })
          ),
          div({ class: css('_flex _aic _gap2') },
            Chip({ label: game.genre, variant: 'outline', size: 'xs', class: css('gg-label') }),
            game.status !== 'Active'
              ? Badge({ variant: game.status === 'Beta' ? 'warning' : 'info', size: 'sm' }, game.status.toUpperCase())
              : null,
          ),
          h3({ class: css('_heading5 _medium') }, game.title),
          p({ class: css('_textxs _fgmuted') }, game.description),
          div({ class: css('_flex _aic _jcsb _mt1') },
            div({ class: css('_flex _aic _gap1') },
              icon('users', { size: '0.75rem', class: css('_fgmuted') }),
              span({ class: css('gg-data _textxs _fgmuted') }, game.players)
            ),
            Button({ variant: 'ghost', size: 'sm', class: css('gg-label _textxs') },
              game.status === 'Active' ? 'PLAY' : 'NOTIFY ME'
            )
          )
        )
      )
    )
  );
}

// ─── Page ───────────────────────────────────────────────────────
export default function GamesPage() {
  onMount(() => {
    document.title = 'Games — Nexus Guild';
  });

  return div({ class: css('d-page-enter _flex _col _gap4') },
    div({ class: css('_flex _aic _gap2') },
      icon('gamepad-2', { size: '1.25rem', class: css('_fgprimary') }),
      h2({ class: css('gg-label _fgmutedfg') }, 'GAME CATALOG')
    ),
    SearchFilterBar(),
    GameCatalog()
  );
}
