export default function RadarGrid() {

  const meridians = [];
  const parallels = [];

  // Curved Longitude Lines
  for (let x = 120; x < 1920; x += 120) {

    const curve = Math.abs(960 - x) * 0.28;

    meridians.push(
      <path
        key={"m"+x}
        d={`
          M ${x} 0
          Q ${x-curve} 540 ${x} 1080
        `}
        fill="none"
        stroke="#19b8ff"
        strokeOpacity={x % 480 === 0 ? 0.12 : 0.05}
        strokeWidth={x % 480 === 0 ? 1.1 : 0.6}
      />
    );
  }

  // Curved Latitude Lines
  for (let y = 80; y < 1080; y += 80) {

    const curve = (540 - y) * 0.18;

    parallels.push(
      <path
        key={"p"+y}
        d={`
          M 0 ${y}
          Q 960 ${y+curve}
          1920 ${y}
        `}
        fill="none"
        stroke="#19b8ff"
        strokeOpacity={y === 560 ? 0.18 : 0.05}
        strokeWidth={y === 560 ? 1.2 : 0.6}
      />
    );
  }

  return (
    <g className="radar-grid">

      {meridians}

      {parallels}

    </g>
  );

}