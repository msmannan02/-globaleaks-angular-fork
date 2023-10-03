describe("Whistleblower Navigate Home Page", () => {
  it("should see page properly internationalized", () => {
    // Visit the page with lang=en
    cy.visit("#/?lang=en");

    cy.contains("div", "TEXT1_IT").should("not.exist");

    cy.contains("div", "TEXT2_IT").should("not.exist");

    cy.visit("#/?lang=it");

    cy.contains("div", "TEXT1_IT").should("exist");

    cy.contains("div", "TEXT2_IT").should("exist");
  });
});
