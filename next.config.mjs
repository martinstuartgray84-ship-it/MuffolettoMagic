/** @type {import('next').NextConfig} */
const nextConfig = {
  // Content lives in /content as JSON. Static pages read it at build time; only the
  // on-demand brief route needs the files bundled. (Do NOT use a catch-all key here:
  // it also matches the middleware and breaks it on Vercel.)
  outputFileTracingIncludes: { "/brief/[slug]": ["./content/**/*"] },
};
export default nextConfig;
