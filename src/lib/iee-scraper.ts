export interface IEEEmployerListing {
  employer: string;
  location: string;
  seasons: string[];
  listingText: string;
  slug: string;
  sourceUrl: string;
}

export interface IEEPosition {
  position: string;
  englishLevel: string | null;
  hourlyWageText: string | null;
  wageNotes: string | null;
  description: string | null;
}

const IEE_ORIGIN = "https://www.ieethailand.com";

function decodeHtml(value: string): string {
  return value
    .replace(/&#(\d+);?/g, (_, code: string) =>
      String.fromCodePoint(Number(code))
    )
    .replace(/&#x([\da-f]+);?/gi, (_, code: string) =>
      String.fromCodePoint(parseInt(code, 16))
    )
    .replace(/&nbsp;|&#160;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">");
}

function htmlToText(value: string): string {
  return decodeHtml(
    value
      .replace(/<script\b[\s\S]*?<\/script>|<style\b[\s\S]*?<\/style>/gi, " ")
      .replace(/<br\s*\/?>/gi, " ")
      .replace(/<[^>]*>/g, " ")
  )
    .replace(/[\t\r\n ]+/g, " ")
    .trim();
}

function getText(value: string, pattern: RegExp): string {
  return htmlToText(value.match(pattern)?.[1] ?? "");
}

export function parseIEEEmployerListings(html: string): IEEEmployerListing[] {
  const listings: IEEEmployerListing[] = [];
  const anchors =
    /<a\b[^>]*href=["'](https:\/\/www\.ieethailand\.com\/work_and_travel_2\/([^"'/?#]+)\/?)["'][^>]*>([\s\S]*?)<\/a>/gi;
  let match: RegExpExecArray | null;

  while ((match = anchors.exec(html)) !== null) {
    const [, sourceUrl, slug, cardHtml] = match;
    const employer = getText(
      cardHtml,
      /<div[^>]*class=["'][^"']*wat-pg-blog-title[^"']*["'][^>]*>([\s\S]*?)<\/div>/i
    );
    const location = getText(
      cardHtml,
      /<div[^>]*class=["'][^"']*wat-pg-blog-locat-txt[^"']*["'][^>]*>([\s\S]*?)<\/div>/i
    );
    const seasons = Array.from(
      cardHtml.matchAll(
        /<div[^>]*class=["'][^"']*program-hashtag-a[^"']*["'][^>]*>\s*<span>([\s\S]*?)<\/span>/gi
      )
    ).map((season) => htmlToText(season[1]));

    if (!employer || !slug) continue;

    listings.push({
      employer,
      location,
      seasons,
      listingText: htmlToText(cardHtml),
      slug,
      sourceUrl: new URL(sourceUrl, IEE_ORIGIN).href,
    });
  }

  return Array.from(
    new Map(listings.map((listing) => [listing.slug, listing])).values()
  );
}

export function parseIEEPositions(html: string): IEEPosition[] {
  const rows = html.match(/<tr\b[\s\S]*?<\/tr>/gi) ?? [];
  const positions: IEEPosition[] = [];

  for (const row of rows) {
    if (!/data-mtr-content=["']Position\s*:/i.test(row)) continue;

    const cells = Array.from(
      row.matchAll(/<td\b([^>]*)>([\s\S]*?)<\/td>/gi)
    );
    const getCell = (label: string) =>
      cells.find((cell) =>
        new RegExp(`data-mtr-content=["']${label}\\s*:`, "i").test(cell[1])
      )?.[2] ?? "";
    const positionCell = getCell("Position");
    const wageCell = getCell("Hourly Wage");
    const descriptionCell = getCell("Job Description");
    const position = htmlToText(
      positionCell.match(
        /<div[^>]*class=["'][^"']*program-position-title[^"']*["'][^>]*>([\s\S]*?)(?:<br\b|<div)/i
      )?.[1] ?? ""
    );

    if (!position) continue;

    const englishLevel = getText(
      positionCell,
      /<div[^>]*class=["'][^"']*program-position-tips[^"']*["'][^>]*>([\s\S]*?)<\/div>/i
    ).replace(/^English Level:\s*/i, "");
    const hourlyWageText =
      getText(
        wageCell,
        /<div[^>]*class=["'][^"']*position-count[^"']*["'][^>]*>([\s\S]*?)<\/div>/i
      ) || htmlToText(wageCell);
    const wageNotes = htmlToText(wageCell).replace(hourlyWageText, "").trim();
    const description = htmlToText(descriptionCell).replace(
      /\s*Read more\s*$/i,
      ""
    );

    positions.push({
      position,
      englishLevel: englishLevel || null,
      hourlyWageText: hourlyWageText || null,
      wageNotes: wageNotes || null,
      description: description || null,
    });
  }

  return positions;
}
