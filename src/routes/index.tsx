import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { FotosEditor, FotosImpressao, type Foto } from "@/components/FotosServico";
import brasao from "@/assets/brasao.png";
import cabecalho from "@/assets/cabecalho.png.asset.json";
import { SignaturePad } from "@/components/SignaturePad";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Ficha de Check-List | Grupo Águia Power" },
      {
        name: "description",
        content:
          "Ficha de check-list digital do Grupo Águia Power: preencha os campos, marque os serviços executados, assine e imprima.",
      },
      { property: "og:title", content: "Ficha de Check-List | Grupo Águia Power" },
      {
        property: "og:description",
        content:
          "Preencha, assine e imprima a ficha de check-list de serviços do Grupo Águia Power.",
      },
    ],
  }),
  component: Ficha,
});

const SERVICOS = [
  "RETROFIT SALA DE GINASTICA",
  "FIT POINT SALA SPA",
  "SISTEMA DE WI-FI",
  "SISTEMA DE CFTV",
  "ORGANIZAÇÃO RACK",
  "SISTEMA DE ANTENA CELULAR",
  "DESMONTAGEM UNIDADE",
  "PONTO DE ENERGY DRINK",
  "FORMATAÇÃO DE COMPUTADOR",
  "SISTEMA DE SOM",
  "TROCA/INSTALAÇÃO TV",
  "PONTO DE LOJA SUPRIMENTOS",
  "BALANÇA DE BIOIMPEDANCIA",
  "MODULADOR DE TV",
  "ANALISE DE SERVIÇO/ VISITA",
];

const inputClass =
  "w-full bg-transparent px-1 py-0.5 text-[12px] outline-none focus:bg-yellow-50 print:focus:bg-transparent";

function Campo({
  label,
  value,
  onChange,
  className = "",
  extra,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  className?: string;
  extra?: React.ReactNode;
}) {
  return (
    <div className={`flex items-center gap-1 px-2 py-1.5 ${className}`}>
      <span className="whitespace-nowrap text-[12px] font-bold uppercase">{label}</span>
      <input value={value} onChange={(e) => onChange(e.target.value)} className={inputClass} />
      {extra}
    </div>
  );
}

function Caixa({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={checked}
      onClick={() => onChange(!checked)}
      className="flex h-5 w-10 shrink-0 items-center justify-center border border-black bg-neutral-100 text-[13px] font-bold leading-none print:bg-white"
    >
      {checked ? "X" : ""}
    </button>
  );
}

function StatusBtn({
  cor,
  label,
  checked,
  onClick,
}: {
  cor: "verde" | "vermelho";
  label: string;
  checked: boolean;
  onClick: () => void;
}) {
  const ativo =
    cor === "verde"
      ? "border-[#16a34a] bg-[#16a34a] text-white"
      : "border-[#dc2626] bg-[#dc2626] text-white";
  const inativo = cor === "verde" ? "border-[#16a34a] text-[#15803d]" : "border-[#dc2626] text-[#b91c1c]";
  return (
    <button
      type="button"
      aria-pressed={checked}
      onClick={onClick}
      className={`btn-ui status-btn flex items-center gap-2 rounded-xl border-2 px-3 py-1.5 text-[12px] font-bold uppercase transition-all duration-200 ${checked ? ativo : inativo}`}
    >
      <span className="btn-icon flex h-5 w-5 items-center justify-center rounded-md border-2 border-current text-[12px] leading-none">
        {checked ? "X" : ""}
      </span>
      {label}
    </button>
  );
}

interface MaterialRow {
  id: number;
  especificacao: string;
  unidade: string;
  quantidade: string;
}

let nextId = 100;

function novaLinha(): MaterialRow {
  return { id: nextId++, especificacao: "", unidade: "", quantidade: "" };
}

interface Dados {
  local: string;
  dataHora: string;
  sigla: string;
  lider: string;
  colaborador: string;
  marcados: Record<string, boolean>;
  outros: boolean;
  outrosTexto: string;
  descricao: string;
  sucesso: boolean;
  naoRealizado: boolean;
  motivo: string;
  motivoDetalhe: string;
  material: string;
  materialDetalhe: string;
  assTecnico: string | null;
  assColaborador: string | null;
  linhas: MaterialRow[];
  fotos: Foto[];
  incluirFotos: boolean;
  entrada?: number | null;
  saida?: number | null;
}

const vazio = (): Dados => ({
  local: "",
  dataHora: "",
  sigla: "",
  lider: "",
  colaborador: "",
  marcados: {},
  outros: false,
  outrosTexto: "",
  descricao: "",
  sucesso: false,
  naoRealizado: false,
  motivo: "",
  motivoDetalhe: "",
  material: "",
  materialDetalhe: "",
  assTecnico: null,
  assColaborador: null,
  linhas: Array.from({ length: 20 }, novaLinha),
  fotos: [],
  incluirFotos: true,
});

const CHAVE = "ficha-checklist-rascunho";
function pendencias(d: Dados) {
  const f: string[] = [];
  if (!d.local.trim()) f.push("Local");
  if (!d.sucesso && !d.naoRealizado) f.push("Status (sucesso / não realizado)");
  if (!d.assTecnico) f.push("Assinatura do técnico");
  if (!d.assColaborador) f.push("Assinatura do colaborador");
  return f;
}

function confirmarPendencias(d: Dados) {
  void d;
  return true;
}

function imprimir(d: Dados) {
  if (!confirmarPendencias(d)) return;
  const antigo = document.title;
  const data = (d.dataHora.split(" ")[0] || new Date().toLocaleDateString("pt-BR")).replace(/\//g, "-");
  document.title = `CheckList - Águia Power - ${d.local.trim() || "Unidade"} - ${data}`;
  window.print();
  setTimeout(() => (document.title = antigo), 1000);
}
const HIST = "fichas-historico";

interface Registro {
  id: string;
  atualizado: number;
  dados: Dados;
}

function lerHist(): Registro[] {
  try {
    return JSON.parse(localStorage.getItem(HIST) || "[]") as Registro[];
  } catch {
    return [];
  }
}

function gravarHist(l: Registro[]): "ok" | "semfotos" | "erro" {
  try {
    localStorage.setItem(HIST, JSON.stringify(l));
    return "ok";
  } catch {
    try {
      localStorage.setItem(HIST, JSON.stringify(l.map((r) => ({ ...r, dados: { ...r.dados, fotos: [] } }))));
      return "semfotos";
    } catch {
      return "erro";
    }
  }
}

const novoId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

function progresso(d: Dados) {
  const itens = [
    d.local, d.dataHora, d.sigla, d.lider, d.colaborador,
    Object.values(d.marcados).some(Boolean) || d.outros,
    d.descricao, d.sucesso || d.naoRealizado, d.fotos.length > 0,
    d.assTecnico, d.assColaborador,
  ];
  return Math.round((itens.filter(Boolean).length / itens.length) * 100);
}

function statusTxt(d: Dados) {
  return d.sucesso ? "Sucesso" : d.naoRealizado ? "Não realizado" : "Em andamento";
}

const CHAVE_TEC = "ficha-tecnico-nome";
function hm(t: number) {
  return new Date(t).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}
function duracao(ms: number) {
  const m = Math.max(0, Math.floor(ms / 60000));
  return `${Math.floor(m / 60)}h ${String(m % 60).padStart(2, "0")}min`;
}
function cronometro(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  const p = (n: number) => String(n).padStart(2, "0");
  return `${p(Math.floor(s / 3600))}:${p(Math.floor((s % 3600) / 60))}:${p(s % 60)}`;
}

function agora() {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

function Ficha() {
  const [d, setD] = useState<Dados>(vazio);
  const [lista, setLista] = useState<Registro[]>([]);
  const [atualId, setAtualId] = useState<string | null>(null);
  const [carregado, setCarregado] = useState(false);
  const [aviso, setAviso] = useState("");
  const [busca, setBusca] = useState("");
  const [opcoes, setOpcoes] = useState(false);
  const [tecnico, setTecnico] = useState("");
  const [agoraMs, setAgoraMs] = useState(0);
  useEffect(() => {
    setTecnico(localStorage.getItem(CHAVE_TEC) || "");
  }, []);
  useEffect(() => {
    if (!d.entrada || d.saida) return;
    setAgoraMs(Date.now());
    const i = setInterval(() => setAgoraMs(Date.now()), 1000);
    return () => clearInterval(i);
  }, [d.entrada, d.saida]);
  const salvarTecnico = (n: string) => {
    localStorage.setItem(CHAVE_TEC, n);
    setTecnico(n);
  };

  useEffect(() => {
    let l = lerHist();
    try {
      const raw = localStorage.getItem(CHAVE);
      if (raw) {
        const salvo = { ...vazio(), ...(JSON.parse(raw) as Dados) };
        l = [{ id: novoId(), atualizado: Date.now(), dados: salvo }, ...l];
        gravarHist(l);
        localStorage.removeItem(CHAVE);
      }
    } catch {
      /* rascunho inválido */
    }
    setLista(l);
    setCarregado(true);
  }, []);

  useEffect(() => {
    if (!carregado || !atualId) return;
    const t = setTimeout(() => {
      setLista((prev) => {
        const reg = { id: atualId, atualizado: Date.now(), dados: d };
        const nova = [reg, ...prev.filter((r) => r.id !== atualId)];
        const r = gravarHist(nova);
        const hora = new Date().toLocaleTimeString("pt-BR");
        setAviso(r === "ok" ? `Salvo no aparelho · ${hora}` : r === "semfotos" ? `Salvo sem fotos (memória cheia) · ${hora}` : "Não foi possível salvar");
        return nova;
      });
    }, 500);
    return () => clearTimeout(t);
  }, [d, carregado, atualId]);

  const abrir = (dados: Dados, id: string) => {
    nextId = Math.max(nextId, ...dados.linhas.map((l) => l.id + 1));
    setD({ ...vazio(), ...dados });
    setAtualId(id);
    setAviso("");
    window.scrollTo({ top: 0 });
  };

  const set = <K extends keyof Dados>(k: K) => (v: Dados[K]) => setD((p) => ({ ...p, [k]: v }));
  const marcados = d.marcados;
  const toggle = (nome: string) => (v: boolean) =>
    setD((p) => ({ ...p, marcados: { ...p.marcados, [nome]: v } }));

  const novaFicha = () => abrir(vazio(), novoId());

  const duplicar = (r: Registro) =>
    abrir({ ...vazio(), local: r.dados.local, sigla: r.dados.sigla, lider: r.dados.lider, colaborador: r.dados.colaborador }, novoId());

  const excluir = (id: string) => {
    if (!window.confirm("Excluir esta ficha do histórico? Isso não pode ser desfeito.")) return;
    const nova = lista.filter((r) => r.id !== id);
    gravarHist(nova);
    setLista(nova);
  };

  const exportar = () => {
    const blob = new Blob([JSON.stringify(lista)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `backup-fichas-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
  };

  const importar = async (f: File | undefined) => {
    if (!f) return;
    try {
      const vind = JSON.parse(await f.text()) as Registro[];
      const ids = new Set(lista.map((r) => r.id));
      const nova = [...lista, ...vind.filter((r) => r.id && r.dados && !ids.has(r.id))].sort((a, b) => b.atualizado - a.atualizado);
      gravarHist(nova);
      setLista(nova);
      window.alert(`${nova.length - lista.length} ficha(s) importada(s).`);
    } catch {
      window.alert("Arquivo de backup inválido.");
    }
  };

  const compartilhar = async () => {
    if (!confirmarPendencias(d)) return;
    const servicos = SERVICOS.filter((s) => d.marcados[s]);
    if (d.outros && d.outrosTexto) servicos.push(`OUTROS: ${d.outrosTexto}`);
    const texto = [
      "*Ficha de Check-List - Grupo Águia Power*",
      `Local: ${d.local}`,
      `Data e horário: ${d.dataHora}`,
      `Sigla: ${d.sigla} | Líder: ${d.lider} | Colaborador: ${d.colaborador}`,
      `Serviços: ${servicos.join(", ") || "-"}`,
      d.descricao ? `Descrição: ${d.descricao}` : "",
      d.sucesso ? "Status: realizado com sucesso" : d.naoRealizado ? `Status: NÃO realizado - ${d.motivo} ${d.motivoDetalhe}` : "",
      "",
      "PDF da ficha segue em anexo.",
    ]
      .filter(Boolean)
      .join("\n");
    window.open(`https://wa.me/?text=${encodeURIComponent(texto)}`, "_blank");
  };

  const iniciarAtendimento = () => {
    let nome = tecnico;
    if (!nome) {
      nome = (window.prompt("Nome do técnico responsável:") || "").trim();
      if (!nome) return;
      salvarTecnico(nome);
    }
    const t = Date.now();
    setD((p) => ({ ...p, entrada: t, saida: null }));
    const dt = new Date(t);
    const texto = [
      "📍 *TÉCNICO NO LOCAL · ATENDIMENTO INICIADO*",
      "",
      `🏢 Unidade: ${d.local || "-"}`,
      `👤 Técnico: ${nome}`,
      `📅 Data: ${dt.toLocaleDateString("pt-BR")}`,
      `⏰ Entrada: ${hm(t)}`,
    ].join("\n");
    window.open(`https://wa.me/?text=${encodeURIComponent(texto)}`, "_blank");
  };

  const finalizarAtendimento = () => {
    const ent = d.entrada ?? Date.now();
    const sai = Date.now();
    setD((p) => ({ ...p, saida: sai }));
    const feitos = SERVICOS.filter((s) => d.marcados[s]);
    if (d.outros && d.outrosTexto) feitos.push(`OUTROS: ${d.outrosTexto}`);
    const mats = d.linhas.filter((l) => l.especificacao.trim());
    const status = d.sucesso
      ? "✅ Realizado com sucesso"
      : d.naoRealizado
        ? `❌ Não realizado — Motivo: ${[d.motivo, d.motivoDetalhe].filter(Boolean).join(" ") || "-"}`
        : "Não informado";
    const texto = [
      "✅ *ATENDIMENTO CONCLUÍDO*",
      "",
      `🏢 Unidade: ${d.local || "-"}`,
      `👤 Técnico: ${tecnico || "-"}`,
      `📅 Data: ${new Date(ent).toLocaleDateString("pt-BR")}`,
      `⏰ Entrada: ${hm(ent)} · Saída: ${hm(sai)}`,
      `⏱ Duração: ${duracao(sai - ent)}`,
      "",
      "*🛠 Serviços realizados:*",
      ...(feitos.length ? feitos.map((s) => `• ${s}`) : ["• Nenhum serviço marcado"]),
      d.descricao ? `\n📝 Descrição: ${d.descricao}` : "",
      `\n📊 Status: ${status}`,
      mats.length
        ? `\n📦 Materiais:\n${mats.map((m) => `• ${m.especificacao}${m.quantidade ? ` — ${m.quantidade}` : ""}${m.unidade ? ` ${m.unidade}` : ""}`).join("\n")}`
        : "\n📦 Materiais: Nenhum material utilizado",
      `📸 Fotos: ${d.fotos.length ? `${d.fotos.length} foto(s) anexada(s)` : "Nenhuma foto anexada"}`,
      `✍ Assinaturas: Técnico ${d.assTecnico ? "✔" : "pendente"} · Colaborador ${d.assColaborador ? "✔" : "pendente"}`,
      "",
      "A ficha completa em PDF segue em anexo.",
    ]
      .filter((x) => x !== "")
      .join("\n");
    window.open(`https://wa.me/?text=${encodeURIComponent(texto)}`, "_blank");
    setTimeout(() => imprimir(d), 600);
  };

  if (!atualId) {
    const q = busca.trim().toLowerCase();
    const filtrada = q
      ? lista.filter((r) => `${r.dados.local} ${r.dados.dataHora} ${r.dados.lider} ${r.dados.colaborador}`.toLowerCase().includes(q))
      : lista;
    return (
      <div className="min-h-screen bg-slate-50 px-5 pb-10 pt-8 text-slate-900">
        <div className="mx-auto max-w-[640px]">
          <header className="relative flex flex-col items-center text-center">
            <div className="absolute right-0 top-0">
              <button type="button" onClick={() => setOpcoes((v) => !v)} className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[12px] font-medium text-slate-600 shadow-sm">
                Opções
              </button>
              {opcoes && (
                <div className="absolute right-0 z-10 mt-2 w-44 overflow-hidden rounded-2xl border border-slate-200 bg-white text-left text-[13px] shadow-lg">
                  <button type="button" onClick={() => { setOpcoes(false); exportar(); }} className="block w-full px-4 py-3 text-left hover:bg-slate-50">Exportar backup</button>
                  <label className="block cursor-pointer border-t border-slate-100 px-4 py-3 hover:bg-slate-50">
                    Importar backup
                    <input type="file" accept="application/json" className="hidden" onChange={(e) => { setOpcoes(false); void importar(e.target.files?.[0]); }} />
                  </label>
                </div>
              )}
            </div>
            <img src={brasao} alt="Grupo Águia Power" className="h-24 w-auto object-contain" />
            <h1 className="text-[13px] font-medium text-slate-500">Fichas Técnicas</h1>
          </header>

          <button type="button" onClick={novaFicha} className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#14213d] px-4 py-4 text-[15px] font-semibold text-white shadow-md transition active:scale-[0.99]">
            <span className="text-[20px] leading-none">+</span> Iniciar Nova Ficha
          </button>

          <div className="relative mt-4">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">⌕</span>
            <input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar por unidade, líder ou data..." className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-[14px] shadow-sm outline-none focus:border-slate-400" />
          </div>

          <div className="mb-3 mt-7 flex items-center justify-between">
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">Histórico de Fichas</h2>
            <span className="rounded-full bg-slate-200/70 px-2.5 py-0.5 text-[11px] font-medium text-slate-600">
              {lista.length} {lista.length === 1 ? "salva" : "salvas"} no aparelho
            </span>
          </div>

          {filtrada.length === 0 && (
            <p className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-[13px] text-slate-500">
              {lista.length === 0 ? "Nenhuma ficha ainda. Toque em “Iniciar nova ficha”." : "Nenhuma ficha encontrada."}
            </p>
          )}

          <ul className="space-y-3">
            {filtrada.map((r) => {
              const pc = progresso(r.dados);
              const badge = r.dados.sucesso
                ? "bg-emerald-50 text-emerald-700"
                : r.dados.naoRealizado
                  ? "bg-rose-50 text-rose-700"
                  : "bg-amber-50 text-amber-700";
              return (
                <li key={r.id} className="group relative rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm transition hover:shadow-md">
                  <button type="button" onClick={() => abrir(r.dados, r.id)} className="absolute inset-0 rounded-2xl" aria-label={`Abrir ficha ${r.dados.local || "sem local"}`} />
                  <div className="pointer-events-none flex items-start justify-between gap-3">
                    <p className="truncate text-[16px] font-semibold">{r.dados.local || "Sem local"}</p>
                    <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-medium ${badge}`}>● {statusTxt(r.dados)}</span>
                  </div>
                  <p className="pointer-events-none mt-1 text-[12px] text-slate-500">
                    {r.dados.dataHora || new Date(r.atualizado).toLocaleString("pt-BR")} · {r.dados.lider || "Sem líder"} · {r.dados.fotos.length} foto(s)
                  </p>
                  <div className="mt-4 flex items-center gap-3">
                    <div className="pointer-events-none h-1 flex-1 rounded-full bg-slate-100">
                      <div className="h-1 rounded-full bg-[#14213d]" style={{ width: `${pc}%` }} />
                    </div>
                    <span className="pointer-events-none text-[11px] text-slate-400">{pc}%</span>
                    <button type="button" onClick={() => duplicar(r)} className="relative rounded-full px-2 py-1 text-[12px] text-slate-500 hover:bg-slate-100" aria-label="Duplicar">⧉</button>
                    <button type="button" onClick={() => excluir(r.id)} className="relative rounded-full px-2 py-1 text-[12px] text-rose-500 hover:bg-rose-50" aria-label="Excluir">✕</button>
                    <span className="pointer-events-none text-[18px] text-slate-300">›</span>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    );
  }

  const pct = progresso(d);

  return (
    <div className="min-h-screen bg-neutral-200 pb-24 print:bg-white print:pb-0">
      <div className="no-print sticky top-0 z-20 mb-4 border-b border-neutral-300 bg-white px-4 py-2 shadow-sm">
        <div className="mx-auto flex max-w-[820px] items-center gap-3">
          <button type="button" onClick={() => setAtualId(null)} className="shrink-0 rounded-md border border-neutral-400 px-3 py-1.5 text-[13px] font-semibold" aria-label="Voltar ao histórico">
            ← Fichas
          </button>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[14px] font-bold">{d.local || "Nova ficha"}</p>
            <p className="truncate text-[11px] text-green-700">{aviso ? `● ${aviso}` : "Toque nos campos para preencher"}</p>
          </div>
          <span className="shrink-0 text-[13px] font-bold">{pct}%</span>
        </div>
        <div className="mx-auto mt-2 h-1.5 max-w-[820px] rounded-full bg-neutral-200">
          <div className="h-1.5 rounded-full bg-green-600 transition-all" style={{ width: `${pct}%` }} />
        </div>
      </div>

      <div className="no-print fixed inset-x-0 bottom-0 z-20 border-t border-neutral-300 bg-white px-4 py-3">
        <div className="mx-auto grid max-w-[820px] grid-cols-3 gap-2">
          <button type="button" onClick={novaFicha} className="btn-ui rounded-xl border-2 border-[#0b1f5c] bg-white py-2.5 text-[13px] font-bold text-[#0b1f5c] shadow-sm">
            Nova Ficha
          </button>
          {!d.entrada ? (
            <button type="button" onClick={iniciarAtendimento} className="btn-ui rounded-xl bg-[#16a34a] py-2.5 text-[13px] font-bold text-white shadow-md">
              ▶ Iniciar
            </button>
          ) : (
            <button type="button" onClick={finalizarAtendimento} className="btn-ui rounded-xl bg-[#dc2626] py-2.5 text-[13px] font-bold text-white shadow-md">
              {d.saida ? "↻ Reenviar" : "■ Finalizar"}
            </button>
          )}
          <button type="button" onClick={() => imprimir(d)} className="btn-ui rounded-xl bg-[#1d4ed8] py-2.5 text-[13px] font-bold text-white shadow-md">
            Imprimir / PDF
          </button>
        </div>
      </div>

      <div className="no-print mx-auto mb-4 max-w-[820px] rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">Etapas do Atendimento</p>
          <button type="button" onClick={() => { const n = (window.prompt("Nome do técnico responsável:", tecnico) || "").trim(); if (n) salvarTecnico(n); }} className="rounded-full bg-slate-100 px-3 py-1 text-[12px] font-medium text-slate-700">
            👤 {tecnico || "Definir técnico"} · ✏ Alterar
          </button>
        </div>
        {!d.entrada ? (
          <button type="button" onClick={iniciarAtendimento} className="btn-ui mt-3 w-full rounded-xl bg-[#16a34a] py-3 text-[14px] font-bold text-white shadow-md">
            ▶ Iniciar Atendimento
          </button>
        ) : (
          <>
            <div className="mt-3 grid grid-cols-3 gap-2 text-center">
              <div className="rounded-xl bg-slate-50 p-2"><p className="text-[10px] uppercase text-slate-500">Entrada</p><p className="text-[15px] font-bold">{hm(d.entrada)}</p></div>
              <div className="rounded-xl bg-slate-50 p-2"><p className="text-[10px] uppercase text-slate-500">{d.saida ? "Saída" : "Status"}</p><p className={`text-[15px] font-bold ${d.saida ? "" : "text-[#16a34a]"}`}>{d.saida ? hm(d.saida) : "● Em atendimento"}</p></div>
              <div className="rounded-xl bg-slate-50 p-2"><p className="text-[10px] uppercase text-slate-500">{d.saida ? "Duração" : "Tempo decorrido"}</p><p className="text-[15px] font-bold tabular-nums">{d.saida ? duracao(d.saida - d.entrada) : cronometro(agoraMs - d.entrada)}</p></div>
            </div>
            <button type="button" onClick={finalizarAtendimento} className="btn-ui mt-3 w-full rounded-xl bg-[#dc2626] py-3 text-[14px] font-bold text-white shadow-md">
              {d.saida ? "↻ Reenviar Conclusão · WhatsApp + PDF" : "■ Finalizar Atendimento · WhatsApp + PDF"}
            </button>
          </>
        )}
      </div>

      <div className="ficha mx-auto max-w-[820px] border-2 border-black bg-white text-black print:max-w-none print:border">
        <img src={cabecalho.url} alt="Grupo Águia Power" className="block w-full" />

        <div className="border-y-2 border-black bg-[#c9daf8] py-0.5 text-center text-[12px] font-bold uppercase">
          GCR Sistemas de Seguranca / Aguia Power CNPJ: 44.683.082/0001-91
        </div>
        <div className="border-b-2 border-black bg-[#e8eefc] py-0.5 text-center text-[12px] font-bold uppercase">
          paola.contato@gmail.com
        </div>

        <div className="border-b-2 border-black bg-neutral-200 py-2 text-center text-[19px] font-bold uppercase">
          Ficha de Check-List
        </div>

        <div className="grid grid-cols-2 border-b-2 border-black">
          <Campo label="Local:" value={d.local} onChange={set("local")} className="border-r-2 border-black" />
          <Campo
            label="Data e horario:"
            value={d.dataHora}
            onChange={set("dataHora")}
            extra={
              <button
                type="button"
                onClick={() => set("dataHora")(agora())}
                className="btn-ui no-print shrink-0 rounded-xl bg-[#1d4ed8] px-2.5 py-1 text-[10px] font-bold uppercase text-white shadow-sm"
              >
                Agora
              </button>
            }
          />
        </div>
        <div className="grid grid-cols-3 border-b-2 border-black">
          <Campo label="Sigla:" value={d.sigla} onChange={set("sigla")} className="border-r-2 border-black" />
          <Campo label="Lider:" value={d.lider} onChange={set("lider")} className="border-r-2 border-black" />
          <Campo label="Colaborador:" value={d.colaborador} onChange={set("colaborador")} />
        </div>

        <div className="border-b-2 border-black bg-[#e8eefc] px-2 py-1.5 text-[11px] uppercase">
          <strong>Obs.</strong> Obrigatorio o envio de 3 fotos minima por serviço executado. Video
          quando necessario. Fotos antes e depois do serviço.
        </div>

        <FotosEditor
          fotos={d.fotos}
          setFotos={set("fotos")}
          incluirFotos={d.incluirFotos}
          setIncluirFotos={set("incluirFotos")}
        />

        <div className="border-b-2 border-black bg-neutral-300 py-1.5 text-center text-[19px] font-bold uppercase">
          Serviço Executado
        </div>

        <div className="grid grid-cols-1 gap-2 p-3 sm:grid-cols-3 print:grid-cols-3 print:gap-1 print:p-2">
          {SERVICOS.map((s) => (
            <label key={s} className="flex items-center gap-2 text-[11.5px] uppercase">
              <Caixa checked={!!marcados[s]} onChange={toggle(s)} />
              <span>{s}</span>
            </label>
          ))}
        </div>

        <div className="flex items-center gap-2 px-3 pb-3">
          <Caixa checked={d.outros} onChange={set("outros")} />
          <span className="text-[11.5px] font-medium uppercase">Outros</span>
          <input value={d.outrosTexto} onChange={(e) => set("outrosTexto")(e.target.value)} className={`${inputClass} border-b border-black`} />
        </div>

        <div className="px-3 pb-3">
          <textarea
            rows={4}
            value={d.descricao}
            onChange={(e) => set("descricao")(e.target.value)}
            placeholder="Descrição do serviço..."
            className="w-full resize-none border border-black p-2 text-[12px] outline-none focus:bg-yellow-50 print:placeholder:text-transparent print:focus:bg-transparent"
          />
        </div>

        <div className="flex flex-wrap items-center justify-around gap-3 border-y-2 border-black px-3 py-2">
          <StatusBtn
            cor="verde"
            label="Serviço realizado com sucesso"
            checked={d.sucesso}
            onClick={() => setD((p) => ({ ...p, sucesso: !p.sucesso, naoRealizado: false }))}
          />
          <StatusBtn
            cor="vermelho"
            label="Serviço não realizado"
            checked={d.naoRealizado}
            onClick={() => setD((p) => ({ ...p, naoRealizado: !p.naoRealizado, sucesso: false }))}
          />
        </div>

        <div className="px-3 py-3">
          <div className="flex items-baseline gap-2">
            <span className="whitespace-nowrap text-[12px] uppercase">
              Se não realizado especificar o motivo:
            </span>
            <input value={d.motivo} onChange={(e) => set("motivo")(e.target.value)} className={`${inputClass} border-b border-black`} />
          </div>
          <textarea
            value={d.motivoDetalhe}
            onChange={(e) => set("motivoDetalhe")(e.target.value)}
            rows={2}
            className="mt-2 w-full resize-none border border-black p-2 text-[12px] outline-none focus:bg-yellow-50 print:focus:bg-transparent"
          />
        </div>

        <div className="px-3 pb-3">
          <div className="flex items-baseline gap-2">
            <span className="whitespace-nowrap text-[12px] uppercase">
              Material necessario para concluir o serviço:
            </span>
            <input value={d.material} onChange={(e) => set("material")(e.target.value)} className={`${inputClass} border-b border-black`} />
          </div>
          <textarea
            value={d.materialDetalhe}
            onChange={(e) => set("materialDetalhe")(e.target.value)}
            rows={3}
            className="mt-2 w-full resize-none border border-black p-2 text-[12px] outline-none focus:bg-yellow-50 print:focus:bg-transparent"
          />
        </div>

        <div className="border-y-2 border-black bg-neutral-200 py-1 text-center text-[12px] font-bold uppercase">
          Assinatura dos Responsaveis
        </div>

        <div className="grid grid-cols-1 gap-6 p-4 sm:grid-cols-2 print:grid-cols-2 print:gap-4 print:p-2">
          <SignaturePad label="Tecnico TI Aguia Power" value={d.assTecnico} onChange={set("assTecnico")} />
          <SignaturePad label="Colaborador Academia Unidade" value={d.assColaborador} onChange={set("assColaborador")} />
        </div>
      </div>

      <VersoMateriais linhas={d.linhas} setLinhas={(f) => setD((p) => ({ ...p, linhas: f(p.linhas) }))} />

      {d.incluirFotos && (
        <FotosImpressao fotos={d.fotos} cabecalhoUrl={cabecalho.url} local={d.local} dataHora={d.dataHora} />
      )}
    </div>
  );
}

function VersoMateriais({
  linhas,
  setLinhas,
}: {
  linhas: MaterialRow[];
  setLinhas: (f: (prev: MaterialRow[]) => MaterialRow[]) => void;
}) {
  const update = (id: number, patch: Partial<MaterialRow>) =>
    setLinhas((prev) => prev.map((l) => (l.id === id ? { ...l, ...patch } : l)));

  return (
    <div className="verso mx-auto mt-6 max-w-[820px] border-2 border-black bg-white text-black print:mt-0 print:max-w-none print:border">
      <div className="border-b border-black py-3 text-center font-serif text-[18px] font-bold uppercase">
        Lista de Materiais
      </div>
      <p className="no-print px-3 pt-2 text-[11px] text-neutral-500">
        A folha 2 da impressão espelha estas linhas — role para o lado no celular.
      </p>

      <div className="overflow-x-auto">
        <div className="min-w-[640px] font-serif">
          <div className="grid grid-cols-[3.5rem_minmax(15rem,1fr)_6.5rem_11rem] border-b border-black text-[14px] font-bold uppercase leading-tight print:grid-cols-[4rem_1fr_8rem_8rem]">
            <div className="border-r border-black px-2 py-2 text-center">Item</div>
            <div className="border-r border-black px-2 py-2">Especificação</div>
            <div className="border-r border-black px-2 py-2 text-center">Quantidade</div>
            <div className="px-2 py-2 text-center">Unidade</div>
          </div>

          {linhas.map((linha, i) => (
            <div
              key={linha.id}
              className="material-row grid grid-cols-[3.5rem_minmax(15rem,1fr)_6.5rem_11rem] border-b border-black text-[14px] print:grid-cols-[4rem_1fr_8rem_8rem]"
            >
              <div className="flex items-center justify-center border-r border-black px-2">{i + 1}</div>
              <div className="border-r border-black p-1 print:p-0">
                <input
                  aria-label={`Especificação do item ${i + 1}`}
                  value={linha.especificacao}
                  placeholder="Ex.: Cabo UTP cat. 6"
                  onChange={(e) => update(linha.id, { especificacao: e.target.value })}
                  className="pill-input w-full rounded-full border border-neutral-300 bg-neutral-50 px-3 py-1 outline-none focus:border-[#0b1f5c] print:placeholder:text-transparent"
                />
              </div>
              <div className="border-r border-black p-1 print:p-0">
                <input
                  aria-label={`Quantidade do item ${i + 1}`}
                  value={linha.quantidade}
                  onChange={(e) => update(linha.id, { quantidade: e.target.value })}
                  inputMode="decimal"
                  className="pill-input w-full rounded-full border border-neutral-300 bg-neutral-50 px-2 py-1 text-center outline-none focus:border-[#0b1f5c]"
                />
              </div>
              <div className="flex items-center gap-1 p-1 print:justify-center print:p-0">
                <span className="hidden print:inline">{linha.unidade}</span>
                <div className="no-print flex flex-1 gap-0.5 rounded-full bg-neutral-100 p-0.5">
                  {["UN", "M", "CX", "PCT"].map((u) => (
                    <button
                      key={u}
                      type="button"
                      onClick={() => update(linha.id, { unidade: linha.unidade === u ? "" : u })}
                      className={`flex-1 rounded-full py-1 font-sans text-[10px] font-bold transition ${linha.unidade === u ? "bg-[#0b1f5c] text-white shadow" : "text-neutral-600"}`}
                    >
                      {u}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  aria-label={`Remover item ${i + 1}`}
                  onClick={() =>
                    setLinhas((prev) => (prev.length > 1 ? prev.filter((l) => l.id !== linha.id) : [novaLinha()]))
                  }
                  className="no-print flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-50 font-sans text-[12px] font-bold text-red-600 transition active:scale-90"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="no-print flex items-center justify-between gap-2 px-3 py-2">
        <span className="text-[11px] text-neutral-500">
          {linhas.filter((l) => l.especificacao.trim()).length} de {linhas.length} linhas preenchidas
        </span>
        <button
          type="button"
          onClick={() => setLinhas((prev) => [...prev, novaLinha()])}
          className="btn-ui rounded-xl bg-[#1d4ed8] px-4 py-1.5 text-[12px] font-bold text-white shadow-sm"
        >
          + Adicionar linha
        </button>
      </div>
    </div>
  );
}
