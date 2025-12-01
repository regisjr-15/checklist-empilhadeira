// ======================
// ITENS DO CHECKLIST
// ======================
const itensChecklist = [
  "Chave de ignição",
  "Luzes de sinalização",
  "Buzina",
  "Banco e travas",
  "Cinto de segurança",
  "Freio de serviço (operação)",
  "Freio de estacionamento",
  "Pneus (estado geral)",
  "Garfos/Braço Clamp",
  "Mastro e elevação",
  "Correntes",
  "Mangueiras hidráulicas",
  "Nível de óleo do motor",
  "Nível de fluido hidráulico",
  "Nível de água do radiador",
  "Vazamentos visíveis",
  "Painel de instrumentos",
  "Espelhos de visão",
  "Extintor",
  "Grade de Proteção",
  "Vazamento de Gás",
  "Faróis",
  "Sirene de Ré",
  "Seta",
  "Mangueira do Gás",
  "Ajuste de Volante",
];

let respostas = {}; // { indice: { status: 'OK' | 'NOK', obs: '...' } }

document.addEventListener("DOMContentLoaded", () => {
  // ======================
  // ELEMENTOS DAS TELAS
  // ======================
  const stepIdentificacao = document.getElementById("step-identificacao");
  const stepChecklist = document.getElementById("step-checklist");
  const stepResumo = document.getElementById("step-resumo");

  const btnIrChecklist = document.getElementById("btnIrChecklist");
  const btnVoltarIdentificacao = document.getElementById("btnVoltarIdentificacao");
  const btnIrResumo = document.getElementById("btnIrResumo");
  const btnVoltarChecklist = document.getElementById("btnVoltarChecklist");
  const btnGerarPDF = document.getElementById("btnGerarPDF");

  const checklistContainer = document.getElementById("checklistContainer");
  const progressText = document.getElementById("progressText");
  const progressFill = document.getElementById("progressFill");
  const resumoDados = document.getElementById("resumoDados");

  // CAMPOS DE IDENTIFICAÇÃO
  const empilhadeira = document.getElementById("empilhadeira");
  const marca = document.getElementById("marca");
  const modelo = document.getElementById("modelo");
  const numeroSerie = document.getElementById("numeroSerie");
  const horimetro = document.getElementById("horimetro");
  const operadorNome = document.getElementById("operadorNome");
  const operadorMatricula = document.getElementById("operadorMatricula");
  const dataHora = document.getElementById("dataHora");
  const observacoesGerais = document.getElementById("observacoesGerais");

  // ASSINATURA
  const signaturePad = document.getElementById("signaturePad");
  const btnLimparAssinatura = document.getElementById("btnLimparAssinatura");
  let assinaturaCtx;
  let desenhando = false;
  let assinaturaFeita = false;
  let assinaturaInicializada = false;

  // ======================
  // FUNÇÃO AUXILIAR: FORMATAR DATA/HORA (dia/mes/ano hh:mm)
  // ======================
  function formatarDataHoraTexto(valorBruto) {
    if (!valorBruto) return "";
    const partes = valorBruto.split("T");
    if (partes.length < 2) return valorBruto;
    const [data, hora] = partes;
    const [ano, mes, dia] = data.split("-");
    const horaMin = hora.slice(0, 5); // hh:mm
    return `${dia}/${mes}/${ano} ${horaMin}`;
  }

  // ======================
  // INICIALIZAÇÃO
  // ======================
  preencherDataHora();
  montarChecklist();

  function preencherDataHora() {
    if (!dataHora) return;
    const now = new Date();
    const localISO = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
    dataHora.value = localISO;
  }

  function montarChecklist() {
    checklistContainer.innerHTML = "";
    respostas = {};

    itensChecklist.forEach((item, index) => {
      const card = document.createElement("div");
      card.className = "card-item";

      const header = document.createElement("div");
      header.className = "card-item-header";

      const title = document.createElement("div");
      title.className = "card-item-title";
      title.textContent = item;

      const buttonsDiv = document.createElement("div");
      buttonsDiv.className = "card-buttons";

      const btnOk = document.createElement("button");
      btnOk.textContent = "OK";
      btnOk.className = "status-btn status-ok";

      const btnNok = document.createElement("button");
      btnNok.textContent = "NOK";
      btnNok.className = "status-btn status-nok";

      const extraDiv = document.createElement("div");
      extraDiv.className = "card-extra";

      const obsLabel = document.createElement("label");
      obsLabel.textContent = "Observação (obrigatório se NOK):";

      const obsTextarea = document.createElement("textarea");
      obsTextarea.rows = 2;
      obsTextarea.placeholder = "Descreva o problema identificado...";

      // Campo de foto (aparece junto com a observação quando NOK)
      const fotoLabel = document.createElement("label");
      fotoLabel.textContent = "Foto do item (opcional):";

      const fotoInput = document.createElement("input");
      fotoInput.type = "file";
      fotoInput.accept = "image/*";
      fotoInput.capture = "environment"; // abre câmera no celular
      fotoInput.className = "foto-input";
      fotoInput.dataset.index = index; // índice do item

      extraDiv.appendChild(obsLabel);
      extraDiv.appendChild(obsTextarea);
      extraDiv.appendChild(fotoLabel);
      extraDiv.appendChild(fotoInput);

      btnOk.addEventListener("click", () => {
        respostas[index] = { status: "OK", obs: "" };
        btnOk.classList.add("status-selected-ok");
        btnNok.classList.remove("status-selected-nok");
        extraDiv.classList.remove("visible");
        atualizarProgresso();
      });

      btnNok.addEventListener("click", () => {
        respostas[index] = { status: "NOK", obs: obsTextarea.value || "" };
        btnNok.classList.add("status-selected-nok");
        btnOk.classList.remove("status-selected-ok");
        extraDiv.classList.add("visible"); // mostra obs + foto
        atualizarProgresso();
      });

      obsTextarea.addEventListener("input", () => {
        if (!respostas[index]) return;
        respostas[index].obs = obsTextarea.value;
      });

      buttonsDiv.appendChild(btnOk);
      buttonsDiv.appendChild(btnNok);

      header.appendChild(title);
      header.appendChild(buttonsDiv);

      card.appendChild(header);
      card.appendChild(extraDiv);

      checklistContainer.appendChild(card);
    });

    atualizarProgresso();
  }

  function atualizarProgresso() {
    const total = itensChecklist.length;
    const respondidos = Object.keys(respostas).length;
    progressText.textContent = `Itens concluídos: ${respondidos} / ${total}`;
    const percent = total > 0 ? (respondidos / total) * 100 : 0;
    progressFill.style.width = percent + "%";
  }

  // ======================
  // VALIDAÇÕES
  // ======================
  function validarIdentificacao() {
    const campos = [
      { el: empilhadeira, nome: "Empilhadeira" },
      { el: marca, nome: "Marca" },
      { el: modelo, nome: "Modelo" },
      { el: numeroSerie, nome: "Número de Série" },
      { el: horimetro, nome: "Horímetro" },
      { el: operadorNome, nome: "Nome do operador" },
      { el: operadorMatricula, nome: "Matrícula" },
      { el: dataHora, nome: "Data/Hora" },
    ];

    const existentes = campos.filter(c => c.el);
    const faltando = existentes.filter(c => !c.el.value.trim());

    if (faltando.length > 0) {
      alert(
        "Preencha todos os campos obrigatórios:\n- " +
        faltando.map(f => f.nome).join("\n- ")
      );
      return false;
    }
    return true;
  }

  function validarChecklist() {
    const total = itensChecklist.length;
    const respondidos = Object.keys(respostas).length;

    if (respondidos < total) {
      alert("Responda todos os itens do checklist antes de ir para o resumo.");
      return false;
    }

    for (let i = 0; i < total; i++) {
      const r = respostas[i];
      if (r && r.status === "NOK" && (!r.obs || !r.obs.trim())) {
        alert(
          `O item "${itensChecklist[i]}" está como NOK.\nInforme uma observação para esse item.`
        );
        return false;
      }
    }

    return true;
  }

  // ======================
  // NAVEGAÇÃO ENTRE TELAS
  // ======================
  btnIrChecklist.addEventListener("click", () => {
    if (!validarIdentificacao()) return;
    stepIdentificacao.classList.remove("active");
    stepChecklist.classList.add("active");
  });

  btnVoltarIdentificacao.addEventListener("click", () => {
    stepChecklist.classList.remove("active");
    stepIdentificacao.classList.add("active");
  });

  btnIrResumo.addEventListener("click", () => {
    if (!validarChecklist()) return;

    stepChecklist.classList.remove("active");
    stepResumo.classList.add("active");

    if (!assinaturaInicializada) {
      initSignaturePad();
      assinaturaInicializada = true;
    }

    montarResumo();
  });

  btnVoltarChecklist.addEventListener("click", () => {
    stepResumo.classList.remove("active");
    stepChecklist.classList.add("active");
  });

  // ======================
  // RESUMO (ETAPA 3)
  // ======================
  function montarResumo() {
    const temNok = Object.values(respostas).some(r => r.status === "NOK");
    const statusGeral = temNok ? "REPROVADO" : "APROVADO";

    const empVal = empilhadeira ? empilhadeira.value : "";
    const marcaVal = marca ? marca.value : "";
    const modeloVal = modelo ? modelo.value : "";
    const numSerieVal = numeroSerie ? numeroSerie.value : "";
    const horimetroVal = horimetro ? horimetro.value : "";
    const dataBruta = dataHora ? dataHora.value : "";
    const dataHoraFormatada = formatarDataHoraTexto(dataBruta);
    const opNomeVal = operadorNome ? operadorNome.value : "";
    const opMatVal = operadorMatricula ? operadorMatricula.value : "";

    resumoDados.innerHTML = `
      <p><strong>Empilhadeira:</strong> ${empVal}</p>
      <p><strong>Marca / Modelo:</strong> ${marcaVal} / ${modeloVal}</p>
      <p><strong>Nº de série:</strong> ${numSerieVal}</p>
      <p><strong>Horímetro:</strong> ${horimetroVal}</p>
      <p><strong>Operador:</strong> ${opNomeVal} (${opMatVal})</p>
      <p><strong>Data / Hora:</strong> ${dataHoraFormatada}</p>
      <p><strong>Status geral:</strong> ${
        statusGeral === "APROVADO" ? "✅ APROVADO" : "❌ REPROVADO"
      }</p>
    `;
  }

  // ======================
  // ASSINATURA (CANVAS)
  // ======================
  function initSignaturePad() {
    if (!signaturePad) return;

    assinaturaCtx = signaturePad.getContext("2d");
    assinaturaCtx.lineWidth = 2;
    assinaturaCtx.lineCap = "round";

    function ajustarCanvas() {
      const rect = signaturePad.getBoundingClientRect();
      const width = rect.width || 300; // fallback
      signaturePad.width = width;
      signaturePad.height = 180;
    }

    ajustarCanvas();
    window.addEventListener("resize", ajustarCanvas);

    function getPos(evt) {
      const rect = signaturePad.getBoundingClientRect();
      const clientX = evt.touches ? evt.touches[0].clientX : evt.clientX;
      const clientY = evt.touches ? evt.touches[0].clientY : evt.clientY;
      return {
        x: clientX - rect.left,
        y: clientY - rect.top,
      };
    }

    function startDraw(evt) {
      desenhando = true;
      assinaturaFeita = true;
      const pos = getPos(evt);
      assinaturaCtx.beginPath();
      assinaturaCtx.moveTo(pos.x, pos.y);
      evt.preventDefault();
    }

    function moveDraw(evt) {
      if (!desenhando) return;
      const pos = getPos(evt);
      assinaturaCtx.lineTo(pos.x, pos.y);
      assinaturaCtx.stroke();
      evt.preventDefault();
    }

    function endDraw(evt) {
      desenhando = false;
      evt.preventDefault();
    }

    // Mouse
    signaturePad.addEventListener("mousedown", startDraw);
    signaturePad.addEventListener("mousemove", moveDraw);
    signaturePad.addEventListener("mouseup", endDraw);
    signaturePad.addEventListener("mouseleave", endDraw);

    // Toque
    signaturePad.addEventListener("touchstart", startDraw, { passive: false });
    signaturePad.addEventListener("touchmove", moveDraw, { passive: false });
    signaturePad.addEventListener("touchend", endDraw, { passive: false });

    // Limpar
    if (btnLimparAssinatura) {
      btnLimparAssinatura.addEventListener("click", () => {
        assinaturaCtx.clearRect(0, 0, signaturePad.width, signaturePad.height);
        assinaturaFeita = false;
      });
    }
  }

  // ======================
  // ENVIAR FOTOS NOK PARA O SERVIDOR
  // ======================
  async function enviarFotos(baseName, diaParaPasta, operadorSlug) {
    const fotoInputs = document.querySelectorAll(".foto-input");
    const formData = new FormData();
    let temArquivo = false;

    fotoInputs.forEach((input) => {
      const idx = parseInt(input.dataset.index, 10);
      const resp = respostas[idx];

      // Só envia foto se:
      // - tiver arquivo
      // - e o item estiver marcado como NOK
      if (input.files && input.files[0] && resp && resp.status === "NOK") {
        temArquivo = true;
        const itemNome = itensChecklist[idx];

        formData.append("fotos[]", input.files[0]);
        formData.append("fotoItem[]", itemNome);
      }
    });

    if (!temArquivo) {
      return; // não tem foto NOK
    }

    formData.append("filename", baseName);
    formData.append("dia", diaParaPasta);
    formData.append("operador", operadorSlug);

    try {
      const resp = await fetch("upload_fotos.php", {
        method: "POST",
        body: formData,
      });
      const txt = await resp.text();
      console.log("Retorno upload fotos:", txt);
    } catch (e) {
      console.error("Erro ao enviar fotos:", e);
    }
  }

  // ======================
  // GERAÇÃO DO PDF + ENVIO PRO SERVIDOR
  // ======================
  btnGerarPDF.addEventListener("click", async () => {
    const temNok = Object.values(respostas).some(r => r.status === "NOK");
    const statusGeral = temNok ? "REPROVADO" : "APROVADO";
    const assinaturaDataUrl = signaturePad
      ? signaturePad.toDataURL("image/png")
      : null;

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    const empVal = empilhadeira ? empilhadeira.value : "";
    const marcaVal = marca ? marca.value : "";
    const modeloVal = modelo ? modelo.value : "";
    const numSerieVal = numeroSerie ? numeroSerie.value : "";
    const horimetroVal = horimetro ? horimetro.value : "";
    const dataBruta = dataHora ? dataHora.value : "";
    const dataHoraFormatada = formatarDataHoraTexto(dataBruta);
    const opNomeVal = operadorNome ? operadorNome.value : "";
    const opMatVal = operadorMatricula ? operadorMatricula.value : "";
    const obsGeraisVal = observacoesGerais ? observacoesGerais.value.trim() : "";

    // LOGO (logo-jat-arq.png)
    const img = new Image();
    img.src = "logo-jat-arq.png";

    try {
      await img.decode();
      const imgWidth = 26;
      const imgX = (pageWidth - imgWidth) / 2;
      doc.addImage(img, "PNG", imgX, 10, imgWidth, 16);
    } catch (e) {
      console.warn("Não foi possível carregar o logo no PDF:", e);
    }

    let y = 30;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("CHECKLIST DE EMPILHADEIRA", pageWidth / 2, y, { align: "center" });
    y += 4;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(
      "Pré-uso diário de segurança operacional",
      pageWidth / 2,
      y,
      { align: "center" }
    );
    y += 4;

    doc.setDrawColor(150);
    doc.line(10, y, pageWidth - 10, y);
    y += 5;

    // BLOCO EMPILHADEIRA
    const blocoEmpTop = y;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text("Dados da Empilhadeira", 12, y);
    y += 4;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text(`Empilhadeira: ${empVal}`, 14, y); y += 4;
    doc.text(`Horímetro: ${horimetroVal}`, 14, y); y += 4;

    const blocoEmpBottom = y;
    doc.setDrawColor(200);
    doc.roundedRect(
      10,
      blocoEmpTop - 4,
      pageWidth - 20,
      (blocoEmpBottom - blocoEmpTop) + 4,
      2,
      2
    );

    y += 6;

    // BLOCO OPERADOR
    const blocoOpTop = y;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text("Dados do Operador", 12, y);
    y += 4;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text(`Nome: ${opNomeVal}`, 14, y); y += 4;
    doc.text(`Matrícula: ${opMatVal}`, 14, y); y += 4;
    doc.text(`Data/Hora: ${dataHoraFormatada}`, 14, y); y += 4;

    doc.setFont("helvetica", "bold");
    if (statusGeral === "APROVADO") {
      doc.setTextColor(22, 163, 74);
    } else {
      doc.setTextColor(220, 38, 38);
    }
    doc.text(`Status geral: ${statusGeral}`, 14, y);
    doc.setTextColor(0, 0, 0);

    const blocoOpBottom = y;
    doc.setDrawColor(200);
    doc.roundedRect(
      10,
      blocoOpTop - 4,
      pageWidth - 20,
      (blocoOpBottom - blocoOpTop) + 8,
      2,
      2
    );

    y += 10;

    // TABELA ITENS / STATUS
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text("Itens verificados", 10, y);
    y += 3;

    const colItemX = 10;
    const colStatusX = 150;
    const tableWidth = pageWidth - 20;
    const rowHeight = 5;

    doc.setDrawColor(0);
    doc.setFillColor(230);
    doc.rect(colItemX, y, tableWidth, rowHeight, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.text("Item", colItemX + 2, y + 3);
    doc.text("Status", colStatusX + 2, y + 3);
    y += rowHeight;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);

    itensChecklist.forEach((item, idx) => {
      const r = respostas[idx];
      const status = r ? r.status : "-";

      doc.rect(colItemX, y, tableWidth, rowHeight);
      const maxItemWidth = colStatusX - colItemX - 4;
      const itemTxt = doc.splitTextToSize(item, maxItemWidth);
      doc.text(itemTxt, colItemX + 2, y + 3);

      doc.text(status, colStatusX + 2, y + 3);

      y += rowHeight;
    });

    // ITENS NOK COM OBS
    const nokItens = itensChecklist
      .map((item, idx) => ({ item, resp: respostas[idx] }))
      .filter(({ resp }) => resp && resp.status === "NOK" && resp.obs && resp.obs.trim());

    if (nokItens.length > 0) {
      y += 4;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.text("Itens NOK com observação:", 10, y);
      y += 4;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);

      nokItens.forEach(({ item, resp }) => {
        if (y > pageHeight - 45) return;
        const texto = doc.splitTextToSize(`• ${item}: ${resp.obs}`, pageWidth - 20);
        doc.text(texto, 12, y);
        y += texto.length * 4;
      });
    }

    // OBS GERAIS
    if (obsGeraisVal) {
      y += 4;
      if (y > pageHeight - 45) {
        y = pageHeight - 45;
      }

      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.text("Observações gerais:", 10, y);
      y += 4;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      const obsG = doc.splitTextToSize(obsGeraisVal, pageWidth - 20);
      const maxLinhas = 4;
      const obsCortada = obsG.slice(0, maxLinhas);
      doc.text(obsCortada, 12, y);
      y += obsCortada.length * 4;
    }

    // ASSINATURA
    const assinaturaBaseY = pageHeight - 30;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text("Assinatura do operador:", 10, assinaturaBaseY);

    if (assinaturaDataUrl && assinaturaFeita) {
      doc.addImage(assinaturaDataUrl, "PNG", 10, assinaturaBaseY + 2, 60, 20);
    } else {
      doc.line(10, assinaturaBaseY + 12, 70, assinaturaBaseY + 12);
    }

    // RODAPÉ
    doc.setFontSize(7);
    doc.setTextColor(107, 114, 128);
    doc.text(
      "Documento gerado eletronicamente pelo Sistema de Checklist de Empilhadeira.",
      pageWidth / 2,
      pageHeight - 5,
      { align: "center" }
    );

    // ========= NOME DO ARQUIVO COM DATA + NOME DO OPERADOR =========
    let nomeOperadorLimpo = opNomeVal
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")   // remove acentos
      .replace(/[^A-Za-z0-9 ]/g, "")     // tira caracteres estranhos
      .trim()
      .replace(/\s+/g, "_");             // espaços viram _

    if (!nomeOperadorLimpo) {
      nomeOperadorLimpo = "Sem_Nome";
    }

    let dataParaNome = "sem_data";
    let diaParaPasta = "sem_data";
    if (dataBruta && dataBruta.includes("T")) {
      const [dataParte, horaParte] = dataBruta.split("T");
      const [ano, mes, dia] = dataParte.split("-");
      const horaMin = horaParte.slice(0, 5).replace(":", ""); // HHMM
      diaParaPasta = `${ano}-${mes}-${dia}`;                   // pasta do dia
      dataParaNome = `${ano}-${mes}-${dia}_${horaMin}`;        // nome do arquivo
    }

    const nomeArquivo = `Checklist_${dataParaNome}_${nomeOperadorLimpo}`;

    // 1) Gerar PDF em Base64
    const pdfDataUri = doc.output("datauristring");
    const pdfBase64 = pdfDataUri.split(",")[1];

    // 2) Enviar FOTOS NOK (se tiver) para o servidor
    await enviarFotos(nomeArquivo, diaParaPasta, nomeOperadorLimpo);

    // 3) Montar payload para salvar PDF no servidor
    const payload = {
      filename: nomeArquivo,
      dia: diaParaPasta,
      operadorSlug: nomeOperadorLimpo,
      empilhadeira: empVal,
      marca: marcaVal,
      modelo: modeloVal,
      numeroSerie: numSerieVal,
      horimetro: horimetroVal,
      operador: opNomeVal,
      matricula: opMatVal,
      dataHora: dataHoraFormatada,
      statusGeral: statusGeral,
      respostas: respostas,
      observacoesGerais: obsGeraisVal,
      pdfBase64: pdfBase64,
    };

    try {
      fetch("salvar_checklist.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })
        .then((resp) => resp.text())
        .then((txt) => {
          console.log("Retorno do servidor ao salvar checklist:", txt);
        })
        .catch((err) => {
          console.error("Erro ao enviar checklist para o servidor:", err);
        });
    } catch (e) {
      console.error("Falha geral ao salvar checklist no servidor:", e);
    }

    // 4) Ainda baixa o PDF para o operador
    doc.save(nomeArquivo + ".pdf");
  });
});