import { useEffect, useRef, useState } from "react";

export function SignaturePad({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string | null;
  onChange: (dataUrl: string | null) => void;
}) {
  const [aberto, setAberto] = useState(false);

  return (
    <div className="flex flex-col">
      <span className="text-center text-[11px] font-bold uppercase tracking-wide">{label}</span>
      <button
        type="button"
        onClick={() => setAberto(true)}
        aria-label={`Assinar: ${label}`}
        className="sig-area mt-2 flex h-24 w-full items-center justify-center rounded-sm bg-white"
      >
        {value ? (
          <img src={value} alt={`Assinatura ${label}`} className="h-full w-full object-contain" />
        ) : (
          <span className="no-print text-[11px] uppercase text-neutral-400">Toque para assinar</span>
        )}
      </button>
      <div className="mt-1 border-t border-black pt-1 text-center text-[10px] uppercase text-neutral-500">
        Assinatura
      </div>
      <button
        type="button"
        onClick={() => onChange(null)}
        disabled={!value}
        className="no-print mt-1 self-center text-[10px] uppercase text-neutral-500 underline disabled:opacity-40"
      >
        Limpar assinatura
      </button>
      {aberto && (
        <Prancheta
          label={label}
          onCancel={() => setAberto(false)}
          onDone={(url) => {
            onChange(url);
            setAberto(false);
          }}
        />
      )}
    </div>
  );
}

function Prancheta({
  label,
  onCancel,
  onDone,
}: {
  label: string;
  onCancel: () => void;
  onDone: (url: string | null) => void;
}) {
  const ref = useRef<HTMLCanvasElement | null>(null);
  const drawing = useRef(false);
  const [vazio, setVazio] = useState(true);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    const el = document.documentElement as HTMLElement & { requestFullscreen?: () => Promise<void> };
    el.requestFullscreen?.()
      .then(() => (screen.orientation as unknown as { lock?: (o: string) => Promise<void> })?.lock?.("landscape"))
      .catch(() => {});
    const setup = () => {
      const c = ref.current;
      if (!c) return;
      const r = window.devicePixelRatio || 1;
      const rect = c.getBoundingClientRect();
      c.width = rect.width * r;
      c.height = rect.height * r;
      const ctx = c.getContext("2d")!;
      ctx.scale(r, r);
      ctx.lineWidth = 2.6;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.strokeStyle = "#111111";
      setVazio(true);
    };
    const t = setTimeout(setup, 250);
    window.addEventListener("resize", setup);
    return () => {
      clearTimeout(t);
      window.removeEventListener("resize", setup);
      document.body.style.overflow = "";
      if (document.fullscreenElement) document.exitFullscreen?.().catch(() => {});
    };
  }, []);

  const pos = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  const limpar = () => {
    const c = ref.current;
    if (!c) return;
    c.getContext("2d")!.clearRect(0, 0, c.width, c.height);
    setVazio(true);
  };

  const concluir = () => {
    const c = ref.current;
    if (!c || vazio) return onDone(null);
    onDone(c.toDataURL("image/png"));
  };

  return (
    <div className="no-print fixed inset-0 z-50 flex flex-col bg-neutral-100 p-3">
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="text-[13px] font-bold uppercase">Assinatura: {label}</span>
        <span className="text-[11px] text-neutral-500 portrait:inline landscape:hidden">
          Gire o celular para ter mais espaço
        </span>
      </div>
      <div className="relative flex-1 rounded border-2 border-neutral-400 bg-white">
        <div className="pointer-events-none absolute inset-x-8 bottom-[30%] border-b border-dashed border-neutral-400" />
        <canvas
          ref={ref}
          onPointerDown={(e) => {
            e.currentTarget.setPointerCapture(e.pointerId);
            drawing.current = true;
            const ctx = e.currentTarget.getContext("2d")!;
            const { x, y } = pos(e);
            ctx.beginPath();
            ctx.moveTo(x, y);
          }}
          onPointerMove={(e) => {
            if (!drawing.current) return;
            const ctx = e.currentTarget.getContext("2d")!;
            const { x, y } = pos(e);
            ctx.lineTo(x, y);
            ctx.stroke();
            setVazio(false);
          }}
          onPointerUp={() => (drawing.current = false)}
          className="absolute inset-0 h-full w-full"
          style={{ touchAction: "none" }}
        />
      </div>
      <div className="mt-2 flex justify-end gap-2">
        <button type="button" onClick={limpar} className="rounded border border-black bg-white px-4 py-2 text-[13px]">
          Limpar
        </button>
        <button type="button" onClick={onCancel} className="rounded border border-black bg-white px-4 py-2 text-[13px]">
          Cancelar
        </button>
        <button type="button" onClick={concluir} className="rounded bg-neutral-900 px-5 py-2 text-[13px] font-semibold text-white">
          Concluir
        </button>
      </div>
    </div>
  );
}
