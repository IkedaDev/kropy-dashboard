import { withPayload } from '@payloadcms/next/withPayload'

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Your Next.js config here
  async rewrites() {
    return [
      {
        source: '/((?!admin|api))tenant-domains/:path*',
        destination: '/tenant-domains/:tenant/:path*',
        has: [
          {
            type: 'host',
            value: '(?<tenant>.*)',
          },
        ],
      },
    ]
  },
  webpack: (config, { dev }) => {
    if (dev) {
      const existingIgnored = config.watchOptions?.ignored
      if (existingIgnored instanceof RegExp) {
        let source = existingIgnored.source
        if (source.includes('node_modules')) {
          source = source.replace('node_modules', 'node_modules|media|\\.docker-data')
        } else {
          source = `(${source})|media|\\.docker-data`
        }
        config.watchOptions = {
          ...config.watchOptions,
          ignored: new RegExp(source, existingIgnored.flags),
        }
      } else if (typeof existingIgnored === 'string') {
        config.watchOptions = {
          ...config.watchOptions,
          ignored: new RegExp(`${existingIgnored}|media|\\.docker-data`),
        }
      } else {
        config.watchOptions = {
          ...config.watchOptions,
          ignored: /[\\/](media|\.docker-data)[\\/]/,
        }
      }
    }
    return config
  },
}

export default withPayload(nextConfig)
