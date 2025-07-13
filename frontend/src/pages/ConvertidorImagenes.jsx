import { useState, useRef } from "react";

export default function ConvertidorImagenes() {
  const [imagenes, setImagenes] = useState([]);
  const [formato, setFormato] = useState("jpg");
  const [enviando, setEnviando] = useState(false);
  const [zipUrl, setZipUrl] = useState("");
  const [mensaje, setMensaje] = useState("");
  const inputRef = useRef(null);

  const handleSeleccion = (files) => {
    const archivos = Array.from(files);
    const validas = archivos.filter(file =>
      (file.type === "image/jpeg" || file.type === "image/png") &&
      file.size <= 5 * 1024 * 1024
    );

    const nuevas = validas.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }));

    setImagenes(prev => [...prev, ...nuevas].slice(0, 10));
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
    e.stopPropagation();
    handleSeleccion(e.dataTransfer.files);
  };

  const handleConvertir = async () => {
    if (imagenes.length === 0 || !formato) return;
    setEnviando(true);
    setZipUrl("");
    setMensaje("");

    const formData = new FormData();
    formData.append("format", formato);
    imagenes.forEach(img => formData.append("images", img.file));

    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/convert-images`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (data.success) {
        const fullUrl = `${process.env.REACT_APP_API_URL}${data.downloadUrl}`;
        setZipUrl(fullUrl);
      } else {
        alert("Error al convertir imágenes.");
      }
    } catch (err) {
      alert("Error al conectar con el servidor.");
    } finally {
      setEnviando(false);
    }
  };

  const handleDescarga = () => {
    imagenes.forEach(img => URL.revokeObjectURL(img.preview));
    setZipUrl("");
    setImagenes([]);
    setEnviando(false);
    setMensaje("Imágenes convertidas correctamente.");
    if (inputRef.current) inputRef.current.value = "";
    window.scrollTo(0, 0);
  };

  return (
    <div style={estilos.contenedor}>
      <h1 style={estilos.titulo}>Convertidor de Imágenes</h1>

      {mensaje && <div style={estilos.mensaje}>{mensaje}</div>}

      <div
        style={estilos.dropzone}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => inputRef.current.click()}
      >
        <p style={estilos.dropText}>Arrastra tus imágenes aquí o haz clic para seleccionar</p>
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

      <div style={estilos.selector}>
        <label style={estilos.label}>Formato:</label>
        <select
          value={formato}
          onChange={(e) => setFormato(e.target.value)}
          style={estilos.select}
        >
          <option value="jpg">JPG</option>
          <option value="png">PNG</option>
          <option value="webp">WEBP</option>
        </select>
      </div>

      <div style={estilos.grid}>
        {imagenes.map((img, i) => (
          <div key={i} style={estilos.card}>
            <img src={img.preview} alt={`preview-${i}`} style={estilos.img} />
            <div style={estilos.info}>
              <span style={estilos.nombre}>{img.file.name}</span>
              <button onClick={() => eliminarImagen(i)} style={estilos.borrar}>❌</button>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={handleConvertir}
        disabled={enviando || imagenes.length === 0}
        style={{
          ...estilos.boton,
          opacity: enviando || imagenes.length === 0 ? 0.5 : 1,
        }}
      >
        {enviando ? "Procesando..." : "Convertir imágenes"}
      </button>

      {zipUrl && (
        <a
          href={zipUrl}
          style={estilos.descarga}
          download
          onClick={handleDescarga}
        >
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
  mensaje: {
    backgroundColor: "#1f1f1f",
    color: "#00ff90",
    padding: "10px",
    textAlign: "center",
    borderRadius: "8px",
    marginBottom: "20px",
    fontSize: "14px",
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
  dropText: {
    color: "#bbb",
    fontSize: "16px",
    marginBottom: "10px",
  },
  contador: {
    color: "#6bc5ff",
    fontSize: "14px",
  },
  selector: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "24px",
    gap: "10px",
  },
  label: {
    color: "#ccc",
    fontSize: "14px",
  },
  select: {
    padding: "6px 12px",
    borderRadius: "6px",
    border: "1px solid #444",
    backgroundColor: "#1f1f1f",
    color: "#fff",
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
