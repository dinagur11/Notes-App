// sanitize.ts — the single place in the app that turns an untrusted HTML string
// into HTML safe to inject. It is a PURE function: same input → same output, no
// side effects (lecture 5: "rendering must be pure"). Components call it during
// render and memoize the result.

// Formatting tags we allow. Anything not here (script, iframe, img, svg, …) is
// dropped together with its contents.
const ALLOWED_TAGS: ReadonlySet<string> = new Set([
  "B", "I", "STRONG", "EM", "U", "P", "BR",
  "UL", "OL", "LI", "H1", "H2", "H3",
  "A", "SPAN", "DIV", "CODE", "PRE", "BLOCKQUOTE",
]);

// Attributes allowed per tag. Everything else (including every on* handler) is stripped.
const ALLOWED_ATTRS: Readonly<Record<string, ReadonlySet<string>>> = {
  A: new Set(["href"]),
};

const DANGEROUS_SCHEMES = ["javascript:", "data:", "vbscript:"];

function isDangerousUrl(value: string): boolean {
  // Collapse whitespace/control chars used to smuggle a scheme past naive checks
  // (e.g. "java\tscript:" or "  javascript:").
  const normalized = value.replace(/[\u0000-\u0020]+/g, "").toLowerCase();
  return DANGEROUS_SCHEMES.some((scheme) => normalized.startsWith(scheme));
}

function scrub(node: Node): void {
  // Snapshot first: we mutate the tree while walking it.
  for (const child of Array.from(node.childNodes)) {
    if (child.nodeType !== Node.ELEMENT_NODE) continue; // text/comments are inert, keep them

    const el = child as Element;
    const tag = el.tagName.toUpperCase();

    // Tag not on the whitelist → remove the element AND everything inside it.
    // This is what drops <script>evil()</script> together with its body.
    if (!ALLOWED_TAGS.has(tag)) {
      el.remove();
      continue;
    }

    // Whitelisted tag → strip every attribute that isn't explicitly allowed,
    // every on* handler, and any href with a code-executing scheme.
    const allowedForTag = ALLOWED_ATTRS[tag];
    for (const attr of Array.from(el.attributes)) {
      const name = attr.name.toLowerCase();
      const isWhitelisted = allowedForTag?.has(name) ?? false;

      if (name.startsWith("on") || !isWhitelisted) {
        el.removeAttribute(attr.name);
      } else if (name === "href" && isDangerousUrl(attr.value)) {
        el.removeAttribute(attr.name);
      }
    }

    scrub(el); // recurse into the now-clean element
  }
}

export function sanitizeHtml(input: unknown): string {
  if (typeof input !== "string") return "";        // contract: never throw on bad input
  if (typeof document === "undefined") return "";  // no DOM (e.g. SSR) → emit nothing rather than something unsafe

  try {
    // A <template>'s content is an INERT DocumentFragment: parsing the string
    // here does NOT load images or fire onerror/onload. That inertness is the
    // whole reason we can safely parse hostile HTML in order to clean it.
    const template = document.createElement("template");
    template.innerHTML = input;
    scrub(template.content);
    return template.innerHTML;
  } catch {
    return ""; // malformed input → degrade gracefully
  }
}