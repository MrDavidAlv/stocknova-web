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
    cy.get("input[placeholder*=Buscar]").type("test-nonexistent-xyz");
    // Wait for debounce and API call
    cy.wait(1000);
    // Should show empty or filtered results
    cy.get("table").should("be.visible");
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

    // Should redirect to product detail or list
    cy.url().should("not.include", "/new");
    // Verify toast success
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
    cy.visit("/products");
    // Click edit button on first product
    cy.get("table tbody tr").first().find("a").first().click();
    cy.url().should("match", /\/products\/\d+/);

    cy.contains("Editar").click();
    cy.url().should("include", "/edit");
    cy.get("#productName").should("be.visible");
    cy.get("#productName").clear().type(`Edited ${Date.now()}`);
    cy.contains("button", "Guardar cambios").click();
    cy.contains("Producto actualizado").should("be.visible");
  });

  it("should show pagination controls", () => {
    cy.visit("/products");
    cy.get("table tbody tr").should("have.length.greaterThan", 0);
    // Pagination info should be visible
    cy.contains(/Página \d+ de \d+/).should("be.visible");
  });
});
