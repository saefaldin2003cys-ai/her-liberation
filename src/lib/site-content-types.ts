export type ImageSetting = {
  url: string;
  fit?: "cover" | "contain";
  position?: "center" | "top" | "bottom";
  aspect?: "3/2" | "4/3" | "1/1" | "4/5" | "16/9" | "auto";
};

export type SiteImages = {
  homeHero: string | ImageSetting;
  homeTestimony: string | ImageSetting;
  campaignBefore18: string | ImageSetting;
  campaignsHero?: string | ImageSetting;
  aboutHero: string | ImageSetting;
  programSpotlight?: string | ImageSetting;
  logo: string | ImageSetting;
};

export const DEFAULT_SITE_IMAGES: Record<keyof SiteImages, string> = {
  homeHero: "/img/baghdad-mustansiriya.jpg",
  homeTestimony: "/img/kirkuk-classroom.jpg",
  campaignBefore18: "/img/campaign-before-18.jpg",
  campaignsHero: "/img/campaign-before-18.jpg",
  aboutHero: "/img/basra-marshlands.jpg",
  programSpotlight: "/img/shelf-to-spotlight.png",
  logo: "/brand/logo.png",
};

export function normalizeImageSetting(
  item: string | ImageSetting | undefined,
  defaultUrl: string,
): ImageSetting {
  if (!item) {
    return { url: defaultUrl, fit: "cover", position: "center", aspect: "3/2" };
  }
  if (typeof item === "string") {
    return { url: item, fit: "cover", position: "center", aspect: "3/2" };
  }
  return {
    url: item.url || defaultUrl,
    fit: item.fit || "cover",
    position: item.position || "center",
    aspect: item.aspect || "3/2",
  };
}

export function getImageAspectClass(aspect?: ImageSetting["aspect"]): string {
  switch (aspect) {
    case "4/5":
      return "aspect-[4/5]";
    case "1/1":
      return "aspect-square";
    case "4/3":
      return "aspect-[4/3]";
    case "16/9":
      return "aspect-[16/9]";
    case "3/2":
    default:
      return "aspect-[3/2]";
  }
}

export function getImageFitClass(fit?: ImageSetting["fit"]): string {
  return fit === "contain" ? "object-contain p-2" : "object-cover";
}

export function getImagePositionClass(pos?: ImageSetting["position"]): string {
  switch (pos) {
    case "top":
      return "object-top";
    case "bottom":
      return "object-bottom";
    case "center":
    default:
      return "object-center";
  }
}
