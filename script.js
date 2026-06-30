const BASE_URL = "https://valentino-cdn.thron.com/delivery/public/thumbnail/valentino/cb:";
const SUFFIX = "/t8s7yi/std/600x600/immagine1.jpg";

function leggiCodici() {
  return document.getElementById("lista").value
    .split(/\n|,|;|\s+/)
    .map(c => c.trim().toUpperCase())
    .filter(Boolean);
}

function creaUrl(codice) {
  return BASE_URL + "WS0" + codice + SUFFIX;
}

function pausa(ms) {
  return new Promise(r => setTimeout(r, ms));
}

// ✅ TAGLIA LO SPAZIO SOPRA
function cropDalBasso(img) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  // mantieni larghezza originale
  canvas.width = img.width;

  // prendi solo la parte bassa (tipo ultimi 60%)
  const cropHeight = img.height * 0.6;

  canvas.height = cropHeight;

  const sx = 0;
  const sy = img.height - cropHeight;

  ctx.drawImage(
    img,
    sx, sy, img.width, cropHeight,
    0, 0, img.width, cropHeight
  );

  return canvas;
}

function scarica(blob, nome) {
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = nome;
  a.click();

  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

async function scaricaImmagine(codice) {
  const res = await fetch(creaUrl(codice));
  const blob = await res.blob();

  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = () => {
      const canvas = cropDalBasso(img);

      canvas.toBlob(b => {
        scarica(b, codice + ".jpg");
        resolve();
      }, "image/jpeg", 0.95);
    };

    img.onerror = reject;
    img.src = URL.createObjectURL(blob);
  });
}

async function scaricaImmagini() {
  const codici = leggiCodici();

  for (let codice of codici) {
    try {
      await scaricaImmagine(codice);
    } catch {
      console.log("Errore:", codice);
    }

    await pausa(400);
  }
}
