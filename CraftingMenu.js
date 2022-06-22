class CraftingMenu {
  constructor({ pizzas, onComplete}) {
    this.pizzas = pizzas;
    this.onComplete = onComplete;
  }
 update() {
    this.sprite.currentAnimation = playerState.storyFlags[this.storyFlag]
     ? "used-down"
     : "unused-down";
   }
  getOptions() {
    return this.pizzas.map(id => {
      const base = Pizzas[id];
      return {
        label: base.name,
        description: base.description,
        handler: () => {
          playerState.addPizza(id);
          this.close();
        }
      }
    })
  }

  createElement() {
    this.element = document.createElement("div");
    this.element.classList.add("CraftingMenu");
    this.element.classList.add("overlayMenu");
    this.element.innerHTML = (`
      <h2>Choose a Wrestler</h2>
    `)
  }

  close() {
    this.keyboardMenu.end();
    this.element.remove();
    this.onComplete();
  }


  init(container) {
    this.createElement();
    this.keyboardMenu = new KeyboardMenu({
      descriptionContainer: container
    })
    this.keyboardMenu.init(this.element)
    this.keyboardMenu.setOptions(this.getOptions())

    container.appendChild(this.element);
  }
}
