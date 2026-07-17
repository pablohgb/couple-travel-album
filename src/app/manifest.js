export default function manifest() {
  return {
    name: "Nuestro álbum de viajes",
    short_name: "Álbum",
    description: "Álbum privado de viajes y recuerdos de pareja.",
    start_url: "/",
    display: "standalone",
    background_color: "#FFB8B8",
    theme_color: "#FF8A8A",
    orientation: "portrait-primary",
    icons: [
      {
        src: "/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
