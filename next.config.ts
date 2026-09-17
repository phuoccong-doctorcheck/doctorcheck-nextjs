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
