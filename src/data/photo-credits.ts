/**
 * Photograph credits.
 *
 * Every photograph on the site is documentary and openly licensed. Two rules
 * were applied when choosing them:
 *
 *   1. No AI-generated imagery. A campaign whose authority rests on citing
 *      UNICEF and Human Rights Watch cannot illustrate itself with pictures
 *      of things that never happened.
 *
 *   2. No identifiable children. A stock photograph of a real, recognisable
 *      child on a page about child marriage implies that child is a victim.
 *      These images carry the subject through place and absence instead.
 *
 * CC BY-SA requires attribution and that adaptations keep the same licence.
 * These files are cropped and resized, which makes them adaptations, so each
 * is credited below and remains under its original licence. That obligation
 * attaches to the images, not to the rest of the site.
 */

export type PhotoCredit = {
  /** Path under /public. */
  src: string;
  title: string;
  author: string;
  license: string;
  licenseUrl: string;
  sourceUrl: string;
  /** What the picture shows, for the credits page. */
  note: { ar: string; en: string };
};

export const PHOTO_CREDITS: Record<string, PhotoCredit> = {
  "/img/baghdad-mustansiriya.jpg": {
    src: "/img/baghdad-mustansiriya.jpg",
    title: "المدرسة المستنصرية في بغداد",
    author: "Taisir Mahdi",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
    sourceUrl:
      "https://commons.wikimedia.org/wiki/File:%D8%A7%D9%84%D9%85%D8%AF%D8%B1%D8%B3%D8%A9_%D8%A7%D9%84%D9%85%D8%B3%D8%AA%D9%86%D8%B5%D8%B1%D9%8A%D8%A9_%D9%81%D9%8A_%D8%A8%D8%BA%D8%AF%D8%A7%D8%AF_(3).jpg",
    note: {
      ar: "صحن المدرسة المستنصرية في بغداد، من أقدم الجامعات في العالم، بُنيت سنة 1227.",
      en: "The courtyard of the Mustansiriya Madrasa in Baghdad, one of the world's oldest universities, built in 1227.",
    },
  },
  "/img/kirkuk-classroom.jpg": {
    src: "/img/kirkuk-classroom.jpg",
    title: "Kale İlkokulu (Citadel Primary School), Kirkuk Citadel, Iraq",
    author: "Enasiqph",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
    sourceUrl:
      "https://commons.wikimedia.org/wiki/File:Kale_%C4%B0lkokulu_(Citadel_Primary_School),_Kirkuk_Citadel,_Kirkuk,_Iraq_13.jpg",
    note: {
      ar: "صف فارغ في مدرسة القلعة الابتدائية بقلعة كركوك.",
      en: "An empty classroom in the Citadel Primary School, Kirkuk Citadel.",
    },
  },
  "/img/mustansiriya-portal.jpg": {
    src: "/img/mustansiriya-portal.jpg",
    title: "Mustansiriya Madrasah",
    author: "Makaay31",
    license: "CC BY-SA 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0/",
    sourceUrl:
      "https://commons.wikimedia.org/wiki/File:Mustansiriya_Madrasah5.jpg",
    note: {
      ar: "المدخل المزخرف للمدرسة المستنصرية، ببغداد، بنقوشه الكوفية.",
      en: "The carved portal of the Mustansiriya Madrasa in Baghdad, with its Kufic inscription.",
    },
  },
  "/img/campaign-before-18.jpg": {
    src: "/img/campaign-before-18.jpg",
    title: "حق التعليم والطفولة",
    author: "HerLiberation",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
    sourceUrl: "https://her-liberation.org",
    note: {
      ar: "صورة وثائقية ترمز لحق الطفلة في التعليم وبناء مستقبلها.",
      en: "A documentary photo symbolizing a girl's right to education and building her future.",
    },
  },
};

/** Short credit line, e.g. for a caption under an image. */
export function creditLine(src: string): string | null {
  const c = PHOTO_CREDITS[src];
  return c ? `${c.title} · ${c.author} · ${c.license}` : null;
}

export const ALL_CREDITS = Object.values(PHOTO_CREDITS);
