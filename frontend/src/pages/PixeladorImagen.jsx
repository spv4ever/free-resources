import { useRef, useState, useEffect } from "react";

export default function PixeladorImagen() {
  const [imagen, setImagen] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [resultadoUrl, setResultadoUrl] = useState("");
  const [seleccion, setSeleccion] = useState(null);
  const [arrastrando, setArrastrando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [procesando, setProcesando] = useState(false);
  const canvasRef = useRef(null);

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
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      if (seleccion) {
        ctx.strokeStyle = "#00ffff";
        ctx.lineWidth = 2;
        ctx.strokeRect(seleccion.x, seleccion.y, seleccion.w, seleccion.h);
      }
    };
    img.src = previewUrl;
  }, [previewUrl, seleccion]);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const iniciarSeleccion = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setSeleccion({ x, y, w: 0, h: 0 });
    setArrastrando(true);
  };

  const actualizarSeleccion = (e) => {
    if (!arrastrando) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x2 = e.clientX - rect.left;
    const y2 = e.clientY - rect.top;
    setSeleccion((prev) => ({
      ...prev,
      w: x2 - prev.x,
      h: y2 - prev.y,
    }));
  };

  const finalizarSeleccion = () => setArrastrando(false);

  const aplicarPixelado = async () => {
    if (!imagen || !seleccion) return;

    const w = Math.abs(Math.round(seleccion.w));
    const h = Math.abs(Math.round(seleccion.h));
    if (w === 0 || h === 0) {
    setMensaje("Selecciona un área válida para pixelar.");
    return;
    }

    const formData = new FormData();
    formData.append("image", imagen);
    formData.append("x", Math.round(seleccion.x));
    formData.append("y", Math.round(seleccion.y));
    formData.append("width", Math.abs(Math.round(seleccion.w)));
    formData.append("height", Math.abs(Math.round(seleccion.h)));

    try {
      setProcesando(true);
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/pixelate-image`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (data.success) {
        const fullUrl = `${process.env.REACT_APP_API_URL}${data.downloadUrl}`;
        setResultadoUrl(fullUrl);
        setMensaje("Zona pixelada correctamente.");
      } else {
        setMensaje("Error: No se pudo aplicar el pixelado.");
      }
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

      {/* Zona 1: carga */}
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
        <div style={estilos.canvasBox}>
          <canvas
            ref={canvasRef}
            style={estilos.canvas}
            onMouseDown={iniciarSeleccion}
            onMouseMove={actualizarSeleccion}
            onMouseUp={finalizarSeleccion}
            onMouseLeave={finalizarSeleccion}
          />
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
        </div>
      )}

      {/* Zona 2: resultado */}
     {resultadoUrl && (
        <div style={estilos.resultado}>
            <h3 style={{ color: "#fff", marginBottom: "16px" }}>Zona aplicada correctamente</h3>

            <button
            style={estilos.botonSecundario}
            onClick={() => window.open(resultadoUrl, "_blank")}
            >
            Ver en nueva pestaña
            </button>
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
  canvasBox: {
    marginBottom: "30px",
  },
  canvas: {
    border: "2px dashed #4a90e2",
    borderRadius: "12px",
    maxWidth: "100%",
    cursor: "crosshair",
    marginBottom: "20px",
  },
  descarga: {
    display: "inline-block",
    color: "#00e0ff",
    textDecoration: "underline",
    fontSize: "16px",
    marginBottom: "10px",
    },
  boton: {
  backgroundColor: "#1e90ff",
  color: "#fff",
  border: "none",
  padding: "12px 20px",
  borderRadius: "8px",
  cursor: "pointer",
  fontSize: "16px",
  margin: "8px",
  transition: "all 0.3s ease",
},

botonSecundario: {
  backgroundColor: "#333",
  color: "#00e0ff",
  border: "1px solid #00e0ff",
  padding: "12px 20px",
  borderRadius: "8px",
  cursor: "pointer",
  fontSize: "16px",
  margin: "8px",
  transition: "all 0.3s ease",
},
  resultado: {
    marginTop: "40px",
    backgroundColor: "#1f1f1f",
    padding: "20px",
    borderRadius: "12px",
  },
  resultImg: {
    maxWidth: "100%",
    borderRadius: "8px",
    marginBottom: "12px",
  },
  descarga: {
    display: "inline-block",
    color: "#00e0ff",
    textDecoration: "underline",
    fontSize: "16px",
  },
};
