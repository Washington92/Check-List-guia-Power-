import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { FotosEditor, FotosImpressao, type Foto } from "@/components/FotosServico";
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

function agora() {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

function Ficha() {
  const [d, setD] = useState<Dados>(vazio);
  const [carregado, setCarregado] = useState(false);
  const [aviso, setAviso] = useState("");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(CHAVE);
      if (raw) {
        const salvo = JSON.parse(raw) as Dados;
        nextId = Math.max(nextId, ...salvo.linhas.map((l) => l.id + 1));
        setD({ ...vazio(), ...salvo });
      }
    } catch {
      /* rascunho inválido */
    }
    setCarregado(true);
  }, []);

  useEffect(() => {
    if (!carregado) return;
    const t = setTimeout(() => {
      try {
        localStorage.setItem(CHAVE, JSON.stringify(d));
        setAviso("Rascunho salvo no aparelho");
      } catch {
        try {
          localStorage.setItem(CHAVE, JSON.stringify({ ...d, fotos: [] }));
          setAviso("Rascunho salvo (fotos não cabem no rascunho)");
        } catch {
          setAviso("");
        }
      }
    }, 500);
    return () => clearTimeout(t);
  }, [d, carregado]);

  const set = <K extends keyof Dados>(k: K) => (v: Dados[K]) => setD((p) => ({ ...p, [k]: v }));
  const marcados = d.marcados;
  const toggle = (nome: string) => (v: boolean) =>
    setD((p) => ({ ...p, marcados: { ...p.marcados, [nome]: v } }));

  const novaFicha = () => {
    if (!window.confirm("Limpar toda a ficha e começar uma nova? Isso não pode ser desfeito.")) return;
    localStorage.removeItem(CHAVE);
    setD(vazio());
    window.scrollTo({ top: 0 });
  };

  const compartilhar = async () => {
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

  return (
    <div className="min-h-screen bg-neutral-200 py-6 print:bg-white print:py-0">
      <div className="no-print mx-auto mb-4 flex max-w-[820px] items-center justify-between gap-3 px-4">
        <div>
          <p className="text-[13px] text-neutral-700">
            Toque nos campos para preencher, marque os serviços, anexe fotos e assine.
          </p>
          {aviso && <p className="text-[11px] text-green-700">{aviso}</p>}
        </div>
        <div className="flex flex-wrap justify-end gap-2">
          <button
            type="button"
            onClick={novaFicha}
            className="rounded-md border border-neutral-900 bg-white px-3 py-2 text-[13px] font-semibold"
          >
            Nova Ficha
          </button>
          <button
            type="button"
            onClick={() => void compartilhar()}
            className="rounded-md bg-green-700 px-3 py-2 text-[13px] font-semibold text-white"
          >
            WhatsApp
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="rounded-md bg-neutral-900 px-3 py-2 text-[13px] font-semibold text-white"
          >
            Imprimir / Salvar PDF
          </button>
        </div>
      </div>

      <div className="ficha mx-auto max-w-[820px] border-2 border-black bg-white text-black print:max-w-none print:border">
        <img src={cabecalho.url} alt="Grupo Águia Power" className="w-full" />

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
                className="no-print shrink-0 rounded border border-black bg-neutral-100 px-1.5 py-0.5 text-[10px] font-bold uppercase"
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
          <div className="flex items-center gap-2">
            <span className="text-[12px] font-bold uppercase">Serviço realizado com sucesso?</span>
            <Caixa checked={d.sucesso} onChange={(v) => setD((p) => ({ ...p, sucesso: v, naoRealizado: v ? false : p.naoRealizado }))} />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[12px] font-bold uppercase">Serviço não realizado</span>
            <Caixa checked={d.naoRealizado} onChange={(v) => setD((p) => ({ ...p, naoRealizado: v, sucesso: v ? false : p.sucesso }))} />
          </div>
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

      <div className="overflow-x-auto">
        <div className="min-w-[620px] font-serif">
          <div className="grid grid-cols-[4rem_minmax(17rem,1fr)_8rem_8rem] border-b border-black text-[14px] font-bold uppercase leading-tight">
            <div className="border-r border-black px-2 py-2 text-center">Item</div>
            <div className="border-r border-black px-2 py-2">Especificação</div>
            <div className="border-r border-black px-2 py-2 text-center">Unidade</div>
            <div className="px-2 py-2 text-center">Quantidade</div>
          </div>

          {linhas.map((linha, i) => (
            <div
              key={linha.id}
              className="material-row grid grid-cols-[4rem_minmax(17rem,1fr)_8rem_8rem] border-b border-black text-[14px]"
            >
              <div className="flex items-center justify-center border-r border-black px-2">
                {i + 1}
              </div>
              <div className="border-r border-black">
                <input
                  aria-label={`Especificação do item ${i + 1}`}
                  value={linha.especificacao}
                  onChange={(e) => update(linha.id, { especificacao: e.target.value })}
                  className="h-full w-full bg-transparent px-2 py-1.5 outline-none focus:bg-yellow-50 print:focus:bg-transparent"
                />
              </div>
              <div className="border-r border-black">
                <input
                  aria-label={`Unidade do item ${i + 1}`}
                  value={linha.unidade}
                  onChange={(e) => update(linha.id, { unidade: e.target.value })}
                  className="h-full w-full bg-transparent px-2 py-1.5 text-center outline-none focus:bg-yellow-50 print:focus:bg-transparent"
                />
              </div>
              <div>
                <input
                  aria-label={`Quantidade do item ${i + 1}`}
                  value={linha.quantidade}
                  onChange={(e) => update(linha.id, { quantidade: e.target.value })}
                  inputMode="decimal"
                  className="h-full w-full bg-transparent px-2 py-1.5 text-center outline-none focus:bg-yellow-50 print:focus:bg-transparent"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="no-print flex justify-end gap-2 px-3 py-2">
          <button
            type="button"
            onClick={() => setLinhas((prev) => [...prev, novaLinha()])}
            className="rounded border border-black bg-neutral-100 px-3 py-1 text-[12px] font-semibold"
          >
            + Adicionar linha
          </button>
          {linhas.length > 1 && (
            <button
              type="button"
              onClick={() => setLinhas((prev) => prev.slice(0, -1))}
              className="rounded border border-black px-3 py-1 text-[12px]"
            >
              Remover
            </button>
          )}
      </div>
    </div>
  );
}
