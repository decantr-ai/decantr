import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Link, Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  BadgeCheck,
  Box,
  Check,
  ChevronRight,
  ClipboardCheck,
  Copy,
  Download,
  FileText,
  Gamepad2,
  HeartHandshake,
  Mail,
  PackageCheck,
  Play,
  Radio,
  Share2,
  Sparkles,
  Star,
  Timer,
  Users,
  Zap,
} from 'lucide-react';

const campaign = {
  product: 'PixelForge MicroDeck',
  label: 'Kickstarter-style prototype drop',
  headline: 'Launch the pocket maker console with arcade-grade momentum',
  subhead:
    'A complete Retro Arcade campaign blueprint for product launches: physical product reveal, backer proof, reward cartridges, stretch-goal map, checkout kiosk, updates, press shelf, and post-pledge sharing.',
  raised: '$184,260',
  goal: '$200,000',
  percent: 92,
  backers: '3,184',
  daysLeft: '07',
  batch: 'Wave 01',
  betaSlots: '116',
};

const metrics = [
  { label: 'Raised', value: campaign.raised, note: `${campaign.percent}% of ${campaign.goal}`, icon: Zap },
  { label: 'Backers', value: campaign.backers, note: 'Founders joined', icon: Users },
  { label: 'Days left', value: campaign.daysLeft, note: 'Campaign clock', icon: Timer },
  { label: 'Beta slots', value: campaign.betaSlots, note: 'First run left', icon: BadgeCheck },
];

const tiers = [
  {
    id: 'starter',
    name: 'Starter Cart',
    price: '$39',
    badge: 'Digital',
    inventory: 'Open run',
    delivery: 'Instant prototype access',
    color: 'cyan',
    features: ['Launch OS template', 'Retro Arcade theme', 'Update log pack'],
  },
  {
    id: 'founder',
    name: 'Founder Deck',
    price: '$89',
    badge: 'Popular',
    inventory: '116 left',
    delivery: 'Ships with Wave 01',
    color: 'yellow',
    features: ['Everything in Starter', 'Reward selector', 'Press shelf', 'Backer ticker'],
  },
  {
    id: 'collector',
    name: 'Collector Box',
    price: '$169',
    badge: 'Limited',
    inventory: '42 left',
    delivery: 'First 500 supporters',
    color: 'pink',
    features: ['Founder Deck', 'Campaign audit', 'Launch checklist', 'Numbered box art'],
  },
  {
    id: 'studio',
    name: 'Studio Cabinet',
    price: '$329',
    badge: 'Teams',
    inventory: '18 left',
    delivery: 'Concierge onboarding',
    color: 'green',
    features: ['Collector Box', 'Team playbook', 'Copy review', 'Private launch QA'],
  },
];

const stretchGoals = [
  { target: '$50k', title: 'Theme pack unlocked', state: 'unlocked', detail: 'Base cabinet language and campaign atoms.' },
  { target: '$100k', title: 'Press shelf unlocked', state: 'unlocked', detail: 'Media assets, fact sheets, and usage notes.' },
  { target: '$150k', title: 'Referral quests online', state: 'unlocked', detail: 'Share loop and post-pledge progress.' },
  { target: '$200k', title: 'Variant cartridges', state: 'current', detail: 'Extra launch formats for software and hardware.' },
  { target: '$250k', title: 'Showcase certification', state: 'locked', detail: 'Automated visual QA and registry proof run.' },
];

const updates = [
  {
    date: 'May 10',
    category: 'Prototype',
    title: 'Wave 01 console shell is playable',
    summary: 'The launch home, rewards, demo, checkout, thanks, and press routes now compile from a single campaign blueprint.',
  },
  {
    date: 'May 08',
    category: 'Funding',
    title: 'Backer progress crossed 90%',
    summary: 'The campaign is close to unlocking variant cartridges and the expanded product drop kit.',
  },
  {
    date: 'May 04',
    category: 'Shipping',
    title: 'Fulfillment language added to every tier',
    summary: 'Reward actions now carry access windows, inventory, caveats, and Wave 01 delivery expectations.',
  },
  {
    date: 'May 01',
    category: 'Press',
    title: 'Media shelf packed with product facts',
    summary: 'The press route includes launch facts, asset previews, contact copy, and downloadable media bundles.',
  },
];

const supporters = [
  'Ava backed Founder Deck',
  'Noah reserved Wave 01',
  'Mina unlocked Collector Box',
  'Kai shared the launch',
  'Rae joined from Austin',
  'Theo chose Starter Cart',
  'Iris copied the press kit',
  'Sol joined Studio Cabinet',
];

const pressAssets = [
  { name: 'Launch fact sheet', type: 'PDF', size: '1.4 MB', icon: FileText },
  { name: 'Product renders', type: 'PNG', size: '22 MB', icon: PackageCheck },
  { name: 'Founder headshots', type: 'ZIP', size: '9 MB', icon: Users },
  { name: 'Prototype b-roll', type: 'MP4', size: '76 MB', icon: Play },
];

function useCampaignHotkeys() {
  const navigate = useNavigate();

  useEffect(() => {
    let waitingForRoute = false;
    const routes: Record<string, string> = {
      h: '/',
      r: '/rewards',
      u: '/updates',
      d: '/demo',
      p: '/press',
    };

    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.matches('input, textarea, select, [contenteditable="true"]')) return;

      if (event.key.toLowerCase() === 'g') {
        waitingForRoute = true;
        window.setTimeout(() => {
          waitingForRoute = false;
        }, 900);
        return;
      }

      if (waitingForRoute) {
        const route = routes[event.key.toLowerCase()];
        if (route) {
          event.preventDefault();
          navigate(route);
        }
        waitingForRoute = false;
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [navigate]);
}

function AppShell({ children }: { children: ReactNode }) {
  useCampaignHotkeys();

  return (
    <div className="arcade-canvas app-shell">
      <div className="scanline-layer" aria-hidden="true" />
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      <header className="site-nav">
        <Link to="/" className="brand-lockup" aria-label="PixelForge campaign home">
          <span className="brand-mark">PF</span>
          <span>
            <strong>PixelForge</strong>
            <small>Launch Cabinet</small>
          </span>
        </Link>
        <nav aria-label="Campaign routes">
          <Link to="/rewards">Rewards</Link>
          <Link to="/updates">Updates</Link>
          <Link to="/story">Story</Link>
          <Link to="/demo">Demo</Link>
          <Link to="/press">Press</Link>
        </nav>
        <Link to="/checkout" className="arcade-button nav-cta">
          Reserve <ArrowRight size={16} />
        </Link>
      </header>
      <main id="main-content">{children}</main>
    </div>
  );
}

function ArcadeButton({
  children,
  to,
  variant = 'primary',
}: {
  children: ReactNode;
  to: string;
  variant?: 'primary' | 'secondary';
}) {
  return (
    <Link className={`arcade-button arcade-button-${variant}`} to={to}>
      {children}
    </Link>
  );
}

function SectionHeader({
  kicker,
  title,
  copy,
  id,
  headingLevel = 'h2',
}: {
  kicker: string;
  title: string;
  copy?: string;
  id?: string;
  headingLevel?: 'h1' | 'h2';
}) {
  const Heading = headingLevel;

  return (
    <div className="section-header">
      <span className="arcade-sticker">{kicker}</span>
      <Heading id={id}>{title}</Heading>
      {copy ? <p>{copy}</p> : null}
    </div>
  );
}

function ProductTheater({ compact = false }: { compact?: boolean }) {
  return (
    <section className={`product-theater arcade-cabinet-shell ${compact ? 'compact' : ''}`} aria-label={`${campaign.product} product visual`}>
      <div className="cabinet-marquee-strip">
        <span>Prototype live</span>
        <span>{campaign.batch}</span>
      </div>
      <div className="product-stage">
        <div className="product-box" aria-hidden="true">
          <div className="box-spine">PF-01</div>
          <div className="box-face">
            <span className="box-label">Limited creator kit</span>
            <strong>MicroDeck</strong>
            <small>Build. Back. Ship.</small>
            <div className="box-art-grid">
              <span />
              <span />
              <span />
              <span />
            </div>
          </div>
        </div>

        <div className="deck-body" aria-hidden="true">
          <div className="deck-screen">
            <div className="screen-grid">
              <span />
              <span />
              <span />
            </div>
            <div className="pixel-logo">PF</div>
            <p>LAUNCH OS</p>
            <strong>92%</strong>
          </div>
          <div className="deck-controls">
            <div className="d-pad">
              <span />
              <span />
              <span />
              <span />
              <span />
            </div>
            <div className="face-buttons">
              <span className="button-a" />
              <span className="button-b" />
              <span className="button-c" />
            </div>
          </div>
        </div>

        <div className="cartridge-pack" aria-hidden="true">
          <span>Reward cart</span>
          <strong>Founder Deck</strong>
          <small>116 left</small>
        </div>
      </div>
      <div className="cabinet-footer">
        <span><Radio size={15} /> Signal ready</span>
        <span>Serial PF-2026-01</span>
      </div>
    </section>
  );
}

function CampaignHero() {
  return (
    <section className="hero-section" aria-labelledby="campaign-title">
      <div className="hero-copy">
        <span className="arcade-sticker hero-sticker">{campaign.label}</span>
        <h1 id="campaign-title" className="arcade-marquee">
          {campaign.headline}
        </h1>
        <p>{campaign.subhead}</p>
        <div className="hero-actions">
          <ArcadeButton to="/checkout">
            Back Wave 01 <ArrowRight size={18} />
          </ArcadeButton>
          <ArcadeButton to="/demo" variant="secondary">
            Watch prototype <Play size={18} />
          </ArcadeButton>
        </div>
        <div className="trust-row" aria-label="Campaign proof">
          <span><BadgeCheck size={16} /> Prototype route included</span>
          <span><Box size={16} /> Product-first scaffold</span>
          <span><HeartHandshake size={16} /> Fulfillment notes visible</span>
        </div>
      </div>
      <ProductTheater />
    </section>
  );
}

function ProgressConsole({ compact = false }: { compact?: boolean }) {
  return (
    <section className={`progress-console arcade-scoreboard ${compact ? 'compact' : ''}`} aria-label="Campaign progress">
      <div className="console-head">
        <span className="arcade-token">Live counter</span>
        <span className="console-status"><Radio size={15} /> Funding signal online</span>
      </div>
      <div className="metric-grid">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <div className="arcade-led-counter" key={metric.label}>
              <span><Icon size={15} /> {metric.label}</span>
              <strong>{metric.value}</strong>
              <small>{metric.note}</small>
            </div>
          );
        })}
      </div>
      <div className="progress-label">
        <strong>{campaign.raised}</strong>
        <span>{campaign.goal} target</span>
      </div>
      <span className="arcade-progress-track" aria-label={`${campaign.percent}% funded`}>
        <span className="progress-fill" />
      </span>
    </section>
  );
}

function RewardTiers() {
  const [selected, setSelected] = useState('founder');
  const selectedTier = tiers.find((tier) => tier.id === selected) ?? tiers[1];

  return (
    <section className="page-band reward-section" aria-labelledby="rewards-title">
      <SectionHeader
        kicker="Reward cartridges"
        title="Choose the launch pack that snaps into your campaign"
        copy="Every tier shows price, inventory, included pieces, and access timing before the pledge action."
        id="rewards-title"
      />
      <div className="tier-rack" role="radiogroup" aria-label="Choose a reward tier">
        {tiers.map((tier) => (
          <button
            type="button"
            role="radio"
            aria-checked={selected === tier.id}
            className="tier-cartridge"
            data-active={selected === tier.id}
            data-color={tier.color}
            key={tier.id}
            onClick={() => setSelected(tier.id)}
          >
            <span className="tier-pin">{tier.badge}</span>
            <span className="tier-name">{tier.name}</span>
            <strong>{tier.price}</strong>
            <small>{tier.delivery}</small>
            <span className="inventory-strip">{tier.inventory}</span>
            <ul>
              {tier.features.map((feature) => (
                <li key={feature}><Check size={15} /> {feature}</li>
              ))}
            </ul>
          </button>
        ))}
      </div>
      <div className="selected-reward-console">
        <div>
          <span className="arcade-token">Selected</span>
          <strong>{selectedTier.name}</strong>
          <p>{selectedTier.delivery}. {selectedTier.inventory}. Includes a transparent campaign status note in checkout.</p>
        </div>
        <ArcadeButton to="/checkout">
          Continue with {selectedTier.name} <ChevronRight size={18} />
        </ArcadeButton>
      </div>
    </section>
  );
}

function StretchGoals() {
  return (
    <section className="page-band stretch-section" aria-labelledby="stretch-title">
      <SectionHeader
        kicker="Level map"
        title="Stretch goals that feel like campaign levels"
        copy="Shared unlocks are presented as a readable milestone map, not buried below generic feature blocks."
        id="stretch-title"
      />
      <ol className="goal-ladder">
        {stretchGoals.map((goal, index) => (
          <li className="goal-node" data-state={goal.state} key={goal.target}>
            <span className="level-number">0{index + 1}</span>
            <div>
              <small>{goal.target}</small>
              <strong>{goal.title}</strong>
              <p>{goal.detail}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

function ProductSpecs() {
  const specs = [
    { label: 'Format', value: 'Full campaign funnel', note: 'Home, rewards, demo, checkout, thanks, press' },
    { label: 'Theme', value: 'Retro Arcade', note: 'Cabinet shell, manual panels, controller buttons' },
    { label: 'Trust', value: 'Visible caveats', note: 'Inventory, access window, delivery, pledge status' },
    { label: 'Motion', value: 'Tactile and reduced-motion safe', note: 'Press states, LED counters, marquee ticks' },
  ];

  return (
    <section className="page-band spec-section" aria-labelledby="specs-title">
      <SectionHeader
        kicker="Box back"
        title="Everything a campaign scaffold needs, printed on the back"
        copy="The product brief is designed like packaging: quick to scan, honest about status, and specific enough for a real launch."
        id="specs-title"
      />
      <div className="manual-foldout arcade-manual-panel">
        <div className="manual-cover">
          <span>Included in box</span>
          <strong>{campaign.product}</strong>
          <p>Launch-ready routes, campaign-native copy patterns, proof moments, and a visual system that resists generic SaaS cards.</p>
        </div>
        <div className="spec-table">
          {specs.map((spec) => (
            <div className="spec-row" key={spec.label}>
              <span>{spec.label}</span>
              <strong>{spec.value}</strong>
              <small>{spec.note}</small>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function DemoBezel() {
  const [mode, setMode] = useState('Campaign');
  const modes = ['Campaign', 'Rewards', 'Checkout'];

  return (
    <section className="page-band demo-section" aria-labelledby="demo-title">
      <SectionHeader
        kicker="Prototype demo"
        title="A playable-looking console, not a decorative mockup"
        copy="The demo frame exposes product evidence, route states, and conversion controls inside a cabinet screen."
        id="demo-title"
      />
      <div className="demo-bezel arcade-bezel">
        <div className="screen-toolbar">
          <span><Gamepad2 size={16} /> Prototype walkthrough</span>
          <span>Mode: {mode}</span>
        </div>
        <div className="demo-screen" aria-label={`${mode} demo screen`}>
          <div className="demo-screen-inner">
            <span className="arcade-token">{mode}</span>
            <strong>{mode === 'Campaign' ? '92% funded' : mode === 'Rewards' ? 'Founder Deck selected' : 'Reserve Wave 01'}</strong>
            <div className="demo-ui-grid">
              <span />
              <span />
              <span />
              <span />
            </div>
            <p>{mode === 'Campaign' ? 'Progress, proof, and CTA are visible before scrolling.' : mode === 'Rewards' ? 'Inventory and delivery are tied to every reward action.' : 'Checkout stays calm, explicit, and conversion-safe.'}</p>
          </div>
        </div>
        <div className="control-strip">
          {modes.map((item) => (
            <button className="arcade-button secondary-control" data-active={mode === item} key={item} onClick={() => setMode(item)} type="button">
              {item}
            </button>
          ))}
          <ArcadeButton to="/checkout">
            Reserve from demo <ArrowRight size={18} />
          </ArcadeButton>
        </div>
      </div>
    </section>
  );
}

function FounderStory() {
  const panels = [
    ['01', 'Problem', 'Great product ideas often lose momentum between prototype proof and the first conversion ask.'],
    ['02', 'Prototype', 'PixelForge packages the funnel as routes, patterns, copy, and visible campaign trust moments.'],
    ['03', 'Launch', 'Backers see what exists, what ships, what unlocks next, and how to choose the right reward.'],
  ];

  return (
    <section className="page-band story-section" aria-labelledby="story-title">
      <SectionHeader
        kicker="Maker strip"
        title="A campaign story with proof in every panel"
        copy="The founder narrative is structured like a manual/comic foldout, with evidence and caveats beside the spark."
        id="story-title"
      />
      <div className="comic-strip">
        {panels.map(([step, title, copy]) => (
          <article className="comic-panel arcade-pixel-border" key={step}>
            <span>{step}</span>
            <strong>{title}</strong>
            <p>{copy}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function BackerTicker() {
  const tickerItems = useMemo(() => [...supporters, ...supporters], []);

  return (
    <section className="ticker-band" aria-label="Recent backer activity">
      <div className="ticker-track">
        {tickerItems.map((item, index) => (
          <span key={`${item}-${index}`}><Star size={14} /> {item}</span>
        ))}
      </div>
    </section>
  );
}

function ContinueCta({
  title = 'Press start on the launch route',
  copy = 'Move visitors from product proof to a reward choice with a physical, controller-like action surface.',
}: {
  title?: string;
  copy?: string;
}) {
  return (
    <section className="continue-screen arcade-cabinet-shell" aria-labelledby="continue-title">
      <div>
        <span className="arcade-token">Continue?</span>
        <h2 id="continue-title">{title}</h2>
        <p>{copy}</p>
      </div>
      <div className="continue-actions">
        <ArcadeButton to="/checkout">
          Reserve Founder Deck <ArrowRight size={18} />
        </ArcadeButton>
        <ArcadeButton to="/press" variant="secondary">
          Open press shelf <Download size={18} />
        </ArcadeButton>
      </div>
    </section>
  );
}

function UpdatesLog() {
  const categories = ['All', 'Prototype', 'Funding', 'Shipping', 'Press'];
  const [active, setActive] = useState('All');
  const visibleUpdates = active === 'All' ? updates : updates.filter((update) => update.category === active);

  return (
    <section className="page-band updates-section" aria-labelledby="updates-title">
      <SectionHeader
        kicker="Update console"
        title="Campaign notes that build trust while momentum grows"
        copy="Prototype, funding, shipping, and press updates stay factual and easy to scan."
        id="updates-title"
      />
      <div className="filter-strip" role="tablist" aria-label="Filter campaign updates">
        {categories.map((category) => (
          <button className="arcade-button secondary-control" data-active={active === category} key={category} onClick={() => setActive(category)} role="tab" type="button">
            {category}
          </button>
        ))}
      </div>
      <div className="update-log">
        {visibleUpdates.map((update) => (
          <article className="update-entry" key={update.title}>
            <div className="update-date">
              <span>{update.date}</span>
              <small>{update.category}</small>
            </div>
            <div>
              <strong>{update.title}</strong>
              <p>{update.summary}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function CheckoutPanel() {
  const [mode, setMode] = useState('card');

  return (
    <section className="checkout-page" aria-labelledby="checkout-title">
      <SectionHeader
        kicker="Checkout kiosk"
        title="Reserve your Wave 01 founder deck"
        copy="The form stays calm and readable while preserving the tactile Retro Arcade surface."
        id="checkout-title"
        headingLevel="h1"
      />
      <div className="checkout-grid">
        <form className="checkout-form arcade-manual-panel">
          <label>
            Supporter name
            <input defaultValue="Launch Founder" />
          </label>
          <label>
            Email
            <input defaultValue="founder@example.com" />
          </label>
          <fieldset>
            <legend>Reserve mode</legend>
            <div className="payment-toggle">
              {[
                ['card', 'Card pledge'],
                ['invoice', 'Team invoice'],
              ].map(([id, label]) => (
                <button className="arcade-button secondary-control" data-active={mode === id} key={id} onClick={() => setMode(id)} type="button">
                  {label}
                </button>
              ))}
            </div>
          </fieldset>
          <label>
            Launch note
            <textarea defaultValue="Ship me the first founder deck and keep the campaign updates coming." />
          </label>
          <Link to="/thanks" className="arcade-button checkout-submit">
            Confirm pledge <ClipboardCheck size={18} />
          </Link>
        </form>
        <aside className="order-summary arcade-scoreboard" aria-label="Order summary">
          <span className="arcade-token">Wave 01</span>
          <h2>Founder Deck</h2>
          <div className="summary-line"><span>Pledge</span><strong>$89</strong></div>
          <div className="summary-line"><span>Ships</span><strong>June 2026</strong></div>
          <div className="summary-line"><span>Inventory</span><strong>116 left</strong></div>
          <p>Payment timing, fulfillment status, and beta access are confirmed before the campaign action completes.</p>
        </aside>
      </div>
    </section>
  );
}

function ShareQuest() {
  const quests = [
    ['Copy link', '1 referral point', Copy],
    ['Email press kit', '3 referral points', Mail],
    ['Share campaign', '5 referral points', Share2],
  ];

  return (
    <section className="page-band share-section" aria-labelledby="share-title">
      <SectionHeader
        kicker="After pledge"
        title="A post-conversion share quest without the guilt trip"
        copy="Confirmation comes first. Sharing is framed as an optional unlock path with transparent progress."
        id="share-title"
      />
      <div className="quest-row">
        {quests.map(([title, reward, Icon]) => (
          <button className="quest-button" type="button" key={title as string}>
            <Icon size={20} />
            <strong>{title}</strong>
            <small>{reward}</small>
          </button>
        ))}
      </div>
    </section>
  );
}

function PressShelf() {
  return (
    <section className="page-band press-section" aria-labelledby="press-title">
      <SectionHeader
        kicker="Press shelf"
        title="Launch assets packed like a retail display"
        copy="Media, product facts, and contact actions are factual, inspectable, and easy to pull into coverage."
        id="press-title"
        headingLevel="h1"
      />
      <div className="press-shelf">
        {pressAssets.map((asset) => {
          const Icon = asset.icon;
          return (
            <article className="press-asset" key={asset.name}>
              <Icon size={22} />
              <strong>{asset.name}</strong>
              <span>{asset.type} / {asset.size}</span>
              <button className="arcade-button secondary-control" type="button">
                Download
              </button>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function HomePage() {
  return (
    <>
      <CampaignHero />
      <ProgressConsole />
      <DemoBezel />
      <ProductSpecs />
      <RewardTiers />
      <StretchGoals />
      <FounderStory />
      <BackerTicker />
      <ContinueCta />
    </>
  );
}

function RewardsPage() {
  return (
    <>
      <section className="page-hero page-band">
        <SectionHeader
          kicker="Rewards"
          title="Four campaign packs, each with inventory and delivery in view"
          copy="Use this route when a visitor wants the details before choosing a pledge level."
          headingLevel="h1"
        />
      </section>
      <RewardTiers />
      <ProductSpecs />
      <ProgressConsole compact />
      <ContinueCta title="Lock in the founder deck" copy="Carry the selected reward into a focused, trust-first checkout kiosk." />
    </>
  );
}

function UpdatesPage() {
  return (
    <>
      <section className="page-hero page-band">
        <SectionHeader
          kicker="Updates"
          title="Proof beats hype on campaign day"
          copy="Backers can see prototype status, funding movement, shipping notes, and press coverage in one place."
          headingLevel="h1"
        />
      </section>
      <UpdatesLog />
      <ProgressConsole compact />
      <ContinueCta title="Ready to join Wave 01?" copy="Use updates as proof, then route visitors back into a clear reward action." />
    </>
  );
}

function StoryPage() {
  return (
    <>
      <section className="page-hero page-band">
        <SectionHeader
          kicker="Story"
          title="The maker narrative stays grounded in product proof"
          copy="A compact campaign story explains why this exists, what has been built, and what support unlocks next."
          headingLevel="h1"
        />
      </section>
      <FounderStory />
      <ProductSpecs />
      <ContinueCta title="Back the product, not just the vibe" copy="Tie the origin story back to a visible, specific launch reward." />
    </>
  );
}

function DemoPage() {
  return (
    <>
      <section className="page-hero page-band">
        <SectionHeader
          kicker="Demo"
          title="Prototype evidence sits inside the cabinet screen"
          copy="The demo route gives skeptical visitors one product-focused place to inspect the launch before pledging."
          headingLevel="h1"
        />
      </section>
      <DemoBezel />
      <ProductTheater compact />
      <ContinueCta title="Reserve from the demo" copy="Move from proof to pledge without making visitors hunt for the next step." />
    </>
  );
}

function CheckoutPage() {
  return <CheckoutPanel />;
}

function ThanksPage() {
  return (
    <>
      <section className="page-hero page-band">
        <SectionHeader
          kicker="Pledge confirmed"
          title="Wave 01 reserved"
          copy="The success state confirms the action first, then offers optional share quests and backer proof."
          headingLevel="h1"
        />
      </section>
      <ShareQuest />
      <BackerTicker />
      <ContinueCta title="Campaign loop complete" copy="The blueprint covers discovery, proof, reward choice, pledge, and post-conversion sharing." />
    </>
  );
}

function PressPage() {
  return (
    <>
      <PressShelf />
      <ProductSpecs />
      <ContinueCta title="Need the campaign context?" copy="Route press visitors to the product demo, reward details, or maker story without losing the launch shell." />
    </>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<AppShell><HomePage /></AppShell>} />
      <Route path="/rewards" element={<AppShell><RewardsPage /></AppShell>} />
      <Route path="/updates" element={<AppShell><UpdatesPage /></AppShell>} />
      <Route path="/story" element={<AppShell><StoryPage /></AppShell>} />
      <Route path="/demo" element={<AppShell><DemoPage /></AppShell>} />
      <Route path="/checkout" element={<AppShell><CheckoutPage /></AppShell>} />
      <Route path="/thanks" element={<AppShell><ThanksPage /></AppShell>} />
      <Route path="/press" element={<AppShell><PressPage /></AppShell>} />
      <Route path="/credits" element={<Navigate to="/" replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export { App };
export default App;
