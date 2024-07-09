module.exports = {
  reactStrictMode: false,
  images: {
    domains: ["media.graphassets.com"],
  },
  webpack: (config, { isServer }) => {
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"],
    });

    return config;
  },
};
