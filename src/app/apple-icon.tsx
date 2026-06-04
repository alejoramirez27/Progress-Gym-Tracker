import { ImageResponse } from 'next/og'

export const runtime = 'edge'

// iOS home screen icon — 180×180
export const size        = { width: 180, height: 180 }
export const contentType = 'image/png'

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 180,
          height: 180,
          background: 'linear-gradient(145deg, #16181d 0%, #0c0e12 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Lightning bolt centered */}
        <svg width="90" height="90" viewBox="0 0 20 20" fill="none">
          <polygon
            points="11,2 5,11 10,11 9,18 15,9 10,9"
            fill="#b1c9e1"
          />
        </svg>
      </div>
    ),
    { width: 180, height: 180 },
  )
}
