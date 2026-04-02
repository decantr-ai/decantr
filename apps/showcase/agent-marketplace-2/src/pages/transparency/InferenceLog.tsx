import { css } from '@decantr/css';
import { AgentTimeline } from '../../components/AgentTimeline';

export function InferenceLog() {
  return (
    <div className={css('_flex _col _gap6 _p6')}>
      <h1 className={css('_textxl _fontsemi')}>Inference Log</h1>
      <div className="d-section" data-density="compact">
        <AgentTimeline title="Inference Trace" />
      </div>
    </div>
  );
}
