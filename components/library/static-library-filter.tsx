"use client";

import { useEffect } from "react";

export function StaticLibraryFilter() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const category = params.get("category") ?? "";
    const genre = params.get("genre") ?? "";
    const query = (params.get("q") ?? "").trim().toLocaleLowerCase();
    const mood = params.get("mood") ?? "";
    const cards = [...document.querySelectorAll<HTMLElement>("[data-library-work]")];
    let visible = 0;
    for (const card of cards) {
      const matches = (!category || card.dataset.category === category) &&
        (!genre || card.dataset.genre === genre) &&
        (!mood || card.dataset.moods?.split("|").includes(mood)) &&
        (!query || card.dataset.search?.includes(query));
      card.hidden = !matches;
      if (matches) visible += 1;
    }
    const heading = document.querySelector<HTMLElement>("#library-results-title");
    if (heading && (category || genre || mood || query)) heading.textContent = visible ? `找到 ${visible} 篇` : "暂无结果";
  }, []);
  return null;
}
