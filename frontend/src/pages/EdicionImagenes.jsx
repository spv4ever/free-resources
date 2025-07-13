import { useState } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faWandMagicSparkles,
  faMagnifyingGlass,
  faBoxOpen,
  faRulerCombined,
  faScissors,
  faRotate,
  faBorderNone,
  faWater,
  faEyeSlash
} from "@fortawesome/free-solid-svg-icons";

const tools = [
  {
    title: "Eliminar fondo",
    desc: "Elimina el fondo de tus imágenes automáticamente con un solo clic. Detecta objetos y recorta con precisión.",
    icon: <FontAwesomeIcon icon={faWandMagicSparkles} />,
    link: "/keiko-remove-bg",
    access: "Free",
    status: "activo",
  },
  {
    title: "Mejorar calidad",
    desc: "Aumenta la resolución y nitidez de tus imágenes con inteligencia artificial. Ideal para ampliar sin perder detalle.",
    icon: <FontAwesomeIcon icon={faMagnifyingGlass} />,
    link: "/upscale",
    access: "Free / Premium",
    status: "activo",
  },
  {
    title: "Comprimir imagen",
    desc: "Reduce el peso de imágenes JPG y PNG sin pérdida de calidad visible. Optimiza para web o redes sociales.",
    icon: <FontAwesomeIcon icon={faBoxOpen} />,
    link: "/compresor-imagenes",
    access: "Free",
    status: "activo",
  },
  {
    title: "Redimensionar imagen",
    desc: "Cambia el tamaño de tus imágenes por porcentaje o píxeles. Ajusta al formato que necesites.",
    icon: <FontAwesomeIcon icon={faRulerCombined} />,
    link: "/redimensionar-imagenes",
    access: "Free",
    status: "activo",
  },
  {
    title: "Recortar imagen",
    desc: "Recorta cualquier parte de tu imagen con precisión usando un área rectangular definida por ti.",
    icon: <FontAwesomeIcon icon={faScissors} />,
    link: "/crop",
    access: "Free",
    status: "proximamente",
  },
  {
    title: "Convertir formato",
    desc: "Convierte imágenes entre formatos JPG, PNG, WebP y más. Compatible con la mayoría de estándares.",
    icon: <FontAwesomeIcon icon={faBorderNone} />,
    link: "/convert",
    access: "Free",
    status: "proximamente",
  },
  {
    title: "Girar imagen",
    desc: "Gira tus imágenes en 90°, 180° o cualquier ángulo. Perfecto para ajustar orientación o composición.",
    icon: <FontAwesomeIcon icon={faRotate} />,
    link: "/rotate",
    access: "Free",
    status: "proximamente",
  },
  {
    title: "Pixelar zona",
    desc: "Oculta zonas sensibles, como rostros o matrículas, aplicando desenfoque o pixelado automático.",
    icon: <FontAwesomeIcon icon={faEyeSlash} />,
    link: "/pixelate",
    access: "Premium",
    status: "proximamente",
  },
  {
    title: "Marca de agua",
    desc: "Protege tus imágenes añadiendo una marca de agua personalizable con texto o logotipo.",
    icon: <FontAwesomeIcon icon={faWater} />,
    link: "/watermark",
    access: "Premium",
    status: "proximamente",
  }
];

export default function EdicionImagenes() {
  const styles = {
    container: {
      maxWidth: "1200px",
      margin: "0 auto",
      padding: "40px 20px",
    },
    title: {
      color: "#ffffff",
      textAlign: "center",
      fontSize: "32px",
      marginBottom: "40px",
    },
    grid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
      gap: "24px",
    },
    card: {
      backgroundColor: "#1f1f1f",
      border: "1px solid #333",
      borderRadius: "12px",
      padding: "20px",
      textDecoration: "none",
      color: "#ddd",
      transition: "all 0.3s ease",
    },
    icon: {
      fontSize: "32px",
      marginBottom: "12px",
    },
    titleCard: {
      fontSize: "18px",
      color: "#1e90ff",
      marginBottom: "8px",
    },
    desc: {
      fontSize: "14px",
      color: "#bbb",
    },
    access: {
      marginTop: "10px",
      fontSize: "12px",
      color: "#6bc5ff",
    },
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Edición de Imágenes</h1>
      <div style={styles.grid}>
        {tools.map((tool, i) => (
          <Card key={i} tool={tool} styles={styles} />
        ))}
      </div>
    </div>
  );
}

function Card({ tool, styles }) {
  const [hover, setHover] = useState(false);
  const isActive = tool.status === "activo";

  const baseStyle = {
    ...styles.card,
    position: "relative",
    ...(hover && isActive && {
      borderColor: "#1e90ff",
      boxShadow: "0 4px 12px rgba(30, 144, 255, 0.5)",
      transform: "translateY(-5px)",
    }),
    ...(tool.status !== "activo" && {
      opacity: 0.4,
      cursor: "not-allowed",
      pointerEvents: "none",
    }),
  };

  const badgeText = {
    premium: "Premium",
    proximamente: "Próximamente",
  }[tool.status];

  const cardContent = (
    <>
      {badgeText && (
        <div style={{
          position: "absolute",
          top: 10,
          right: 10,
          backgroundColor: tool.status === "premium" ? "#ff9e3b" : "#555",
          color: "#fff",
          padding: "4px 8px",
          fontSize: "12px",
          borderRadius: "8px",
          zIndex: 1,
        }}>
          {badgeText}
        </div>
      )}
      <div style={styles.icon}>{tool.icon}</div>
      <h2 style={styles.titleCard}>{tool.title}</h2>
      <p style={styles.desc}>{tool.desc}</p>
      <p style={styles.access}>{tool.access}</p>
    </>
  );

  return isActive ? (
    <Link
      to={tool.link}
      style={baseStyle}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {cardContent}
    </Link>
  ) : (
    <div style={baseStyle}>
      {cardContent}
    </div>
  );
}