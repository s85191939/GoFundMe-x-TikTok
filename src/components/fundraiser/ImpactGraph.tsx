'use client';

import { useMemo, useState, useEffect } from 'react';
import Link from 'next/link';
import { getImpactConnections, getCategoryEmoji } from '@/lib/impactGraph';
import { formatCurrency } from '@/lib/formatters';

interface ImpactGraphProps {
  fundraiserId: string;
}

// ─── Layout constants ────────────────────────────────────────

const WIDTH = 700;
const HEIGHT = 660;
const CX = WIDTH / 2;
const CY = HEIGHT / 2;
const RADIUS = 220;
const FONT = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

const YOU_X = CX - 230;
const YOU_Y = CY - 20;

function truncate(text: string, max: number): string {
  return text.length > max ? text.slice(0, max - 1) + '\u2026' : text;
}

// Split text into two lines for SVG display
function splitTitle(text: string, maxPerLine: number): string[] {
  if (text.length <= maxPerLine) return [text];
  // Try to break at a word boundary
  const words = text.split(' ');
  let line1 = '';
  let i = 0;
  while (i < words.length && (line1 + words[i]).length <= maxPerLine) {
    line1 += (line1 ? ' ' : '') + words[i];
    i++;
  }
  if (i === 0) {
    // Single very long word
    return [text.slice(0, maxPerLine), text.slice(maxPerLine, maxPerLine * 2)];
  }
  const remaining = words.slice(i).join(' ');
  if (remaining.length > maxPerLine) {
    return [line1, truncate(remaining, maxPerLine)];
  }
  return remaining ? [line1, remaining] : [line1];
}

export default function ImpactGraph({ fundraiserId }: ImpactGraphProps) {
  const data = useMemo(() => getImpactConnections(fundraiserId), [fundraiserId]);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 150);
    return () => clearTimeout(timer);
  }, []);

  if (!data || data.connections.length === 0) return null;

  const { currentFundraiser, userSupported, connections, totalSharedDonors } = data;

  const angleOffset = userSupported ? Math.PI * 0.1 : 0;
  const startAngle = -Math.PI / 2 + angleOffset;
  const positions = connections.map((_, i) => {
    const angle = startAngle + (2 * Math.PI * i) / connections.length;
    return {
      x: CX + RADIUS * Math.cos(angle),
      y: CY + RADIUS * Math.sin(angle),
    };
  });

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6 overflow-hidden shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-2.5 mb-1.5">
        <h3 className="text-lg font-bold text-gray-900 tracking-tight">
          🤖 Impact Network
        </h3>
        <span className="text-[11px] font-semibold bg-purple-50 text-purple-600 px-2.5 py-0.5 rounded-full border border-purple-100">
          AI-generated
        </span>
      </div>
      <p className="text-sm text-gray-400 mb-5 leading-relaxed">
        See how this fundraiser connects to other causes through mutual supporters
      </p>

      {/* SVG Graph */}
      <div className="relative w-full mx-auto" style={{ aspectRatio: `${WIDTH}/${HEIGHT}` }}>
        <svg
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          className="w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <filter id="node-shadow" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.1" />
            </filter>
            <filter id="center-shadow" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="0" dy="3" stdDeviation="6" floodColor="#00b964" floodOpacity="0.25" />
            </filter>
          </defs>

          {/* ── You → Center line ── */}
          {userSupported && (
            <line
              x1={YOU_X + 28} y1={YOU_Y}
              x2={CX - 50} y2={CY}
              stroke="#00b964" strokeWidth={2.5}
              style={{ opacity: isVisible ? 1 : 0, transition: 'opacity 0.4s ease 100ms' }}
            />
          )}
          {userSupported && isVisible && (
            <text
              x={(YOU_X + CX) / 2} y={(YOU_Y + CY) / 2 - 12}
              textAnchor="middle" fontSize={13} fontFamily={FONT}
              fill="#00b964" fontWeight={600}
              style={{ opacity: isVisible ? 1 : 0, transition: 'opacity 0.5s ease 300ms' }}
            >
              supported
            </text>
          )}

          {/* ── Center → Connection lines ── */}
          {positions.map((pos, i) => (
            <line
              key={`line-${i}`}
              x1={CX} y1={CY} x2={pos.x} y2={pos.y}
              stroke="#e5e7eb" strokeWidth={2} strokeDasharray="8 5"
              style={{ opacity: isVisible ? 0.5 : 0, transition: `opacity 0.3s ease ${i * 80 + 100}ms` }}
            />
          ))}

          {/* ── Mutual donor pills on lines ── */}
          {positions.map((pos, i) => {
            const conn = connections[i];
            const midX = CX + (pos.x - CX) * 0.45;
            const midY = CY + (pos.y - CY) * 0.45;
            const pillW = 62;
            const pillH = 22;
            return (
              <g key={`badge-${i}`} style={{ opacity: isVisible ? 1 : 0, transition: `opacity 0.4s ease ${i * 80 + 300}ms` }}>
                <rect
                  x={midX - pillW / 2} y={midY - pillH / 2}
                  width={pillW} height={pillH} rx={pillH / 2}
                  fill="white" stroke="#e5e7eb" strokeWidth={1}
                />
                <text
                  x={midX} y={midY + 5}
                  textAnchor="middle" fontSize={11} fontFamily={FONT}
                  fill="#6b7280" fontWeight={600}
                >
                  {conn.sharedDonorCount} mutual
                </text>
              </g>
            );
          })}

          {/* ── Center Node ── */}
          <g
            filter="url(#center-shadow)"
            style={{
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? 'scale(1)' : 'scale(0)',
              transformOrigin: `${CX}px ${CY}px`,
              transition: 'opacity 0.4s ease, transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
            }}
          >
            <circle cx={CX} cy={CY} r={52} fill="#00b964" />
            <circle cx={CX} cy={CY} r={52} fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth={2.5} />
            <text x={CX} y={CY - 14} textAnchor="middle" fontSize={28}>
              {getCategoryEmoji(currentFundraiser.category)}
            </text>
            {splitTitle(currentFundraiser.title, 18).map((line, li) => (
              <text
                key={li}
                x={CX} y={CY + 10 + li * 15}
                textAnchor="middle" fontSize={12} fontFamily={FONT}
                fill="white" fontWeight={700} letterSpacing="0.01em"
              >
                {line}
              </text>
            ))}
            <text
              x={CX} y={CY + 10 + splitTitle(currentFundraiser.title, 18).length * 15 + 4}
              textAnchor="middle" fontSize={11} fontFamily={FONT}
              fill="rgba(255,255,255,0.8)" fontWeight={500}
            >
              {formatCurrency(currentFundraiser.raisedAmount)} raised
            </text>
          </g>

          {/* ── "You" Node ── */}
          {userSupported && (
            <g
              filter="url(#node-shadow)"
              style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? 'scale(1)' : 'scale(0)',
                transformOrigin: `${YOU_X}px ${YOU_Y}px`,
                transition: 'opacity 0.4s ease 200ms, transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) 200ms',
              }}
            >
              <circle cx={YOU_X} cy={YOU_Y} r={28} fill="white" stroke="#00b964" strokeWidth={3} />
              <text
                x={YOU_X} y={YOU_Y + 1}
                textAnchor="middle" dominantBaseline="middle"
                fontSize={16} fontFamily={FONT} fill="#00b964" fontWeight={700}
              >
                You
              </text>
            </g>
          )}

          {/* ── Connection Nodes ── */}
          {connections.map((conn, i) => {
            const pos = positions[i];
            const isTop = pos.y < CY;
            const textDir = isTop ? 1 : -1;
            const textBaseY = isTop ? pos.y + 48 : pos.y - 48;

            return (
              <g
                key={conn.fundraiser.id}
                style={{
                  opacity: isVisible ? 1 : 0,
                  transform: isVisible ? 'scale(1)' : 'scale(0)',
                  transformOrigin: `${pos.x}px ${pos.y}px`,
                  transition: `opacity 0.4s ease ${i * 100 + 250}ms, transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) ${i * 100 + 250}ms`,
                }}
              >
                {/* Node circle */}
                <circle
                  cx={pos.x} cy={pos.y} r={38}
                  fill="white" stroke="#e5e7eb" strokeWidth={2}
                  filter="url(#node-shadow)"
                />

                {/* Category emoji */}
                <text x={pos.x} y={pos.y - 4} textAnchor="middle" fontSize={24}>
                  {getCategoryEmoji(conn.fundraiser.category)}
                </text>

                {/* Raised amount inside circle */}
                <text
                  x={pos.x} y={pos.y + 18}
                  textAnchor="middle" fontSize={11} fontFamily={FONT}
                  fill="#6b7280" fontWeight={600}
                >
                  {formatCurrency(conn.fundraiser.raisedAmount)}
                </text>

                {/* Title below/above (multi-line) */}
                {splitTitle(conn.fundraiser.title, 22).map((line, li) => (
                  <text
                    key={li}
                    x={pos.x} y={textBaseY + textDir * li * 16}
                    textAnchor="middle" fontSize={13} fontFamily={FONT}
                    fill="#1f2937" fontWeight={600}
                  >
                    {line}
                  </text>
                ))}

                {/* Community tag */}
                {conn.community && (
                  <text
                    x={pos.x}
                    y={textBaseY + textDir * (splitTitle(conn.fundraiser.title, 22).length * 16 + 2)}
                    textAnchor="middle" fontSize={12} fontFamily={FONT}
                    fill="#00b964" fontWeight={500}
                  >
                    {conn.community.name}
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        {/* ── Clickable Link Overlays ── */}
        {connections.map((conn, i) => {
          const pos = positions[i];
          return (
            <Link
              key={`link-${conn.fundraiser.id}`}
              href={`/fundraiser/${conn.fundraiser.id}`}
              className="absolute w-20 h-20 -translate-x-1/2 -translate-y-1/2 rounded-full z-10 hover:ring-2 hover:ring-green-400/40 transition-all duration-200"
              style={{
                left: `${(pos.x / WIDTH) * 100}%`,
                top: `${(pos.y / HEIGHT) * 100}%`,
              }}
              title={conn.fundraiser.title}
            />
          );
        })}

        {connections.map((conn, i) => {
          if (!conn.community) return null;
          const pos = positions[i];
          const isTop = pos.y < CY;
          const communityOffsetY = isTop ? pos.y + 58 : pos.y - 58;
          return (
            <Link
              key={`comm-${conn.community.id}`}
              href={`/community/${conn.community.id}`}
              className="absolute z-10 -translate-x-1/2 -translate-y-1/2 hover:underline transition-colors cursor-pointer"
              style={{
                left: `${(pos.x / WIDTH) * 100}%`,
                top: `${(communityOffsetY / HEIGHT) * 100}%`,
              }}
              title={`Visit ${conn.community.name} community`}
            >
              <span className="inline-block px-4 py-2" />
            </Link>
          );
        })}
      </div>

      {/* Summary */}
      <div className="mt-5 pt-4 border-t border-gray-100 text-center px-2">
        <p className="text-sm text-gray-500 leading-relaxed">
          <span className="font-bold text-gray-900">{totalSharedDonors}</span>
          {' '}donor{totalSharedDonors !== 1 ? 's' : ''} who supported this also funded{' '}
          <span className="font-bold text-[#00b964]">{connections.length}</span>
          {' '}other cause{connections.length !== 1 ? 's' : ''}
        </p>
        {connections.length > 0 && connections[0].sharedDonorNames.length > 0 && (
          <p className="text-xs text-gray-400 mt-1.5">
            Including{' '}
            {connections[0].sharedDonorNames.slice(0, 3).join(', ')}
            {connections[0].sharedDonorNames.length > 3 &&
              ` and ${connections[0].sharedDonorNames.length - 3} more`}
          </p>
        )}
      </div>
    </div>
  );
}
