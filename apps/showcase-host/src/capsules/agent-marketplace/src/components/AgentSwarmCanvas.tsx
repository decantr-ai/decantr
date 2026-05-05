import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Bot, Maximize2, Pause, Play, ZoomIn, ZoomOut } from 'lucide-react';
import { css } from '@decantr/css';
import type { AgentNode } from '../data/mock';

function statusToAnnotation(status: AgentNode['status']) {
  if (status === 'active') return 'success';
  if (status === 'processing') return 'info';
  if (status === 'error') return 'error';
  return 'warning';
}

export function AgentSwarmCanvas({
  agents,
  connections,
  onSelectAgent,
}: {
  agents: AgentNode[];
  connections: readonly (readonly [string, string])[];
  onSelectAgent: (id: string) => void;
}) {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const [running, setRunning] = useState(true);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const panStartRef = useRef({ x: 0, y: 0, panX: 0, panY: 0 });
  const dragStartRef = useRef({ x: 0, y: 0, nodeX: 0, nodeY: 0, moved: false });
  const nodeRefs = useRef(new Map<string, HTMLButtonElement>());
  const [nodeSizes, setNodeSizes] = useState<Record<string, { width: number; height: number }>>({});
  const [nodePositions, setNodePositions] = useState<Record<string, { x: number; y: number }>>(() =>
    Object.fromEntries(agents.map((agent) => [agent.id, { x: agent.x, y: agent.y }])),
  );

  const agentMap = useMemo(
    () => new Map(agents.map((agent) => [agent.id, agent])),
    [agents],
  );

  useLayoutEffect(() => {
    setNodePositions(Object.fromEntries(agents.map((agent) => [agent.id, { x: agent.x, y: agent.y }])));
  }, [agents]);

  useLayoutEffect(() => {
    const nextSizes: Record<string, { width: number; height: number }> = {};

    for (const [id, element] of nodeRefs.current.entries()) {
      nextSizes[id] = {
        width: element.offsetWidth,
        height: element.offsetHeight,
      };
    }

    setNodeSizes(nextSizes);
  }, [agents]);

  function setNodeRef(id: string, element: HTMLButtonElement | null) {
    if (element) {
      nodeRefs.current.set(id, element);
    } else {
      nodeRefs.current.delete(id);
    }
  }

  function getPoints(fromId: string, toId: string) {
    const from = agentMap.get(fromId);
    const to = agentMap.get(toId);
    if (!from || !to) {
      return {
        start: { x: 0, y: 0, side: 'right' as const },
        end: { x: 0, y: 0, side: 'left' as const },
      };
    }

    const fromSize = nodeSizes[fromId] ?? { width: 208, height: 146 };
    const toSize = nodeSizes[toId] ?? { width: 208, height: 146 };
    const fromPosition = nodePositions[fromId] ?? { x: from.x, y: from.y };
    const toPosition = nodePositions[toId] ?? { x: to.x, y: to.y };

    const fromCenter = {
      x: fromPosition.x + fromSize.width / 2,
      y: fromPosition.y + fromSize.height / 2,
    };
    const toCenter = {
      x: toPosition.x + toSize.width / 2,
      y: toPosition.y + toSize.height / 2,
    };

    const dx = toCenter.x - fromCenter.x;
    const dy = toCenter.y - fromCenter.y;
    const horizontalBias = Math.abs(dx) >= Math.abs(dy) * 1.1;

    const startSide = horizontalBias
      ? (dx >= 0 ? 'right' : 'left')
      : (dy >= 0 ? 'bottom' : 'top');
    const endSide = horizontalBias
      ? (dx >= 0 ? 'left' : 'right')
      : (dy >= 0 ? 'top' : 'bottom');

    function anchorFor(position: { x: number; y: number }, size: { width: number; height: number }, side: 'left' | 'right' | 'top' | 'bottom') {
      if (side === 'left') return { x: position.x, y: position.y + size.height / 2, side };
      if (side === 'right') return { x: position.x + size.width, y: position.y + size.height / 2, side };
      if (side === 'top') return { x: position.x + size.width / 2, y: position.y, side };
      return { x: position.x + size.width / 2, y: position.y + size.height, side };
    }

    return {
      start: anchorFor(fromPosition, fromSize, startSide),
      end: anchorFor(toPosition, toSize, endSide),
    };
  }

  function controlPointFor(
    point: { x: number; y: number; side: 'left' | 'right' | 'top' | 'bottom' },
    distance: number,
  ) {
    const offset = Math.max(48, Math.min(120, distance * 0.35));

    if (point.side === 'left') return { x: point.x - offset, y: point.y };
    if (point.side === 'right') return { x: point.x + offset, y: point.y };
    if (point.side === 'top') return { x: point.x, y: point.y - offset };
    return { x: point.x, y: point.y + offset };
  }

  function applyZoom(nextZoom: number, anchorClientX?: number, anchorClientY?: number) {
    const viewport = viewportRef.current;
    const clampedZoom = Math.min(2.25, Math.max(0.65, nextZoom));

    if (!viewport) {
      setZoom(clampedZoom);
      return;
    }

    const rect = viewport.getBoundingClientRect();
    const anchorX = anchorClientX !== undefined ? anchorClientX - rect.left : rect.width / 2;
    const anchorY = anchorClientY !== undefined ? anchorClientY - rect.top : rect.height / 2;
    const worldX = (anchorX - pan.x) / zoom;
    const worldY = (anchorY - pan.y) / zoom;

    setZoom(clampedZoom);
    setPan({
      x: anchorX - worldX * clampedZoom,
      y: anchorY - worldY * clampedZoom,
    });
  }

  function handlePointerDown(event: React.PointerEvent<HTMLDivElement>) {
    if ((event.target as HTMLElement).closest('[data-agent-node="true"]')) return;
    setIsPanning(true);
    panStartRef.current = {
      x: event.clientX,
      y: event.clientY,
      panX: pan.x,
      panY: pan.y,
    };
    viewportRef.current?.setPointerCapture(event.pointerId);
  }

  function handlePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    if (draggingNodeId) {
      const nextX = dragStartRef.current.nodeX + (event.clientX - dragStartRef.current.x) / zoom;
      const nextY = dragStartRef.current.nodeY + (event.clientY - dragStartRef.current.y) / zoom;
      if (Math.abs(event.clientX - dragStartRef.current.x) > 3 || Math.abs(event.clientY - dragStartRef.current.y) > 3) {
        dragStartRef.current.moved = true;
      }
      setNodePositions((current) => ({
        ...current,
        [draggingNodeId]: {
          x: Math.max(24, Math.min(980, nextX)),
          y: Math.max(24, Math.min(360, nextY)),
        },
      }));
      return;
    }

    if (!isPanning) return;
    setPan({
      x: panStartRef.current.panX + (event.clientX - panStartRef.current.x),
      y: panStartRef.current.panY + (event.clientY - panStartRef.current.y),
    });
  }

  function handlePointerEnd(event: React.PointerEvent<HTMLDivElement>) {
    if (draggingNodeId) {
      const releasedNodeId = draggingNodeId;
      const didMove = dragStartRef.current.moved;
      setDraggingNodeId(null);
      dragStartRef.current.moved = false;
      viewportRef.current?.releasePointerCapture(event.pointerId);
      if (!didMove) {
        onSelectAgent(releasedNodeId);
      }
      return;
    }

    if (!isPanning) return;
    setIsPanning(false);
    viewportRef.current?.releasePointerCapture(event.pointerId);
  }

  function resetView() {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }

  return (
    <section className="swarm-shell carbon-fade-slide">
      <div className="swarm-canvas">
        <div
          ref={viewportRef}
          className="swarm-canvas__viewport"
          data-panning={isPanning ? 'true' : 'false'}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerEnd}
          onPointerCancel={handlePointerEnd}
          onPointerLeave={(event) => {
            if (isPanning) handlePointerEnd(event);
          }}
          onWheel={(event) => {
            event.preventDefault();
            const deltaFactor = Math.exp(-event.deltaY * 0.0012);
            applyZoom(zoom * deltaFactor, event.clientX, event.clientY);
          }}
          role="application"
          aria-label="Agent swarm canvas"
        >
          <div
            className="swarm-canvas__pan-layer"
            style={{ transform: `translate(${pan.x}px, ${pan.y}px)` }}
          >
            <div
              className="swarm-canvas__zoom-layer"
              data-zoom={Math.round(zoom * 100)}
              style={{ transform: `scale(${zoom})` }}
            >
              <svg className="swarm-canvas__svg-layer" aria-hidden="true">
                {connections.map(([from, to]) => {
                  const { start, end } = getPoints(from, to);
                  const distance = Math.hypot(end.x - start.x, end.y - start.y);
                  const controlA = controlPointFor(start, distance);
                  const controlB = controlPointFor(end, distance);
                  return (
                    <path
                      key={`${from}-${to}`}
                      className="swarm-canvas__flow"
                      data-flow-direction={start.side === 'right' || start.side === 'left' ? 'horizontal' : 'vertical'}
                      d={`M ${start.x} ${start.y} C ${controlA.x} ${controlA.y}, ${controlB.x} ${controlB.y}, ${end.x} ${end.y}`}
                    />
                  );
                })}
              </svg>
              {agents.map((agent) => (
                <button
                  key={agent.id}
                  type="button"
                  ref={(element) => setNodeRef(agent.id, element)}
                  className="d-surface carbon-card swarm-node"
                  data-agent-id={agent.id}
                  data-interactive
                  data-status={agent.status}
                  data-agent-node="true"
                  data-dragging={draggingNodeId === agent.id ? 'true' : 'false'}
                  style={{
                    left: `${(nodePositions[agent.id] ?? { x: agent.x, y: agent.y }).x}px`,
                    top: `${(nodePositions[agent.id] ?? { x: agent.x, y: agent.y }).y}px`,
                  }}
                  onPointerDown={(event) => {
                    event.stopPropagation();
                    dragStartRef.current = {
                      x: event.clientX,
                      y: event.clientY,
                      nodeX: (nodePositions[agent.id] ?? { x: agent.x, y: agent.y }).x,
                      nodeY: (nodePositions[agent.id] ?? { x: agent.x, y: agent.y }).y,
                      moved: false,
                    };
                    setDraggingNodeId(agent.id);
                    viewportRef.current?.setPointerCapture(event.pointerId);
                  }}
                >
                  <div className="swarm-node__top">
                    <div className="status-ring" data-status={agent.status}>
                      <Bot size={15} />
                    </div>
                    <div className="swarm-node__identity">
                      <span className="swarm-node__title">{agent.name}</span>
                      <span className="swarm-node__id">{agent.id}</span>
                    </div>
                  </div>
                  <div className={css('_flex _aic _gap2')}>
                    <span className="d-annotation" data-status={statusToAnnotation(agent.status)}>
                      <span className="status-inline-dot" data-status={agent.status} />
                      {agent.status}
                    </span>
                    <span className="d-annotation">{agent.zone}</span>
                  </div>
                  <div className="swarm-node__meta">
                    <span>Requests: {agent.requests}</span>
                    <span>{agent.latency > 0 ? `Latency: ${agent.latency}ms` : 'Latency: idle'}</span>
                    <span>Model: {agent.model}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <aside className="d-surface carbon-glass swarm-canvas__overlay">
          <div className="section-heading">
            <span className="mono-kicker">Live fleet signal</span>
            <strong>Operator summary</strong>
          </div>
          <div className="swarm-canvas__legend">
            <span className="status-pill" data-status="active"><span className="status-pill__dot" />2 active</span>
            <span className="status-pill" data-status="processing"><span className="status-pill__dot" />1 processing</span>
            <span className="status-pill" data-status="error"><span className="status-pill__dot" />1 error</span>
          </div>
          <div className="swarm-canvas__overlay-bar" aria-hidden="true">
            <span />
          </div>
          <div className="swarm-canvas__overlay-meta">
            <span className="d-annotation">5 fleet nodes</span>
            <span className="d-annotation">4 live handoffs</span>
            <span className="d-annotation" data-status="success">Queue healthy</span>
          </div>
        </aside>

        <div className="d-surface carbon-glass swarm-canvas__controls">
          <button type="button" className="d-interactive icon-button" data-variant="ghost" onClick={() => applyZoom(zoom + 0.12)} aria-label="Zoom in">
            <ZoomIn size={14} />
          </button>
          <button type="button" className="d-interactive icon-button" data-variant="ghost" onClick={() => applyZoom(zoom - 0.12)} aria-label="Zoom out">
            <ZoomOut size={14} />
          </button>
          <button type="button" className="d-interactive icon-button" data-variant="ghost" onClick={resetView} aria-label="Fit view">
            <Maximize2 size={14} />
          </button>
          <button type="button" className="d-interactive icon-button" data-variant="ghost" onClick={() => setRunning((current) => !current)} aria-label={running ? 'Pause swarm' : 'Resume swarm'}>
            {running ? <Pause size={14} /> : <Play size={14} />}
          </button>
          <span className="swarm-canvas__controls-value">{Math.round(zoom * 100)}%</span>
        </div>
      </div>
    </section>
  );
}
