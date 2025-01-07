describe("Login Flow", () => {
  beforeEach(() => {
    cy.window().then((win) => {
      win.localStorage.clear();
      win.sessionStorage.clear();
    });
    cy.visit("/auth/login");
  });

  it("should validate email format in real-time", () => {
    const emailInput = cy.get('[formControlName="email"]');

    emailInput.type("invalid").blur();
    cy.get(".error-message").should("contain", "Please enter a valid email address");

    emailInput.clear().type("valid@example.com");
    cy.get(".error-message").should("not.exist");
  });

  it("should validate password complexity requirements", () => {
    const passwordInput = cy.get('[formControlName="password"]');

    passwordInput.type("simple").blur();
    cy.get(".error-message").should("contain", "Password must contain at least one number, one uppercase, one lowercase letter and one special character");

    passwordInput.clear().type("Test123#!");
    cy.get(".error-message").should("not.exist");
  });

  it("should handle network errors gracefully", () => {
    cy.intercept('POST', '**/auth/login', {
      statusCode: 401,
      body: { message: "Invalid credentials" }
    }).as('failedLogin');

    cy.get('[formControlName="email"]').type("test@example.com");
    cy.get('[formControlName="password"]').type("Test123#!");
    cy.get('button[type="submit"]').click();

    cy.get(".error-message").should("contain", "Invalid email or password");
  });

  it("should prevent form submission and show loading state", () => {
    cy.intercept('POST', '**/auth/login', {
      delay: 1000,
      statusCode: 200,
      body: {
        token: 'test-token',
        user: {
          email: 'test@example.com',
          role: 'USER',
        },
      },
    }).as('delayedLogin');

    cy.get('[formControlName="email"]').type("test@example.com");
    cy.get('[formControlName="password"]').type("Test123#!");
    cy.get('button[type="submit"]').click();

    cy.get('button[type="submit"]').should('be.disabled');
    cy.get('button[type="submit"]').should('contain', 'Logging in...');
  });
});
