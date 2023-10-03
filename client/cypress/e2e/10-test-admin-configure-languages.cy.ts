describe("admin configure languages", () => {
  it("should configure languages", () => {
    cy.login_admin();
    cy.visit("/#/admin/settings");
    cy.contains("button", "Languages").click();
    cy.get(".add-language-btn").click();

    cy.get("body").click("top");
    cy.get('ng-select').last().click();
    cy.get('div.ng-option').contains('English [en]').click();
    cy.get('ul.selectionList li').should('contain', 'English [en]');

    cy.get("body").click("top");
    cy.get('ng-select').last().click();
    cy.get('div.ng-option').contains('Italian [it]').click();
    cy.get('ul.selectionList li').should('contain', 'Italian [it]');

    cy.get("body").click("top");
    cy.get('ng-select').last().click();
    cy.get('div.ng-option').contains('German [de]').click();
    cy.get('ul.selectionList li').should('contain', 'German [de]');


    cy.contains("button", "Save").click();
    cy.visit("/#/admin/settings");
    cy.contains("button", "Languages").click();

    cy.get(".non-default-language").eq(0).click();
    cy.contains("button", "Save").click();

    cy.get(".non-default-language").eq(0).click();
    cy.get(".remove-lang-btn").eq(1).click();
    cy.contains("button", "Salva").click();

    cy.visit("/#/admin/settings");
    cy.get('#LanguagePickerBox').find('ng-select').last().click().get('ng-dropdown-panel').contains('Italiano').click();

    cy.get('[name="node.dataModel.header_title_homepage"]').clear().type("TEXT1_IT");
    cy.get('[name="node.dataModel.presentation"]').clear().type("TEXT2_IT");
    cy.get('button.btn.btn-primary').eq(0).contains('Salva').click();

    cy.get('#LanguagePickerBox').find('ng-select').last().click().get('ng-dropdown-panel').contains('English').click();

    cy.logout();
  });
});
