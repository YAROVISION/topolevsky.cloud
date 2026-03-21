/** @type {import('next').NextConfig} */
const nextConfig = {
	typescript: {
		ignoreBuildErrors: true
	},
	images: {
		unoptimized: true
	},
	experimental: {
		serverActions: {
			bodySizeLimit: '10mb'
		}
	},
	serverExternalPackages: ['@prisma/client', 'prisma', '@prisma/extension-accelerate', '.prisma/client'],
	transpilePackages: ['voyageai']
}

export default nextConfig
