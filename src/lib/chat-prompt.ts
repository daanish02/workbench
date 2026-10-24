interface Section {
  title: string;
  heading: string;
  text: string;
}

/** The system message: the prompt text (src/prompts/chat-system.md) plus the retrieved sections, numbered from 1. */
export const systemMessage = (prompt: string, sections: Section[]) =>
  `${prompt.trim()}\n\n${sections.map((c, i) => `<section n="${i + 1}" source="${c.title} > ${c.heading}">\n${c.text}\n</section>`).join('\n\n')}`;
