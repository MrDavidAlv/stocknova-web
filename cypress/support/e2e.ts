/// <reference types="cypress" />

// Custom command: login and store tokens
Cypress.Commands.add("login", (role: "admin" | "manager" | "viewer" = "admin") => {
  const credentials: Record<string, { email: string; password: string }> = {
    admin: {
      email: Cypress.env("ADMIN_EMAIL"),
      password: Cypress.env("ADMIN_PASSWORD"),
    },
    manager: {
      email: Cypress.env("MANAGER_EMAIL"),
      password: Cypress.env("MANAGER_PASSWORD"),
    },
    viewer: {
      email: Cypress.env("VIEWER_EMAIL"),
      password: Cypress.env("VIEWER_PASSWORD"),
    },
  };

  const { email, password } = credentials[role];

  cy.session(role, () => {
    cy.visit("/login");
    cy.get("#email").type(email);
    cy.get("#password").type(password);
    cy.get("button[type=submit]").click();
    cy.url().should("include", "/products");
  });
});

declare global {
  namespace Cypress {
    interface Chainable {
      login(role?: "admin" | "manager" | "viewer"): Chainable<void>;
    }
  }
}
