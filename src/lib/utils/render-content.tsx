import React from "react";
import DOMPurify from "isomorphic-dompurify";

export type ParseProps = {
  htmlString: string;
};

export type ProductData = {
  description: string;
  features: string[];
  specifications: Record<string, string>;
  packageContents: string[];
};

export function renderContent(content?: string): React.ReactNode {
  if (!content) return null;

  const isHtml = /<\/?[a-z][^>]*>/i.test(content);

  if (isHtml) {
    return (
      <>
      <div
        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(content) }}
      />
   </>
    );
  }

  return (
    <>
      <p>{content}</p>
    </>
  );
}

const HTML_ENTITIES: Record<string, string> = {
  "&ndash;": "–",
  "&mdash;": "—",
  "&nbsp;": " ",
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&apos;": "'",
  "&#39;": "'",
  "&rsquo;": "’",
  "&lsquo;": "‘",
  "&rdquo;": "”",
  "&ldquo;": "“",
};

function decodeEntities(str: string): string {
  return str
    .replace(
      /&ndash;|&mdash;|&nbsp;|&amp;|&lt;|&gt;|&quot;|&apos;|&#39;|&rsquo;|&lsquo;|&rdquo;|&ldquo;/g,
      (match) => HTML_ENTITIES[match],
    )
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCharCode(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code: string) =>
      String.fromCharCode(parseInt(code, 16)),
    );
}

//
export function cleanText(str: string): string {
  return decodeEntities(
    str
      .replace(/<\/?[^>]+(>|$)/g, "")
      .replace(/\s+/g, " ")
      .trim(),
  );
}

function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// function extractSectionBody(html: string, label: string): string | null {
//   const labelMatch = html.match(
//     new RegExp(`<(strong|b)>\\s*${escapeRegExp(label)}\\s*:?\\s*<\\/\\1>`, "i")
//   );

//   if (!labelMatch || typeof labelMatch.index !== "number") return null;

//   const afterLabel = html.slice(labelMatch.index + labelMatch[0].length);
//   const nextLabelIndex = afterLabel.search(/<(strong|b)>/i);

//   return nextLabelIndex === -1 ? afterLabel : afterLabel.slice(0, nextLabelIndex);
// }

// function extractListItems(section: string): string[] {
//   const listMatch = section.match(/<(ul|ol)[^>]*>([\s\S]*?)<\/\1>/i);

//   if (listMatch) {
//     const liMatches: string[] =
//       listMatch[2].match(/<li[^>]*>([\s\S]*?)<\/li>/gi) || [];
//     return liMatches.map((li: string) => cleanText(li));
//   }

//   return section
//     .split(/<br\s*\/?>/i)
//     .map((item) => cleanText(item))
//     .filter(Boolean);
// }

export function parseProductHTML({ htmlString }: ParseProps): ProductData {
  const html = htmlString;

  const result: ProductData = {
    description: "",
    features: [],
    specifications: {},
    packageContents: []
  };

  const descMatch: RegExpMatchArray | null = html.match(
    /<strong>Description:<\/strong><br[^>]*>([\s\S]*?)<\/p>/i
  );

  if (descMatch) {
    result.description = cleanText(descMatch[1]);
  }

  const featuresLabelMatch: RegExpMatchArray | null = html.match(
    /<(strong|b)>\s*Features\s*:?\s*<\/\1>/i
  );

  if (featuresLabelMatch && typeof featuresLabelMatch.index === "number") {
    const afterLabel = html.slice(
      featuresLabelMatch.index + featuresLabelMatch[0].length
    );
    const nextLabelIndex = afterLabel.search(/<(strong|b)>/i);
    const section =
      nextLabelIndex === -1 ? afterLabel : afterLabel.slice(0, nextLabelIndex);

    const listMatch = section.match(/<(ul|ol)[^>]*>([\s\S]*?)<\/\1>/i);

    if (listMatch) {
      const liMatches: string[] =
        listMatch[2].match(/<li[^>]*>([\s\S]*?)<\/li>/gi) || [];

      result.features = liMatches.map((li: string) => cleanText(li));
    } else {
      result.features = section
        .split(/<br\s*\/?>/i)
        .map((item) => cleanText(item))
        .filter(Boolean);
    }
  }

  const specsMatch: RegExpMatchArray | null = html.match(
    /<strong>Specifications:<\/strong><\/p>\s*<ul>([\s\S]*?)<\/ul>/i
  );

  if (specsMatch) {
    const liMatches: string[] =
      specsMatch[1].match(/<li>([\s\S]*?)<\/li>/g) || [];

    liMatches.forEach((li: string) => {
      const clean: string = cleanText(li);

      if (clean.includes(":")) {
        const [key, ...rest] = clean.split(":");
        result.specifications[key.trim()] = rest.join(":").trim();
      }
    });
  }

  const packageMatch: RegExpMatchArray | null = html.match(
    /<strong>Package Contents:<br><\/strong>([\s\S]*?)<\/p>/i
  );

  if (packageMatch) {
    result.packageContents = packageMatch[1]
      .split("<br>")
      .map((item: string) => cleanText(item))
      .filter(Boolean);
  }

  return result;
}