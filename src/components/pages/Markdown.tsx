import type { ReactNode } from 'react'

/**
 * Minimal Markdown renderer for post bodies.
 *
 * Deliberately not a full Markdown implementation and deliberately not a
 * dependency: it returns React elements rather than an HTML string, so there is
 * no `dangerouslySetInnerHTML` and no injection surface.
 *
 * Supported: ## / ### headings, - bullets, 1. numbered lists, > blockquotes,
 * ``` fenced code, --- rules, paragraphs, and inline **bold**, *italic*, `code`,
 * [links](href).
 *
 * Replace with a real parser (remark/rehype) in Phase 7 once the admin editor
 * exists and post bodies are user-supplied.
 */

type Block =
  | { kind: 'h2' | 'h3'; text: string }
  | { kind: 'p' | 'quote'; text: string }
  | { kind: 'ul' | 'ol'; items: string[] }
  | { kind: 'code'; text: string }
  | { kind: 'hr' }

function parse(src: string): Block[] {
  const lines = src.replace(/\r\n/g, '\n').split('\n')
  const blocks: Block[] = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i]

    if (!line.trim()) {
      i++
      continue
    }

    if (line.startsWith('```')) {
      const buf: string[] = []
      i++
      while (i < lines.length && !lines[i].startsWith('```')) buf.push(lines[i++])
      i++
      blocks.push({ kind: 'code', text: buf.join('\n') })
      continue
    }

    if (/^(-{3,}|\*{3,})$/.test(line.trim())) {
      blocks.push({ kind: 'hr' })
      i++
      continue
    }

    if (line.startsWith('### ')) {
      blocks.push({ kind: 'h3', text: line.slice(4) })
      i++
      continue
    }

    if (line.startsWith('## ')) {
      blocks.push({ kind: 'h2', text: line.slice(3) })
      i++
      continue
    }

    if (line.startsWith('> ')) {
      const buf: string[] = []
      while (i < lines.length && lines[i].startsWith('> ')) buf.push(lines[i++].slice(2))
      blocks.push({ kind: 'quote', text: buf.join(' ') })
      continue
    }

    if (/^\s*[-*]\s+/.test(line)) {
      const items: string[] = []
      while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*[-*]\s+/, ''))
        i++
      }
      blocks.push({ kind: 'ul', items })
      continue
    }

    if (/^\s*\d+\.\s+/.test(line)) {
      const items: string[] = []
      while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*\d+\.\s+/, ''))
        i++
      }
      blocks.push({ kind: 'ol', items })
      continue
    }

    const buf: string[] = []
    while (i < lines.length && lines[i].trim() && !isBlockStart(lines[i])) buf.push(lines[i++])
    blocks.push({ kind: 'p', text: buf.join(' ') })
  }

  return blocks
}

function isBlockStart(line: string): boolean {
  return (
    line.startsWith('#') ||
    line.startsWith('> ') ||
    line.startsWith('```') ||
    /^(-{3,}|\*{3,})$/.test(line.trim()) ||
    /^\s*[-*]\s+/.test(line) ||
    /^\s*\d+\.\s+/.test(line)
  )
}

/** Inline formatting -> React nodes. No HTML strings. */
function inline(text: string, keyPrefix: string): ReactNode[] {
  const nodes: ReactNode[] = []
  const pattern = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g
  let last = 0
  let m: RegExpExecArray | null
  let n = 0

  while ((m = pattern.exec(text)) !== null) {
    if (m.index > last) nodes.push(text.slice(last, m.index))
    const tok = m[0]
    const key = `${keyPrefix}-${n++}`

    if (tok.startsWith('**')) {
      nodes.push(<strong key={key}>{tok.slice(2, -2)}</strong>)
    } else if (tok.startsWith('`')) {
      nodes.push(<code key={key}>{tok.slice(1, -1)}</code>)
    } else if (tok.startsWith('[')) {
      const label = tok.slice(1, tok.indexOf(']'))
      const href = tok.slice(tok.indexOf('](') + 2, -1)
      const external = href.startsWith('http')
      nodes.push(
        <a key={key} href={href} {...(external ? { target: '_blank', rel: 'noreferrer noopener' } : {})}>
          {label}
        </a>,
      )
    } else {
      nodes.push(<em key={key}>{tok.slice(1, -1)}</em>)
    }
    last = m.index + tok.length
  }

  if (last < text.length) nodes.push(text.slice(last))
  return nodes
}

export function Markdown({ source, placeholder }: { source: string; placeholder?: boolean }) {
  if (placeholder) {
    return (
      <div className="prose-post">
        <p data-placeholder>{source}</p>
      </div>
    )
  }

  const blocks = parse(source)

  return (
    <div className="prose-post">
      {blocks.map((b, i) => {
        const key = `b${i}`
        switch (b.kind) {
          case 'h2':
            return <h2 key={key}>{inline(b.text, key)}</h2>
          case 'h3':
            return <h3 key={key}>{inline(b.text, key)}</h3>
          case 'quote':
            return <blockquote key={key}>{inline(b.text, key)}</blockquote>
          case 'hr':
            return <hr key={key} />
          case 'code':
            return (
              <pre key={key}>
                <code>{b.text}</code>
              </pre>
            )
          case 'ul':
            return (
              <ul key={key}>
                {b.items.map((it, j) => (
                  <li key={`${key}-${j}`}>{inline(it, `${key}-${j}`)}</li>
                ))}
              </ul>
            )
          case 'ol':
            return (
              <ol key={key}>
                {b.items.map((it, j) => (
                  <li key={`${key}-${j}`}>{inline(it, `${key}-${j}`)}</li>
                ))}
              </ol>
            )
          default:
            return <p key={key}>{inline(b.text, key)}</p>
        }
      })}
    </div>
  )
}
