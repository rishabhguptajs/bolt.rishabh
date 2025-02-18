export function cleanCodeContent(content: string): string {
  // Remove code block markers and language identifiers
  const codeBlockRegex = /```[\w-]*\n([\s\S]*?)```/
  const match = content.match(codeBlockRegex)

  if (match && match[1]) {
    // Return just the code content without the markers
    return match[1].trim()
  }

  // If no code block markers found, return original content
  return content
}
