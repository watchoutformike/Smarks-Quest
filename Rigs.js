class Rigs extends GameObject {
    constructor(config) {
      super(config);
      this.sprite = new Sprite({
        gameObject: this,
        src: "/images/characters/rigs.png",
        animations: {
          "used-down"   : [ [0,0] ],
          "unused-down" : [ [1,0] ],
        },
        currentAnimation: "used-down"
      });
      this.storyFlag = config.storyFlag;
      this.actions = config.actions;
  
      this.talking = [
        {
          required: [this.storyFlag],
          events: [
            { type: "textMessage", text: "You have already used this." },
          ]
        },
        {
          events: [
            { type: "textMessage", text: "Time to put on some muscle... Choose your cycle." },
            { type: "craftingMenu2", actions: this.actions },
            { type: "addStoryFlag", flag: this.storyFlag },
          ]
        }
      ]
  
    }
  
    update() {
     this.sprite.currentAnimation = playerState.storyFlags[this.storyFlag]
      ? "used-down"
      : "unused-down";
    }
  
  }