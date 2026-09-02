export const FOREIGN_LITERATURE_CATEGORY = "外国文学";

export const FOREIGN_LITERATURE_GENRES = [
  "经典小说",
  "散文随笔",
  "奇幻文学",
  "科幻文学",
  "推理探案",
  "恐怖惊悚",
  "传记 / 自传",
  "历史文学",
  "思想随笔",
] as const;

export type ForeignLiteratureGenre = (typeof FOREIGN_LITERATURE_GENRES)[number];

export function isForeignLiteratureGenre(value: string | undefined): value is ForeignLiteratureGenre {
  return FOREIGN_LITERATURE_GENRES.some((genre) => genre === value);
}
