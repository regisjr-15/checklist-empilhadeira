<?php
// salvar_checklist.php

// Lê o corpo da requisição (JSON enviado pelo JavaScript)
$raw = file_get_contents("php://input");
$data = json_decode($raw, true);

if (!$data) {
    http_response_code(400);
    echo "JSON inválido";
    exit;
}

// Raiz onde ficam as pastas
$rootDir = "D:\\Checklist Empilhadeira Diario";

// Dia para a pasta (vem do front, ex: 2025-12-01)
$dia = isset($data["dia"]) ? $data["dia"] : date("Y-m-d");
$dia = preg_replace('/[^0-9\-]/', "", $dia); // só números e -

// "Slug" do operador (Kaique_Adriano, etc.)
$operadorSlug = isset($data["operadorSlug"]) ? $data["operadorSlug"] : "Sem_Nome";
$operadorSlug = preg_replace('/[^A-Za-z0-9_\-]/', "_", $operadorSlug);

// Pasta do dia + operador
$baseDir = $rootDir . DIRECTORY_SEPARATOR . $dia . DIRECTORY_SEPARATOR . $operadorSlug;

// Se a pasta não existir, tenta criar
if (!is_dir($baseDir)) {
    if (!mkdir($baseDir, 0777, true)) {
        http_response_code(500);
        echo "Não foi possível criar a pasta: " . $baseDir;
        exit;
    }
}

// Monta um nome "seguro" para o PDF, vindo do front (já com data + operador)
$baseName = isset($data["filename"]) ? $data["filename"] : "Checklist_Empilhadeira";
$baseName = preg_replace('/[^A-Za-z0-9_\-]/', "_", $baseName); // só letras, números, _ e -

// Caminho do PDF na pasta do dia/operador
$pdfPath  = $baseDir . DIRECTORY_SEPARATOR . $baseName . ".pdf";

// Salva o PDF (vem em Base64)
if (!empty($data["pdfBase64"])) {
    $pdfBinary = base64_decode($data["pdfBase64"]);
    if ($pdfBinary === false) {
        http_response_code(400);
        echo "Falha ao decodificar o PDF em Base64.";
        exit;
    }

    if (file_put_contents($pdfPath, $pdfBinary) === false) {
        http_response_code(500);
        echo "Falha ao gravar o PDF em: " . $pdfPath;
        exit;
    }
} else {
    http_response_code(400);
    echo "PDF não enviado no payload.";
    exit;
}

// Pronto: só salvamos o PDF (sem JSON)
echo "OK";
