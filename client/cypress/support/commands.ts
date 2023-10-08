import { PageIdleDetector } from './PageIdleDetector';

declare global {
  namespace Cypress {
    interface Chainable {
      waitForLoader: () => void;
      waitForPageIdle: () => void;
      logout: () => void;
      takeScreenshot: (filename: string, locator?:any) => void;
      waitUntilClickable: (locator: string, timeout?: number) => void;
      waitForUrl: (url: string, timeout?: number) => Chainable<any>;
      login_admin: (username?: string, password?: string, url?: string, firstlogin?: boolean) => void;
      login_receiver: (username?: string, password?: string, url?: string, firstlogin?: boolean) => void;
      login_custodian: (username?: string, password?: string, url?: string, firstlogin?: boolean) => void;
    }
  }
}

Cypress.Commands.add("waitForPageIdle", () => {
    const pageIdleDetector = new PageIdleDetector();
    pageIdleDetector.waitForPageToBeIdle();
  }
);

Cypress.Commands.add("login_receiver", (username, password, url, firstlogin) => {
  username = username === undefined ? "Recipient" : username;
  password = password === undefined ? Cypress.env("user_password") : password;
  url = url === undefined ? "#/login" : url;

  let finalURL = "/actions/forcedpasswordchange";

  cy.visit(url);
  cy.get('[name="username"]').type(username);

  // @ts-ignore
  cy.get('[name="password"]').type(password);
  cy.get("#login-button").click();

  if (!firstlogin) {
    cy.url().should("include", "#/login").then(() => {
      cy.url().should("not.include", "#/login").then((currentURL) => {
        const hashPart = currentURL.split("#")[1];
        finalURL = hashPart === "login" ? "/recipient/home" : hashPart;
        cy.waitForUrl(finalURL);
      });
    });
  }

  cy.waitForPageIdle();
});

Cypress.Commands.add("login_custodian", (username, password, url, firstlogin) => {
  username = username === undefined ? "Custodian" : username;
  password = password === undefined ? Cypress.env("user_password") : password;
  url = url === undefined ? "#/login" : url;

  let finalURL = "/actions/forcedpasswordchange";

  cy.visit(url);
  cy.get('[name="username"]').type(username);
  // @ts-ignore
  cy.get('[name="password"]').type(password);
  cy.get("#login-button").click();

  if (!firstlogin) {
    cy.url().should("include", "/login").then(() => {
      cy.url().should("not.include", "/login").then((currentURL) => {
        const hashPart = currentURL.split("#")[1];
        finalURL = hashPart === "login" ? "/custodian/home" : hashPart;
        cy.waitForUrl(finalURL);
      });
    });
  }

});

Cypress.Commands.add("takeScreenshot", (filename, locator?:any) => {
  if (!Cypress.env('takeScreenshots')) {
    return;
  }

  cy.wait(1000)
  cy.get("html, body").invoke(
    "attr",
    "style",
    "height: auto; scroll-behavior: auto;"
  );

  return cy.document().then((doc) => {
    cy.viewport(1280, doc.body.scrollHeight);

    cy.waitForPageIdle();

    cy.screenshot("../" + filename, {
      overwrite: true
    });
  });
});

Cypress.Commands.add("waitUntilClickable", (locator: string, timeout?: number) => {
  const t = timeout === undefined ? Cypress.config().defaultCommandTimeout : timeout;
  cy.get(locator).click({ timeout: t });
});

Cypress.Commands.add("waitForLoader", () => {
  // Use cy.intercept to wait for all ongoing HTTP requests to complete
  cy.intercept("**").as("httpRequests");

  cy.get("#PageOverlay", { timeout: 1000, log: false }) // Adjust the timeout as needed
    .should(($overlay) => {
      return new Cypress.Promise((resolve, reject) => {
        let visible = false;
        let startTime = Date.now();

        const checkVisibility = () => {
          if (Cypress.$($overlay).is(":visible")) {
            visible = true;
            resolve();
          } else if (Date.now() - startTime > 2000) {
            resolve();
          } else {
            setTimeout(checkVisibility, 100);
          }
        };

        checkVisibility();
      });
    })
    .then(() => {
      cy.wait("@httpRequests");
      cy.wait(1000)
    });
});



Cypress.Commands.add("waitForUrl", (url: string, timeout?: number) => {
  const t = timeout === undefined ? Cypress.config().defaultCommandTimeout : timeout;
  return cy.url().should("include", url, { timeout: t });
});

Cypress.Commands.add("login_admin", (username, password, url, firstlogin) => {
  username = username === undefined ? "admin" : username;
  password = password === undefined ? Cypress.env("user_password") : password;
  url = url === undefined ? "#/login" : url;

  let finalURL = "";

  cy.visit(url);

  cy.get('[name="username"]').type(username);

  // @ts-ignore
  cy.get('[name="password"]').type(password);
  cy.get("#login-button").click();

  if (firstlogin) {
    finalURL = "/actions/forcedpasswordchange";
    cy.waitForUrl(finalURL);
  } else {
    cy.url().should("include", "#/login").then(() => {
      cy.url().should("not.include", "#/login").then((currentURL) => {
        const hashPart = currentURL.split("#")[1];
        finalURL = hashPart === "login" ? "/admin/home" : hashPart;
        cy.waitForUrl(finalURL);
      });
    });
  }
});

Cypress.Commands.add("logout", () => {
  cy.waitUntilClickable("#LogoutLink");
});
