import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
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

function Campo({ label, className = "" }: { label: string; className?: string }) {
  return (
    <div className={`flex items-center gap-1 px-2 py-1.5 ${className}`}>
      <span className="whitespace-nowrap text-[12px] font-bold uppercase">{label}</span>
      <input className={inputClass} />
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

function Ficha() {
  const [marcados, setMarcados] = useState<Record<string, boolean>>({});
  const [outros, setOutros] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const [naoRealizado, setNaoRealizado] = useState(false);

  const toggle = (nome: string) => (v: boolean) =>
    setMarcados((prev) => ({ ...prev, [nome]: v }));

  return (
    <div className="min-h-screen bg-neutral-200 py-6 print:bg-white print:py-0">
      <div className="no-print mx-auto mb-4 flex max-w-[820px] items-center justify-between gap-3 px-4">
        <p className="text-[13px] text-neutral-700">
          Toque nos campos para preencher, marque os serviços e assine no final.
        </p>
        <button
          type="button"
          onClick={() => window.print()}
          className="rounded-md bg-neutral-900 px-4 py-2 text-[13px] font-semibold text-white"
        >
          Imprimir / Salvar PDF
        </button>
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
          <Campo label="Local:" className="border-r-2 border-black" />
          <Campo label="Data e horario:" />
        </div>
        <div className="grid grid-cols-3 border-b-2 border-black">
          <Campo label="Sigla:" className="border-r-2 border-black" />
          <Campo label="Lider:" className="border-r-2 border-black" />
          <Campo label="Colaborador:" />
        </div>

        <div className="border-b-2 border-black bg-[#e8eefc] px-2 py-1.5 text-[11px] uppercase">
          <strong>Obs.</strong> Obrigatorio o envio de 3 fotos minima por serviço executado. Video
          quando necessario. Fotos antes e depois do serviço.
        </div>

        <div className="border-b-2 border-black bg-neutral-300 py-1.5 text-center text-[19px] font-bold uppercase">
          Serviço Executado
        </div>

        <div className="grid grid-cols-1 gap-2 p-3 sm:grid-cols-3">
          {SERVICOS.map((s) => (
            <label key={s} className="flex items-center gap-2 text-[11.5px] uppercase">
              <Caixa checked={!!marcados[s]} onChange={toggle(s)} />
              <span>{s}</span>
            </label>
          ))}
        </div>

        <div className="flex items-center gap-2 px-3 pb-3">
          <Caixa checked={outros} onChange={setOutros} />
          <span className="text-[11.5px] font-medium uppercase">Outros</span>
          <input className={`${inputClass} border-b border-black`} />
        </div>

        <div className="px-3 pb-3">
          <textarea
            rows={4}
            placeholder="Descrição do serviço..."
            className="w-full resize-none border border-black p-2 text-[12px] outline-none focus:bg-yellow-50 print:placeholder:text-transparent print:focus:bg-transparent"
          />
        </div>

        <div className="flex flex-wrap items-center justify-around gap-3 border-y-2 border-black px-3 py-2">
          <div className="flex items-center gap-2">
            <span className="text-[12px] font-bold uppercase">Serviço realizado com sucesso?</span>
            <Caixa checked={sucesso} onChange={setSucesso} />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[12px] font-bold uppercase">Serviço não realizado</span>
            <Caixa checked={naoRealizado} onChange={setNaoRealizado} />
          </div>
        </div>

        <div className="px-3 py-3">
          <div className="flex items-baseline gap-2">
            <span className="whitespace-nowrap text-[12px] uppercase">
              Se não realizado especificar o motivo:
            </span>
            <input className={`${inputClass} border-b border-black`} />
          </div>
          <textarea
            rows={2}
            className="mt-2 w-full resize-none border border-black p-2 text-[12px] outline-none focus:bg-yellow-50 print:focus:bg-transparent"
          />
        </div>

        <div className="px-3 pb-3">
          <div className="flex items-baseline gap-2">
            <span className="whitespace-nowrap text-[12px] uppercase">
              Material necessario para concluir o serviço:
            </span>
            <input className={`${inputClass} border-b border-black`} />
          </div>
          <textarea
            rows={3}
            className="mt-2 w-full resize-none border border-black p-2 text-[12px] outline-none focus:bg-yellow-50 print:focus:bg-transparent"
          />
        </div>

        <div className="border-y-2 border-black bg-neutral-200 py-1 text-center text-[12px] font-bold uppercase">
          Assinatura dos Responsaveis
        </div>

        <div className="grid grid-cols-1 gap-6 p-4 sm:grid-cols-2">
          <SignaturePad label="Tecnico TI Aguia Power" />
          <SignaturePad label="Colaborador Academia Unidade" />
        </div>
      </div>
    </div>
  );
}
