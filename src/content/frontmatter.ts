export interface ParsedMarkdown {
  data: Record<string, string | string[]>
  content: string
}

/** Minimal frontmatter parser: `key: value` pairs and `key:` followed by `  - item` lists. */
export function parseFrontmatter(raw: string): ParsedMarkdown {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/.exec(raw)
  if (!match) return { data: {}, content: raw }

  const data: Record<string, string | string[]> = {}
  let listKey: string | null = null

  for (const line of match[1]!.split(/\r?\n/)) {
    const item = /^\s+-\s+(.*)$/.exec(line)
    if (item && listKey) {
      ;(data[listKey] as string[]).push(item[1]!.trim())
      continue
    }
    const kv = /^([A-Za-z][\w-]*):\s*(.*)$/.exec(line)
    if (!kv) continue
    if (kv[2] === '') {
      listKey = kv[1]!
      data[listKey] = []
    } else {
      listKey = null
      data[kv[1]!] = kv[2]!.trim()
    }
  }
  return { data, content: match[2]! }
}

/** Splits the markdown body at the `## Exercise` heading. */
export function splitExercise(content: string): { body: string; exercise: string } {
  const idx = content.search(/^## Exercise\s*$/m)
  if (idx === -1) return { body: content.trim(), exercise: '' }
  return {
    body: content.slice(0, idx).trim(),
    exercise: content.slice(idx).replace(/^## Exercise\s*/, '').trim(),
  }
}
