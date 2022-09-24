/* eslint-disable no-undef */
/// <reference types="cypress" />


describe("end to end", () => {
  beforeEach(() => {
    cy.clearDatabase();
  });

  const musics = [
    {
      name: "Eduardo e monica",
      youtubeLink: "https://www.youtube.com/watch?v=-CEMNef58J0",
    },
    {
      name: "Geracao coca-cola",
      youtubeLink: "https://www.youtube.com/watch?v=7tXCo-fl59M",
      score: 2,
    },
    {
      name: "Índios",
      youtubeLink: "https://www.youtube.com/watch?v=nM_gEzvhsM0",
      score: 10,
    },
    {
      name: "Tempo perdido",
      youtubeLink: "https://www.youtube.com/watch?v=zpzoG5KGaHg",
      score: 15,
    },
    {
      name: "Pais e filhos",
      youtubeLink: "https://www.youtube.com/watch?v=DEwLqT669Do",
      score: 12,
    },
  ];
  describe("Create a song recommendation", () => {
    it("should add a song recommendation", () => {
      cy.visit("http://localhost:3000/");
      
      cy.get("input[placeholder='Name']").type(
        "Diego Pinho - Caractere mais frequente"
      );
      cy.get("input[placeholder='https://youtu.be/...']").type(
        "https://youtu.be/q08oqgoSTSo"
      );

      cy.intercept("POST", "http://localhost:5000/recommendations").as(
        "createRecommendation"
      );
      cy.get("button").click();

      cy.wait("@createRecommendation").then((res) => {
        expect(res.response.statusCode).to.equals(201);
      });
    });

    it("should not create a duplicated song recommendation", () => {
      const song = {
        name: "Diego Pinho - Caractere mais frequente",
        youtubeLink: "https://youtu.be/q08oqgoSTSo",
      };

      cy.addSong(song);

      cy.visit("http://localhost:3000");

      cy.get("input[placeholder='Name']").type(song.name);
      cy.get("input[placeholder='https://youtu.be/...']").type(
        song.youtubeLink
      );

      cy.intercept("POST", "http://localhost:5000/recommendations").as(
        "createRecommendation"
      );
      cy.get("button").click();

      cy.wait("@createRecommendation").then((res) => {
        expect(res.response.statusCode).to.equals(409);
      });
    });
  });
  describe("Vote for a song recommendation", () => {
  it("should upvote for a song recommendation", () => {
    const music = musics[0];

    cy.visit("http://localhost:3000/");
    cy.get('input[placeholder="Name"]').type(music.name);
    cy.get('input[placeholder="https://youtu.be/..."]').type(music.youtubeLink);
    cy.intercept("POST", "http://localhost:5000/recommendations").as(
      "createRecommendations"
    );

    cy.get("button").click();

    cy.wait("@createRecommendations");

    cy.contains(music.name)
      .get("article")
      .within(() => {
        cy.get("div:last-of-type").should("have.text", "0");
      });
    cy.contains(music.name)
      .get("article")
      .within(() => {
        cy.get("svg:first-of-type").click();
      });
    cy.contains(music.name)
      .get("article")
      .within(() => {
        cy.get("div:last-of-type").should("have.text", "1");
      });
  });
  it("should downvote for a song recommendation", () => {
    const music = musics[0];

    cy.visit("http://localhost:3000/");
    cy.get('input[placeholder="Name"]').type(music.name);
    cy.get('input[placeholder="https://youtu.be/..."]').type(music.youtubeLink);
    cy.intercept("POST", "http://localhost:5000/recommendations").as(
      "createRecommendations"
    );

    cy.get("button").click();

    cy.wait("@createRecommendations");

    cy.contains(music.name)
      .get("article")
      .within(() => {
        cy.get("div:last-of-type").should("have.text", "0");
      });
    cy.contains(music.name)
      .get("article")
      .within(() => {
        cy.get("svg:last-of-type").click();
      });
    cy.contains(music.name)
      .get("article")
      .within(() => {
        cy.get("div:last-of-type").should("have.text", "-1");
      });
  });
});

  describe("Random screen test suit", () => {
    it("should load ten tests", () => {
      const amount = 50;
      const highScorePercentage = 70;
      cy.seedDatabase(amount, highScorePercentage);
  
      cy.intercept("GET", "/recommendations/random").as(
        "getRandomRecommendation"
      );
      cy.visit("http://localhost:3000/random");
      cy.wait("@getRandomRecommendation").then(({ response }) => {
        cy.log(response);
        expect(response.body).to.haveOwnProperty("name");
        expect(response.body).to.haveOwnProperty("youtubeLink");
        expect(response.body).to.haveOwnProperty("score");
      });
    });
  });

  describe("Top screen test suit", () => {
    it("should load ten random song recommendations", () => {
      const amount = 50;
      const highScorePercentage = 70;
      cy.seedDatabase(amount, highScorePercentage);

      cy.intercept("GET", "/recommendations/top/10").as(
        "getTopRecommendations"
      );
      cy.visit("http://localhost:3000/top");
      cy.wait("@getTopRecommendations").then(({ response }) => {
        cy.log(response);
        expect(response.body.length).to.equal(10);
        expect(response.body[0]).to.haveOwnProperty("name");
        expect(response.body[0]).to.haveOwnProperty("youtubeLink");
        expect(response.body[0]).to.haveOwnProperty("score");
        expect(response.body[0].score).to.gte(response.body[9].score);
      });
    });
  });  
});
