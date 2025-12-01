<?php
// upload_fotos.php

// Raiz onde ficam as pastas
$rootDir = "D:\\Checklist Empilhadeira Diario";

// Dia da pasta (vem do front, ex: 2025-12-01)
$dia = isset($_POST["dia"]) ? $_POST["dia"] : date("Y-m-d");
$dia = preg_replace('/[^0-9\-]/', "", $dia);

// "Slug" do operador (Kaique_Adriano, etc.)
$operadorSlug = isset($_POST["operador"]) ? $_POST["operador"] : "Sem_Nome";
$operadorSlug = preg_replace('/[^A-Za-z0-9_\-]/', "_", $operadorSlug);

// Pasta do dia + operador
$baseDir = $rootDir . DIRECTORY_SEPARATOR . $dia . DIRECTORY_SEPARATOR . $operadorSlug;

if (!is_dir($baseDir)) {
    if (!mkdir($baseDir, 0777, true)) {
        http_response_code(500);
        echo "Não foi possível criar a pasta de destino em: " . $baseDir;
        exit;
    }
}

// Nome base vindo do front (mesmo usado no PDF)
$baseName = isset($_POST["filename"]) ? $_POST["filename"] : "Checklist_Empilhadeira";
$baseName = preg_replace('/[^A-Za-z0-9_\-]/', "_", $baseName); // limpa

if (!isset($_FILES["fotos"])) {
    echo "Sem fotos para salvar.";
    exit;
}

$fotoItems = isset($_POST["fotoItem"]) ? $_POST["fotoItem"] : [];

$total = count($_FILES["fotos"]["name"]);
$saved = 0;

for ($i = 0; $i < $total; $i++) {
    if ($_FILES["fotos"]["error"][$i] === UPLOAD_ERR_OK) {
        $tmpName = $_FILES["fotos"]["tmp_name"][$i];
        $origName = $_FILES["fotos"]["name"][$i];

        // Extensão do arquivo original
        $ext = strtolower(pathinfo($origName, PATHINFO_EXTENSION));
        if (!in_array($ext, ["jpg", "jpeg", "png", "heic", "webp"])) {
            $ext = "jpg"; // fallback
        }

        // Nome do item correspondente (se vier)
        $itemNome = isset($fotoItems[$i]) ? $fotoItems[$i] : "Item_desconhecido";
        // Limpa o nome do item para usar no arquivo
        $itemSlug = preg_replace('/[^A-Za-z0-9 ]/', '_', $itemNome);
        $itemSlug = preg_replace('/\s+/', '_', trim($itemSlug));

        // Nome final: Checklist_..._NOK_Item_xxx.jpg
        $destName = $baseName . "_NOK_" . $itemSlug . "." . $ext;
        $destPath = $baseDir . DIRECTORY_SEPARATOR . $destName;

        if (move_uploaded_file($tmpName, $destPath)) {
            $saved++;
        }
    }
}

echo "Fotos salvas: " . $saved . " de " . $total;
