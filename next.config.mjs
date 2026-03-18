/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "i.scdn.co",
        pathname: "**"
      },
      {
        protocol: "https",
        hostname: "cuajuep66z.ufs.sh",
        pathname: "**"
      }
    ]
  },
};

export default nextConfig;
