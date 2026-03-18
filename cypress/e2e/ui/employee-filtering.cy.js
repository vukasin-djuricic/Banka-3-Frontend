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

describe("Filtriranje zaposlenih", () => {
  beforeEach(() => {
    cy.loginBypass();
    cy.intercept("GET", "**/api/employees?*", {
      body: { employees: mockEmployees },
    }).as("getEmployees");
    cy.visit("/employees");
    cy.wait("@getEmployees");
    cy.get(".employee-row").should("have.length", 4);
  });

  it("search po imenu filtrira listu", () => {
    cy.get(".search").type("Petar");
    cy.get(".employee-row").should("have.length", 1);
    cy.get(".employee-row").should("contain", "Petar");
  });

  it("search po emailu filtrira listu", () => {
    cy.get(".search").type("ana@");
    cy.get(".employee-row").should("have.length", 1);
    cy.get(".employee-row").should("contain", "Ana");
  });

  it("filter po poziciji", () => {
    cy.get(".position-filter").select("Analitičar");
    cy.get(".employee-row").should("have.length", 2);
  });

  it("kombinacija search i position filter", () => {
    cy.get(".search").type("Nikola");
    cy.get(".position-filter").select("Analitičar");
    cy.get(".employee-row").should("have.length", 2);
  });

  it("nema rezultata prikazuje poruku", () => {
    cy.get(".search").type("xyz");
    cy.get(".no-results").should("be.visible");
  });

  it("filter info se azurira", () => {
    cy.get(".search").type("Petar");
    cy.get(".filter-info").should("contain", "1");
  });

  it("reset dugme resetuje filtere", () => {
    cy.get(".search").type("Petar");
    cy.get(".position-filter").select("Analitičar");
    cy.get(".reset-btn").click();
    cy.get(".employee-row").should("have.length", 4);
    cy.get(".search").should("have.value", "");
  });

  it("search je case-insensitive", () => {
    cy.get(".search").type("petar");
    cy.get(".employee-row").should("have.length", 1);
  });
});
