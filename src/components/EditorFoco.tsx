import { useEffect, useRef, useState } from "react";

type Alvo = { el: HTMLInputElement | HTMLTextAreaElement; rotulo: string; multi: boolean };

function rotuloDe(el: HTMLElement): string {
  const r = el.dataset.rotulo;
  if (r) return r;
  const span = el.parentElement?.querySelector("span");
  return (span?.textContent || "Campo").replace(/:\s*$/, "");
}

function gravar(el: HTMLInputElement | HTMLTextAreaElement, valor: string) {
  const proto = el instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
  Object.getOwnPropertyDescriptor(proto, "value")?.set?.call(el, valor);
  el.dispatchEvent(new Event("input", { bubbles: true }));
}

/** Barra de digitação focada (somente celular, nunca impressa). */
export function EditorFoco({ escopo = ".ficha" }: { escopo?: string }) {
  const [alvo, setAlvo] = useState<Alvo | null>(null);
  const [texto, setTexto] = useState("");
  const campo = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const onFocus = (e: FocusEvent) => {
      if (window.innerWidth >= 768) return;
      const el = e.target as HTMLElement;
      if (!(el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement)) return;
      if (el instanceof HTMLInputElement && !["text", ""].includes(el.type)) return;
      if (!el.closest(escopo) || el.closest(".editor-foco")) return;
      el.blur();
      setTexto(el.value);
      setAlvo({ el, rotulo: rotuloDe(el), multi: el instanceof HTMLTextAreaElement });
    };
    document.addEventListener("focusin", onFocus);
    return () => document.removeEventListener("focusin", onFocus);
  }, [escopo]);

  useEffect(() => {
    if (!alvo) return;
    const t = campo.current;
    if (t) {
      t.focus();
      t.setSelectionRange(t.value.length, t.value.length);
    }
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [alvo]);

  useEffect(() => {
    const t = campo.current;
    if (!t) return;
    t.style.height = "auto";
    t.style.height = `${Math.min(t.scrollHeight, alvo?.multi ? 260 : 120)}px`;
  }, [texto, alvo]);

  if (!alvo) return null;

  const concluir = () => {
    gravar(alvo.el, alvo.multi ? texto : texto.replace(/\n/g, " "));
    setAlvo(null);
  };

  return (
    <div className="editor-foco no-print fixed inset-0 z-[60] flex flex-col bg-[#0b1f5c]/45 backdrop-blur-[2px]" onClick={() => setAlvo(null)}>
      <div className="border-b-4 border-[#1d4ed8] bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between gap-3 bg-[#14213d] px-4 py-2.5 text-white">
          <button type="button" onClick={() => setAlvo(null)} className="rounded-full px-2 py-1 text-[13px] font-semibold text-white/80">
            ✕ Fechar
          </button>
          <span className="min-w-0 truncate text-center text-[12px] font-bold uppercase tracking-[0.1em]">{alvo.rotulo}</span>
          <button type="button" onClick={concluir} className="btn-ui shrink-0 rounded-full bg-[#16a34a] px-4 py-1.5 text-[13px] font-bold text-white shadow">
            ✔ Concluir
          </button>
        </div>
        <div className="p-4">
          <textarea
            ref={campo}
            value={texto}
            rows={alvo.multi ? 5 : 1}
            onChange={(e) => setTexto(e.target.value)}
            onKeyDown={(e) => {
              if (!alvo.multi && e.key === "Enter") {
                e.preventDefault();
                concluir();
              }
            }}
            enterKeyHint={alvo.multi ? "enter" : "done"}
            className="w-full resize-none rounded-xl border-2 border-[#1d4ed8]/40 bg-[#f5f8ff] px-4 py-3 text-[16px] leading-relaxed text-black outline-none focus:border-[#1d4ed8]"
          />
          <div className="mt-1.5 flex justify-between text-[11px] text-slate-500">
            <span>{alvo.multi ? "Toque em Concluir para salvar na ficha" : "Enter ou Concluir para salvar"}</span>
            <span>{texto.length} caracteres</span>
          </div>
        </div>
      </div>
    </div>
  );
}
