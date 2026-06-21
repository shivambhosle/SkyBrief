function VerdictBadge({ verdict }) {
  const colors = {
    GO: "#16a34a",
    CAUTION: "#f59e0b",
    "NO-GO": "#dc2626",
  };

  return (
    <div
      style={{
        backgroundColor: colors[verdict],
        color: "white",
        padding: "10px 20px",
        borderRadius: "8px",
        display: "inline-block",
        fontWeight: "bold",
      }}
    >
      {verdict}
    </div>
  );
}

export default VerdictBadge;