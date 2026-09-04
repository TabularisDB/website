import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
    output: 'export',
    trailingSlash: true,
    images: {
        unoptimized: true,
    },
    allowedDevOrigins: ['192.168.1.17', '192.168.1.10'],
};

export default nextConfig;
