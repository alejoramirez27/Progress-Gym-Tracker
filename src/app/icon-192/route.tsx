import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 192,
          height: 192,
          background: 'linear-gradient(145deg, #16181d 0%, #0c0e12 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <svg width="100" height="100" viewBox="0 0 20 20" fill="none">
          <polygon
            points="11,2 5,11 10,11 9,18 15,9 10,9"
            fill="#b1c9e1"
          />
        </svg>
      </div>
    ),
    { width: 192, height: 192 },
  )
}
