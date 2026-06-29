const { withSentryConfig } = require("@sentry/nextjs");

const cspHeader = `
    default-src 'self' https://8x8.vc;
    script-src 'self' 'unsafe-eval' 'unsafe-inline' https://8x8.vc;
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    img-src 'self' blob: data:;
    font-src 'self' https://fonts.gstatic.com;
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    upgrade-insecure-requests;
`

/** @type {import('next').NextConfig} */
const nextConfig = {
    output: "standalone",
    async headers() {
        return [
            {
                source: "/(.*)",
                headers: [
                    {
                        key: "Content-Security-Policy",
                        value: cspHeader.replace(/\n/g, "").trim(),
                    },
                ],
            },
        ];
    },
};

const sentryWebpackPluginOptions = {
    silent: true,
    disable: !process.env.NEXT_PUBLIC_SENTRY_DSN,
};

module.exports = process.env.NEXT_PUBLIC_SENTRY_DSN
    ? withSentryConfig(nextConfig, sentryWebpackPluginOptions)
    : nextConfig;
