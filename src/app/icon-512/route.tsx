import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 512,
          height: 512,
          background: 'linear-gradient(145deg, #16181d 0%, #0c0e12 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Outer glow ring */}
        <div
          style={{
            position: 'absolute',
            width: 320,
            height: 320,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(177,201,225,0.06) 0%, transparent 70%)',
            display: 'flex',
          }}
        />
        <svg width="260" height="260" viewBox="0 0 20 20" fill="none">
          <polygon
            points="11,2 5,11 10,11 9,18 15,9 10,9"
            fill="#b1c9e1"
          />
        </svg>
      </div>
    ),
    { width: 512, height: 512 },
  )
}
