function extractText(node: any): string {
  if (!node) return ''
  let text = ''
  if (node.text && typeof node.text === 'string') {
    text += node.text + ' '
  }
  if (node.children && Array.isArray(node.children)) {
    for (const child of node.children) {
      text += extractText(child)
    }
  }
  return text
}

export function calculateReadingTime(lexicalContent: any): number {
  if (!lexicalContent || typeof lexicalContent !== 'object') return 1
  
  // Lexical saves content under a root node
  const rootNode = lexicalContent.root || lexicalContent
  const text = extractText(rootNode).trim()
  if (!text) return 1
  
  const words = text.split(/\s+/).filter(Boolean).length
  // Assuming average reading speed of 200 words per minute
  return Math.max(1, Math.ceil(words / 200))
}
