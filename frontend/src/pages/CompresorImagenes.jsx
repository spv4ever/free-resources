import { useState, useRef } from "react";

export default function CompresorImagenes() {
  const [imagenes, setImagenes] = useState([]);
  const [enviando, setEnviando] = useState(false);
  const [zipUrl, setZipUrl] = useState("");
  const inputRef = useRef(null);

  const handleSeleccion = (files) => {
    const archivos = Array.from(files);
    const validas = archivos.filter(file =>
      (file.type === "image/jpeg" || file.type === "image/png") &&
      file.size <= 5 * 1024 * 1024
    );

    const nuevas = [...imagenes, ...validas].slice(0, 10);
    setImagenes(nuevas);
  };

  const eliminarImagen = (index) => {
    const copia = [...imagenes];
    copia.splice(index, 1);
    setImagenes(copia);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    handleSeleccion(e.dataTransfer.files);
  };

  const handleComprimir = async () => {
    if (imagenes.length === 0) return;
    setEnviando(true);
    setZipUrl("");

    const formData = new FormData();
    imagenes.forEach((img) => formData.append("images", img));

    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/compress-images`, {
            method: "POST",
            body: formData,
            });

      const data = await res.json();
        if (data.success) {
        const fullUrl = `${process.env.REACT_APP_API_URL}${data.downloadUrl}`;
        setZipUrl(fullUrl);
        } else {
        alert("Error al comprimir imágenes.");
        }
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div style={estilos.contenedor}>
      <h1 style={estilos.titulo}>Compresor de Imágenes</h1>

      <div
        style={estilos.dropzone}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => inputRef.current.click()}
      >
        <p style={estilos.dropText}>Arrastra tus imágenes aquí o haz clic para seleccionar</p>
        <p style={estilos.contador}>{imagenes.length} / 10 imágenes cargadas</p>
        {imagenes.some(img => img.type === "image/png") && (
            <p style={estilos.aviso}>
                Las imágenes PNG se convertirán automáticamente a JPG para una mejor compresión.
            </p>
            )}
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
              src={URL.createObjectURL(img)}
              alt={`preview-${i}`}
              style={estilos.img}
            />
            <div style={estilos.info}>
              <span style={estilos.nombre}>{img.name}</span>
              <button onClick={() => eliminarImagen(i)} style={estilos.borrar}>❌</button>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={handleComprimir}
        disabled={enviando || imagenes.length === 0}
        style={{
          ...estilos.boton,
          opacity: enviando || imagenes.length === 0 ? 0.5 : 1,
        }}
      >
        {enviando ? "Procesando..." : "Comprimir imágenes"}
      </button>

      {zipUrl && (
        <a href={zipUrl} style={estilos.descarga} download>
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
  },
  titulo: {
    color: "#ffffff",
    fontSize: "28px",
    textAlign: "center",
    marginBottom: "30px",
  },
  dropzone: {
    border: "2px dashed #4a90e2",
    borderRadius: "12px",
    padding: "30px",
    textAlign: "center",
    cursor: "pointer",
    marginBottom: "24px",
    backgroundColor: "#1f1f1f",
  },
  aviso: {
    color: "#ffaa00",
    fontSize: "13px",
    marginTop: "8px",
    },

  dropText: {
    color: "#bbb",
    fontSize: "16px",
    marginBottom: "10px",
  },
  contador: {
    color: "#6bc5ff",
    fontSize: "14px",
  },
  grid: {
    display: "flex",
    flexWrap: "wrap",
    gap: "16px",
    justifyContent: "center",
    marginBottom: "30px",
    },
  card: {
    backgroundColor: "#1f1f1f",
    border: "1px solid #333",
    borderRadius: "10px",
    padding: "10px",
    color: "#ccc",
    position: "relative",
    width: "160px",
    minHeight: "220px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    },
  img: {
    width: "100%",
    borderRadius: "6px",
    objectFit: "cover",
    maxHeight: "140px",
  },
  info: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "12px",
    alignItems: "center",
    marginTop: "10px",
  },
  nombre: {
    wordBreak: "break-all",
    maxWidth: "80%",
  },
  borrar: {
    background: "none",
    border: "none",
    color: "#ff5f5f",
    cursor: "pointer",
    fontSize: "16px",
  },
  boton: {
    backgroundColor: "#1e90ff",
    color: "#fff",
    border: "none",
    padding: "12px 20px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "16px",
    display: "block",
    margin: "0 auto",
    marginBottom: "20px",
  },
  descarga: {
    display: "block",
    textAlign: "center",
    color: "#00e0ff",
    textDecoration: "underline",
    fontSize: "16px",
  },
};
