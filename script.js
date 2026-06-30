const baseUrl = "https://valentino-cdn.thron.com/delivery/public/thumbnail/valentino/cb:";
const suffix = "/t8s7yi/std/600x600/immagine1.jpg";

function normalizzaCodice(codice) {
  let c = codice.trim();
  if (!c) return "";

  // Se l'utente incolla gia WS0, non lo raddoppio.
  if (c.toUpperCase().startsWith("WS0")) {
    return c;
  }

  // Il CDN usa cb:WS0 + codice articolo.
  return "WS0" + c;
}

function nomeFileDaCodice(codiceOriginale) {
  let c = codiceOriginale.trim();

  // Il file viene salvato senza il prefisso tecnico WS0 se l'utente lo ha inserito.
  if (c.toUpperCase().startsWith("WS0")) {
    c = c.substring(3);
  }

  return c.toUpperCase() + ".jpg";
}

function aggiungiLog(tipo, testo) {
  const log = document.getElementById("log");
  const li = document.createElement("li");
  li.className = tipo;
  li.textContent = testo;
  log.prepend(li);
}

function pulisci() {
  document.getElementById("lista").value = "";
  document.getElementById("status").textContent = "Nessun download avviato.";
  document.getElementById("log").innerHTML = "";
}

function scarica() {
  const testo = document.getElementById("lista").value;
  const codiciOriginali = testo
    .split(/\n|,|;|\t|\s+/)
    .map(c => c.trim())
    .filter(Boolean)
    .filter((c, i, arr) => arr.indexOf(c) === i);

  const status = document.getElementById("status");
  const log = document.getElementById("log");
  log.innerHTML = "";

  if (codiciOriginali.length === 0) {
    status.textContent = "Inserisci almeno un codice articolo.";
    return;
  }

  status.textContent = "Avvio download di " + codiciOriginali.length + " immagini...";

  codiciOriginali.forEach((codiceOriginale, i) => {
    setTimeout(() => {
      const codiceCdn = normalizzaCodice(codiceOriginale);
      const url = baseUrl + codiceCdn + suffix;
      const nomeFile = nomeFileDaCodice(codiceOriginale);

      const link = document.createElement("a");
      link.href = url;
      link.download = nomeFile;
      link.target = "_blank";
      document.body.appendChild(link);
      link.click();
      link.remove();

      aggiungiLog("info", "Aperto/download richiesto: " + nomeFile + " da " + codiceCdn);

      if (i === codiciOriginali.length - 1) {
        status.textContent = "Download richiesti completati. Controlla la cartella Download.";
      }
    }, i * 500);
  });
}
