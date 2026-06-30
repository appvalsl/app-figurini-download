const BASE_URL = "https://valentino-cdn.thron.com/delivery/public/thumbnail/valentino/cb:";
const SUFFIX = "/t8s7yi/std/600x600/immagine1.jpg";

function leggiCodici() {
  const testo = document.getElementById("lista").value;

  return testo
    .split(/\n|,|;|\t|\s+/)
    .map(codice => codice.trim().toUpperCase())
    .filter(Boolean)
    .filter((codice, index, array) => array.indexOf(codice) === index);
}

function creaUrlFigurino(codiceArticolo) {
  // Il codice articolo rimane quello a 6 caratteri.
  // Nel CDN il codice viene inserito nel percorso dopo cb:WS0.
  // Esempio: codice 393VOD => cb:WS0393VOD
  return BASE_URL + "WS0" + codiceArticolo + SUFFIX;
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

function pausa(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function scaricaSingolaImmagine(codiceArticolo) {
  const url = creaUrlFigurino(codiceArticolo);

  const response = await fetch(url, { cache: "no-store" });
  const contentType = response.headers.get("content-type") || "";

  if (!response.ok || !contentType.toLowerCase().includes("image")) {
    throw new Error("immagine non trovata");
  }

  const blob = await response.blob();
  const objectUrl = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = objectUrl;
  link.download = codiceArticolo + ".jpg";
  document.body.appendChild(link);
  link.click();
  link.remove();

  setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
}

async function scaricaImmagini() {
  const codici = leggiCodici();
  const bottone = document.getElementById("btnScarica");
  document.getElementById("log").innerHTML = "";

  if (codici.length === 0) {
    aggiornaStatus("Inserisci almeno un codice articolo.");
    return;
  }

  bottone.disabled = true;
  bottone.textContent = "Download in corso...";

  let ok = 0;
  let errore = 0;

  for (let i = 0; i < codici.length; i++) {
    const codice = codici[i];
    aggiornaStatus("Download " + (i + 1) + " di " + codici.length + ": " + codice);

    if (codice.length !== 6) {
      errore++;
      aggiungiLog("err", codice + ": codice non valido, deve essere di 6 caratteri.");
      continue;
    }

    try {
      await scaricaSingolaImmagine(codice);
      ok++;
      aggiungiLog("ok", codice + ".jpg scaricato");
    } catch (error) {
      errore++;
      aggiungiLog("err", codice + ": immagine non trovata o non scaricabile");
    }

    await pausa(450);
  }

  aggiornaStatus("Completato. Scaricati: " + ok + " - Errori: " + errore + ".");
  bottone.disabled = false;
  bottone.textContent = "Scarica immagini";
}
