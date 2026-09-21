export interface ColorToken {
  token: string;
  hex: string;
  role: string;
}

export interface DesignSection {
  id: string;
  title: string;
  content: string;
}

export interface StructuredDesignData {
  rawMarkdown: string;
  colorTokens: ColorToken[];
  sections: DesignSection[];
}

export function parseDesignMarkdown(mdText: string): StructuredDesignData {
  if (!mdText || !mdText.trim()) {
    return { rawMarkdown: "", colorTokens: [], sections: [] };
  }

  const lines = mdText.split("\n");
  const rawSections: DesignSection[] = [];
  let currentTitle = "";
  let currentContentLines: string[] = [];

  lines.forEach((line) => {
    const headingMatch = line.match(/^#{1,2}\s+(.+)$/);
    if (headingMatch) {
      if (currentTitle && currentContentLines.join("").trim()) {
        rawSections.push({
          id: currentTitle.toLowerCase().replace(/[^\w]+/g, "-"),
          title: currentTitle,
          content: currentContentLines.join("\n").trim(),
        });
      }
      currentTitle = headingMatch[1].trim();
      currentContentLines = [];
    } else if (currentTitle) {
      currentContentLines.push(line);
    }
  });

  if (currentTitle && currentContentLines.join("").trim()) {
    rawSections.push({
      id: currentTitle.toLowerCase().replace(/[^\w]+/g, "-"),
      title: currentTitle,
      content: currentContentLines.join("\n").trim(),
    });
  }

  // Merge separate Do / Don't into Do's and Don'ts section
  const sections: DesignSection[] = [];
  let dosAndDontsSection: DesignSection | null = null;

  rawSections.forEach((sec) => {
    const cleanTitle = sec.title.toLowerCase().trim();
    const isDo = cleanTitle === "do" || cleanTitle === "dos" || cleanTitle === "do's";
    const isDont = cleanTitle === "don't" || cleanTitle === "dont" || cleanTitle === "donts" || cleanTitle === "don'ts";
    const isMergedAlready = cleanTitle.includes("do") && cleanTitle.includes("don");

    if (isDo || isDont) {
      if (!dosAndDontsSection) {
        dosAndDontsSection = {
          id: "dos_and_donts",
          title: "Do's and Don'ts",
          content: "",
        };
        sections.push(dosAndDontsSection);
      }
      const headingPrefix = isDo ? "### Do\n" : "### Don't\n";
      dosAndDontsSection.content = (dosAndDontsSection.content ? dosAndDontsSection.content + "\n\n" : "") + headingPrefix + sec.content;
    } else if (isMergedAlready) {
      sec.id = "dos_and_donts";
      sec.title = "Do's and Don'ts";
      sections.push(sec);
    } else {
      sections.push(sec);
    }
  });

  // Color tokens parser
  const colorTokens: ColorToken[] = [];
  const seen = new Set<string>();

  const mdLines = mdText.split("\n");
  mdLines.forEach((line) => {
    const trimmed = line.trim();
    if (trimmed.startsWith("|")) {
      const cells = trimmed
        .split("|")
        .map((c) => c.trim().replace(/^`|`$/g, ""))
        .filter((c, idx, arr) => !(idx === 0 && c === "") && !(idx === arr.length - 1 && c === ""));

      if (cells.length >= 3) {
        const rawToken = cells[0].trim();
        const hexMatch = cells[1].match(/#(?:[0-9a-fA-F]{3,4}){1,2}\b/);
        const role = cells[2].trim();

        if (
          rawToken &&
          hexMatch &&
          !rawToken.toLowerCase().includes("token") &&
          !rawToken.toLowerCase().includes("name") &&
          !seen.has(rawToken)
        ) {
          const hex = hexMatch[0];
          colorTokens.push({ token: rawToken, hex, role });
          seen.add(rawToken);
        }
      }
    }
  });

  // CSS variables / Key-value format: --color-token: #hex; /* role */ or token: #hex
  const tokenLineRegex = /^\s*(--?[\w-]+):\s*["']?(#[0-9a-fA-F]{3,8})["']?(?:;)?(?:\s*\/\*\s*(.*?)\s*\*\/)?/gm;
  let match;
  while ((match = tokenLineRegex.exec(mdText)) !== null) {
    const token = match[1].trim();
    const hex = match[2].trim();
    const role = (match[3] && match[3].trim()) || "Color Token";
    if (token && hex && !seen.has(token)) {
      colorTokens.push({ token, hex, role });
      seen.add(token);
    }
  }

  return {
    rawMarkdown: mdText,
    colorTokens,
    sections,
  };
}
