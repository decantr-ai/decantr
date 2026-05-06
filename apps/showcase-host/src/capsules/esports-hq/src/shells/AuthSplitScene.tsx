import { Link, Outlet } from 'react-router-dom';
import { Activity, Crosshair, Radio, Shield, Trophy, Zap } from 'lucide-react';

export function AuthSplitScene() {
  return (
    <div className="esx-auth-shell">
      <section className="esx-auth-panel" aria-label="Authentication">
        <Link to="/" className="esx-auth-brand">
          <span className="esx-brand-mark" aria-hidden="true">
            <Trophy size={18} />
          </span>
          <span>Esports HQ</span>
        </Link>

        <div className="esx-auth-card">
          <Outlet />
        </div>
      </section>

      <aside className="esx-auth-scene" aria-label="Live operations preview">
        <div className="esx-auth-orb" aria-hidden="true" />
        <div className="esx-auth-terminal">
          <div className="esx-auth-terminal-head">
            <span>Shadow Legion</span>
            <span>Map 2: Ascent</span>
          </div>
          <div className="esx-auth-scoreline">
            <strong>08</strong>
            <span>:</span>
            <strong>06</strong>
          </div>
          <div className="esx-auth-map">
            <span className="esx-map-node is-hot" />
            <span className="esx-map-node" />
            <span className="esx-map-node is-cold" />
            <span className="esx-map-node" />
            <span className="esx-map-line" />
          </div>
        </div>

        <div className="esx-auth-float is-top">
          <Radio size={16} />
          <span>Live scrim room</span>
        </div>
        <div className="esx-auth-float is-mid">
          <Crosshair size={16} />
          <span>Retake plan locked</span>
        </div>
        <div className="esx-auth-float is-low">
          <Zap size={16} />
          <span>Momentum +18%</span>
        </div>

        <div className="esx-auth-metrics">
          <div>
            <Activity size={16} />
            <span>Form</span>
            <strong>91</strong>
          </div>
          <div>
            <Shield size={16} />
            <span>Comms</span>
            <strong>A+</strong>
          </div>
        </div>
      </aside>
    </div>
  );
}
