const BASE_URL = "https://valentino-cdn.thron.com/delivery/public/thumbnail/valentino/cb:";
const SUFFIX = "/t8s7yi/std/600x600/immagine1.jpg";

function leggiCodici() {
  const testo = document.getElementById("lista").value;

  return testo
    .split(/\n|,|;|\s+/)
    .map(c => c.trim().toUpperCase())
    .filter(Boolean)
    .filter((c, i, arr) => arr.indexOf(c) === i);
}

function creaUrl(codice) {
  return BASE_URL + "WS0" + codice + SUFFIX;
}

function pausa(ms) {
  return new Promise(r => setTimeout(r, ms));
}

function aggiungiLog(tipo, testo) {
  const log = document.getElementById("log");
  const li = document.createElement("li");

  li.className = tipo;
  li.textContent = testo;

  log.prepend(li);
}

function aggiornaStatus(testo) {
  document.getElementById("status").textContent = testo;
}

function pulisci() {
  document.getElementById("lista").value = "";
  document.getElementById("log").innerHTML = "";
  aggiornaStatus("Nessun download avviato.");
}

function scaricaBlob(blob, nomeFile) {
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = nomeFile;

  document.body.appendChild(link);
  link.click();
  link.remove();

  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

async function scaricaImmagine(codice) {
  const url = creaUrl(codice);

  const res = await fetch(url);
  const contentType = res.headers.get("content-type") || "";

  if (!res.ok || !contentType.includes("image")) {
    throw new Error("Immagine non trovata");
  }

  const blob = await res.blob();

  // ✅ SALVA ESATTAMENTE L'IMMAGINE ORIGINALE (NO CANVAS)
  scaricaBlob(blob, codice + ".jpg");
}

async function scaricaImmagini() {
  const codici = leggiCodici();
  const btn = document.getElementById("btnScarica");

  document.getElementById("log").innerHTML = "";

  if (codici.length === 0) {
    aggiornaStatus("Inserisci almeno un codice articolo");
    return;
  }

  btn.disabled = true;
  btn.textContent = "Download in corso...";

  let ok = 0;
  let err = 0;

  for (let i = 0; i < codici.length; i++) {
    const codice = codici[i];

    aggiornaStatus(`Download ${i + 1} di ${codici.length}: ${codice}`);

    try {
      await scaricaImmagine(codice);

      ok++;
      aggiungiLog("ok", `${codice}.jpg scaricato`);
    } catch {
      err++;
      aggiungiLog("err", `${codice}: non trovato`);
    }

    await pausa(400);
  }

  aggiornaStatus(`Completo → OK: ${ok} | Errori: ${err}`);

  btn.disabled = false;
  btn.textContent = "Scarica immagini";
}
