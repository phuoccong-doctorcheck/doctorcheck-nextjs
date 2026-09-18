import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "imagedelivery.net",
      },
      {
        protocol: "https",
        hostname: "www.doctorcheck.vn",
      },
      {
        protocol: "https",
        hostname: "doctorcheck.vn",
      },
      {
        protocol: "https",
        hostname: "img.youtube.com",
      },
    ],
  },
  trailingSlash: true,
  async headers() {
    const isProd = process.env.NODE_ENV === 'production';

    const scriptSrc = isProd
      ? "script-src 'self' 'unsafe-inline'"
      : "script-src 'self' 'unsafe-inline' 'unsafe-eval'";

    const cspDirectives = [
      "default-src 'self'",
      scriptSrc,
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com data:",
      "img-src 'self' data: blob: https://imagedelivery.net https://doctorcheck.vn https://www.doctorcheck.vn https://img.youtube.com https://*.r2.cloudflarestorage.com https://*.amazonaws.com",
      "media-src 'self' data: blob: https://imagedelivery.net https://doctorcheck.vn",
      "frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com",
      "connect-src 'self' https://imagedelivery.net https://*.r2.cloudflarestorage.com https://*.amazonaws.com",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'self'",
    ];

    const cspHeaderValue = cspDirectives.join('; ');

    const standardHeaders = [
      {
        key: 'Content-Security-Policy',
        value: cspHeaderValue,
      },
      {
        key: 'X-Content-Type-Options',
        value: 'nosniff',
      },
      {
        key: 'X-Frame-Options',
        value: 'SAMEORIGIN',
      },
      {
        key: 'Referrer-Policy',
        value: 'strict-origin-when-cross-origin',
      },
      {
        key: 'Permissions-Policy',
        value: 'camera=(), microphone=(), geolocation=()',
      },
    ];

    if (isProd) {
      standardHeaders.push({
        key: 'Strict-Transport-Security',
        value: 'max-age=31536000; includeSubDomains; preload',
      });
    }

    return [
      {
        source: '/:path*',
        headers: standardHeaders,
      },
    ];
  },
  async redirects() {
    return [
      {
        source: '/ve-chung-toi',
        destination: '/ve-doctor-check/',
        permanent: true,
      },
      {
        source: '/bang-gia-dich-vu',
        destination: '/bang-gia-dich-vu-tam-soat-benh-tai-doctor-check/',
        permanent: true,
      },
      {
        source: '/bang-gia-kham-suc-khoe-tong-quat',
        destination: '/bang-gia-dich-vu-tam-soat-benh-tai-doctor-check/',
        permanent: true,
      },
      {
        source: '/trung-tam-noi-soi-tieu-hoa',
        destination: '/trung-tam-noi-soi-tieu-hoa-doctor-check/',
        permanent: true,
      },
      {
        source: '/goi-ung-thu-da-day',
        destination: '/tam-soat-ung-thu-da-day/',
        permanent: true,
      },
      {
        source: '/goi-kham-danh-cho-nam',
        destination: '/goi-tam-soat-nam/',
        permanent: true,
      },
      {
        source: '/goi-kham-danh-cho-nu',
        destination: '/goi-tam-soat-nu/',
        permanent: true,
      },
      {
        source: '/bang-gia-kham-tong-quat',
        destination: '/bang-gia-dich-vu-tam-soat-benh-tai-doctor-check/',
        permanent: true,
      },
      {
        source: '/bang-gia-kham-tong-quat-new',
        destination: '/bang-gia-dich-vu-tam-soat-benh-tai-doctor-check/',
        permanent: true,
      },
      {
        source: '/trung-tam-noi-soi-tieu-hoa/bang-gia-noi-soi-da-day',
        destination: '/bang-gia-dich-vu-tam-soat-benh-tai-doctor-check/',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
