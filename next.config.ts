
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
