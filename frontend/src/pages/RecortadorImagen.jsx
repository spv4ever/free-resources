import { useRef, useState, useEffect } from "react";

export default function RecortadorImagen() {
  const [imagen, setImagen] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [resultadoUrl, setResultadoUrl] = useState("");
  const [seleccion, setSeleccion] = useState(null);
  const [arrastrando, setArrastrando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  // const [procesando, setProcesando] = useState(false);
  const [escala, setEscala] = useState(1);
  const canvasRef = useRef(null);
  const overlayRef = useRef(null);

  const handleSeleccion = (file) => {
    if (!file || !["image/jpeg", "image/png"].includes(file.type)) return;
    const url = URL.createObjectURL(file);
    setImagen(file);
    setPreviewUrl(url);
    setResultadoUrl("");
    setSeleccion(null);
    setMensaje("");
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
      const nueva = { ...prev, w: x - prev.x, h: y - prev.y };
      actualizarOverlay(nueva);
      return nueva;
    });
  };

  const finalizarSeleccion = () => {
    setArrastrando(false);
    aplicarRecorte();
  };

  const actualizarOverlay = (sel) => {
    if (!overlayRef.current) return;
    overlayRef.current.style.left = `${Math.min(sel.x, sel.x + sel.w)}px`;
    overlayRef.current.style.top = `${Math.min(sel.y, sel.y + sel.h)}px`;
    overlayRef.current.style.width = `${Math.abs(sel.w)}px`;
    overlayRef.current.style.height = `${Math.abs(sel.h)}px`;
    overlayRef.current.style.display = "block";
  };

  const aplicarRecorte = async () => {
    if (!imagen || !seleccion) return;

    const w = Math.abs(seleccion.w / escala);
    const h = Math.abs(seleccion.h / escala);
    const x = Math.min(seleccion.x, seleccion.x + seleccion.w) / escala;
    const y = Math.min(seleccion.y, seleccion.y + seleccion.h) / escala;

    if (w === 0 || h === 0) {
        setMensaje("Selecciona un área válida para recortar.");
        return;
    }

    const formData = new FormData();
    formData.append("image", imagen);
    formData.append("x", Math.round(x));
    formData.append("y", Math.round(y));
    formData.append("width", Math.round(w));
    formData.append("height", Math.round(h));

    try {
        // setProcesando(true);
        const res = await fetch(`${process.env.REACT_APP_API_URL}/api/crop-image`, {
        method: "POST",
        body: formData,
        });

        if (!res.ok) {
        throw new Error("Error en el servidor");
        }

        const blob = await res.blob();
        const blobUrl = URL.createObjectURL(blob);
        setResultadoUrl(blobUrl);
        setMensaje("Imagen recortada correctamente.");
    } catch (err) {
        setMensaje("Error al conectar con el servidor.");
    } finally {
        // setProcesando(false);
    }
    };


  return (
    <div style={estilos.contenedor}>
      <h1 style={estilos.titulo}>Recortar imagen</h1>

      {mensaje && <div style={estilos.mensaje}>{mensaje}</div>}

      <div
        style={estilos.dropzone}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => document.getElementById("input-crop").click()}
      >
        <p style={estilos.dropText}>Arrastra una imagen aquí o haz clic para seleccionar</p>
        <input
          id="input-crop"
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
            <div ref={overlayRef} style={estilos.overlay}></div>
          </div>
        </div>
      )}

      {resultadoUrl && (
        <div style={estilos.resultado}>
          <h3 style={{ color: "#fff", marginBottom: "10px" }}>Resultado del recorte:</h3>
          <img src={resultadoUrl} alt="Recorte" style={{ maxWidth: "100%", borderRadius: "8px" }} />
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
  overlay: {
    position: "absolute",
    border: "2px dashed #00ffff",
    backgroundColor: "rgba(0,255,255,0.2)",
    pointerEvents: "none",
    display: "none",
  },
  resultado: {
    marginTop: "40px",
    backgroundColor: "#1f1f1f",
    padding: "20px",
    borderRadius: "12px",
  },
};
