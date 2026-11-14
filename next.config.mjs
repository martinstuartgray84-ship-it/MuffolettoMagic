/** @type {import('next').NextConfig} */
const nextConfig = {
  // Content lives in /content as JSON and is read at build time.
  outputFileTracingIncludes: { "/**": ["./content/**/*"] },
};
export default nextConfig;
