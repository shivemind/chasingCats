// src/app/icon.tsx
import { ImageResponse } from 'next/og';

export const size = {
  width: 180,
  height: 180,
};

export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',             // ✅ explicit flex
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0E7C7B 10%, #095859 90%)',
        }}
      >
        <div
          style={{
            height: '140px',
            width: '140px',
            borderRadius: '32px',
            backgroundColor: '#0E7C7B',
            boxShadow: '0 18px 35px -15px rgba(12, 20, 18, 0.45)',
            display: 'flex',           // ✅ also flex (but only 1 child)
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <svg
            viewBox="0 0 128 128"
            width="110"
            height="110"
            fill="none"
            style={{
              filter: 'drop-shadow(0 4px 8px rgba(9, 88, 89, 0.3))',
            }}
          >
            <path
              d="M36 54V36L20 16l36 18 8-12 8 12 36-18-16 20v18c14 10 22 24 22 40 0 22-18 40-40 40H54c-22 0-40-18-40-40 0-16 8-30 22-40z"
              fill="#F5F1E3"
            />
            <path
              d="M44 84c0 13.255 8.745 24 20 24s20-10.745 20-24"
              stroke="#0C1412"
              strokeWidth={6}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx={52} cy={76} r={6} fill="#0C1412" />
            <circle cx={76} cy={76} r={6} fill="#0C1412" />
            <path
              d="M64 96c4.418 0 8-3.134 8-7"
              stroke="#F9982F"
              strokeWidth={4}
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>
    ),
    {
      ...size,
    },
  );
}
