import { useNavigate } from 'react-router-dom';
import { ArrowUpRight, Lock, Play, Radio } from 'lucide-react';

const rosterRows = [
  {
    home: { avatar: 'PX', name: 'PhantomX', role: 'Entry' },
    away: { avatar: 'VX', name: 'VexRift', role: 'Duelist' },
  },
  {
    home: { avatar: 'CN', name: 'CyberNova', role: 'Support' },
    away: { avatar: 'RK', name: 'RiftKade', role: 'Sentinel' },
  },
  {
    home: { avatar: 'BF', name: 'BlazeFury', role: 'AWPer' },
    away: { avatar: 'NR', name: 'NullRaze', role: 'Anchor' },
  },
  {
    home: { avatar: 'IW', name: 'IronWolf', role: 'IGL' },
    away: { avatar: 'HM', name: 'HexMotive', role: 'Controller' },
  },
  {
    home: { avatar: 'PS', name: 'PixelStorm', role: 'Lurker' },
    away: { avatar: 'SK', name: 'SilicaK', role: 'Flex' },
  },
];

const updates = [
  ['12:44', 'Vitality converts a broken buy on B split'],
  ['12:02', 'r3F burns both flashes before the retake call'],
  ['11:37', 'PixelStorm opens mid with a clean triple entry'],
  ['10:58', 'IronWolf sells the fake and empties A site'],
  ['10:21', 'CyberNova denies Baron setup with late vision'],
  ['09:46', 'NullRaze clutches the 1v3 post-plant retake'],
];

const telemetry = [
  { label: 'Map ban closes', value: '04:12' },
  { label: 'Comms', value: '94' },
  { label: 'Form', value: '91' },
  { label: 'Momentum', value: '+18' },
];

const commandLayers = [
  {
    label: '01',
    title: 'Live Pressure',
    copy: 'Opponent tempo, player fatigue, economy risk, and round pressure pulse together.',
  },
  {
    label: '02',
    title: 'Replay Evidence',
    copy: 'Every clip lands as a timestamped coaching decision, not a forgotten VOD note.',
  },
  {
    label: '03',
    title: 'Partner Control',
    copy: 'Sponsor reads, broadcast windows, and activation promises stay inside match flow.',
  },
];

export function HomePage() {
  const navigate = useNavigate();
  const reelItems = [...updates, ...updates];

  return (
    <div className="matchday-page">
      <section className="matchday" aria-labelledby="matchday-title">
        <div className="matchday-field" aria-hidden="true">
          <span className="matchday-grid" />
          <span className="matchday-light light-cyan" />
          <span className="matchday-light light-violet" />
          <span className="matchday-light light-red" />
          <span className="matchday-radar">
            <span />
            <span />
            <span />
          </span>
        </div>

        <div className="hero-copy">
          <p className="match-eyebrow">
            <span />
            Live from Metro Gaming Coliseum
          </p>
          <h1 id="matchday-title">
            <span data-text="Team Vitality">Team Vitality</span>
            <em>vs.</em>
            <span data-text="r3Fraction">r3Fraction</span>
          </h1>
          <p className="lede">
            Live score, map control, player form, and coaching cues update in one broadcast view
            built for the next call before the round resets.
          </p>

          <div className="match-telemetry" aria-label="Broadcast telemetry">
            <div className="telemetry-score">
              <span>Team Vitality</span>
              <strong>8</strong>
              <em>Ascent</em>
              <strong>6</strong>
              <span>R3F</span>
            </div>
            {telemetry.map((item) => (
              <div key={item.label}>
                <span>{item.label}</span>
                <strong>{item.value}</strong>
              </div>
            ))}
          </div>

          <div className="hero-actions" aria-label="Primary actions">
            <button className="cut-button primary live-watch" type="button" onClick={() => navigate('/team')}>
              <span className="live-beacon" aria-hidden="true" />
              <span>Watch Live</span>
            </button>
            <button className="cut-button secondary" type="button" onClick={() => navigate('/vods')}>
              <Play size={17} />
              <span>Watch Replay</span>
            </button>
          </div>
        </div>

        <aside className="roster-panel" id="roster" aria-label="Team Vitality versus r3Fraction roster">
          <div className="roster-panel__score">
            <span>Team Vitality</span>
            <strong>8</strong>
            <em>Ascent</em>
            <strong>6</strong>
            <span>r3Fraction</span>
          </div>
          <div className="roster-grid" aria-label="Starting five matchup">
            <div className="roster-head">
              <span>Vitality</span>
              <span>r3F</span>
            </div>
            {rosterRows.map((row) => (
              <article key={`${row.home.name}-${row.away.name}`}>
                <PlayerCard player={row.home} tint="cyan" />
                <PlayerCard player={row.away} tint="pink" rival />
              </article>
            ))}
          </div>

          <div className="roster-feed" aria-label="Live match updates">
            <div className="roster-feed__head">
              <span>Live updates</span>
              <strong>rolling</strong>
            </div>
            <div className="roster-reel">
              <div className="reel-track">
                {reelItems.map(([time, text], index) => (
                  <span key={`${time}-${index}`}>
                    <em>{time}</em>
                    {text}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </aside>
      </section>

      <section className="war-room" id="war-room" aria-labelledby="war-room-title">
        <div className="section-heading">
          <p>
            <Radio size={15} />
            Command layers
          </p>
          <h2 id="war-room-title">Built like a broadcast truck, tuned like a coaching room.</h2>
        </div>

        <div className="war-lanes">
          {commandLayers.map((layer) => (
            <article className="lane" key={layer.label}>
              <span>{layer.label}</span>
              <h3>{layer.title}</h3>
              <p>{layer.copy}</p>
              <ArrowUpRight size={20} />
            </article>
          ))}
        </div>
      </section>

      <section className="access" id="access" aria-labelledby="access-title">
        <div className="access-art" aria-hidden="true">
          <span className="portal-ring ring-a" />
          <span className="portal-ring ring-b" />
          <span className="portal-core" />
          <span className="portal-blade blade-a" />
          <span className="portal-blade blade-b" />
        </div>

        <form className="access-form">
          <p>
            <Lock size={15} />
            Secure team portal
          </p>
          <h2 id="access-title">Enter the command room</h2>
          <label>
            <span>Operator</span>
            <input type="text" defaultValue="coach@shadowlegion.gg" />
          </label>
          <label>
            <span>Access key</span>
            <input type="password" defaultValue="matchday" />
          </label>
          <button className="cut-button primary" type="button" onClick={() => navigate('/login')}>
            <span>Authorize</span>
          </button>
        </form>
      </section>
    </div>
  );
}

function PlayerCard({
  player,
  rival = false,
  tint,
}: {
  player: { avatar: string; name: string; role: string };
  rival?: boolean;
  tint: 'cyan' | 'pink';
}) {
  return (
    <div className={`player-card${rival ? ' rival' : ''}`}>
      <span className={`avatar avatar-${tint}`}>{player.avatar}</span>
      <div>
        <strong>{player.name}</strong>
        <em>{player.role}</em>
      </div>
    </div>
  );
}
