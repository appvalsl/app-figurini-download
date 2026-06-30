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
  /*
    ATTENZIONE:
    Il codice articolo resta quello normale a 6 caratteri.
    Esempio: 393VOD

    Il prefisso WS0 serve SOLO per costruire il link tecnico del CDN.
    Quindi:
    393VOD -> cb:WS0393VOD
  */

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

function caricaImmagineDaBlob(blob) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(blob);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(img);
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Errore caricamento immagine"));
    };

    img.src = objectUrl;
  });
}

function creaCanvasQuadratoDalBasso(img) {
  /*
    Qui creiamo un'immagine quadrata.

    Se l'immagine originale è 474x600:
    - il quadrato sarà 600x600
    - l'immagine viene centrata orizzontalmente
    - l'immagine viene appoggiata in basso
    - lo spazio vuoto resta sopra
  */

  const size = Math.max(img.width, img.height);

  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;

  const ctx = canvas.getContext("2d");

  // Sfondo bianco
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, size, size);

  // Centratura orizzontale
  const x = (size - img.width) / 2;

  // Appoggio sul basso
  const y = size - img.height;

  ctx.drawImage(img, x, y);

  return canvas;
}

function canvasToBlob(canvas) {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      blob => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error("Errore conversione canvas"));
        }
      },
      "image/jpeg",
      0.95
    );
  });
}

function scaricaBlob(blob, nomeFile) {
  const objectUrl = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = objectUrl;
  link.download = nomeFile;

  document.body.appendChild(link);
  link.click();
  link.remove();

  setTimeout(() => {
    URL.revokeObjectURL(objectUrl);
  }, 1000);
}

async function scaricaSingolaImmagine(codiceArticolo) {
  const url = creaUrlFigurino(codiceArticolo);

  const response = await fetch(url, {
    cache: "no-store"
  });

  const contentType = response.headers.get("content-type") || "";

  if (!response.ok || !contentType.toLowerCase().includes("image")) {
    throw new Error("Immagine non trovata");
  }

  const blobOriginale = await response.blob();

  const img = await caricaImmagineDaBlob(blobOriginale);

  const canvasQuadrato = creaCanvasQuadratoDalBasso(img);

  const blobQuadrato = await canvasToBlob(canvasQuadrato);

  scaricaBlob(blobQuadrato, codiceArticolo + ".jpg");
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
      aggiungiLog("ok", codice + ".jpg scaricato in formato quadrato");
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
