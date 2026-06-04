import { ImageResponse } from 'next/og'

export const runtime = 'edge'

// Favicon 32×32
export const size        = { width: 32, height: 32 }
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          background: '#111318',
          borderRadius: 7,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Lightning bolt "V" shape */}
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <polygon
            points="11,2 5,11 10,11 9,18 15,9 10,9"
            fill="#b1c9e1"
          />
        </svg>
      </div>
    ),
    { width: 32, height: 32 },
  )
}
