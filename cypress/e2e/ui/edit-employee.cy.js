describe("Izmena zaposlenog", () => {
  beforeEach(() => {
    cy.loginBypass();
    cy.intercept("GET", "**/api/employees/1", {
      body: {
        id: 1,
        first_name: "Petar",
        last_name: "Petrović",
        email: "petar@primer.rs",
        position: "Menadžer",
        active: true,
        gender: "Muški",
        phone_number: "+381601234567",
        address: "Knez Mihailova 1, Beograd",
        department: "Menadžment",
      },
    }).as("getEmployee");
    cy.intercept("PUT", "**/api/employees/1", {
      body: { valid: true },
    }).as("updateEmployee");
    cy.visit("/employees/edit/1");
    cy.wait("@getEmployee");
  });

  it("forma je popunjena postojecim podacima", () => {
    cy.get('input[name="prezime"]').should("have.value", "Petrović");
    cy.get('input[name="pozicija"]').should("have.value", "Menadžer");
    cy.get('input[name="pol"]').should("have.value", "Muški");
    cy.get('input[name="telefon"]').should("have.value", "+381601234567");
    cy.get('input[name="adresa"]').should("have.value", "Knez Mihailova 1, Beograd");
    cy.get('input[name="departman"]').should("have.value", "Menadžment");
  });

  it("korisnik moze izmeniti podatke", () => {
    cy.get('input[name="prezime"]').clear().type("Novi Prezime");
    cy.get('button[type="submit"]').click();
    cy.wait("@updateEmployee").its("request.body").should("deep.include", {
      last_name: "Novi Prezime",
    });
    cy.get(".success-msg").should("contain", "uspešno izmenjen");
  });

  it("validacija pri praznim poljima", () => {
    cy.get('input[name="prezime"]').clear();
    cy.get('button[type="submit"]').click();
    cy.get(".error-msg").should("exist");
  });

  it("prikazuje gresku kad API vrati error", () => {
    cy.intercept("PUT", "**/api/employees/1", {
      statusCode: 500,
      body: { error: "Server error" },
    }).as("updateEmployeeFail");
    cy.get('input[name="prezime"]').clear().type("Test");
    cy.get('button[type="submit"]').click();
    cy.wait("@updateEmployeeFail");
    cy.get(".error-msg").should("be.visible");
  });
});

describe("Izmena zaposlenog - error stanja", () => {
  it("prikazuje 'nije pronadjen' za 404", () => {
    cy.loginBypass();
    cy.intercept("GET", "**/api/employees/999", {
      statusCode: 404,
      body: { error: "Not found" },
    }).as("getEmployee404");
    cy.visit("/employees/edit/999");
    cy.wait("@getEmployee404");
    cy.contains("Zaposleni nije pronađen").should("be.visible");
  });

  it("prikazuje error poruku za server gresku", () => {
    cy.loginBypass();
    cy.intercept("GET", "**/api/employees/1", {
      statusCode: 500,
      body: { error: "Internal Server Error" },
    }).as("getEmployeeError");
    cy.visit("/employees/edit/1");
    cy.wait("@getEmployeeError");
    cy.get("p[style*='color']").should("be.visible");
  });
});
