const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.pexels.com',
      },
      {
        protocol: 'https',
        hostname: 'www.pinterest.com',
      },
      {
        protocol: 'https',
        hostname: 'as2.ftcdn.net',
      },
    ],
  },
};

export default nextConfig;
