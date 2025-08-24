/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental:{
      serverActions:{
        bodySizeLimit:"100MB"
      },
    },
    images: {
    domains: ["img.freepik.com","nyc.cloud.appwrite.io"], // allow images from freepik
  },
};

export default nextConfig;
