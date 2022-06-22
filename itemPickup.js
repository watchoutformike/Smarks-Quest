class ItemPickup extends GameObject {
    constructor(config) {
      super(config)
  this.sprite = new Sprite({
        gameObject: this,
        src: "/images/characters/rigs.png",
        animations: {
          "used-down"   : [ [0,0] ],
          "unused-down" : [ [1,0] ],
        },
        currentAnimation: "used-down"
      });
      this.items = config.items;
  
      this.talking = [
        {
          required: [this.storyFlag],
          events: [
            { type: "textMessage", text: "You have already used this." },
          ]
        },
        {
          events: [
            { type: "craftingMenu", pizzas: this.items
   },
            { type: "addStoryFlag", flag: this.storyFlag },
          ]
        }
      ]
    }
  }
