const mockEmployees = [
  {
    id: 1, first_name: "Petar", last_name: "Petrović",
    email: "petar@primer.rs", position: "Menadžer",
    phone_number: "+381601234567", active: true,
  },
  {
    id: 2, first_name: "Ana", last_name: "Jovanović",
    email: "ana@primer.rs", position: "Finansije",
    phone_number: "+381607654321", active: true,
  },
  {
    id: 3, first_name: "Nikola", last_name: "Marković",
    email: "nikola@primer.rs", position: "Analitičar",
    phone_number: "+381609876543", active: true,
  },
  {
    id: 4, first_name: "Nikola", last_name: "Jovanovic",
    email: "nikola2@primer.rs", position: "Analitičar",
    phone_number: "+381611112233", active: false,
  },
];

describe("Lista zaposlenih", () => {
  beforeEach(() => {
    cy.loginBypass();
    cy.intercept("GET", "**/api/employees?*", {
      body: { employees: mockEmployees },
    }).as("getEmployees");
    cy.visit("/employees");
    cy.wait("@getEmployees");
  });

  it("employees stranica se ucitava sa heading-om", () => {
    cy.contains("h3", "Zaposleni");
  });

  it("tabela prikazuje zaposlene sa kolonama", () => {
    cy.get(".employee-table").should("be.visible");
    cy.get(".employee-table thead th").should("contain", "ID");
    cy.get(".employee-table thead th").should("contain", "Ime");
    cy.get(".employee-table thead th").should("contain", "Prezime");
    cy.get(".employee-table thead th").should("contain", "Email");
    cy.get(".employee-table thead th").should("contain", "Pozicija");
    cy.get(".employee-row").should("have.length", 4);
  });

  it("podaci zaposlenog su tacni", () => {
    cy.get(".employee-row")
      .first()
      .within(() => {
        cy.get("td").should("contain", "Petar");
        cy.get("td").should("contain", "Petrović");
        cy.get("td").should("contain", "petar@primer.rs");
        cy.get("td").should("contain", "Menadžer");
      });
  });

  it("klik na red vodi na details stranicu", () => {
    cy.get(".employee-row").first().find("td").first().click();
    cy.url().should("include", "/employees/1");
  });

  it("search, filter, reset i add dugmad su vidljivi", () => {
    cy.get(".search").should("be.visible");
    cy.get(".position-filter").should("be.visible");
    cy.get(".reset-btn").should("be.visible");
    cy.get(".add-btn").should("be.visible");
  });

  it("filter info prikazuje tacan broj", () => {
    cy.get(".filter-info").should("contain", "4");
  });
});

describe("Lista zaposlenih - loading i error stanja", () => {
  it("prikazuje loading dok se podaci ucitavaju", () => {
    cy.loginBypass();
    cy.intercept("GET", "**/api/employees?*", {
      body: { employees: mockEmployees },
      delay: 500,
    }).as("getEmployeesSlow");
    cy.visit("/employees");
    cy.contains("Učitavanje...").should("be.visible");
    cy.wait("@getEmployeesSlow");
    cy.contains("Učitavanje...").should("not.exist");
  });

  it("prikazuje gresku kad API vrati error", () => {
    cy.loginBypass();
    cy.intercept("GET", "**/api/employees?*", {
      statusCode: 500,
      body: { error: "Internal Server Error" },
    }).as("getEmployeesError");
    cy.visit("/employees");
    cy.wait("@getEmployeesError");
    cy.get("p[style*='color']").should("be.visible");
  });
});
