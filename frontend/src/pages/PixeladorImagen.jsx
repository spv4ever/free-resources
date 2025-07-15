import { useRef, useState, useEffect } from "react";

export default function PixeladorImagen() {
  const [imagen, setImagen] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [resultadoUrl, setResultadoUrl] = useState("");
  const [seleccion, setSeleccion] = useState(null);
  const [arrastrando, setArrastrando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [procesando, setProcesando] = useState(false);
  const [escala, setEscala] = useState(1);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const [formaSeleccion, setFormaSeleccion] = useState("cuadrado");
  const [nivelPixelado, setNivelPixelado] = useState(10);
  const [selecciones, setSelecciones] = useState([]);

  const canvasRef = useRef(null);

  const handleSeleccion = (file) => {
    if (!file || !["image/jpeg", "image/png"].includes(file.type)) return;
    const url = URL.createObjectURL(file);
    setImagen(file);
    setPreviewUrl(url);
    setResultadoUrl("");
    setSeleccion(null);
    setMensaje("");
    setSelecciones([]);
  };

  const handleFileInput = (e) => handleSeleccion(e.target.files[0]);

  const handleDrop = (e) => {
    e.preventDefault();
    handleSeleccion(e.dataTransfer.files[0]);
  };

  useEffect(() => {
    if (!previewUrl || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      const maxSize = 800;
      let factor = 1;
      if (img.width > maxSize || img.height > maxSize) {
        factor = Math.min(maxSize / img.width, maxSize / img.height);
      }
      setEscala(factor);

      const scaledWidth = img.width * factor;
      const scaledHeight = img.height * factor;
      setCanvasSize({ width: scaledWidth, height: scaledHeight });

      canvas.width = scaledWidth;
      canvas.height = scaledHeight;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, scaledWidth, scaledHeight);
    };

    img.src = previewUrl;
  }, [previewUrl]);

  const obtenerCoords = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const iniciarSeleccion = (e) => {
    const { x, y } = obtenerCoords(e);
    setSeleccion({ x, y, w: 0, h: 0 });
    setArrastrando(true);
  };

  const actualizarSeleccion = (e) => {
    if (!arrastrando) return;
    const { x, y } = obtenerCoords(e);
    setSeleccion((prev) => {
      if (!prev) return null;
      return { ...prev, w: x - prev.x, h: y - prev.y };
    });
  };

  const finalizarSeleccion = () => {
    setArrastrando(false);
    if (seleccion && Math.abs(seleccion.w) > 3 && Math.abs(seleccion.h) > 3) {
      setSelecciones((prev) => [...prev, { ...seleccion, shape: formaSeleccion }]);
    }
    setSeleccion(null);
  };

  const aplicarPixelado = async () => {
    if (!imagen || selecciones.length === 0) {
      setMensaje("Selecciona al menos una zona para pixelar.");
      return;
    }

    const zonasBackend = selecciones.map((sel) => ({
      x: Math.round(Math.min(sel.x, sel.x + sel.w) / escala),
      y: Math.round(Math.min(sel.y, sel.y + sel.h) / escala),
      width: Math.round(Math.abs(sel.w) / escala),
      height: Math.round(Math.abs(sel.h) / escala),
      shape: sel.shape || "cuadrado",
    }));

    const formData = new FormData();
    formData.append("image", imagen);
    formData.append("zonas", JSON.stringify(zonasBackend));
    formData.append("blur", nivelPixelado);

    try {
      setProcesando(true);
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/pixelate-image`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Error al procesar imagen");

      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      setResultadoUrl(blobUrl);
      setMensaje("Zonas pixeladas correctamente.");
    } catch (err) {
      setMensaje("Error al conectar con el servidor.");
    } finally {
      setProcesando(false);
    }
  };

  return (
    <div style={estilos.contenedor}>
      <h1 style={estilos.titulo}>Pixelar zona de imagen</h1>

      {mensaje && <div style={estilos.mensaje}>{mensaje}</div>}

      <div
        style={estilos.dropzone}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => document.getElementById("input-pixel").click()}
      >
        <p style={estilos.dropText}>Arrastra una imagen aquí o haz clic para seleccionar</p>
        <input
          id="input-pixel"
          type="file"
          accept="image/jpeg,image/png"
          onChange={handleFileInput}
          style={{ display: "none" }}
        />
      </div>

      {previewUrl && (
        <div style={estilos.canvasWrapper}>
          <div style={estilos.canvasContainer}>
            <canvas
              ref={canvasRef}
              style={estilos.canvas}
              onMouseDown={iniciarSeleccion}
              onMouseMove={actualizarSeleccion}
              onMouseUp={finalizarSeleccion}
              onMouseLeave={finalizarSeleccion}
            />
            {selecciones.map((sel, idx) => {
              const x = Math.min(sel.x, sel.x + sel.w);
              const y = Math.min(sel.y, sel.y + sel.h);
              const w = Math.abs(sel.w);
              const h = Math.abs(sel.h);
              return (
                <div
                  key={idx}
                  style={{
                    position: "absolute",
                    left: `${x}px`,
                    top: `${y}px`,
                    width: `${w}px`,
                    height: `${h}px`,
                    border: "2px dashed #00ffff",
                    backgroundColor: "rgba(0,255,255,0.2)",
                    borderRadius:
                      sel.shape === "redondo" ? "50%" : sel.shape === "redondeado" ? "16px" : "0",
                  }} className="zona-pixelada"
                >
                  <button
                    className="boton-eliminar-zona"
                    onClick={() =>
                      setSelecciones((prev) => prev.filter((_, i) => i !== idx))
                    }
                    style={{
                      position: "absolute",
                      top: "-10px",
                      right: "-10px",
                      width: "22px",
                      height: "22px",
                      backgroundColor: "#222",
                      color: "#fff",
                      fontSize: "14px",
                      fontWeight: "bold",
                      borderRadius: "50%",
                      border: "1px solid #aaa",
                      cursor: "pointer",
                      opacity: 0,
                      transition: "opacity 0.2s ease-in-out",
                      pointerEvents: "auto",
                      zIndex: 10,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                    title="Eliminar zona"
                  >
                    🗑️
                  </button>

                </div>
              );
            })}

            {seleccion && (
              <div
                style={{
                  position: "absolute",
                  left: `${Math.min(seleccion.x, seleccion.x + seleccion.w)}px`,
                  top: `${Math.min(seleccion.y, seleccion.y + seleccion.h)}px`,
                  width: `${Math.abs(seleccion.w)}px`,
                  height: `${Math.abs(seleccion.h)}px`,
                  border: "2px dashed #ffaa00",
                  backgroundColor: "rgba(255,165,0,0.2)",
                  borderRadius:
                    formaSeleccion === "redondo"
                      ? "50%"
                      : formaSeleccion === "redondeado"
                      ? "16px"
                      : "0px",
                  pointerEvents: "none",
                }}
              />
            )}
          </div>

          {selecciones.length > 0 && (
            <div style={{ marginTop: "16px" }}>
              <button
                onClick={aplicarPixelado}
                style={{
                  ...estilos.boton,
                  opacity: procesando ? 0.6 : 1,
                  cursor: procesando ? "not-allowed" : "pointer",
                }}
                disabled={procesando}
              >
                {procesando ? "Procesando..." : "Aplicar pixelado"}
              </button>
              <button
                onClick={() => setSelecciones([])}
                style={{ ...estilos.botonSecundario, marginLeft: "10px" }}
                className="boton-eliminar"
              >
                Borrar zonas
              </button>
            </div>
          )}
        </div>
      )}

      <div style={{ marginBottom: "16px", marginTop: "24px" }}>
        <label style={{ color: "#fff", marginRight: "12px" }}>Forma de selección:</label>
        {["cuadrado", "redondeado", "redondo"].map((f) => (
          <button
            key={f}
            onClick={() => setFormaSeleccion(f)}
            style={{
              padding: "8px 12px",
              margin: "0 4px",
              borderRadius: "6px",
              border: formaSeleccion === f ? "2px solid #00e0ff" : "1px solid #888",
              backgroundColor: formaSeleccion === f ? "#00e0ff22" : "#1f1f1f",
              color: "#fff",
              cursor: "pointer",
            }}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      <div style={{ marginBottom: "20px" }}>
        <label style={{ color: "#fff", marginRight: "10px" }}>Intensidad:</label>
        <input
          type="range"
          min="2"
          max="50"
          step="1"
          value={nivelPixelado}
          onChange={(e) => setNivelPixelado(parseInt(e.target.value))}
        />
        <span style={{ color: "#fff", marginLeft: "8px" }}>{nivelPixelado}</span>
      </div>

      {resultadoUrl && (
        <div style={estilos.resultado}>
          <h3 style={{ color: "#fff", marginBottom: "10px" }}>Resultado de la pixelación:</h3>
          <img
            src={resultadoUrl}
            alt="Pixelado"
            style={{
              width: canvasSize.width,
              height: canvasSize.height,
              objectFit: "cover",
            }}
          />
        </div>
      )}
    </div>
  );
}

const estilos = {
  contenedor: {
    maxWidth: "900px",
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
  },
  canvasWrapper: {
    position: "relative",
    display: "inline-block",
  },
  canvasContainer: {
    position: "relative",
    display: "inline-block",
    border: "2px dashed #4a90e2",
    borderRadius: "12px",
    overflow: "hidden",
    maxWidth: "100%",
    marginBottom: "20px",
  },
  
  canvas: {
    display: "block",
    maxWidth: "100%",
    height: "auto",
    cursor: "crosshair",
  },
  zonaConHover: {
    position: "absolute",
    transition: "opacity 0.2s ease-in-out",
    ":hover .botonEliminar": {
      opacity: 1,
    },
  },
  boton: {
    backgroundColor: "#1e90ff",
    color: "#fff",
    border: "none",
    padding: "12px 20px",
    borderRadius: "8px",
    fontSize: "16px",
  },
  botonSecundario: {
    backgroundColor: "#333",
    color: "#00e0ff",
    border: "1px solid #00e0ff",
    padding: "12px 20px",
    borderRadius: "8px",
    fontSize: "16px",
  },
  resultado: {
    marginTop: "20px",
    backgroundColor: "#1f1f1f",
    padding: "20px",
    borderRadius: "12px",
  },
};
