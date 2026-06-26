'use client';

import { useEffect, useMemo, useState } from 'react';

type TokenType = 'keyword' | 'string' | 'number' | 'comment' | 'fn' | 'prop' | 'punct' | 'plain';

type Token = { type: TokenType; text: string };

type Snippet = { file: string; lines: Token[][] };

const SNIPPETS: Snippet[] = [
  {
    file: 'enroll.ts',
    lines: [
      [{ type: 'comment', text: '// find a mentor on a real OSS project' }],
      [
        { type: 'keyword', text: 'const' },
        { type: 'plain', text: ' listing = ' },
        { type: 'keyword', text: 'await' },
        { type: 'plain', text: ' osship.' },
        { type: 'fn', text: 'browse' },
        { type: 'punct', text: '({' },
      ],
      [
        { type: 'prop', text: '  project' },
        { type: 'punct', text: ': ' },
        { type: 'string', text: '"linux-kernel"' },
        { type: 'punct', text: ',' },
      ],
      [
        { type: 'prop', text: '  slots' },
        { type: 'punct', text: ': ' },
        { type: 'number', text: '1' },
        { type: 'punct', text: ',' },
      ],
      [{ type: 'punct', text: '});' }],
      [{ type: 'plain', text: '' }],
      [
        { type: 'keyword', text: 'await' },
        { type: 'plain', text: ' listing.' },
        { type: 'fn', text: 'enroll' },
        { type: 'punct', text: '({ ' },
        { type: 'prop', text: 'ledger' },
        { type: 'punct', text: ': ' },
        { type: 'string', text: '"public"' },
        { type: 'punct', text: ' });' },
      ],
    ],
  },
  {
    file: 'contribute.sh',
    lines: [
      [{ type: 'comment', text: '# ship your first meaningful PR' }],
      [
        { type: 'fn', text: 'git' },
        { type: 'plain', text: ' clone git@github.com:oss/project.git' },
      ],
      [
        { type: 'fn', text: 'git' },
        { type: 'plain', text: ' checkout -b ' },
        { type: 'string', text: 'mentorship/fix-docs' },
      ],
      [{ type: 'comment', text: '# mentor reviews live on the call' }],
      [
        { type: 'fn', text: 'git' },
        { type: 'plain', text: ' commit -m ' },
        { type: 'string', text: '"docs: clarify onboarding"' },
      ],
      [
        { type: 'fn', text: 'gh' },
        { type: 'plain', text: ' pr create --fill' },
      ],
      [{ type: 'plain', text: '' }],
      [
        { type: 'fn', text: 'osship' },
        { type: 'plain', text: ' profile link-pr --merged' },
      ],
    ],
  },
  {
    file: 'ledger.json',
    lines: [
      [{ type: 'punct', text: '{' }],
      [
        { type: 'prop', text: '  "gross_cents"' },
        { type: 'punct', text: ': ' },
        { type: 'number', text: '15000' },
        { type: 'punct', text: ',' },
      ],
      [
        { type: 'prop', text: '  "mentor_payout"' },
        { type: 'punct', text: ': ' },
        { type: 'number', text: '12750' },
        { type: 'punct', text: ',' },
      ],
      [
        { type: 'prop', text: '  "platform_fee"' },
        { type: 'punct', text: ': ' },
        { type: 'number', text: '2250' },
        { type: 'punct', text: ',' },
      ],
      [
        { type: 'prop', text: '  "auditable"' },
        { type: 'punct', text: ': ' },
        { type: 'keyword', text: 'true' },
      ],
      [{ type: 'punct', text: '}' }],
    ],
  },
];

function flattenSnippet(snippet: Snippet): { file: string; chars: { type: TokenType; ch: string; line: number }[] } {
  const chars: { type: TokenType; ch: string; line: number }[] = [];
  snippet.lines.forEach((line, lineIdx) => {
    line.forEach((token) => {
      for (const ch of token.text) {
        chars.push({ type: token.type, ch, line: lineIdx });
      }
    });
    if (lineIdx < snippet.lines.length - 1) {
      chars.push({ type: 'plain', ch: '\n', line: lineIdx });
    }
  });
  return { file: snippet.file, chars };
}

function renderVisible(chars: { type: TokenType; ch: string; line: number }[], count: number) {
  const lines: { type: TokenType; ch: string }[][] = [];
  let currentLine = 0;
  lines[0] = [];

  for (let i = 0; i < count && i < chars.length; i++) {
    const { type, ch, line } = chars[i];
    if (ch === '\n') {
      currentLine = line + 1;
      if (!lines[currentLine]) lines[currentLine] = [];
      continue;
    }
    if (!lines[line]) lines[line] = [];
    lines[line].push({ type, ch });
  }

  return lines;
}

export function CodeSyntaxAnimation() {
  const prepared = useMemo(() => SNIPPETS.map(flattenSnippet), []);
  const [snippetIdx, setSnippetIdx] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [cursorOn, setCursorOn] = useState(true);
  const [paused, setPaused] = useState(false);

  const current = prepared[snippetIdx];
  const visibleLines = renderVisible(current.chars, charCount);
  const lineCount = current.chars.reduce((max, c) => (c.ch === '\n' ? c.line + 1 : max), 0) + 1;

  useEffect(() => {
    const blink = setInterval(() => setCursorOn((v) => !v), 530);
    return () => clearInterval(blink);
  }, []);

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      setCharCount(current.chars.length);
      return;
    }

    if (paused) {
      const hold = setTimeout(() => {
        setPaused(false);
        setCharCount(0);
        setSnippetIdx((i) => (i + 1) % prepared.length);
      }, 2400);
      return () => clearTimeout(hold);
    }

    if (charCount >= current.chars.length) {
      setPaused(true);
      return;
    }

    const delay = current.chars[charCount]?.ch === '\n' ? 90 : 22;
    const tick = setTimeout(() => setCharCount((c) => c + 1), delay);
    return () => clearTimeout(tick);
  }, [charCount, current.chars, paused, prepared.length]);

  const cursorLine = visibleLines.length > 0 ? visibleLines.length - 1 : 0;
  const showCursor = cursorOn && !paused;

  return (
    <div className="code-terminal" aria-hidden="true">
      <div className="code-terminal-bar">
        <span className="code-terminal-dots">
          <i /><i /><i />
        </span>
        <span className="code-terminal-tabs">
          {prepared.map((s, i) => (
            <span key={s.file} className={`code-tab ${i === snippetIdx ? 'active' : ''}`}>
              {s.file}
            </span>
          ))}
        </span>
      </div>
      <div className="code-terminal-body">
        <div className="code-gutter">
          {Array.from({ length: lineCount }, (_, i) => (
            <span key={i} className="code-line-num">
              {i + 1}
            </span>
          ))}
        </div>
        <pre className="code-block">
          {visibleLines.map((line, li) => (
            <code key={li} className="code-line">
              {line.map((t, ti) => (
                <span key={ti} className={`tok tok-${t.type}`}>
                  {t.ch}
                </span>
              ))}
              {li === cursorLine && showCursor && (
                <span className="code-cursor">▍</span>
              )}
            </code>
          ))}
          {visibleLines.length === 0 && showCursor && (
            <code className="code-line">
              <span className="code-cursor">▍</span>
            </code>
          )}
        </pre>
      </div>
      <div className="code-terminal-status">
        <span className="code-status-dot" />
        typing · {current.file}
      </div>
    </div>
  );
}
