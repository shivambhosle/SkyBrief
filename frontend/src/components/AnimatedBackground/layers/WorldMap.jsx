export default function WorldMap() {
  return (
    <g className="world-map opacity-10" fill="none" stroke="#38bdf8" strokeWidth="1">
      {/* Continental outlines and flight navigation grid */}
      <path
        d="M 250,220 C 320,180 400,190 480,240 C 440,320 380,380 340,460 C 290,440 240,360 210,300 Z"
        fill="#0284c7"
        fillOpacity="0.05"
      />
      <path
        d="M 520,490 C 580,480 640,540 680,620 C 660,720 590,820 540,890 C 490,850 480,750 490,650 Z"
        fill="#0284c7"
        fillOpacity="0.05"
      />
      <path
        d="M 900,180 C 1020,160 1150,190 1250,240 C 1220,320 1100,380 980,360 C 920,300 880,240 900,180 Z"
        fill="#0284c7"
        fillOpacity="0.05"
      />
      <path
        d="M 940,400 C 1050,420 1100,520 1080,640 C 1040,740 960,780 900,700 C 880,580 900,480 940,400 Z"
        fill="#0284c7"
        fillOpacity="0.05"
      />
      <path
        d="M 1250,260 C 1450,220 1650,280 1750,360 C 1700,500 1550,560 1400,520 C 1320,440 1280,350 1250,260 Z"
        fill="#0284c7"
        fillOpacity="0.05"
      />
      <path
        d="M 1450,680 C 1580,660 1660,720 1650,820 C 1580,880 1480,860 1420,800 C 1400,740 1420,700 1450,680 Z"
        fill="#0284c7"
        fillOpacity="0.05"
      />
    </g>
  );
}