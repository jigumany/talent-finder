
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      }
    ],
  },
  devIndicators: {
    allowedDevOrigins: [
      'https://*.cluster-iesosxm5fzdewqvhlwn5qivgry.cloudworkstations.dev',
    ],
  },
   async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Access-Control-Allow-Credentials", value: "true" },
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Access-Control-Allow-Methods", value: "GET,OPTIONS,PATCH,DELETE,POST,PUT" },
          { key: "Access-Control-Allow-Headers", value: "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version" },
          { key: "Access-Control-Expose-Headers", value: "X-Total-Pages" },
        ],
      },
    ]
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      // These packages are required by Genkit, but used only for tracing.
      // We can mark them as external to avoid including them in the server
      // bundle.
      config.externals.push('@opentelemetry/exporter-jaeger');
    }
    return config;
  },
};

export default nextConfig;
