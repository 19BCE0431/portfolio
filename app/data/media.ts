export type StoryImage = {
  src: string;
  alt: string;
  caption: string;
  source: string;
  orientation?: "portrait" | "landscape" | "square";
};

export type GalleryCluster = {
  id: "mba" | "recognition" | "life" | "portraits";
  label: string;
  title: string;
  description: string;
  intent: string;
  images: StoryImage[];
};

export const portraitImages: StoryImage[] = [
  {
    src: "/images/profile/profile-hero-01.jpg",
    alt: "Professional campus portrait of Mohit Sai Krishna Peddakotla",
    caption: "The main portrait: formal enough for recruiters, still warm enough to feel like me.",
    source: "IMG_3157.heic",
    orientation: "portrait",
  },
  {
    src: "/images/profile/profile-campus-01.jpg",
    alt: "Mohit Sai Krishna Peddakotla standing on the IIM Sirmaur campus",
    caption: "A second campus portrait kept as an editorial reserve, not forced into the homepage.",
    source: "IMG_3145.heic",
    orientation: "portrait",
  },
];

export const recognitionImages: StoryImage[] = [
  {
    src: "/images/achievements/iconic-quiz-01.jpg",
    alt: "Iconic Quiz recognition collage by iimjobs.com and Markezen of IIM Sirmaur",
    caption: "An early campus signal: Top 10 in the Iconic Quiz conducted by iimjobs.com and Markezen at IIM Sirmaur.",
    source: "IMG_0388.jpg",
    orientation: "portrait",
  },
  {
    src: "/images/achievements/placement-season-kit-01.jpg",
    alt: "Placement season kit from the IIM Sirmaur MBA chapter",
    caption: "A placement-season context frame. Useful, but kept quieter than the quiz proof point.",
    source: "IMG_0368.HEIC",
    orientation: "landscape",
  },
];

export const mbaLifeImages: StoryImage[] = [
  {
    src: "/images/mba-life/iim-classroom-01.jpg",
    alt: "Students seated in an IIM Sirmaur classroom",
    caption: "Case rooms, name cards, and the slow work of learning how to think in groups.",
    source: "IMG_9765.HEIC",
    orientation: "landscape",
  },
  {
    src: "/images/mba-life/iim-collaboration-01.jpg",
    alt: "Students collaborating around a table at IIM Sirmaur",
    caption: "A small classroom frame that feels more useful than staged: people around a problem.",
    source: "IMG_5118.HEIC",
    orientation: "landscape",
  },
  {
    src: "/images/mba-life/iim-campus-01.jpg",
    alt: "IIM Sirmaur campus building in evening light",
    caption: "The campus has this quiet, mountain-side seriousness that suits the chapter.",
    source: "IMG_9150.HEIC",
    orientation: "landscape",
  },
  {
    src: "/images/mba-life/iim-campus-rain-01.jpg",
    alt: "Rainy view of IIM Sirmaur campus and surrounding hills",
    caption: "A softer campus frame for the days when the hills do most of the talking.",
    source: "c3b761f8-9759-4b42-aa87-8b3ff11bd57f.JPG",
    orientation: "landscape",
  },
];

export const lifeGalleryImages: StoryImage[] = [
  {
    src: "/images/gallery/life-window-01.jpg",
    alt: "Mohit standing by a window on campus",
    caption: "A quiet window frame from the campus days.",
    source: "IMG_0866.HEIC",
    orientation: "landscape",
  },
  {
    src: "/images/gallery/life-hills-01.jpg",
    alt: "Mohit looking out over hills from a viewpoint",
    caption: "The kind of view that makes you stop narrating everything for a minute.",
    source: "IMG_0940.HEIC",
    orientation: "portrait",
  },
  {
    src: "/images/gallery/life-sunset-01.jpg",
    alt: "Mohit standing near a sunset in the hills",
    caption: "Sunset, hills, and just enough silence.",
    source: "IMG_2621.heic",
    orientation: "landscape",
  },
  {
    src: "/images/gallery/life-viewpoint-01.jpg",
    alt: "Mohit sitting near a mountain viewpoint",
    caption: "A travel frame I like for the calm in it.",
    source: "IMG_2911.PNG",
    orientation: "portrait",
  },
  {
    src: "/images/gallery/life-mountain-portrait-01.jpg",
    alt: "Mohit smiling in front of mountain clouds",
    caption: "Cloudy weather, good light, no agenda.",
    source: "IMG_6004.HEIC",
    orientation: "portrait",
  },
  {
    src: "/images/gallery/life-friends-viewpoint-01.jpg",
    alt: "Friends looking at a mountain view",
    caption: "A friend-frame kept off the homepage, but warm enough for here.",
    source: "IMG_2474.HEIC",
    orientation: "landscape",
  },
  {
    src: "/images/gallery/life-friends-snow-01.jpg",
    alt: "Friends sitting together during a cold-weather trip",
    caption: "Slightly messy, very real.",
    source: "IMG_1489.HEIC",
    orientation: "landscape",
  },
  {
    src: "/images/gallery/life-mist-01.jpg",
    alt: "Mohit standing in misty weather",
    caption: "A misty frame from outside the usual routine.",
    source: "IMG_5535.HEIC",
    orientation: "portrait",
  },
];

export const galleryClusters: GalleryCluster[] = [
  {
    id: "life",
    label: "Life",
    title: "Travel, friends, and quiet reset frames.",
    description:
      "The warmest set stays away from the homepage. It is here for people who want a little more texture after the professional story.",
    intent: "Optional personal layer",
    images: lifeGalleryImages,
  },
  {
    id: "mba",
    label: "MBA",
    title: "Classrooms, campus, and the current chapter.",
    description:
      "A small set of IIM Sirmaur frames that supports the MBA story without turning the homepage into an album.",
    intent: "Professional context",
    images: mbaLifeImages,
  },
  {
    id: "recognition",
    label: "Recognition",
    title: "Small signals from the MBA chapter.",
    description:
      "Recognition visuals are kept compact and specific: proof points, not a victory lap.",
    intent: "Quiet credibility",
    images: recognitionImages,
  },
  {
    id: "portraits",
    label: "Portraits",
    title: "Professional photo candidates.",
    description:
      "Only the strongest portrait options are kept in circulation, so the site does not feel like it is trying every image at once.",
    intent: "Identity system",
    images: portraitImages,
  },
];
