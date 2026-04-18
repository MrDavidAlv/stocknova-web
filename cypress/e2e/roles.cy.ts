describe("Role-based access", () => {
  it("viewer should not see create/edit/delete buttons", () => {
    cy.login("viewer");
    cy.visit("/products");
    cy.get("table").should("be.visible");
    cy.contains("Nuevo producto").should("not.exist");
    cy.contains("Importar CSV").should("not.exist");
  });

  it("manager should see create button but not import CSV", () => {
    cy.login("manager");
    cy.visit("/products");
    cy.get("table").should("be.visible");
    cy.contains("Nuevo producto").should("be.visible");
  });

  it("admin should see all action buttons", () => {
    cy.login("admin");
    cy.visit("/products");
    cy.get("table").should("be.visible");
    cy.contains("Nuevo producto").should("be.visible");
    cy.contains("Importar CSV").should("be.visible");
  });

  it("viewer should not see audit logs in navigation", () => {
    cy.login("viewer");
    cy.visit("/products");
    cy.contains("Audit Logs").should("not.exist");
  });

  it("admin should access audit logs", () => {
    cy.login("admin");
    cy.visit("/audit-logs");
    cy.contains("Audit Logs").should("be.visible");
  });
});
