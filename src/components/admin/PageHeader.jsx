import { Card } from "antd";

export const AdminPageHeader = ({
  title,
  description,
  icon,
  color = "#c8102e",
  image,
}) => {
  return (
    <Card
      style={{
        background: `linear-gradient(135deg, ${color}15 0%, ${color}08 100%)`,
        border: `2px solid ${color}30`,
        borderRadius: "16px",
        marginBottom: "24px",
        overflow: "hidden",
      }}
      bodyStyle={{ padding: "24px" }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
        <div
          style={{
            fontSize: "64px",
            flex: "0 0 auto",
          }}
        >
          {icon}
        </div>
        <div style={{ flex: 1 }}>
          <h2 style={{ margin: 0, fontSize: "28px", fontWeight: "700", color }}>
            {title}
          </h2>
          <p style={{ margin: "8px 0 0 0", fontSize: "16px", color: "#666" }}>
            {description}
          </p>
        </div>
        {image && (
          <div
            style={{
              width: "120px",
              height: "120px",
              borderRadius: "12px",
              background: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "80px",
              flex: "0 0 auto",
            }}
          >
            {image}
          </div>
        )}
      </div>
    </Card>
  );
};
