import { useEffect, useRef } from "react";

export function SignaturePad({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string | null;
  onChange: (dataUrl: string | null) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawing = useRef(false);
  const lastLoaded = useRef<string | null>(null);

  const ctxOf = () => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    return ctx;
  };

  // Prepara o canvas na densidade correta da tela
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ratio = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = Math.max(1, rect.width * ratio);
    canvas.height = Math.max(1, rect.height * ratio);
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.scale(ratio, ratio);
    ctx.lineWidth = 1.8;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#111111";
  }, []);

  // Sincroniza com o estado externo (rascunho salvo ou limpeza da ficha)
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = ctxOf();
    if (!canvas || !ctx) return;
    if (value === lastLoaded.current) return;
    lastLoaded.current = value;

    if (!value) {
      const ratio = window.devicePixelRatio || 1;
      ctx.clearRect(0, 0, canvas.width / ratio, canvas.height / ratio);
      return;
    }

    const img = new Image();
    img.onload = () => {
      const ratio = window.devicePixelRatio || 1;
      ctx.clearRect(0, 0, canvas.width / ratio, canvas.height / ratio);
      ctx.drawImage(img, 0, 0, canvas.width / ratio, canvas.height / ratio);
    };
    img.src = value;
  }, [value]);

  const pos = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const start = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    const ctx = ctxOf();
    if (!ctx) return;
    drawing.current = true;
    const { x, y } = pos(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const move = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current) return;
    e.preventDefault();
    const ctx = ctxOf();
    if (!ctx) return;
    const { x, y } = pos(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const end = () => {
    if (!drawing.current) return;
    drawing.current = false;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL("image/png");
    lastLoaded.current = dataUrl;
    onChange(dataUrl);
  };

  const clear = () => {
    const canvas = canvasRef.current;
    const ctx = ctxOf();
    if (!canvas || !ctx) return;
    const ratio = window.devicePixelRatio || 1;
    ctx.clearRect(0, 0, canvas.width / ratio, canvas.height / ratio);
    lastLoaded.current = null;
    onChange(null);
  };

  return (
    <div className="flex flex-col">
      <span className="text-center text-[11px] font-bold uppercase tracking-wide">{label}</span>
      <canvas
        ref={canvasRef}
        onPointerDown={start}
        onPointerMove={move}
        onPointerUp={end}
        onPointerLeave={end}
        className="mt-2 h-24 w-full touch-none rounded-sm bg-white"
        style={{ touchAction: "none" }}
      />
      <div className="mt-1 border-t border-black pt-1 text-center text-[10px] uppercase text-neutral-500">
        Assinatura
      </div>
      <button
        type="button"
        onClick={clear}
        disabled={!value}
        className="no-print mt-1 self-center text-[10px] uppercase text-neutral-500 underline disabled:opacity-40"
      >
        Limpar assinatura
      </button>
    </div>
  );
}
