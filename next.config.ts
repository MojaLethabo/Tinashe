import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/Contact.html",
        destination: "/contact",
        permanent: true,
      },
      {
        source: "/About.html",
        destination: "/about",
        permanent: true,
      },
      {
        source: "/Blog.html",
        destination: "/blog",
        permanent: true,
      },
      {
        source: "/Podcast.html",
        destination: "/podcast",
        permanent: true,
      },
      {
        source: "/Research.html",
        destination: "/research",
        permanent: true,
      },
      {
        source: "/Index.html",
        destination: "/",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;