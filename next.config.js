/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Permet de lire les env variables côté serveur uniquement (API routes)
  serverExternalPackages: ["@notionhq/client"],
}

module.exports = nextConfig
