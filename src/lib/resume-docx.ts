/**
 * Builds a clean, ATS-friendly Word (.docx) version of a resume from the same
 * `UserProfile` the on-page template renders, then triggers a browser download.
 *
 * Mirrors the section order of `resume_template.tsx` so the Word file and the
 * page stay in lock-step. Runs client-side only (uses Blob + DOM download).
 */
import {
  AlignmentType,
  BorderStyle,
  Document,
  ExternalHyperlink,
  Packer,
  Paragraph,
  TextRun,
  type IParagraphOptions,
  type IRunOptions,
} from "docx";
import { UserProfile } from "./type";
import { externalHref } from "./utils";

// Atelier-Paper ink palette, as Word-friendly hex (no leading #).
const INK = "211B12";
const INK_SOFT = "3A3329";
const INK_MUTE = "8A7D68";
const ACCENT = "8B5CF6";
const SERIF = "Georgia"; // echoes the Fraunces display serif; ATS-safe
const SANS = "Calibri";

const hasText = (v?: string) => Boolean(v && v.trim());
const stripUrl = (url: string) => url.replace(/^https?:\/\/(www\.)?/, "");

function run(text: string, opts: Partial<IRunOptions> = {}): TextRun {
  return new TextRun({ text, font: SANS, color: INK_SOFT, size: 20, ...opts });
}

/** A violet, underlined external link run pair (normalises bare URLs). */
function link(text: string, url: string): ExternalHyperlink {
  return new ExternalHyperlink({
    link: externalHref(url),
    children: [
      new TextRun({
        text,
        font: SANS,
        color: ACCENT,
        size: 20,
        underline: {},
      }),
    ],
  });
}

function para(
  children: IParagraphOptions["children"],
  opts: Omit<IParagraphOptions, "children"> = {},
): Paragraph {
  return new Paragraph({ children, spacing: { after: 60 }, ...opts });
}

/** Section heading: small-caps serif with a hairline rule beneath. */
function sectionHeading(label: string): Paragraph {
  return new Paragraph({
    spacing: { before: 220, after: 90 },
    border: {
      bottom: { color: "D9D2C4", space: 2, style: BorderStyle.SINGLE, size: 4 },
    },
    children: [
      new TextRun({
        text: label.toUpperCase(),
        font: SERIF,
        bold: true,
        color: INK,
        size: 24,
        // characterSpacing widens the letters for an editorial small-caps feel.
        characterSpacing: 20,
      }),
    ],
  });
}

function bullets(items: string[]): Paragraph[] {
  return items
    .filter((h) => hasText(h) && h !== "•")
    .map(
      (h) =>
        new Paragraph({
          bullet: { level: 0 },
          spacing: { after: 30 },
          children: [run(h)],
        }),
    );
}

export function buildResumeDoc(profile: UserProfile): Document {
  const b = profile.basics;
  const children: Paragraph[] = [];

  // ---- Header: name, label, contact line -------------------------------
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 20 },
      children: [
        new TextRun({
          text: b.name || "",
          font: SERIF,
          bold: true,
          color: INK,
          size: 40,
        }),
      ],
    }),
  );

  if (hasText(b.label)) {
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 60 },
        children: [
          new TextRun({ text: b.label, font: SERIF, color: INK_SOFT, size: 24 }),
        ],
      }),
    );
  }

  // Contact: city · email · phone · website · social handles, " | " separated.
  const contact: (TextRun | ExternalHyperlink)[] = [];
  const sep = () =>
    new TextRun({ text: "   |   ", font: SANS, color: INK_MUTE, size: 18 });
  const pushContact = (node: TextRun | ExternalHyperlink) => {
    if (contact.length) contact.push(sep());
    contact.push(node);
  };

  if (hasText(b.location?.city) && hasText(b.location?.countryCode)) {
    pushContact(
      run(`${b.location.city}, ${b.location.countryCode}`, {
        color: INK_MUTE,
        size: 18,
      }),
    );
  }
  if (hasText(b.email)) {
    pushContact(
      new ExternalHyperlink({
        link: `mailto:${b.email}`,
        children: [
          new TextRun({ text: b.email, font: SANS, color: INK_MUTE, size: 18 }),
        ],
      }),
    );
  }
  if (hasText(b.phone)) {
    pushContact(run(b.phone, { color: INK_MUTE, size: 18 }));
  }
  if (hasText(b.website)) {
    pushContact(
      new ExternalHyperlink({
        link: externalHref(b.website),
        children: [
          new TextRun({
            text: stripUrl(b.website),
            font: SANS,
            color: ACCENT,
            size: 18,
            underline: {},
          }),
        ],
      }),
    );
  }
  (b.profiles ?? [])
    .filter((p) => hasText(p.url) && hasText(p.network))
    .forEach((p) => {
      pushContact(
        new ExternalHyperlink({
          link: externalHref(p.url),
          children: [
            new TextRun({
              text: p.username && p.username.trim() ? p.username : p.network,
              font: SANS,
              color: ACCENT,
              size: 18,
              underline: {},
            }),
          ],
        }),
      );
    });

  if (contact.length) {
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 160 },
        children: contact,
      }),
    );
  }

  // ---- Section builders -------------------------------------------------
  const aboutSection = () => {
    if (!hasText(b.about)) return;
    children.push(para([run(b.about)], { spacing: { after: 140 } }));
  };

  const experienceSection = () => {
    const work = (profile.work ?? []).filter(
      (w) => hasText(w.name) || hasText(w.position),
    );
    if (work.length === 0) return;
    children.push(sectionHeading("Experience"));
    work.forEach((w) => {
      const dates = [w.startDate, w.endDate].filter(hasText).join(" – ");
      children.push(
        new Paragraph({
          spacing: { before: 80, after: 10 },
          children: [
            run(w.position || w.name, { bold: true, color: INK, size: 22 }),
            ...(dates
              ? [run(`     ${dates}`, { color: INK_MUTE, size: 18 })]
              : []),
          ],
        }),
      );
      const org = [w.name, w.location].filter(hasText).join(", ");
      if (org)
        children.push(
          para([run(org, { italics: true, color: INK_MUTE })], {
            spacing: { after: 40 },
          }),
        );
      if (hasText(w.summary)) children.push(para([run(w.summary)]));
      bullets(w.highlights ?? []).forEach((p) => children.push(p));
    });
  };

  const projectsSection = () => {
    const projects = (profile.projects?.projects ?? []).filter((p) =>
      hasText(p.title),
    );
    if (projects.length === 0) return;
    children.push(sectionHeading("Projects"));
    projects.forEach((p) => {
      children.push(
        new Paragraph({
          spacing: { before: 80, after: 10 },
          children: [
            run(p.title, { bold: true, color: INK, size: 22 }),
            ...(hasText(p.duration)
              ? [run(`     ${p.duration}`, { color: INK_MUTE, size: 18 })]
              : []),
          ],
        }),
      );
      if (hasText(p.description)) children.push(para([run(p.description)]));
      // Order mirrors the page: highlights → technologies → links.
      bullets(p.highlights ?? []).forEach((para_) => children.push(para_));
      if (p.technologies && p.technologies.length > 0)
        children.push(
          para([
            run("Technologies: ", { bold: true, color: INK }),
            run(p.technologies.join(", ")),
          ]),
        );
      const linkRuns: (TextRun | ExternalHyperlink)[] = [];
      if (hasText(p.website)) {
        linkRuns.push(run("Live: ", { bold: true, color: INK }));
        linkRuns.push(link(stripUrl(p.website), p.website));
      }
      if (hasText(p.source)) {
        if (linkRuns.length) linkRuns.push(run("    "));
        linkRuns.push(run("Source: ", { bold: true, color: INK }));
        linkRuns.push(link(stripUrl(p.source), p.source));
      }
      if (linkRuns.length) children.push(para(linkRuns));
    });
  };

  const skillsSection = () => {
    const skills = (profile.skills ?? []).filter((s) => hasText(s.name));
    if (skills.length === 0) return;
    children.push(sectionHeading("Skills"));
    skills.forEach((s) => {
      children.push(
        para([
          run(`${s.name}: `, { bold: true, color: INK }),
          run((s.keywords ?? []).join(", ")),
        ]),
      );
    });
  };

  const educationSection = () => {
    const edu = (profile.education ?? []).filter((e) => hasText(e.institution));
    if (edu.length === 0) return;
    children.push(sectionHeading("Education"));
    edu.forEach((e) => {
      const dates = [e.startDate, e.endDate].filter(hasText).join(" – ");
      children.push(
        new Paragraph({
          spacing: { before: 80, after: 10 },
          children: [
            run(e.institution, { bold: true, color: INK, size: 22 }),
            ...(dates
              ? [run(`     ${dates}`, { color: INK_MUTE, size: 18 })]
              : []),
          ],
        }),
      );
      const study = [e.studyType, e.area].filter(hasText).join(" in ");
      if (study)
        children.push(
          para([run(study, { italics: true, color: INK_MUTE })], {
            spacing: { after: 30 },
          }),
        );
      if (hasText(e.summary)) children.push(para([run(e.summary)]));
      if (hasText(e.score)) children.push(para([run(`Score: ${e.score}`)]));
      bullets(e.courses ?? []).forEach((p) => children.push(p));
    });
  };

  const certificatesSection = () => {
    const certs = (profile.certificates ?? []).filter((c) => hasText(c.name));
    if (certs.length === 0) return;
    children.push(sectionHeading("Certificates"));
    certs.forEach((c) => {
      children.push(
        para([run(c.name, { bold: true, color: INK, size: 22 })], {
          spacing: { before: 60, after: 10 },
        }),
      );
      const meta = [
        hasText(c.issuer) ? `Issuer: ${c.issuer}` : "",
        hasText(c.date) ? `Date: ${c.date}` : "",
      ].filter(Boolean);
      if (meta.length)
        children.push(para([run(meta.join("   ·   "), { color: INK_MUTE })]));
      if (hasText(c.url))
        children.push(para([link("View certificate", c.url)]));
    });
  };

  const interestsSection = () => {
    const interests = (profile.interests ?? []).filter((i) => hasText(i.name));
    if (interests.length === 0) return;
    children.push(sectionHeading("Interests"));
    interests.forEach((i) =>
      children.push(
        para([
          run(`${i.name}: `, { bold: true, color: INK }),
          run((i.keywords ?? []).join(", ")),
        ]),
      ),
    );
  };

  const awardsSection = () => {
    const awards = (profile.awards ?? []).filter((a) => hasText(a.title));
    if (awards.length === 0) return;
    children.push(sectionHeading("Awards"));
    awards.forEach((a) => {
      children.push(
        para([run(a.title, { bold: true, color: INK, size: 22 })], {
          spacing: { before: 60, after: 10 },
        }),
      );
      const meta = [
        hasText(a.awarder) ? a.awarder : "",
        hasText(a.date) ? a.date : "",
      ].filter(Boolean);
      if (meta.length)
        children.push(para([run(meta.join("   ·   "), { color: INK_MUTE })]));
      if (hasText(a.summary)) children.push(para([run(a.summary)]));
    });
  };

  const languagesSection = () => {
    const langs = (profile.languages ?? []).filter((l) => hasText(l.language));
    if (langs.length === 0) return;
    children.push(sectionHeading("Languages"));
    langs.forEach((l) =>
      children.push(
        para([
          run(`${l.language}: `, { bold: true, color: INK }),
          run(l.fluency),
        ]),
      ),
    );
  };

  const referencesSection = () => {
    const refs = (profile.references ?? []).filter((r) => hasText(r.name));
    if (refs.length === 0) return;
    children.push(sectionHeading("References"));
    refs.forEach((r) => {
      if (hasText(r.reference))
        children.push(para([run(r.reference, { italics: true })]));
      children.push(
        para([run(`— ${r.name}`, { color: INK_MUTE })], {
          alignment: AlignmentType.RIGHT,
        }),
      );
    });
  };

  // ---- Order mirrors the page (experience gates the first block) --------
  const hasExperience =
    (profile.work ?? []).length > 0 && hasText(profile.work[0]?.name);

  aboutSection();
  if (hasExperience) {
    experienceSection();
    projectsSection();
    skillsSection();
  } else {
    skillsSection();
    projectsSection();
  }
  educationSection();
  certificatesSection();
  interestsSection();
  awardsSection();
  languagesSection();
  referencesSection();

  return new Document({
    creator: "AuraCV",
    title: `${b.name || "Resume"} — Resume`,
    sections: [
      {
        properties: {
          page: { margin: { top: 720, right: 1080, bottom: 720, left: 1080 } },
        },
        children,
      },
    ],
  });
}

/** Build the .docx and trigger a browser download. */
export async function downloadResumeDocx(profile: UserProfile): Promise<void> {
  const doc = buildResumeDoc(profile);
  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${(profile.basics.name || "resume").trim() || "resume"} Resume.docx`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
