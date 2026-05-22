import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "vcgyvauqdxoddiiutrds.supabase.co",
      },
      {
        protocol: "https",
        hostname: "jzwkaxziwimnjxzzupyr.supabase.co",
      },
        {
        protocol: "https",
        hostname: "i.pravatar.cc",
      },

      // Ou, para aceitar qualquer projeto do Supabase:
      // {
      //   protocol: "https",
      //   hostname: "**.supabase.co",
      // },
    ],
  },
};

export default nextConfig;