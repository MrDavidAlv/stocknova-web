describe("Authentication", () => {
  beforeEach(() => {
    cy.clearLocalStorage();
  });

  it("should show login page by default", () => {
    cy.visit("/login");
    cy.contains("Bienvenido de nuevo").should("be.visible");
    cy.get("#email").should("be.visible");
    cy.get("#password").should("be.visible");
  });

  it("should login with valid admin credentials", () => {
    cy.visit("/login");
    cy.get("#email").type(Cypress.env("ADMIN_EMAIL"));
    cy.get("#password").type(Cypress.env("ADMIN_PASSWORD"));
    cy.get("button[type=submit]").click();
    cy.url().should("include", "/products");
    cy.contains("Productos").should("be.visible");
  });

  it("should show error with invalid credentials", () => {
    cy.visit("/login");
    cy.get("#email").type("wrong@email.com");
    cy.get("#password").type("WrongPass123!");
    cy.get("button[type=submit]").click();
    cy.get("[class*=destructive]").should("be.visible");
  });

  it("should navigate to register page", () => {
    cy.visit("/login");
    cy.contains("Crea una aqui").click();
    cy.url().should("include", "/register");
    cy.contains("Crear cuenta").should("be.visible");
  });

  it("should show password validation on register", () => {
    cy.visit("/register");
    cy.get("#fullName").type("Test User");
    cy.get("#email").type("test@test.com");
    cy.get("#password").type("weak");
    cy.get("#confirmPassword").type("weak");
    cy.get("button[type=submit]").click();
    cy.contains("Minimo 6 caracteres").should("be.visible");
  });

  it("should redirect to /products if already authenticated", () => {
    cy.login("admin");
    cy.visit("/login");
    cy.url().should("include", "/products");
  });

  it("should redirect to login when accessing protected route", () => {
    cy.visit("/products");
    cy.url().should("include", "/login");
  });
});
