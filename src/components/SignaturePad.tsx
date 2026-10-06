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
  const ref = useRef<HTMLCanvasElement | null>(null);
  const drawing = useRef(false);
  const dirty = useRef(false);

  const setup = () => {
    const c = ref.current;
    if (!c) return;
    const r = window.devicePixelRatio || 1;
    const rect = c.getBoundingClientRect();
    if (!rect.width) return;
    c.width = rect.width * r;
    c.height = rect.height * r;
    const ctx = c.getContext("2d")!;
    ctx.setTransform(r, 0, 0, r, 0, 0);
    ctx.lineWidth = 2.2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#111111";
    if (value) {
      const img = new Image();
      img.onload = () => ctx.drawImage(img, 0, 0, rect.width, rect.height);
      img.src = value;
    }
  };

  useEffect(() => {
    setup();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!value && ref.current) {
      const c = ref.current;
      c.getContext("2d")!.clearRect(0, 0, c.width, c.height);
    }
  }, [value]);

  const pos = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  const fim = () => {
    if (!drawing.current) return;
    drawing.current = false;
    if (dirty.current && ref.current) onChange(ref.current.toDataURL("image/png"));
  };

  return (
    <div className="flex flex-col">
      <span className="text-center text-[11px] font-bold uppercase tracking-wide">{label}</span>
      <div className="sig-area relative mt-2 h-24 w-full rounded-sm bg-white">
        {value && <img src={value} alt="" className="hidden print:block absolute inset-0 h-full w-full object-contain" />}
        <canvas
          ref={ref}
          aria-label={`Assinar: ${label}`}
          className="no-print absolute inset-0 h-full w-full"
          style={{ touchAction: "none" }}
          onPointerDown={(e) => {
            e.currentTarget.setPointerCapture(e.pointerId);
            drawing.current = true;
            dirty.current = false;
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
            dirty.current = true;
          }}
          onPointerUp={fim}
          onPointerCancel={fim}
        />
      </div>
      <div className="mt-1 border-t border-black pt-1 text-center text-[10px] uppercase text-neutral-500">
        Assinatura
      </div>
      <button
        type="button"
        onClick={() => onChange(null)}
        disabled={!value}
        className="btn-ui no-print mt-1 self-center rounded-xl border-2 border-[#dc2626] px-3 py-1 text-[10px] font-semibold uppercase text-[#dc2626] disabled:opacity-40"
      >
        Limpar assinatura
      </button>
    </div>
  );
}
