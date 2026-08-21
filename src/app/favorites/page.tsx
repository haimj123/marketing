import type { Metadata } from "next";
import { AppHeader } from "@/components/shell/app-header";
import { FavoritesList } from "@/components/giving/favorites-list";

export const metadata: Metadata = {
  title: "Favorites",
  robots: { index: false, follow: true },
};

export default function FavoritesPage() {
  return (
    <>
      <AppHeader back title="Favorites" />
      <FavoritesList />
    </>
  );
}
