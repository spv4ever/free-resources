import { useState, useRef } from "react";

export default function GiradorImagenes() {
  const [imagenes, setImagenes] = useState([]); // array de File
  const [angulo, setAngulo] = useState(90);
  const [descargaUrl, setDescargaUrl] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [enviando, setEnviando] = useState(false);
  const inputRef = useRef(null);

  const handleSeleccion = (files) => {
    const archivos = Array.from(files).filter(
        (file) =>
        (file.type === "image/jpeg" || file.type === "image/png") &&
        file.size <= 5 * 1024 * 1024
    );

    const conPreview = archivos.map((file) => {
        file.preview = URL.createObjectURL(file);
        return file;
    });

    setImagenes((prev) => [...prev, ...conPreview].slice(0, 10));
    setMensaje("");
    };

  const eliminarImagen = (index) => {
    const copia = [...imagenes];
    URL.revokeObjectURL(copia[index].preview);
    copia.splice(index, 1);
    setImagenes(copia);
    };

  const handleDrop = (e) => {
    e.preventDefault();
    handleSeleccion(e.dataTransfer.files);
  };

  const handleEnviar = async () => {
    if (imagenes.length === 0) return;
    setEnviando(true);
    setDescargaUrl("");
    setMensaje("");

    const formData = new FormData();
    imagenes.forEach((file) => {
      formData.append("images", file); // ✅ usar File directamente
    });
    formData.append("angle", angulo);

    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/rotate-images`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        const fullUrl = `${process.env.REACT_APP_API_URL}${data.downloadUrl}`;
        setDescargaUrl(fullUrl);
        setMensaje("Imágenes rotadas correctamente.");
      } else {
        setMensaje("Error al procesar las imágenes.");
      }
    } catch (err) {
      setMensaje("Error de conexión con el servidor.");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div style={estilos.contenedor}>
      <h1 style={estilos.titulo}>Girar imágenes</h1>

      {mensaje && <div style={estilos.mensaje}>{mensaje}</div>}

      <div
        style={estilos.dropzone}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => inputRef.current.click()}
      >
        <p style={estilos.dropText}>Arrastra imágenes aquí o haz clic para seleccionar</p>
        <p style={estilos.contador}>{imagenes.length} / 10 imágenes cargadas</p>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept=".jpg,.jpeg,.png"
          onChange={(e) => handleSeleccion(e.target.files)}
          style={{ display: "none" }}
        />
      </div>

      <div style={estilos.grid}>
        {imagenes.map((img, i) => (
            <div key={i} style={estilos.card}>
                <img
                    src={img.preview}
                    alt={`preview-${i}`}
                    style={estilos.img}
                />
                <span style={estilos.nombre}>{img.name}</span>
                <button onClick={() => eliminarImagen(i)} style={estilos.borrar}>❌</button>
                </div>
            ))}
      </div>

      <label style={estilos.label}>Ángulo de giro:</label>
      <select value={angulo} onChange={(e) => setAngulo(parseInt(e.target.value))} style={estilos.select}>
        <option value={90}>90°</option>
        <option value={180}>180°</option>
        <option value={270}>270°</option>
      </select>

      <button
        onClick={handleEnviar}
        disabled={enviando || imagenes.length === 0}
        style={{
          ...estilos.boton,
          opacity: enviando || imagenes.length === 0 ? 0.5 : 1,
        }}
      >
        {enviando ? "Procesando..." : "Girar imágenes"}
      </button>

      {descargaUrl && (
        <a href={descargaUrl} download style={estilos.descarga}>
          Descargar ZIP
        </a>
      )}
    </div>
  );
}

const estilos = {
  contenedor: {
    maxWidth: "800px",
    margin: "0 auto",
    padding: "40px 20px",
    textAlign: "center",
  },
  titulo: {
    color: "#ffffff",
    fontSize: "28px",
    marginBottom: "20px",
  },
  mensaje: {
    backgroundColor: "#1f1f1f",
    color: "#00ff90",
    padding: "10px",
    borderRadius: "8px",
    marginBottom: "20px",
    fontSize: "14px",
  },
  
    info: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "12px",
    alignItems: "center",
    marginTop: "10px",
    },
  dropzone: {
    border: "2px dashed #4a90e2",
    borderRadius: "12px",
    padding: "30px",
    backgroundColor: "#1f1f1f",
    cursor: "pointer",
    marginBottom: "20px",
  },
  dropText: {
    color: "#bbb",
    fontSize: "16px",
    marginBottom: "6px",
  },
  contador: {
    color: "#6bc5ff",
    fontSize: "14px",
  },
  grid: {
    display: "flex",
    flexWrap: "wrap",
    gap: "12px",
    justifyContent: "center",
    marginBottom: "20px",
  },
  
  
  img: {
    width: "100%",
    borderRadius: "6px",
    objectFit: "cover",
    maxHeight: "140px",
    },
    nombre: {
    color: "#ccc",
    fontSize: "12px",
    marginTop: "8px",
    display: "block",
    textAlign: "center",
    wordBreak: "break-word",
    },
    borrar: {
    position: "absolute",
    top: "8px",
    right: "8px",
    background: "none",
    border: "none",
    color: "#ff5f5f",
    cursor: "pointer",
    fontSize: "16px",
    },
    card: {
    backgroundColor: "#1f1f1f",
    border: "1px solid #333",
    borderRadius: "10px",
    padding: "10px",
    color: "#ccc",
    position: "relative",
    width: "160px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    },

  label: {
    color: "#ddd",
    fontSize: "14px",
    marginBottom: "6px",
    display: "block",
  },
  select: {
    padding: "8px",
    borderRadius: "6px",
    border: "1px solid #333",
    backgroundColor: "#1f1f1f",
    color: "#fff",
    marginBottom: "20px",
  },
  boton: {
    backgroundColor: "#1e90ff",
    color: "#fff",
    padding: "12px 20px",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "16px",
    marginBottom: "20px",
  },
  descarga: {
    color: "#00e0ff",
    textDecoration: "underline",
    fontSize: "16px",
    display: "block",
  },
};
