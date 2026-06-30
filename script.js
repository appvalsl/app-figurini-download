async function scarica() {
  const lista = document.getElementById("lista").value;

  const codici = lista
    .split(/\n|,|;|\s/)
    .map(c => c.trim())
    .filter(c => c !== "");

  const baseUrl = "https://valentino-cdn.thron.com/delivery/public/thumbnail/valentino/cb:WS0";
  const suffix = "/t8s7yi/std/600x600/immagine1.jpg";



  
  for (let i = 0; i < codici.length; i++) {
    const codice = codici[i];
    const url = baseUrl + codice + suffix;

    try {
      const res = await fetch(url);

      // ✅ controllo se esiste davvero
      if (!res.ok || res.headers.get("content-type").indexOf("image") === -1) {
        alert("Immagine NON trovata per: " + codice);
        continue;
      }

      const blob = await res.blob();

      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = codice + ".jpg";
      link.click();

      // pausa per evitare blocchi browser
      await new Promise(r => setTimeout(r, 400));

    } catch (err) {
      alert("Errore su " + codice);
    }
  }
}
