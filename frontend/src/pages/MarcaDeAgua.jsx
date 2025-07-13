import { useState, useRef } from "react";

export default function MarcaDeAgua() {
  const [imagenes, setImagenes] = useState([]);
  const [texto, setTexto] = useState("");
  const [watermarkFile, setWatermarkFile] = useState(null);
  const [posicion, setPosicion] = useState("bottom-right");
  const [enviando, setEnviando] = useState(false);
  const [zipUrl, setZipUrl] = useState("");
  const [mensaje, setMensaje] = useState("");
  const inputRef = useRef(null);
  const marcaRef = useRef(null);

  // estilos de texto
  const [fontFamily, setFontFamily] = useState("Arial");
  const [fontSize, setFontSize] = useState(24);
  const [bold, setBold] = useState(false);
  const [italic, setItalic] = useState(false);
  const [underline, setUnderline] = useState(false);
  const [fillColor, setFillColor] = useState("#ffffff");

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

  const handleAplicarMarca = async () => {
    if (imagenes.length === 0 || (!texto && !watermarkFile)) return;

    setEnviando(true);
    setZipUrl("");
    setMensaje("");

    const formData = new FormData();
    imagenes.forEach(img => formData.append("images", img.file));
    if (texto) {
      formData.append("watermarkText", texto);
      formData.append("fontFamily", fontFamily);
      formData.append("fontSize", fontSize);
      formData.append("fontWeight", bold ? "bold" : "normal");
      formData.append("fontStyle", italic ? "italic" : "normal");
      formData.append("textDecoration", underline ? "underline" : "none");
      formData.append("fillColor", fillColor);

    }
    if (watermarkFile) formData.append("watermarkImage", watermarkFile);
    formData.append("position", posicion);

    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/watermark-images`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (data.success) {
        const fullUrl = `${process.env.REACT_APP_API_URL}${data.downloadUrl}`;
        setZipUrl(fullUrl);
      } else {
        alert("Error al aplicar marca de agua.");
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
    setWatermarkFile(null);
    setTexto("");
    if (inputRef.current) inputRef.current.value = "";
    if (marcaRef.current) marcaRef.current.value = "";
    setMensaje("Imágenes con marca de agua generadas correctamente.");
    window.scrollTo(0, 0);
  };

  return (
    <div style={estilos.contenedor}>
      <h1 style={estilos.titulo}>Marca de Agua</h1>

      {mensaje && <div style={estilos.mensaje}>{mensaje}</div>}

      <div style={estilos.dropzone} onDrop={handleDrop} onDragOver={(e) => e.preventDefault()} onClick={() => inputRef.current.click()}>
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

      <div style={estilos.configuracion}>
        <input
          type="text"
          placeholder="Texto de marca (opcional)"
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          style={estilos.inputText}
        />
        <label style={estilos.labelArchivo}>
            Subir logo (PNG transparente):
            <input
                ref={marcaRef}
                type="file"
                accept=".png"
                onChange={(e) => setWatermarkFile(e.target.files[0])}
                style={{ display: "none" }}
            />
            <span style={estilos.botonArchivo}>
                {watermarkFile ? watermarkFile.name : "Elegir archivo"}
            </span>
            </label>

        {/* Estilos de texto */}
        {texto && (
          <>
            <select value={fontFamily} onChange={(e) => setFontFamily(e.target.value)} style={estilos.select}>
              <option value="Arial">Arial</option>
              <option value="Courier New">Courier New</option>
              <option value="Georgia">Georgia</option>
              <option value="Verdana">Verdana</option>
              <option value="Tahoma">Tahoma</option>
            </select>

            <input
              type="range"
              min="12"
              max="48"
              value={fontSize}
              onChange={(e) => setFontSize(parseInt(e.target.value))}
              style={{ width: "100%", maxWidth: "400px" }}
            />
            <span style={{ color: "#aaa", marginBottom: "12px" }}>Tamaño: {fontSize}px</span>

            <div style={estilos.estilosTexto}>
              <label><input type="checkbox" checked={bold} onChange={() => setBold(!bold)} /> Negrita</label>
              <label><input type="checkbox" checked={italic} onChange={() => setItalic(!italic)} /> Cursiva</label>
              <label><input type="checkbox" checked={underline} onChange={() => setUnderline(!underline)} /> Subrayado</label>
              <input
                type="color"
                value={fillColor}
                onChange={(e) => setFillColor(e.target.value)}
                style={{ width: "100px", height: "40px", cursor: "pointer" }}
                />
                <span style={{ color: "#aaa" }}>Color del texto</span>
            </div>
            

            <div style={{
              color: "#fff",
              backgroundColor: "#2a2a2a",
              padding: "12px",
              borderRadius: "8px",
              fontFamily,
              fontSize: `${fontSize}px`,
              fontWeight: bold ? "bold" : "normal",
              fontStyle: italic ? "italic" : "normal",
              textDecoration: underline ? "underline" : "none",
              marginTop: "10px",
              maxWidth: "400px",
              textAlign: "center"
            }}>
              {texto || "Vista previa de texto"}
            </div>
          </>
        )}

        <select value={posicion} onChange={(e) => setPosicion(e.target.value)} style={estilos.select}>
          <option value="top-left">Arriba izquierda</option>
          <option value="top-right">Arriba derecha</option>
          <option value="center">Centro</option>
          <option value="bottom-left">Abajo izquierda</option>
          <option value="bottom-right">Abajo derecha</option>
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
        onClick={handleAplicarMarca}
        disabled={enviando || imagenes.length === 0}
        style={{
          ...estilos.boton,
          opacity: enviando || imagenes.length === 0 ? 0.5 : 1,
        }}
      >
        {enviando ? "Procesando..." : "Aplicar marca de agua"}
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
  labelArchivo: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "6px",
    color: "#ccc",
    fontSize: "14px",
    },

    botonArchivo: {
    backgroundColor: "#2e2e2e",
    padding: "8px 16px",
    borderRadius: "6px",
    border: "1px solid #444",
    cursor: "pointer",
    color: "#6bc5ff",
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
  configuracion: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    alignItems: "center",
    marginBottom: "24px",
  },
  inputText: {
    padding: "10px",
    borderRadius: "6px",
    border: "1px solid #444",
    backgroundColor: "#1f1f1f",
    color: "#fff",
    width: "100%",
    maxWidth: "400px",
  },
  select: {
    padding: "10px",
    borderRadius: "6px",
    border: "1px solid #444",
    backgroundColor: "#1f1f1f",
    color: "#fff",
    width: "100%",
    maxWidth: "400px",
  },
  estilosTexto: {
    display: "flex",
    gap: "20px",
    color: "#ccc",
    marginTop: "8px",
    marginBottom: "12px",
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
