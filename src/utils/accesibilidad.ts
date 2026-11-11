// Ionic deja el campo interno de <IonSearchbar> con un nombre fijo en ingles ("search text") y
// no copia el aria-label del componente. Esta funcion le pone el nombre correcto al <input> real,
// para que un lector de pantalla diga, por ejemplo, "Folio del reclamo" y no "search text".
export const etiquetarBuscador = (
  el: HTMLIonSearchbarElement | null,
  etiqueta: string,
) => {
  el?.getInputElement().then((input) => input.setAttribute("aria-label", etiqueta));
};
