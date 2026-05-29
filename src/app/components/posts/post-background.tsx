"use client"

export function PostBackground() {
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none select-none"
      viewBox="0 0 1000 800"
      preserveAspectRatio="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Long flowing strands */}
      <path
        d="M-50 80 C 200 20, 400 160, 700 80 S 950 160, 1050 80"
        stroke="#272662" strokeWidth="1.5" fill="none" opacity="0.1"
      />
      <path
        d="M-50 160 C 250 100, 450 240, 750 160 S 980 240, 1050 160"
        stroke="#F15A24" strokeWidth="1" fill="none" opacity="0.08"
      />
      <path
        d="M-50 240 C 180 180, 380 320, 680 240 S 930 320, 1050 240"
        stroke="#86B0DD" strokeWidth="2" fill="none" opacity="0.06"
      />
      <path
        d="M-50 320 C 220 260, 420 400, 720 320 S 970 400, 1050 320"
        stroke="#F7A06A" strokeWidth="1.2" fill="none" opacity="0.12"
      />
      <path
        d="M-50 400 C 300 340, 500 480, 800 400 S 1000 480, 1050 400"
        stroke="#F7ECDA" strokeWidth="1.8" fill="none" opacity="0.08"
      />
      <path
        d="M-50 480 C 200 420, 400 560, 700 480 S 950 560, 1050 480"
        stroke="#272662" strokeWidth="0.8" fill="none" opacity="0.07"
      />
      <path
        d="M-50 560 C 250 500, 450 640, 750 560 S 980 640, 1050 560"
        stroke="#F15A24" strokeWidth="1.5" fill="none" opacity="0.06"
      />
      <path
        d="M-50 640 C 180 580, 380 720, 680 640 S 930 720, 1050 640"
        stroke="#86B0DD" strokeWidth="1" fill="none" opacity="0.09"
      />

      {/* Crossing vertical-ish strands */}
      <path
        d="M 150 -20 C 100 180, 250 380, 200 620"
        stroke="#F15A24" strokeWidth="0.8" fill="none" opacity="0.07"
      />
      <path
        d="M 350 -20 C 300 180, 450 380, 400 620"
        stroke="#272662" strokeWidth="1.5" fill="none" opacity="0.08"
      />
      <path
        d="M 600 -20 C 550 180, 700 380, 650 620"
        stroke="#86B0DD" strokeWidth="1" fill="none" opacity="0.06"
      />
      <path
        d="M 800 -20 C 750 180, 900 380, 850 620"
        stroke="#F7A06A" strokeWidth="1.3" fill="none" opacity="0.1"
      />

      {/* Wavy accent strands */}
      <path
        d="M-50 60 C 150 10, 250 130, 400 60 S 600 130, 750 60 S 950 130, 1050 60"
        stroke="#86B0DD" strokeWidth="1" fill="none" opacity="0.07"
      />
      <path
        d="M-50 520 C 200 470, 350 590, 500 520 S 750 590, 900 520 S 1050 590, 1100 520"
        stroke="#F7A06A" strokeWidth="1.5" fill="none" opacity="0.09"
      />
      <path
        d="M-50 600 C 180 550, 330 670, 480 600 S 730 670, 880 600 S 1030 670, 1100 600"
        stroke="#272662" strokeWidth="0.8" fill="none" opacity="0.06"
      />

      {/* Short decorative strands */}
      <path
        d="M 80 200 C 180 170, 230 240, 330 200"
        stroke="#F7ECDA" strokeWidth="2" fill="none" opacity="0.1"
      />
      <path
        d="M 450 370 C 550 340, 600 410, 700 370"
        stroke="#F15A24" strokeWidth="1.2" fill="none" opacity="0.08"
      />
      <path
        d="M 650 520 C 750 490, 800 560, 900 520"
        stroke="#86B0DD" strokeWidth="1.8" fill="none" opacity="0.07"
      />
      <path
        d="M 250 620 C 350 590, 400 660, 500 620"
        stroke="#F7A06A" strokeWidth="0.8" fill="none" opacity="0.11"
      />

      {/* Dramatic flowing curves */}
      <path
        d="M-50 460 C 150 560, 350 360, 550 460 S 750 360, 1050 460"
        stroke="#F15A24" strokeWidth="1.5" fill="none" opacity="0.05"
      />
      <path
        d="M-50 720 C 250 820, 450 620, 750 720 S 950 620, 1050 720"
        stroke="#272662" strokeWidth="2.5" fill="none" opacity="0.05"
      />
    </svg>
  )
}
