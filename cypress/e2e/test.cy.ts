describe("Pruebas E2E de la aplicacion MiSantoDomingo", () => {
  // Test 1: Comprueba que al entrar a la raiz '/' redirija al login municipal
  it("Visita la raiz y redirige al login municipal correctamente", () => {
    cy.visit("/");
    cy.url().should("include", "/login");
    cy.contains("MUNICIPALIDAD DE SANTO DOMINGO");
  });

  // Test 2: Comprueba que la consulta publica cargue su buscador
  it("Permite acceder a la consulta ciudadana por folio", () => {
    cy.visit("/consulta");
    cy.contains("Consulta Ciudadana");
    cy.contains("Seguimiento de Reclamo");
  });
});
