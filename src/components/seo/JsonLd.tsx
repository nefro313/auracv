import { serializeJsonLd } from "@/lib/seo/jsonld";

/**
 * Renders a JSON-LD block with XSS-safe serialization. Always use this
 * instead of hand-rolling <script type="application/ld+json"> — the
 * serializer escapes `<` so user-supplied resume text can't break out of
 * the script element.
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }}
    />
  );
}
