describe("Categories", () => {
  beforeEach(() => {
    cy.login("admin");
  });

  it("should display categories page", () => {
    cy.visit("/categories");
    cy.contains("Categorias").should("be.visible");
  });

  it("should show category cards", () => {
    cy.visit("/categories");
    // Should have at least SERVIDORES and CLOUD from seed
    cy.contains("SERVIDORES").should("be.visible");
    cy.contains("CLOUD").should("be.visible");
  });

  it("should create a new category", () => {
    const categoryName = `CypressCategory${Date.now()}`;

    cy.visit("/categories");
    cy.contains("Nueva categoria").click();

    // Dialog should be visible
    cy.get("[role=dialog]").should("be.visible");
    cy.get("[role=dialog]").find("input").first().type(categoryName);
    cy.get("[role=dialog]").find("textarea").type("Created by Cypress test");

    cy.get("[role=dialog]").contains("button", "Crear").click();
    cy.contains("creada").should("be.visible");
  });
});
