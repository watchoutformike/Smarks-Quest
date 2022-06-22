class OverworldMap {
  constructor(config) {
    this.overworld = null;
    this.gameObjects = config.gameObjects;
    this.cutsceneSpaces = config.cutsceneSpaces || {};
    this.walls = config.walls || {};

    this.lowerImage = new Image();
    this.lowerImage.src = config.lowerSrc;

    this.upperImage = new Image();
    this.upperImage.src = config.upperSrc;

    this.isCutscenePlaying = false;
    this.isPaused = false;
  }

  drawLowerImage(ctx, cameraPerson) {
    ctx.drawImage(
      this.lowerImage, 
      utils.withGrid(10.5) - cameraPerson.x, 
      utils.withGrid(6) - cameraPerson.y
      )
  }

  drawUpperImage(ctx, cameraPerson) {
    ctx.drawImage(
      this.upperImage, 
      utils.withGrid(10.5) - cameraPerson.x, 
      utils.withGrid(6) - cameraPerson.y
    )
  } 

  isSpaceTaken(currentX, currentY, direction) {
    const {x,y} = utils.nextPosition(currentX, currentY, direction);
    return this.walls[`${x},${y}`] || false;
  }

  mountObjects() {
    Object.keys(this.gameObjects).forEach(key => {

      let object = this.gameObjects[key];
      object.id = key;

      //TODO: determine if this object should actually mount
      object.mount(this);

    })
  }

  async startCutscene(events) {
    this.isCutscenePlaying = true;

    for (let i=0; i<events.length; i++) {
      const eventHandler = new OverworldEvent({
        event: events[i],
        map: this,
      })
      const result = await eventHandler.init();
      if (result === "LOST_BATTLE") {
        break;
      }
    }
    this.isCutscenePlaying = false;
  }

  checkForActionCutscene() {
    const hero = this.gameObjects["hero"];
    const nextCoords = utils.nextPosition(hero.x, hero.y, hero.direction);
    const match = Object.values(this.gameObjects).find(object => {
      return `${object.x},${object.y}` === `${nextCoords.x},${nextCoords.y}`
    });
    if (!this.isCutscenePlaying && match && match.talking.length) {

      const relevantScenario = match.talking.find(scenario => {
        return (scenario.required || []).every(sf => {
          return playerState.storyFlags[sf]
        })
      })
      relevantScenario && this.startCutscene(relevantScenario.events)
    }
  }

  checkForFootstepCutscene() {
    const hero = this.gameObjects["hero"];
    const match = this.cutsceneSpaces[ `${hero.x},${hero.y}` ];
    if (!this.isCutscenePlaying && match) {
      this.startCutscene( match[0].events )
    }
  }

  addWall(x,y) {
    this.walls[`${x},${y}`] = true;
  }
  removeWall(x,y) {
    delete this.walls[`${x},${y}`]
  }
  moveWall(wasX, wasY, direction) {
    this.removeWall(wasX, wasY);
    const {x,y} = utils.nextPosition(wasX, wasY, direction);
    this.addWall(x,y);
  }

}

window.OverworldMaps = {
  DemoRoom: {
    id: "DemoRoom",
    lowerSrc: "/images/maps/DemoLower.png",
    upperSrc: "/images/maps/DemoUpper.png",
    gameObjects: {
      hero: new Person({
        isPlayerControlled: true,
        x: utils.withGrid(5),
        y: utils.withGrid(6),
      }),
      npcA: new Person({
        x: utils.withGrid(9),
        y: utils.withGrid(9),
        src: "/images/characters/people/npc1.png",
        behaviorLoop: [
          { type: "walk", direction: "left", },
          { type: "walk", direction: "down", },
          { type: "walk", direction: "right", },
          { type: "walk", direction: "up", },
          { type: "stand", direction: "up", time: 400, },
        ],
        talking: [
          {
            required: ["TALKED_TO_ERIO"],
            events: [
              { type: "textMessage", text: "Isn't Erio the coolest?", faceHero: "npcA" },
            ]
          },
          {
            events: [
              { type: "textMessage", text: "I'm going to crush you!", faceHero: "npcA" },
              // { type: "battle", enemyId: "beth" },
              // { type: "addStoryFlag", flag: "DEFEATED_BETH"},
              // { type: "textMessage", text: "You crushed me like weak pepper.", faceHero: "npcA" },
              // { type: "textMessage", text: "Go away!"},
               //{ who: "npcB", type: "walk",  direction: "up" },
            ]
          }
        ]
      }),
      npcC: new Person({
        x: utils.withGrid(4),
        y: utils.withGrid(8),
        src: "/images/characters/people/npc1.png",
        behaviorLoop: [
          { type: "stand", direction: "left", time: 500, },
          { type: "stand", direction: "down", time: 500, },
          { type: "stand", direction: "right", time: 500, },
          { type: "stand", direction: "up", time: 500, },
          { type: "walk", direction: "left",  },
          { type: "walk", direction: "down",  },
          { type: "walk", direction: "right",  },
          { type: "walk", direction: "up",  },
        ],
      }),
      npcB: new Person({
        x: utils.withGrid(8),
        y: utils.withGrid(5),
        src: "/images/characters/people/erio.png",
        talking: [
          {
            events: [
              { type: "textMessage", text: "Bahaha!", faceHero: "npcB" },
              { type: "addStoryFlag", flag: "TALKED_TO_ERIO"}
              //{ type: "battle", enemyId: "erio" }
            ]
          }
        ]
        // behaviorLoop: [
        //   { type: "walk",  direction: "left" },
        //   { type: "stand",  direction: "up", time: 800 },
        //   { type: "walk",  direction: "up" },
        //   { type: "walk",  direction: "right" },
        //   { type: "walk",  direction: "down" },
        // ]
      }),
      pizzaStone: new PizzaStone({
        x: utils.withGrid(2),
        y: utils.withGrid(7),
        storyFlag: "USED_PIZZA_STONE",
        pizzas: ["v001", "f001"],
      }),
    },
    walls: {
      [utils.asGridCoord(7,6)] : true,
      [utils.asGridCoord(8,6)] : true,
      [utils.asGridCoord(7,7)] : true,
      [utils.asGridCoord(8,7)] : true,
    },
    cutsceneSpaces: {
      [utils.asGridCoord(7,4)]: [
        {
          events: [
            { who: "npcB", type: "walk",  direction: "left" },
            { who: "npcB", type: "stand",  direction: "up", time: 500 },
            { type: "textMessage", text:"You can't be in there!"},
            { who: "npcB", type: "walk",  direction: "right" },
            { who: "hero", type: "walk",  direction: "down" },
            { who: "hero", type: "walk",  direction: "left" },
          ]
        }
      ],
      [utils.asGridCoord(5,10)]: [
        {
          events: [
            { 
              type: "changeMap", 
              map: "Kitchen",
              x: utils.withGrid(2),
              y: utils.withGrid(2), 
              direction: "down"
            }
          ]
        }
      ]
    }
  },
  Kitchen: {
    id: "Kitchen",
    lowerSrc: "/images/maps/KitchenLower.png",
    upperSrc: "/images/maps/KitchenUpper.png",
    gameObjects: {
      hero: new Person({
        isPlayerControlled: true,
        x: utils.withGrid(10),
        y: utils.withGrid(5),
      }),
      kitchenNpcA: new Person({
        x: utils.withGrid(9),
        y: utils.withGrid(5),
        direction: "up",
        src: "/images/characters/people/npc8.png",
        talking: [
          {
            events: [
              { type: "textMessage", text: "** You know they say all men are created equal but... **",},
            ]
          }
        ]
      }),
      kitchenNpcB: new Person({
        x: utils.withGrid(3),
        y: utils.withGrid(6),
        src: "/images/characters/people/erio.png",
        talking: [
          {
            events: [
              { type: "textMessage", text: "Its hard times Daddy!", faceHero: "kitchenNpcB" },
            ]
          }
        ]
      }),
    },
    cutsceneSpaces: {
      [utils.asGridCoord(5,10)]: [
        {
          events: [
            { 
              type: "changeMap", 
              map: "DiningRoom",
              x: utils.withGrid(7),
              y: utils.withGrid(3),
              direction: "down"
            }
          ]
        }
      ],
      [utils.asGridCoord(10,6)]: [{
        disqualify: ["SEEN_INTRO"],
        events: [
          { type: "addStoryFlag", flag: "SEEN_INTRO"},
          { type: "textMessage", text: "* You walk into a gym, your reputation precedes you. *"},
          { type: "walk", who: "kitchenNpcA", direction: "down"},
          { type: "stand", who: "kitchenNpcA", direction: "right", time: 200},
          { type: "stand", who: "hero", direction: "left", time: 200},
          { type: "textMessage", text: "Hey Jock-Ass. You think because some neckbeard in a racecar bed gave your match 5-Stars, you're somebody huh?"},
          { type: "textMessage", text: "Your moves don't mean a thing if there is no story behind them!"},
          { type: "textMessage", text: "Tell me, did Harley, Flair, Hogan or Firebreaker Chip carelessly bump for no reason? "},
          { type: "textMessage", text: "Its time to see if you got what it takes to cut it in the sport of kings!"},
          { type: "stand", who: "kitchenNpcA", direction: "right", time: 200},
          { type: "walk", who: "kitchenNpcA", direction: "up"},
          { type: "stand", who: "kitchenNpcA", direction: "up", time: 300},
          { type: "stand", who: "hero", direction: "down", time: 400},
          { type: "textMessage", text: "* The competition is fierce! You should spend some time leveling up your Wrestling and Mic skills. *"},
          {
            type: "changeMap",
            map: "Street",
            x: utils.withGrid(5),
            y: utils.withGrid(10),
            direction: "down"
          },
        ]
      }]
    },
    walls: {
      [utils.asGridCoord(2,4)]: true,
      [utils.asGridCoord(3,4)]: true,
      [utils.asGridCoord(5,4)]: true,
      [utils.asGridCoord(6,4)]: true,
      [utils.asGridCoord(7,4)]: true,
      [utils.asGridCoord(8,4)]: true,
      [utils.asGridCoord(11,4)]: true,
      [utils.asGridCoord(11,5)]: true,
      [utils.asGridCoord(12,5)]: true,
      [utils.asGridCoord(1,5)]: true,
      [utils.asGridCoord(1,6)]: true,
      [utils.asGridCoord(1,7)]: true,
      [utils.asGridCoord(1,9)]: true,
      [utils.asGridCoord(2,9)]: true,
      [utils.asGridCoord(6,7)]: true,
      [utils.asGridCoord(7,7)]: true,
      [utils.asGridCoord(9,7)]: true,
      [utils.asGridCoord(10,7)]: true,
      [utils.asGridCoord(9,9)]: true,
      [utils.asGridCoord(10,9)]: true,
      [utils.asGridCoord(3,10)]: true,
      [utils.asGridCoord(4,10)]: true,
      [utils.asGridCoord(6,10)]: true,
      [utils.asGridCoord(7,10)]: true,
      [utils.asGridCoord(8,10)]: true,
      [utils.asGridCoord(11,10)]: true,
      [utils.asGridCoord(12,10)]: true,

      [utils.asGridCoord(0,8)]: true,
      [utils.asGridCoord(5,11)]: true,

      [utils.asGridCoord(4,3)]: true,
      [utils.asGridCoord(9,4)]: true,
      [utils.asGridCoord(10,4)]: true,

      [utils.asGridCoord(13,6)]: true,
      [utils.asGridCoord(13,7)]: true,
      [utils.asGridCoord(13,8)]: true,
      [utils.asGridCoord(13,9)]: true,

    }
  },
  Street: {
    id: "Street",
    lowerSrc: "/images/maps/StreetLower.png",
    upperSrc: "/images/maps/StreetUpper.png",
    gameObjects: {
      hero: new Person({
        isPlayerControlled: true,
        x: utils.withGrid(30),
        y: utils.withGrid(10),
      }),
      streetNpcA: new Person({
        x: utils.withGrid(9),
        y: utils.withGrid(11),
        src: "/images/characters/people/npc2.png",
        behaviorLoop: [
          { type: "stand", direction: "right", time: 1400, },
          { type: "stand", direction: "up", time: 900, },
        ],
        talking: [
          {
            events: [
              { type: "textMessage", text: "Curtain Jerkers and Main Eventers reside on Meat Slapper Blvd.", faceHero: "streetNpcA" },
            ]
          }
        ]
      }),
      streetNpcB: new Person({
        x: utils.withGrid(31),
        y: utils.withGrid(12),
        src: "/images/characters/people/npc7.png",
        behaviorLoop: [
          { type: "stand", direction: "up", time: 400, },
          { type: "stand", direction: "left", time: 800, },
          { type: "stand", direction: "down", time: 400, },
          { type: "stand", direction: "left", time: 800, },
          { type: "stand", direction: "right", time: 800, },
        ],
        talking: [
          {
            events: [
              { type: "textMessage", text: "Even Shane Gunn knows, I'm the Best there is, the Best there was, and the Best there ever will be.", faceHero: "streetNpcB" },
            ]
          }
        ]
      }),
      streetNpcC: new Person({
        x: utils.withGrid(22),
        y: utils.withGrid(10),
        src: "/images/characters/people/bookerT.png",
        talking: [
          {
            required: ["streetBattle"],
            events: [
              { type: "textMessage", text: "Can you dig it... SUCKA!", faceHero: "streetNpcC" },
            ]
          },
          {
            events: [
              { type: "textMessage", text: "Hulk Hogan, we comin' for you *****!", faceHero: "streetNpcC" },
              { type: "battle", enemyId: "streetBattle" },
              { type: "addStoryFlag", flag: "streetBattle"},
            ]
          },
        ]
      }),
    },
    walls: function() {
      let walls = {};
      ["4,9", "5,8", "6,9", "7,9", "8,9", "9,9", "10,9", "11,9", "12,9", "13,8", "14,8", "15,7",
        "16,7", "17,7", "18,7", "19,7", "20,7", "21,7", "22,7", "23,7", "24,7", "24,6", "24,5", "26,5", "26,6", "26,7", "27,7", "28,8", "28,9", "29,8", "30,9", "31,9", "32,9", "33,9",
        "16,9", "17,9", "25,9", "26,9", "16,10", "17,10", "25,10", "26,10", "16,11", "17,11", "25,11", "26,11",
        "18,11","19,11",
        "4,14", "5,14", "6,14", "7,14", "8,14", "9,14", "10,14", "11,14", "12,14", "13,14", "14,14", "15,14", "16,14", "17,14", "18,14", "19,14", "20,14", "21,14", "22,14", "23,14",
        "24,14", "25,14", "26,14", "27,14", "28,14", "29,14", "30,14", "31,14", "32,14", "33,14",
        "3,10", "3,11", "3,12", "3,13", "34,11", "34,12", "34,13",
          "29,8","25,4",
      ].forEach(coord => {
        let [x,y] = coord.split(",");
        walls[utils.asGridCoord(x,y)] = true;
      })
      return walls;
    }(),
    cutsceneSpaces: {
      [utils.asGridCoord(5,9)]: [
        {
          events: [
            { 
              type: "changeMap",
              map: "DiningRoom",
              x: utils.withGrid(6),
              y: utils.withGrid(12),
              direction: "up"
            }
          ]
        }
      ],
      [utils.asGridCoord(29,9)]: [
        {
          events: [
            {
              type: "changeMap",
              map: "Shop",
              x: utils.withGrid(5),
              y: utils.withGrid(12),
              direction: "up"
            }
          ]
        }
      ],
      [utils.asGridCoord(34,10)]: [
        {
          events: [
            {
              type: "changeMap",
              map: "Japan",
              x: utils.withGrid(5),
              y: utils.withGrid(14),
              direction: "right"
            }
          ]
        }
      ],
      [utils.asGridCoord(25,5)]: [
        {
          events: [
            {
              type: "changeMap",
              map: "StreetNorth",
              x: utils.withGrid(7),
              y: utils.withGrid(16),
              direction: "up"
            }
          ]
        }
      ]
    }
  },
  Shop: {
    id: "Shop",
    lowerSrc: "/images/maps/PizzaShopLower.png",
    upperSrc: "/images/maps/PizzaShopUpper.png",
    gameObjects: {
      hero: new Person({
        isPlayerControlled: true,
        x: utils.withGrid(3),
        y: utils.withGrid(7),
      }),
      shopNpcA: new Person({
        x: utils.withGrid(6),
        y: utils.withGrid(5),
        src: "/images/characters/people/erio.png",
        talking: [
          {
            events: [
              { type: "textMessage", text: "Take the razor coast to coast, do the Spot! Damn it, Spot 42", faceHero: "shopNpcA" },
            ]
          }
        ]
      }),
      shopNpcB: new Person({
        x: utils.withGrid(5),
        y: utils.withGrid(9),
        src: "/images/characters/people/npc2.png",
        behaviorLoop: [
          { type: "stand", direction: "left", time: 400, },
        ],
        talking: [
          {
            events: [
              { type: "textMessage", text: "Don't fall for the Spot Monkey trap, make the people feel it.", faceHero: "shopNpcB" },
            ]
          }
        ]
      }),
      pizzaStone: new PizzaStone({
        x: utils.withGrid(1),
        y: utils.withGrid(4),
        storyFlag: "STONE_SHOP",
        pizzas: ["v002", "f002"],
      }),
    },
    cutsceneSpaces: {
      [utils.asGridCoord(5,12)]: [
        {
          events: [
            {
              type: "changeMap",
              map: "Street",
              x: utils.withGrid(29),
              y: utils.withGrid(9),
              direction: "down"
            }
          ]
        }
      ],
    },
    walls: {
      [utils.asGridCoord(2,4)]: true,
      [utils.asGridCoord(2,5)]: true,
      [utils.asGridCoord(2,6)]: true,
      [utils.asGridCoord(3,6)]: true,
      [utils.asGridCoord(4,6)]: true,
      [utils.asGridCoord(5,6)]: true,
      [utils.asGridCoord(7,6)]: true,
      [utils.asGridCoord(8,6)]: true,
      [utils.asGridCoord(9,6)]: true,
      [utils.asGridCoord(9,5)]: true,
      [utils.asGridCoord(9,4)]: true,
      [utils.asGridCoord(3,8)]: true,
      [utils.asGridCoord(3,9)]: true,
      [utils.asGridCoord(3,10)]: true,
      [utils.asGridCoord(4,8)]: true,
      [utils.asGridCoord(4,9)]: true,
      [utils.asGridCoord(4,10)]: true,
      [utils.asGridCoord(7,8)]: true,
      [utils.asGridCoord(7,9)]: true,
      [utils.asGridCoord(8,8)]: true,
      [utils.asGridCoord(8,9)]: true,
      [utils.asGridCoord(1,12)]: true,
      [utils.asGridCoord(2,12)]: true,
      [utils.asGridCoord(3,12)]: true,
      [utils.asGridCoord(4,12)]: true,
      [utils.asGridCoord(6,12)]: true,
      [utils.asGridCoord(7,12)]: true,
      [utils.asGridCoord(8,12)]: true,
      [utils.asGridCoord(9,12)]: true,
      [utils.asGridCoord(10,12)]: true,
      [utils.asGridCoord(0,4)]: true,
      [utils.asGridCoord(0,5)]: true,
      [utils.asGridCoord(0,6)]: true,
      [utils.asGridCoord(0,7)]: true,
      [utils.asGridCoord(0,8)]: true,
      [utils.asGridCoord(0,9)]: true,
      [utils.asGridCoord(0,10)]: true,
      [utils.asGridCoord(0,11)]: true,
      [utils.asGridCoord(11,4)]: true,
      [utils.asGridCoord(11,5)]: true,
      [utils.asGridCoord(11,6)]: true,
      [utils.asGridCoord(11,7)]: true,
      [utils.asGridCoord(11,8)]: true,
      [utils.asGridCoord(11,9)]: true,
      [utils.asGridCoord(11,10)]: true,
      [utils.asGridCoord(11,11)]: true,

      [utils.asGridCoord(1,3)]: true,
      [utils.asGridCoord(2,3)]: true,
      [utils.asGridCoord(3,3)]: true,
      [utils.asGridCoord(4,3)]: true,
      [utils.asGridCoord(5,3)]: true,
      [utils.asGridCoord(6,3)]: true,
      [utils.asGridCoord(7,3)]: true,
      [utils.asGridCoord(8,3)]: true,
      [utils.asGridCoord(9,3)]: true,
      [utils.asGridCoord(10,3)]: true,

      [utils.asGridCoord(5,13)]: true,
    }
  },
  GreenKitchen: {
    id: "GreenKitchen",
    lowerSrc: "/images/maps/GreenKitchenLower.png",
    upperSrc: "/images/maps/GreenKitchenUpper.png",
    gameObjects: {
      hero: new Person({
        isPlayerControlled: true,
        x: utils.withGrid(3),
        y: utils.withGrid(8),
      }),
      greenKitchenNpcA: new Person({
        x: utils.withGrid(8),
        y: utils.withGrid(8),
        src: "/images/characters/people/npc2.png",
        behaviorLoop: [
          { type: "stand", direction: "up", time: 400, },
          { type: "stand", direction: "left", time: 800, },
          { type: "stand", direction: "down", time: 400, },
          { type: "stand", direction: "left", time: 800, },
        ],
        talking: [
          {
            events: [
              { type: "textMessage", text: "That doesn't work for me, Brother.", faceHero: "greenKitchenNpcA" },
            ]
          }
        ]
      }),
      greenKitchenNpcB: new Person({
        x: utils.withGrid(1),
        y: utils.withGrid(8),
        src: "/images/characters/people/npc3.png",
        behaviorLoop: [
          { type: "stand", direction: "up", time: 900, },
          { type: "walk", direction: "down"},
          { type: "walk", direction: "down"},
          { type: "stand", direction: "right", time: 800, },
          { type: "stand", direction: "down", time: 400, },
          { type: "stand", direction: "right", time: 800, },
          { type: "walk", direction: "up"},
          { type: "walk", direction: "up"},
          { type: "stand", direction: "up", time: 600, },
          { type: "stand", direction: "right", time: 900, },
        ],
        talking: [
          {
            events: [
              { type: "textMessage", text: "We're talkin about the WRESTLING BUSINESS bro!", faceHero: "greenKitchenNpcB" },
            ]
          }
        ]
      }),
      greenKitchenNpcC: new Person({
        x: utils.withGrid(3),
        y: utils.withGrid(5),
        src: "/images/characters/people/secondBoss.png",
        talking: [
          {
            required: ["chefRootie"],
            events: [ {type: "textMessage", faceHero:["greenKitchenNpcC"], text: "My hole can finally Rest In Peace."} ]
          },
          {
            events: [
              { type: "textMessage", text: "Im here to take souls and lick buttholes, and I am all out of souls.", faceHero: "greenKitchenNpcC" },
              { type: "battle", enemyId: "chefRootie", arena: "green-kitchen" },
              { type: "addStoryFlag", flag: "chefRootie"},
            ]
          }
        ]
      }),
    },
    cutsceneSpaces: {
      [utils.asGridCoord(5,12)]: [
        {
          events: [
            {
              type: "changeMap",
              map: "StreetNorth",
              x: utils.withGrid(7),
              y: utils.withGrid(5),
              direction: "down"
            }
          ]
        }
      ],
      [utils.asGridCoord(5,3)]: [
        {
          events: [
            {
              type: "changeMap",
              map: "WWF",
              x: utils.withGrid(3),
              y: utils.withGrid(5),
              direction: "up"
            }
          ]
        }
      ],
    },
    walls: {
      [utils.asGridCoord(1,4)]: true,
      [utils.asGridCoord(3,4)]: true,
      [utils.asGridCoord(4,4)]: true,
      [utils.asGridCoord(6,4)]: true,
      [utils.asGridCoord(7,4)]: true,
      [utils.asGridCoord(8,5)]: true,
      [utils.asGridCoord(9,4)]: true,
      [utils.asGridCoord(1,6)]: true,
      [utils.asGridCoord(2,6)]: true,
      [utils.asGridCoord(3,6)]: true,
      [utils.asGridCoord(4,6)]: true,
      [utils.asGridCoord(5,6)]: true,
      [utils.asGridCoord(6,6)]: true,
      [utils.asGridCoord(3,7)]: true,
      [utils.asGridCoord(4,7)]: true,
      [utils.asGridCoord(6,7)]: true,
      [utils.asGridCoord(2,9)]: true,
      [utils.asGridCoord(3,9)]: true,
      [utils.asGridCoord(4,9)]: true,
      [utils.asGridCoord(7,10)]: true,
      [utils.asGridCoord(8,10)]: true,
      [utils.asGridCoord(9,10)]: true,
      [utils.asGridCoord(1,12)]: true,
      [utils.asGridCoord(2,12)]: true,
      [utils.asGridCoord(3,12)]: true,
      [utils.asGridCoord(4,12)]: true,
      [utils.asGridCoord(6,12)]: true,
      [utils.asGridCoord(7,12)]: true,
      [utils.asGridCoord(8,12)]: true,
      [utils.asGridCoord(9,12)]: true,
      [utils.asGridCoord(0,5)]: true,
      [utils.asGridCoord(0,6)]: true,
      [utils.asGridCoord(0,7)]: true,
      [utils.asGridCoord(0,8)]: true,
      [utils.asGridCoord(0,9)]: true,
      [utils.asGridCoord(0,10)]: true,
      [utils.asGridCoord(0,11)]: true,
      [utils.asGridCoord(10,5)]: true,
      [utils.asGridCoord(10,6)]: true,
      [utils.asGridCoord(10,7)]: true,
      [utils.asGridCoord(10,8)]: true,
      [utils.asGridCoord(10,9)]: true,
      [utils.asGridCoord(10,10)]: true,
      [utils.asGridCoord(10,11)]: true,
      [utils.asGridCoord(5,13)]: true,
    }
  },
  StreetNorth: {
    id: "StreetNorth",
    lowerSrc: "/images/maps/StreetNorthLower.png",
    upperSrc: "/images/maps/StreetNorthUpper.png",
    gameObjects: {
      hero: new Person({
        isPlayerControlled: true,
        x: utils.withGrid(3),
        y: utils.withGrid(8),
      }),
      streetNorthNpcA: new Person({
        x: utils.withGrid(9),
        y: utils.withGrid(6),
        src: "/images/characters/people/npc1.png",
        behaviorLoop: [
          { type: "walk", direction: "left", },
          { type: "walk", direction: "down", },
          { type: "walk", direction: "right", },
          { type: "stand", direction: "right", time: 800, },
          { type: "walk", direction: "up", },
          { type: "stand", direction: "up", time: 400, },
        ],
        talking: [
          {
            events: [
              { type: "textMessage", text: "Trippy things are going on in the back room of Neon Green's", faceHero: "streetNorthNpcA" },
            ]
          }
        ]
      }),
      streetNorthNpcB: new Person({
        x: utils.withGrid(4),
        y: utils.withGrid(12),
        src: "/images/characters/people/snake.png",
        behaviorLoop: [
          { type: "stand", direction: "up", time: 400, },
          { type: "stand", direction: "left", time: 800, },
          { type: "stand", direction: "down", time: 400, },
          { type: "stand", direction: "left", time: 800, },
          { type: "stand", direction: "right", time: 800, },
        ],
        talking: [
          {
            events: [
              { type: "textMessage", text: "This time, you'll be the one that's humiliated, and this time, you will be the one that grovels for the money.", faceHero: "streetNorthNpcB" },
              { type: "textMessage", text: "And how appropriate, that the money you grovel for is your very own.", faceHero: "streetNorthNpcB" },
              { type: "textMessage", text: "A victim of your own greed, wallowing in the muck of avarice.", faceHero: "streetNorthNpcB" },
            ]
          }
        ]
      }),
      streetNorthNpcC: new Person({
        x: utils.withGrid(12),
        y: utils.withGrid(9),
        src: "/images/characters/people/scsa.png",
        talking: [
          {
            required: ["streetNorthBattle"],
            events: [
              { type: "textMessage", text: "And thats the bottom line, cuz Stone Cold Said So!", faceHero: "streetNorthNpcC" },
            ]
          },
          {
            events: [
              { type: "textMessage", text: "If you put a 'S' in front of Hitman, you have my exact thoughts on You.", faceHero: "streetNorthNpcC" },
              { type: "battle", enemyId: "streetNorthBattle" },
              { type: "addStoryFlag", flag: "streetNorthBattle"},
            ]
          },
        ]
      }),
      pizzaStone: new PizzaStone({
        x: utils.withGrid(2),
        y: utils.withGrid(9),
        storyFlag: "STONE_STREET_NORTH",
        pizzas: ["s002", "f001"],
      }),
    },
    walls: {
      [utils.asGridCoord(2,7)]: true,
      [utils.asGridCoord(3,7)]: true,
      [utils.asGridCoord(3,6)]: true,
      [utils.asGridCoord(4,5)]: true,
      [utils.asGridCoord(5,5)]: true,
      [utils.asGridCoord(6,5)]: true,
      [utils.asGridCoord(8,5)]: true,
      [utils.asGridCoord(9,5)]: true,
      [utils.asGridCoord(10,5)]: true,
      [utils.asGridCoord(11,6)]: true,
      [utils.asGridCoord(12,6)]: true,
      [utils.asGridCoord(13,6)]: true,
      [utils.asGridCoord(7,8)]: true,
      [utils.asGridCoord(8,8)]: true,
      [utils.asGridCoord(7,9)]: true,
      [utils.asGridCoord(8,9)]: true,
      [utils.asGridCoord(7,10)]: true,
      [utils.asGridCoord(8,10)]: true,
      [utils.asGridCoord(9,10)]: true,
      [utils.asGridCoord(10,10)]: true,
      [utils.asGridCoord(2,15)]: true,
      [utils.asGridCoord(3,15)]: true,
      [utils.asGridCoord(4,15)]: true,
      [utils.asGridCoord(5,15)]: true,
      [utils.asGridCoord(6,15)]: true,
      [utils.asGridCoord(6,16)]: true,
      [utils.asGridCoord(8,16)]: true,
      [utils.asGridCoord(8,15,)]: true,
      [utils.asGridCoord(9,15)]: true,
      [utils.asGridCoord(10,15)]: true,
      [utils.asGridCoord(11,15)]: true,
      [utils.asGridCoord(12,15)]: true,
      [utils.asGridCoord(13,15)]: true,

      [utils.asGridCoord(1,8)]: true,
      [utils.asGridCoord(1,9)]: true,
      [utils.asGridCoord(1,10)]: true,
      [utils.asGridCoord(1,11)]: true,
      [utils.asGridCoord(1,12)]: true,
      [utils.asGridCoord(1,13)]: true,
      [utils.asGridCoord(1,14)]: true,

      [utils.asGridCoord(14,7)]: true,
      [utils.asGridCoord(14,8)]: true,
      [utils.asGridCoord(14,9)]: true,
      [utils.asGridCoord(14,10)]: true,
      [utils.asGridCoord(14,11)]: true,
      [utils.asGridCoord(14,12)]: true,
      [utils.asGridCoord(14,13)]: true,
      [utils.asGridCoord(14,14)]: true,

      [utils.asGridCoord(7,17)]: true,
      [utils.asGridCoord(7,4)]: true,
    },
    cutsceneSpaces: {
      [utils.asGridCoord(7,5)]: [
        {
          events: [
            {
              type: "changeMap",
              map: "GreenKitchen",
              x: utils.withGrid(5),
              y: utils.withGrid(12),
              direction: "up"
            }
          ]
        }
      ],
      [utils.asGridCoord(7,16)]: [
        {
          events: [
            {
              type: "changeMap",
              map: "Street",
              x: utils.withGrid(25),
              y: utils.withGrid(5),
              direction: "down"
            }
          ]
        }
      ],
    }
  },
  DiningRoom: {
    id: "DiningRoom",
    lowerSrc: "/images/maps/DiningRoomLower.png",
    upperSrc: "/images/maps/DiningRoomUpper.png",
    gameObjects: {
      hero: new Person({
        isPlayerControlled: true,
        x: utils.withGrid(5),
        y: utils.withGrid(8),
      }),
      diningRoomNpcA: new Person({
        x: utils.withGrid(12),
        y: utils.withGrid(8),
        src: "/images/characters/people/bb.png",
        talking: [
          {
            required: ["diningRoomBattle"],
            events: [
              { type: "textMessage", text: "You beat me in my Home TOOOOOON", faceHero: "diningRoomNpcA" },
            ]
          },
          {
            events: [
              { type: "textMessage", text: "Hope you are ready, Im Fooked, been smoking crack with Mr. Anvil!", faceHero: "diningRoomNpcA" },
              { type: "battle", enemyId: "diningRoomBattle", arena: "dining-room" },
              { type: "addStoryFlag", flag: "diningRoomBattle"},
            ]
          },
        ]
      }),
      diningRoomNpcB: new Person({
        x: utils.withGrid(9),
        y: utils.withGrid(5),
        src: "/images/characters/people/lex.png",
        talking: [
          {
            events: [
              { type: "textMessage", text: "The irresistible force meets the immovable object.", faceHero: "diningRoomNpcB" },
            ]
          },
        ]
      }),
      diningRoomNpcC: new Person({
        x: utils.withGrid(2),
        y: utils.withGrid(8),
        src: "/images/characters/people/zoons.png",
        behaviorLoop: [
          { type: "stand", direction: "right", time: 800, },
          { type: "stand", direction: "down", time: 700, },
          { type: "stand", direction: "right", time: 800, },
        ],
        talking: [
          {
            events: [
              { type: "textMessage", text: "Some say they seen the Horsademus round these parts!", faceHero: "diningRoomNpcC" },
            ]
          },
        ]
      }),
      diningRoomNpcD: new Person({
        x: utils.withGrid(8),
        y: utils.withGrid(9),
        src: "/images/characters/people/npc1.png",
        behaviorLoop: [
          { type: "stand", direction: "right", time: 1200, },
          { type: "stand", direction: "down", time: 900, },
          { type: "stand", direction: "left", time: 800, },
          { type: "stand", direction: "down", time: 700, },
          { type: "stand", direction: "right", time: 400, },
          { type: "stand", direction: "up", time: 800, },
        ],
        talking: [
          {
            events: [
              { type: "textMessage", text: "What I'd like is for all you fat, greasy, low IQ, low lifes is to shut up and look at a real man!", faceHero: "diningRoomNpcD" },
            ]
          },
        ]
      }),
    },
    cutsceneSpaces: {
      [utils.asGridCoord(7,3)]: [
        {
          events: [
            {
              type: "changeMap",
              map: "Kitchen",
              x: utils.withGrid(5),
              y: utils.withGrid(10),
              direction: "up"
            }
          ]
        }
      ],
      [utils.asGridCoord(6,12)]: [
        {
          events: [
            {
              type: "changeMap",
              map: "Street",
              x: utils.withGrid(5),
              y: utils.withGrid(9),
              direction: "down"
            }
          ]
        }
      ],
    },
    walls: {
      [utils.asGridCoord(7,2)]: true,
      [utils.asGridCoord(6,13)]: true,
      [utils.asGridCoord(1,5)]: true,
      [utils.asGridCoord(2,5)]: true,
      [utils.asGridCoord(3,5)]: true,
      [utils.asGridCoord(4,5)]: true,
      [utils.asGridCoord(4,4)]: true,
      [utils.asGridCoord(5,3)]: true,
      [utils.asGridCoord(6,4)]: true,
      [utils.asGridCoord(6,5)]: true,
      [utils.asGridCoord(8,3)]: true,
      [utils.asGridCoord(9,4)]: true,
      [utils.asGridCoord(10,5)]: true,
      [utils.asGridCoord(11,5)]: true,
      [utils.asGridCoord(12,5)]: true,
      [utils.asGridCoord(11,7)]: true,
      [utils.asGridCoord(12,7)]: true,
      [utils.asGridCoord(2,7)]: true,
      [utils.asGridCoord(3,7)]: true,
      [utils.asGridCoord(4,7)]: true,
      [utils.asGridCoord(7,7)]: true,
      [utils.asGridCoord(8,7)]: true,
      [utils.asGridCoord(9,7)]: true,
      [utils.asGridCoord(2,10)]: true,
      [utils.asGridCoord(3,10)]: true,
      [utils.asGridCoord(4,10)]: true,
      [utils.asGridCoord(7,10)]: true,
      [utils.asGridCoord(8,10)]: true,
      [utils.asGridCoord(9,10)]: true,
      [utils.asGridCoord(1,12)]: true,
      [utils.asGridCoord(2,12)]: true,
      [utils.asGridCoord(3,12)]: true,
      [utils.asGridCoord(4,12)]: true,
      [utils.asGridCoord(5,12)]: true,
      [utils.asGridCoord(7,12)]: true,
      [utils.asGridCoord(8,12)]: true,
      [utils.asGridCoord(9,12)]: true,
      [utils.asGridCoord(10,12)]: true,
      [utils.asGridCoord(11,12)]: true,
      [utils.asGridCoord(12,12)]: true,
      [utils.asGridCoord(0,4)]: true,
      [utils.asGridCoord(0,5)]: true,
      [utils.asGridCoord(0,6)]: true,
      [utils.asGridCoord(0,8)]: true,
      [utils.asGridCoord(0,9)]: true,
      [utils.asGridCoord(0,10)]: true,
      [utils.asGridCoord(0,11)]: true,
      [utils.asGridCoord(13,4)]: true,
      [utils.asGridCoord(13,5)]: true,
      [utils.asGridCoord(13,6)]: true,
      [utils.asGridCoord(13,8)]: true,
      [utils.asGridCoord(13,9)]: true,
      [utils.asGridCoord(13,10)]: true,
      [utils.asGridCoord(13,11)]: true,
    }
  },
  WWF: {
    id: "WWF",
    lowerSrc: "/images/maps/DoinkLower.png",
    upperSrc: "/images/maps/DoinkUpper.png",
    gameObjects: {
      hero: new Person({
        isPlayerControlled: true,
        x: utils.withGrid(3),
        y: utils.withGrid(5),
      }),
      WWFNpcA: new Person({
        x: utils.withGrid(5),
        y: utils.withGrid(5),
        src: "/images/characters/people/uw.png",
        behaviorLoop: [
          { type: "stand", direction: "up", time: 400, },
          { type: "stand", direction: "left", time: 800, },
          { type: "stand", direction: "down", time: 400, },
          { type: "stand", direction: "left", time: 800, },
        ],
        talking: [
          {
            events: [
              { type: "textMessage", text: "Assume the controls, Smarks. SHOVE THAT CONTROL INTO A NOSEDIVE, SMARKS!", faceHero: "WWFNpcA" },
            ]
          }
        ]
      }),
      WWFNpcC: new Person({
        x: utils.withGrid(3),
        y: utils.withGrid(2),
        src: "/images/characters/people/herod.png",
        talking: [
          {
            required: ["Doink"],
            events: [ {type: "textMessage", faceHero:["WWFNpcC"], text: "The Clown is Down!"} ]
          },
          {
            events: [
              { type: "textMessage", text: "Open your mouth, close your eyes and wait for Doinks meaty surprise!", faceHero: "WWFNpcC" },
              { type: "battle", enemyId: "Doink", arena: "wwf-ring" },
              { type: "addStoryFlag", flag: "Doink"},
            ]
          }
        ]
      }),
    },
    cutsceneSpaces: {
      [utils.asGridCoord(3,6)]: [
        {
          events: [
            {
              type: "changeMap",
              map: "GreenKitchen",
              x: utils.withGrid(5),
              y: utils.withGrid(3),
              direction: "down"
            }
          ]
        }
      ],
    },
    walls: {
      [utils.asGridCoord(1,6)]: true,
      [utils.asGridCoord(2,6)]: true,
      [utils.asGridCoord(4,6)]: true,
      [utils.asGridCoord(5,6)]: true,
      [utils.asGridCoord(6,6)]: true,
      [utils.asGridCoord(6,5)]: true,
      [utils.asGridCoord(6.4)]: true,
      [utils.asGridCoord(6.3)]: true,
      [utils.asGridCoord(6,2)]: true,
      [utils.asGridCoord(6,1)]: true,
      [utils.asGridCoord(5,1)]: true,
      [utils.asGridCoord(4,1)]: true,
      [utils.asGridCoord(3,1)]: true,
      [utils.asGridCoord(2,1)]: true,
      [utils.asGridCoord(1,1)]: true,
      [utils.asGridCoord(1,2)]: true,
      [utils.asGridCoord(1,3)]: true,
      [utils.asGridCoord(1,4)]: true,
      [utils.asGridCoord(1,5)]: true,
      [utils.asGridCoord(2,2)]: true,
      [utils.asGridCoord(5,2)]: true,
      [utils.asGridCoord(7,2)]: true,
      [utils.asGridCoord(7,3)]: true,
      [utils.asGridCoord(7,4)]: true,
    }
  },
  Japan: {
    id: "Japan",
    lowerSrc: "/images/maps/JapanLower.png",
    upperSrc: "/images/maps/JapanUpper.png",
    gameObjects: {
      hero: new Person({
        isPlayerControlled: true,
        x: utils.withGrid(10),
        y: utils.withGrid(8),
      }),
      WWFNpcA: new Person({
        x: utils.withGrid(28),
        y: utils.withGrid(10),
        src: "/images/characters/people/zoons.png",
        behaviorLoop: [
          { type: "stand", direction: "up", time: 400, },
          { type: "stand", direction: "left", time: 800, },
          { type: "stand", direction: "down", time: 400, },
          { type: "stand", direction: "left", time: 800, },
        ],
        talking: [
          {
            events: [
              { type: "textMessage", text: "Samoa #1!", faceHero: "WWFNpcA" },
            ]
          }
        ]
      }),
      WWFNpcB: new Person({
        x: utils.withGrid(11),
        y: utils.withGrid(13),
        src: "/images/characters/people/erio.png",
        behaviorLoop: [
          { type: "stand", direction: "up", time: 900, },
          { type: "walk", direction: "down"},
          { type: "walk", direction: "down"},
          { type: "stand", direction: "right", time: 800, },
          { type: "stand", direction: "down", time: 400, },
          { type: "stand", direction: "right", time: 800, },
          { type: "walk", direction: "up"},
          { type: "walk", direction: "up"},
          { type: "stand", direction: "up", time: 600, },
          { type: "stand", direction: "right", time: 900, },
        ],
        talking: [
          {
            events: [
              { type: "textMessage", text: "Japan is a beautiful country full of great wrestling, watch out for Indy-Mudshows!", faceHero: "WWFNpcB" },
            ]
          }
        ]
      }),
      WWFNpcC: new Person({
        x: utils.withGrid(15),
        y: utils.withGrid(9),
        src: "/images/characters/people/bam2.png",
        talking: [
          {
            required: ["Bam"],
            events: [ {type: "textMessage", faceHero:["WWFNpcC"], text: "** Loud Screams **"} ]
          },
          {
            events: [
              { type: "textMessage", text: "Greetings from Asbury Park, bitch!", faceHero: "WWFNpcC" },
              { type: "battle", enemyId: "Bam", arena: "fmw-ring" },
              { type: "addStoryFlag", flag: "Bam"},
              
            ]
          }
        ]
       }),
        pizzaStone: new PizzaStone({
          x: utils.withGrid(22),
          y: utils.withGrid(16),
          storyFlag: "JAPAN-CITY",
          pizzas: ["DtC", "RF"],
      }),
    },
       cutsceneSpaces: {
      [utils.asGridCoord(5,14)]: [
        {
          events: [
            {
              type: "changeMap",
              map: "Street",
              x: utils.withGrid(33),
              y: utils.withGrid(10),
              direction: "left"
            }
          ]
        }
      ],
      [utils.asGridCoord(17,13)]: [
        {
          events: [
            {
              type: "changeMap",
              map: "JapH1",
              x: utils.withGrid(4),
              y: utils.withGrid(10),
              direction: "up"
            }
          ]
        }
      ],
      [utils.asGridCoord(33,10)]: [
        {
          events: [
            {
              type: "changeMap",
              map: "JapH2",
              x: utils.withGrid(4),
              y: utils.withGrid(10),
              direction: "up"
            }
          ]
        }
      ],
      [utils.asGridCoord(33,4)]: [
        {
          events: [
            {
              type: "changeMap",
              map: "JapH3",
              x: utils.withGrid(4),
              y: utils.withGrid(10),
              direction: "up"
            }
          ]
        }
      ],
      [utils.asGridCoord(18,5)]: [
        {
          events: [
            {
              type: "changeMap",
              map: "JapH4",
              x: utils.withGrid(4),
              y: utils.withGrid(7),
              direction: "up"
            }
          ]
        }
      ],
    },
    walls: {
      [utils.asGridCoord(5,5)]: true,
      [utils.asGridCoord(6,5)]: true,
      [utils.asGridCoord(7,5)]: true,
      [utils.asGridCoord(8,5)]: true,
      [utils.asGridCoord(9,5)]: true,
      [utils.asGridCoord(10,5)]: true,
      [utils.asGridCoord(11,5)]: true,
      [utils.asGridCoord(12,5)]: true,
      [utils.asGridCoord(13,5)]: true,
      [utils.asGridCoord(14,5)]: true,
      [utils.asGridCoord(15,5)]: true,
      [utils.asGridCoord(16,5)]: true,
      [utils.asGridCoord(17,5)]: true,
      [utils.asGridCoord(19,5)]: true,
      [utils.asGridCoord(20,5)]: true,
      [utils.asGridCoord(21,5)]: true,
      [utils.asGridCoord(22,5)]: true,
      [utils.asGridCoord(30,5)]: true,
      [utils.asGridCoord(31,5)]: true,
      [utils.asGridCoord(32,4)]: true,
      [utils.asGridCoord(34,4)]: true,
      [utils.asGridCoord(34,6)]: true,
      [utils.asGridCoord(29,6)]: true,
      [utils.asGridCoord(21,6)]: true,
      [utils.asGridCoord(13,7)]: true,
      [utils.asGridCoord(14,7)]: true,
      [utils.asGridCoord(16,7)]: true,
      [utils.asGridCoord(17,7)]: true,
      [utils.asGridCoord(21,7)]: true,
      [utils.asGridCoord(25,7)]: true,
      [utils.asGridCoord(26,7)]: true,
      [utils.asGridCoord(28,7)]: true,
      [utils.asGridCoord(29,7)]: true,
      [utils.asGridCoord(31,7)]: true,
      [utils.asGridCoord(32,7)]: true,
      [utils.asGridCoord(33,7)]: true,
      [utils.asGridCoord(7,8)]: true,
      [utils.asGridCoord(8,8)]: true,
      [utils.asGridCoord(13,8)]: true,
      [utils.asGridCoord(17,8)]: true,
      [utils.asGridCoord(22,8)]: true,
      [utils.asGridCoord(23,8)]: true,
      [utils.asGridCoord(24,8)]: true,
      [utils.asGridCoord(31,8)]: true,
      [utils.asGridCoord(31,9)]: true,
      [utils.asGridCoord(25,9)]: true,
      [utils.asGridCoord(24,9)]: true,
      [utils.asGridCoord(23,9)]: true,
      [utils.asGridCoord(22,9)]: true,
      [utils.asGridCoord(17,9)]: true,
      [utils.asGridCoord(13,9)]: true,
      [utils.asGridCoord(6,9)]: true,
      [utils.asGridCoord(9,9)]: true,
      [utils.asGridCoord(9,10)]: true,
      [utils.asGridCoord(13,10)]: true,
      [utils.asGridCoord(14,10)]: true,
      [utils.asGridCoord(16,10)]: true,
      [utils.asGridCoord(17,10)]: true,
      [utils.asGridCoord(22,10)]: true,
      [utils.asGridCoord(24,10)]: true,
      [utils.asGridCoord(25,10)]: true,
      [utils.asGridCoord(31,10)]: true,
      [utils.asGridCoord(32,10)]: true,
      [utils.asGridCoord(34,10)]: true,
      [utils.asGridCoord(18,11)]: true,
      [utils.asGridCoord(15,11)]: true,
      [utils.asGridCoord(13,11)]: true,
      [utils.asGridCoord(10,11)]: true,
      [utils.asGridCoord(10,12)]: true,
      [utils.asGridCoord(13,12)]: true,
      [utils.asGridCoord(19,12)]: true,
      [utils.asGridCoord(20,12)]: true,
      [utils.asGridCoord(23,12)]: true,
      [utils.asGridCoord(24,12)]: true,
      [utils.asGridCoord(25,12)]: true,
      [utils.asGridCoord(26,12)]: true,
      [utils.asGridCoord(27,12)]: true,
      [utils.asGridCoord(28,12)]: true,
      [utils.asGridCoord(29,12)]: true,
      [utils.asGridCoord(30,12)]: true,
      [utils.asGridCoord(32,12)]: true,
      [utils.asGridCoord(33,12)]: true,
      [utils.asGridCoord(6,13)]: true,
      [utils.asGridCoord(7,13)]: true,
      [utils.asGridCoord(8,13)]: true,
      [utils.asGridCoord(9,13)]: true,
      [utils.asGridCoord(10,13)]: true,
      [utils.asGridCoord(13,13)]: true,
      [utils.asGridCoord(15,13)]: true,
      [utils.asGridCoord(16,13)]: true,
      [utils.asGridCoord(18,13)]: true,
      [utils.asGridCoord(19,13)]: true,
      [utils.asGridCoord(20,13)]: true,
      [utils.asGridCoord(23,13)]: true,
      [utils.asGridCoord(25,13)]: true,
      [utils.asGridCoord(26,13)]: true,
      [utils.asGridCoord(27,13)]: true,
      [utils.asGridCoord(28,13)]: true,
      [utils.asGridCoord(30,13)]: true,
      [utils.asGridCoord(32,13)]: true,
      [utils.asGridCoord(33,13)]: true,
      [utils.asGridCoord(23,14)]: true,
      [utils.asGridCoord(24,14)]: true,
      [utils.asGridCoord(25,14)]: true,
      [utils.asGridCoord(28,14)]: true,
      [utils.asGridCoord(29,14)]: true,
      [utils.asGridCoord(30,14)]: true,
      [utils.asGridCoord(11,16)]: true,
      [utils.asGridCoord(12,16)]: true,
      [utils.asGridCoord(5,17)]: true,
      [utils.asGridCoord(6,17)]: true,
      [utils.asGridCoord(7,17)]: true,
      [utils.asGridCoord(8,17)]: true,
      [utils.asGridCoord(9,17)]: true,
      [utils.asGridCoord(10,17)]: true,
      [utils.asGridCoord(11,17)]: true,
      [utils.asGridCoord(12,17)]: true,
      [utils.asGridCoord(13,17)]: true,
      [utils.asGridCoord(14,17)]: true,
      [utils.asGridCoord(15,17)]: true,
      [utils.asGridCoord(16,17)]: true,
      [utils.asGridCoord(17,17)]: true,
      [utils.asGridCoord(18,17)]: true,
      [utils.asGridCoord(19,17)]: true,
      [utils.asGridCoord(20,17)]: true,
      [utils.asGridCoord(21,17)]: true,
      [utils.asGridCoord(22,17)]: true,
      [utils.asGridCoord(23,17)]: true,
      [utils.asGridCoord(24,17)]: true,
      [utils.asGridCoord(25,17)]: true,
      [utils.asGridCoord(26,17)]: true,
      [utils.asGridCoord(27,17)]: true,
      [utils.asGridCoord(28,17)]: true,
      [utils.asGridCoord(29,17)]: true,
      [utils.asGridCoord(30,17)]: true,
      [utils.asGridCoord(31,17)]: true,
      [utils.asGridCoord(32,17)]: true,
      [utils.asGridCoord(33,17)]: true,
      [utils.asGridCoord(34,17)]: true,
      [utils.asGridCoord(35,17)]: true,
      [utils.asGridCoord(35,5)]: true,
      [utils.asGridCoord(35,11)]: true,
      [utils.asGridCoord(35,12)]: true,
      [utils.asGridCoord(35,13)]: true,
      [utils.asGridCoord(35,14)]: true,
      [utils.asGridCoord(35,15)]: true,
      [utils.asGridCoord(35,16)]: true,
      [utils.asGridCoord(5,7)]: true, 
      [utils.asGridCoord(5,8)]: true, 
      [utils.asGridCoord(5,9)]: true, 
      [utils.asGridCoord(5,10)]: true,    
      [utils.asGridCoord(5,11)]: true, 
      [utils.asGridCoord(5,12)]: true,  
      [utils.asGridCoord(5,13)]: true, 
      [utils.asGridCoord(5,15)]: true, 
      [utils.asGridCoord(5,16)]: true, 
    }
  },
  JapH1: {
    id: "JapH1",
    lowerSrc: "/images/maps/SQI1Lower.png",
    upperSrc: "/images/maps/SQI1Upper.png",
    gameObjects: {
      hero: new Person({
        isPlayerControlled: true,
        x: utils.withGrid(4),
        y: utils.withGrid(10),
      }),
      JH1NpcA: new Person({
        x: utils.withGrid(9),
        y: utils.withGrid(9),
        src: "/images/characters/people/npc9.png",
        behaviorLoop: [
          { type: "stand", direction: "up", time: 400, },
          { type: "stand", direction: "left", time: 800, },
          { type: "stand", direction: "down", time: 400, },
          { type: "stand", direction: "left", time: 800, },
        ],
        talking: [
          {
            events: [
              { type: "textMessage", text: "You into ring rats, big boy?", faceHero: "JH1NpcA" },
            ]
          }
        ]
      }),
      JH1NpcB: new Person({
        x: utils.withGrid(4),
        y: utils.withGrid(3),
        src: "/images/characters/people/erio.png",
        talking: [
          {
            required: ["JapStreetBattle"],
            events: [ {type: "textMessage", faceHero:["JH1NpcB"], text: "** Speaks in Japanese disapointment. **"} ]
          },
          {
            events: [
              { type: "textMessage", text: "Its time to feel the golden shower from the Rainmaker.", faceHero: "JH1NpcB" },
              { type: "battle", enemyId: "JapStreetBattle", arena: "fmw-ring" },
              { type: "addStoryFlag", flag: "JapStreetBattle"},
            ]
          }
        ]
      }),
    },
    cutsceneSpaces: {
      [utils.asGridCoord(4,10)]: [
        {
          events: [
            {
              type: "changeMap",
              map: "Japan",
              x: utils.withGrid(17),
              y: utils.withGrid(13),
              direction: "down"
            }
          ]
        }
      ],
    },
    walls: {
      [utils.asGridCoord(1,10)]: true,
      [utils.asGridCoord(2,10)]: true,
      [utils.asGridCoord(3,10)]: true,
      [utils.asGridCoord(5,10)]: true,
      [utils.asGridCoord(6,10)]: true,
      [utils.asGridCoord(7,10)]: true,
      [utils.asGridCoord(8,10)]: true,
      [utils.asGridCoord(9,10)]: true,
      [utils.asGridCoord(10,10)]: true,
      [utils.asGridCoord(10,9)]: true,
      [utils.asGridCoord(10,8)]: true,
      [utils.asGridCoord(10,7)]: true,
      [utils.asGridCoord(10,6)]: true,
      [utils.asGridCoord(10,5)]: true,
      [utils.asGridCoord(10,4)]: true,
      [utils.asGridCoord(9,3)]: true,
      [utils.asGridCoord(10,2)]: true,
      [utils.asGridCoord(9,1)]: true,
      [utils.asGridCoord(8,1)]: true,
      [utils.asGridCoord(7,2)]: true,
      [utils.asGridCoord(6,2)]: true,
      [utils.asGridCoord(5,1)]: true,
      [utils.asGridCoord(4,1)]: true,
      [utils.asGridCoord(3,1)]: true,
      [utils.asGridCoord(2,1)]: true,
      [utils.asGridCoord(1,2)]: true,
      [utils.asGridCoord(2,3)]: true,
      [utils.asGridCoord(2,4)]: true,
      [utils.asGridCoord(2,5)]: true,
      [utils.asGridCoord(2,6)]: true,
      [utils.asGridCoord(2,7)]: true,
      [utils.asGridCoord(1,8)]: true,
      [utils.asGridCoord(1,9)]: true,
      [utils.asGridCoord(4,7)]: true,
      [utils.asGridCoord(5,7)]: true,
      [utils.asGridCoord(6,7)]: true,
      [utils.asGridCoord(7,7)]: true,
      [utils.asGridCoord(7,6)]: true,
      [utils.asGridCoord(7,5)]: true,
      [utils.asGridCoord(6,5)]: true,
      [utils.asGridCoord(5,5)]: true,
      [utils.asGridCoord(4,5)]: true,
      [utils.asGridCoord(4,6)]: true,
    }
  },
  JapH2: {
    id: "JapH2",
    lowerSrc: "/images/maps/SQI2Lower.png",
    upperSrc: "/images/maps/SQI1Upper.png",
    gameObjects: {
      hero: new Person({
        isPlayerControlled: true,
        x: utils.withGrid(4),
        y: utils.withGrid(10),
      }),
      JH2NpcA: new Person({
        x: utils.withGrid(7),
        y: utils.withGrid(3),
        src: "/images/characters/people/npc2.png",
        behaviorLoop: [
          { type: "stand", direction: "up", time: 400, },
          { type: "stand", direction: "left", time: 800, },
          { type: "stand", direction: "down", time: 400, },
          { type: "stand", direction: "left", time: 800, },
        ],
        talking: [
          {
            events: [
              { type: "textMessage", text: "I brought my piss jug!", faceHero: "JH2NpcA" },
            ]
          }
        ]
      }),
      JH2NpcB: new Person({
        x: utils.withGrid(5),
        y: utils.withGrid(5),
        src: "/images/characters/people/meltzer.png",
        talking: [
          {
            required: ["JapStreetBattle2"],
            events: [ {type: "textMessage", faceHero:["JH2NpcB"], text: "** Meltzer was defeated, and he never rated another match again. **"} ]
          },
          {
            events: [
              { type: "textMessage", text: "Cutting great promos, people investing in your character and overarching storylines DON'T matter in wrestling."}, 
               {type:"textMessage", text:"HAHAHAHA You fool! From the power of my racecar bed, I bestow upon thee negative 5 stars.", faceHero: "JH2NpcB" },
              { type: "battle", enemyId: "JapStreetBattle2", arena: "njpw-ring" },
              { type: "addStoryFlag", flag: "JapStreetBattle2"},
            ]
          }
        ]
      }),
    },
    cutsceneSpaces: {
      [utils.asGridCoord(4,10)]: [
        {
          events: [
            {
              type: "changeMap",
              map: "Japan",
              x: utils.withGrid(33),
              y: utils.withGrid(10),
              direction: "down"
            }
          ]
        }
      ],
    },
    walls: {
      [utils.asGridCoord(1,10)]: true,
      [utils.asGridCoord(2,10)]: true,
      [utils.asGridCoord(3,10)]: true,
      [utils.asGridCoord(5,10)]: true,
      [utils.asGridCoord(6,10)]: true,
      [utils.asGridCoord(7,10)]: true,
      [utils.asGridCoord(8,10)]: true,
      [utils.asGridCoord(9,10)]: true,
      [utils.asGridCoord(10,10)]: true,
      [utils.asGridCoord(10,9)]: true,
      [utils.asGridCoord(10,8)]: true,
      [utils.asGridCoord(10,7)]: true,
      [utils.asGridCoord(10,6)]: true,
      [utils.asGridCoord(10,5)]: true,
      [utils.asGridCoord(10,4)]: true,
      [utils.asGridCoord(9,3)]: true,
      [utils.asGridCoord(9,4)]: true,
      [utils.asGridCoord(10,2)]: true,
      [utils.asGridCoord(9,1)]: true,
      [utils.asGridCoord(8,1)]: true,
      [utils.asGridCoord(7,2)]: true,
      [utils.asGridCoord(6,2)]: true,
      [utils.asGridCoord(5,1)]: true,
      [utils.asGridCoord(4,1)]: true,
      [utils.asGridCoord(3,1)]: true,
      [utils.asGridCoord(2,1)]: true,
      [utils.asGridCoord(1,2)]: true,
      [utils.asGridCoord(2,3)]: true,
      [utils.asGridCoord(2,2)]: true,
      [utils.asGridCoord(1,8)]: true,
      [utils.asGridCoord(1,9)]: true,
      [utils.asGridCoord(5,2)]: true,
    }
  },
  JapH3: {
    id: "JapH3",
    lowerSrc: "/images/maps/SQI3Lower.png",
    upperSrc: "/images/maps/SQI1Upper.png",
    gameObjects: {
      hero: new Person({
        isPlayerControlled: true,
        x: utils.withGrid(4),
        y: utils.withGrid(10),
      }),
      JH3NpcB: new Person({
        x: utils.withGrid(5),
        y: utils.withGrid(5),
        src: "/images/characters/people/luis.png",
        talking: [
          {
            required: ["JapStreetBattle3"],
            events: [ {type: "textMessage", faceHero:["JH3NpcB"], text: "Your Tribal Chief acknowledges YOU!"} ]
          },
          {
            events: [
              { type: "textMessage", text: "Smarks, Acknowledge me!", faceHero: "JH3NpcB" },
              { type: "battle", enemyId: "JapStreetBattle3", arena: "njpw-ring" },
              { type: "addStoryFlag", flag: "JapStreetBattle3"},
            ]
          }
        ]
      }),
    },
    cutsceneSpaces: {
      [utils.asGridCoord(4,10)]: [
        {
          events: [
            {
              type: "changeMap",
              map: "Japan",
              x: utils.withGrid(33),
              y: utils.withGrid(4),
              direction: "down"
            }
          ]
        }
      ],
    },
    walls: {
      [utils.asGridCoord(1,10)]: true,
      [utils.asGridCoord(2,10)]: true,
      [utils.asGridCoord(3,10)]: true,
//entrance      [utils.asGridCoord(4,10)]: true,
      [utils.asGridCoord(5,10)]: true,
      [utils.asGridCoord(6,10)]: true,
      [utils.asGridCoord(7,10)]: true,
      [utils.asGridCoord(8,10)]: true,
      [utils.asGridCoord(9,10)]: true,
      [utils.asGridCoord(10,10)]: true,
      [utils.asGridCoord(10,9)]: true,
      [utils.asGridCoord(10,8)]: true,
      [utils.asGridCoord(10,7)]: true,
      [utils.asGridCoord(10,6)]: true,
      [utils.asGridCoord(10,5)]: true,
      [utils.asGridCoord(10,4)]: true,
      [utils.asGridCoord(10,3)]: true,      
      [utils.asGridCoord(10,2)]: true,
      [utils.asGridCoord(10,1)]: true,
      [utils.asGridCoord(1,1)]: true,
      [utils.asGridCoord(1,2)]: true,
      [utils.asGridCoord(1,3)]: true,
      [utils.asGridCoord(1,4)]: true,
      [utils.asGridCoord(1,5)]: true,
      [utils.asGridCoord(1,6)]: true,
      [utils.asGridCoord(1,7)]: true,
      [utils.asGridCoord(1,8)]: true,
      [utils.asGridCoord(1,9)]: true,
//interior add ons:
      [utils.asGridCoord(3,2)]: true,
      [utils.asGridCoord(4,2)]: true,
      [utils.asGridCoord(5,2)]: true,
      [utils.asGridCoord(6,2)]: true,
      [utils.asGridCoord(7,2)]: true,
      [utils.asGridCoord(8,2)]: true,
      [utils.asGridCoord(2,1)]: true,
      [utils.asGridCoord(3,1)]: true,
      [utils.asGridCoord(8,1)]: true,
      [utils.asGridCoord(9,1)]: true,
      [utils.asGridCoord(4,4)]: true,
      [utils.asGridCoord(7,7)]: true,
    }
  },
  JapH4: {
    id: "JapH4",
    lowerSrc: "/images/maps/SQI4Lower.png",
    upperSrc: "/images/maps/SQI1Upper.png",
    gameObjects: {
      hero: new Person({
        isPlayerControlled: true,
        x: utils.withGrid(7),
        y: utils.withGrid(4),
      }),
      JH3NpcB: new Person({
        x: utils.withGrid(9),
        y: utils.withGrid(4),
        src: "/images/characters/people/khan.png",
        talking: [
          {
            required: ["JapStreetBattle4"],
            events: [ {type: "textMessage", faceHero:["JH3NpcB"], text: "Meltzer gave me 5 Stars."} ]
          },
          {
            events: [
              { type: "textMessage", text: "Wanna join my army of over 200 wrestlers in AEW!?!?", faceHero: "JH3NpcB" },
              { type: "battle", enemyId: "JapStreetBattle4", arena: "njpw-ring" },
              { type: "addStoryFlag", flag: "JapStreetBattl43"},
            ]
          }
        ]
      }),
    },
    cutsceneSpaces: {
      [utils.asGridCoord(4,8)]: [
        {
          events: [
            {
              type: "changeMap",
              map: "Japan",
              x: utils.withGrid(18),
              y: utils.withGrid(5),
              direction: "down"
            }
          ]
        }
      ],
    },
    walls: {
      [utils.asGridCoord(1,8)]: true,
      [utils.asGridCoord(2,8)]: true,
      [utils.asGridCoord(3,8)]: true,
      [utils.asGridCoord(5,8)]: true,
      [utils.asGridCoord(6,8)]: true,
      [utils.asGridCoord(7,8)]: true,
      [utils.asGridCoord(8,8)]: true,
      [utils.asGridCoord(9,8)]: true,
      [utils.asGridCoord(10,8)]: true,
      [utils.asGridCoord(11,8)]: true,
      [utils.asGridCoord(12,8)]: true,
      [utils.asGridCoord(12,7)]: true,
      [utils.asGridCoord(12,6)]: true,
      [utils.asGridCoord(12,5)]: true,
      [utils.asGridCoord(12,4)]: true,
      [utils.asGridCoord(12,3)]: true,      
      [utils.asGridCoord(12,2)]: true,
      [utils.asGridCoord(12,1)]: true,
      [utils.asGridCoord(2,2)]: true,
      [utils.asGridCoord(3,2)]: true,
      [utils.asGridCoord(4,2)]: true,
      [utils.asGridCoord(5,2)]: true,
      [utils.asGridCoord(6,2)]: true,
      [utils.asGridCoord(7,2)]: true,
      [utils.asGridCoord(8,2)]: true,
      [utils.asGridCoord(9,2)]: true,
      [utils.asGridCoord(10,2)]: true,
      [utils.asGridCoord(11,2)]: true,
      [utils.asGridCoord(1,1)]: true,
      [utils.asGridCoord(1,2)]: true,
      [utils.asGridCoord(1,3)]: true,
      [utils.asGridCoord(1,4)]: true,
      [utils.asGridCoord(1,5)]: true,
      [utils.asGridCoord(1,6)]: true,
      [utils.asGridCoord(1,7)]: true,
    }
  },
}

let clicked = false
addEventListener('click', () => {
  if (!clicked) {
    audio.Map3.play()
    loop = true,
    clicked = true
  }
})