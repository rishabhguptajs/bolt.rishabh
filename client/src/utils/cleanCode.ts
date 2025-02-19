export function cleanCodeContent(content: string): string {
  const codeBlockRegex = /```[\w-]*\n([\s\S]*?)```/
  const match = content.match(codeBlockRegex)

  if (match && match[1]) {
    return match[1].trim()
  }

  return content
}
