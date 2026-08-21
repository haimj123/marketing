import type { Metadata } from "next";
import { FavoritesList } from "@/components/favorites-list";

export const metadata: Metadata = {
  title: "Favorites",
  robots: { index: false, follow: true },
};

export default function FavoritesPage() {
  return (
    <div className="page py-8">
      <h1 className="font-display text-2xl font-extrabold tracking-tight text-ink-900">
        Favorites
      </h1>
      <p className="mt-2 text-sm text-ink-600">Saved on this device.</p>
      <div className="mt-8">
        <FavoritesList />
      </div>
    </div>
  );
}
