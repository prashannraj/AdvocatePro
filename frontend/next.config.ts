import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Branding is handled via CSS and custom components */
  output: 'standalone',          // यो मुख्य हो — minimal folder बनाउँछ
  images: {
    unoptimized: true,           // cPanel मा image optimization काम गर्दैन
  },
};

export default nextConfig;
