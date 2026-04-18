describe("Products", () => {
  beforeEach(() => {
    cy.login("admin");
  });

  it("should display product list page", () => {
    cy.visit("/products");
    cy.contains("Productos").should("be.visible");
    cy.get("table").should("be.visible");
    cy.get("table tbody tr").should("have.length.greaterThan", 0);
  });

  it("should search products by name", () => {
    cy.visit("/products");
    cy.get("table tbody tr").should("have.length.greaterThan", 0);
    cy.get("input[placeholder*='Buscar por nombre']").type("zzz-nonexistent-xyz");
    // Wait for debounce and API response — no results shows empty state
    cy.contains("Sin productos", { timeout: 15000 }).should("be.visible");
  });

  it("should navigate to create product form", () => {
    cy.visit("/products");
    cy.contains("Nuevo producto").click();
    cy.url().should("include", "/products/new");
    cy.contains("Nuevo producto").should("be.visible");
    cy.get("#productName").should("be.visible");
  });

  it("should create a new product", () => {
    const productName = `Cypress Test ${Date.now()}`;

    cy.visit("/products/new");
    cy.get("#productName").type(productName);
    cy.get("#unitPrice").type("99.99");
    cy.get("#unitsInStock").type("50");

    cy.contains("button", "Crear producto").click();

    // Should redirect and show success
    cy.url().should("not.include", "/new");
    cy.contains("Producto creado").should("be.visible");
  });

  it("should view product detail", () => {
    cy.visit("/products");
    // Click on first product link in the table
    cy.get("table tbody tr").first().find("a").first().click();
    cy.url().should("match", /\/products\/\d+/);
    cy.contains("Volver").should("be.visible");
  });

  it("should edit a product", () => {
    // First create a product to edit (avoids touching seed data)
    const originalName = `ToEdit ${Date.now()}`;
    cy.visit("/products/new");
    cy.get("#productName").type(originalName);
    cy.get("#unitPrice").type("10");
    cy.contains("button", "Crear producto").click();
    cy.contains("Producto creado").should("be.visible");

    // Now navigate to edit
    cy.url().then((url) => {
      cy.visit(`${url}/edit`);
      cy.get("#productName").should("be.visible");
      cy.get("#productName").clear().type(`Edited ${Date.now()}`);
      cy.contains("button", "Guardar cambios").click();
      cy.contains("Producto actualizado").should("be.visible");
    });
  });

  it("should show pagination info", () => {
    cy.visit("/products");
    cy.get("table tbody tr").should("have.length.greaterThan", 0);
    // Pagination shows "X / Y" format
    cy.contains(/\d+ \/ \d+/).should("be.visible");
  });
});
