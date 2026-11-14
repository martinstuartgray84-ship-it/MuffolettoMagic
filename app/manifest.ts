import type { MetadataRoute } from "next";
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Casa Muffoletto",
    short_name: "Muffoletto",
    description: "Design & works headquarters for Casa Muffoletto",
    start_url: "/",
    display: "standalone",
    background_color: "#f7f3ec",
    theme_color: "#9a5a3a",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}
