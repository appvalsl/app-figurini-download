function scarica() {
  const lista = document.getElementById("lista").value;

  const codici = lista
    .split(/\n|,|;|\s/)
    .map(c => c.trim())
    .filter(c => c !== "");

  const baseUrl = "https://valentino-cdn.thron.com/delivery/public/thumbnail/valentino/cb:";
  const suffix = "/t8s7yi/std/600x600/immagine1.jpg";

  codici.forEach((codice, i) => {
    setTimeout(() => {
      const url = baseUrl + codice + suffix;

      fetch(url)
        .then(res => res.blob())
        .then(blob => {
          const link = document.createElement("a");
          link.href = URL.createObjectURL(blob);
          link.download = codice + ".jpg";
          link.click();
        })
        .catch(() => {
          alert("Errore su " + codice);
        });

    }, i * 400);
  });
}
