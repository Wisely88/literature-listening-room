export type RightsStatus =
  | "public-domain"
  | "licensed"
  | "user-owned"
  | "personal-reference"
  | "unknown";

export type ContentMode = "private" | "public";

export type ContentWarning = {
  code: string;
  message: string;
  sourcePath?: string;
};

export type PronunciationOverride = {
  term: string;
  pronunciation: string;
};

export type AnnotationType =
  | "word"
  | "person"
  | "place"
  | "allusion"
  | "history"
  | "grammar";

export type Annotation = {
  id: string;
  workId: string;
  segmentId?: string;
  term: string;
  explanation: string;
  pronunciation?: string;
  type: AnnotationType;
};

export type Segment = {
  id: string;
  order: number;
  displayText: string;
  speechText?: string;
  translation?: string;
};

export type TimelineItem = {
  year: number;
  title: string;
  description: string;
};

export type RepresentativeWork = {
  title: string;
  type: string;
};

export type RelatedPerson = {
  id: string;
  name: string;
  relationship: string;
  summary: string;
};

export type Author = {
  id: string;
  slug: string;
  name: string;
  aliases: string[];
  courtesyNames: string[];
  birthYear?: number;
  deathYear?: number;
  dynasty?: string;
  country?: string;
  bio: string;
  styleSummary?: string;
  timeline: TimelineItem[];
  representativeWorks: RepresentativeWork[];
  relatedPeople: RelatedPerson[];
};

export type Work = {
  id: string;
  slug: string;
  title: string;
  aliases: string[];
  authorId: string;
  author?: Author;
  category: string;
  foreignGenre?: string;
  dynasty?: string;
  language: string;
  estimatedMinutes?: number;
  rightsStatus: RightsStatus;
  summary: string;
  tags: string[];
  moods: string[];
  ambience: string[];
  defaultAmbience?: string;
  sourceNote?: string;
  editorialNotes: string[];
  pronunciationOverrides: PronunciationOverride[];
  background: string;
  translation: string;
  appreciation: string;
  segments: Segment[];
  annotations: Annotation[];
};

export type WorkSummary = Omit<
  Work,
  "segments" | "annotations" | "background" | "translation" | "appreciation"
>;

export type DurationFilter = "5" | "10" | "20" | "30+";
export type WorkSort = "recent" | "shortest" | "longest";

export type WorkQuery = {
  category?: string;
  genre?: string;
  author?: string;
  q?: string;
  duration?: DurationFilter;
  mood?: string;
  sort?: WorkSort;
};

export type RepositoryOptions = {
  contentDir?: string;
  mode?: ContentMode;
};
