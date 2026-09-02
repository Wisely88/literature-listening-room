"use client";

import { useState } from "react";
import styles from "./favorite-button.module.css";

type FavoriteButtonProps = {
  workId: string;
  initialFavorited: boolean;
};

export function FavoriteButton({ workId, initialFavorited }: FavoriteButtonProps) {
  const [favorited, setFavorited] = useState(initialFavorited);
  const [pending, setPending] = useState(false);

  async function toggle() {
    setPending(true);
    try {
      const response = await fetch("/api/favorites/" + workId, {
        method: favorited ? "DELETE" : "POST",
      });
      if (!response.ok) throw new Error("favorite request failed");
      setFavorited(!favorited);
    } catch {
      // Keep the previous state on failure; the next click can retry.
    } finally {
      setPending(false);
    }
  }

  return (
    <button
      aria-pressed={favorited}
      className={styles.button}
      disabled={pending}
      onClick={toggle}
      type="button"
    >
      <span aria-hidden="true">{favorited ? "★" : "☆"}</span>
      {favorited ? "已收藏" : "收藏"}
    </button>
  );
}
