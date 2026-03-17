import { tags } from 'decantr/tags';
import { onMount } from 'decantr/core';
import { createSignal, createMemo } from 'decantr/state';
import { css } from 'decantr/css';
import { Badge, Button, Card, Chip, icon } from 'decantr/components';
import { navigate } from 'decantr/router';

const { div, span, h2, h3, p } = tags;

// ─── Curated Palette Data ───────────────────────────────────────
const collections = [
  { name: 'Sunset Warmth', mood: 'Warm', colors: ['#ff6b6b', '#ee5a24', '#f0932b', '#ffbe76', '#ffeaa7'], desc: 'Radiant orange-to-peach gradient inspired by golden hour.' },
  { name: 'Ocean Breeze', mood: 'Cool', colors: ['#0abde3', '#48dbfb', '#54a0ff', '#5f27cd', '#341f97'], desc: 'Deep indigo to sky blue — a tranquil ocean gradient.' },
  { name: 'Cotton Candy', mood: 'Pastel', colors: ['#f8b4c8', '#c4b4f8', '#b4d8f8', '#b4f8d8', '#f8e8b4'], desc: 'Ultra-soft pastels for gentle, playful interfaces.' },
  { name: 'Electric Neon', mood: 'Vibrant', colors: ['#ff00ff', '#00ff88', '#ffff00', '#ff3366', '#00ccff'], desc: 'Bold neon primaries for maximum visual impact.' },
  { name: 'Forest Floor', mood: 'Earthy', colors: ['#2d3436', '#636e72', '#b2bec3', '#dfe6e9', '#55a060'], desc: 'Grounded earth tones with a mossy green accent.' },
  { name: 'Lavender Dreams', mood: 'Pastel', colors: ['#a78bfa', '#c4b5fd', '#ddd6fe', '#ede9fe', '#f5f3ff'], desc: 'Violet monochrome from deep purple to whisper white.' },
  { name: 'Coral Reef', mood: 'Warm', colors: ['#ff7675', '#fab1a0', '#ffecd2', '#fcb69f', '#e17055'], desc: 'Living coral tones — warm, organic, and inviting.' },
  { name: 'Arctic Ice', mood: 'Cool', colors: ['#dfe6e9', '#b2bec3', '#74b9ff', '#0984e3', '#2d3436'], desc: 'Cool grays and blues evoking glacial landscapes.' },
  { name: 'Tropical Pop', mood: 'Vibrant', colors: ['#fd79a8', '#fdcb6e', '#00cec9', '#6c5ce7', '#e17055'], desc: 'Bold tropical hues — mangoes, flamingos, and lagoons.' },
  { name: 'Desert Sand', mood: 'Earthy', colors: ['#d4a574', '#c9956b', '#b8860b', '#deb887', '#f5deb3'], desc: 'Warm sandstone and terracotta from arid landscapes.' },
  { name: 'Cherry Blossom', mood: 'Pastel', colors: ['#ffb7c5', '#ff87ab', '#f8c8dc', '#fce4ec', '#fff0f5'], desc: 'Delicate pink hues inspired by spring sakura.' },
  { name: 'Midnight Jazz', mood: 'Cool', colors: ['#191970', '#1a1a2e', '#2c3e50', '#8e44ad', '#3498db'], desc: 'Deep midnight blues with electric purple accents.' },
];

const moods = ['All', 'Warm', 'Cool', 'Pastel', 'Vibrant', 'Earthy'];

// ─── Palette Card ───────────────────────────────────────────────
function PaletteCard({ palette }) {
  return Card({ hover: true, class: css('cy-pillow cy-jelly cy-squish'), onclick: () => navigate('/detail') },
    // Swatch strip
    div({ class: css('_flex _r4 _overflow[hidden] _h16') },
      ...palette.colors.map(c =>
        div({ class: css('_flex1'), style: `background:${c}` })
      )
    ),
    Card.Body({ class: css('_flex _col _gap2') },
      div({ class: css('_flex _aic _jcsb') },
        h3({ class: css('_heading5 _medium') }, palette.name),
        Badge({ variant: 'outline', size: 'sm' }, palette.mood)
      ),
      p({ class: css('_textxs _fgmuted _lh[1.5]') }, palette.desc),
      div({ class: css('_flex _aic _jcsb _mt1') },
        div({ class: css('_flex _gap1') },
          ...palette.colors.map(c =>
            div({ class: css('_w3 _h3 _rfull cy-soft'), style: `background:${c}` })
          )
        ),
        Button({ variant: 'ghost', size: 'sm', class: css('_textxs') },
          icon('arrow-right', { size: '0.75rem' })
        )
      )
    )
  );
}

// ─── Page ───────────────────────────────────────────────────────
export default function ExplorePage() {
  const [activeMood, setActiveMood] = createSignal('All');

  const filtered = createMemo(() => {
    const mood = activeMood();
    if (mood === 'All') return collections;
    return collections.filter(c => c.mood === mood);
  });

  onMount(() => {
    document.title = 'Explore — Chromaform';
  });

  return div({ class: css('d-page-enter _flex _col _gap6') },
    // Page header
    div({ class: css('_flex _aic _gap2') },
      icon('grid', { size: '1.25rem', class: css('_fgprimary') }),
      h2({ class: css('_heading4 d-gradient-text') }, 'Explore Palettes')
    ),

    // Mood filter chips
    div({ class: css('_flex _gap2 _wrap') },
      ...moods.map(mood =>
        Chip({
          label: mood,
          variant: () => activeMood() === mood ? 'primary' : 'outline',
          onclick: () => setActiveMood(mood),
          class: css('cy-squish'),
        })
      )
    ),

    // Count
    div({ class: css('_flex _aic _jcsb') },
      span({ class: css('_textsm _fgmuted') }, () => `${filtered().length} palette${filtered().length !== 1 ? 's' : ''}`),
      span({ class: css('cy-label') }, () => activeMood() === 'All' ? 'ALL MOODS' : activeMood().toUpperCase())
    ),

    // Grid
    div({ class: css('_grid _gc1 _sm:gc2 _lg:gc3 _gap4 d-stagger-scale') },
      ...collections.map(palette => {
        const el = PaletteCard({ palette });
        el.style.setProperty('display', '');
        return el;
      })
    )
  );
}
