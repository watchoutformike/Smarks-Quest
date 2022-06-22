window.Actions = {
  damage1: {
    name: "Sweet Chin Music!",
    description: "Michaels is tuning up the band!",
    success: [
      { type: "textMessage", text: "{CASTER} uses {ACTION}!"},
      { type: "animation", animation: "spin"},
      { type: "stateChange", damage: 10},
    ]
  },
  damage2: {
    name: "Torture Rack!",
    description: "The Total Package has em Racked!",
    success: [
      { type: "textMessage", text: "{CASTER} uses {ACTION}!"},
      { type: "animation", animation: "spin"},
      { type: "stateChange", damage: 20}
    ]
  },
  damage3: {
    name: "Stone Cold Stunner!",
    description: "And thats the bottom line",
    success: [
      { type: "textMessage", text: "{CASTER} uses {ACTION}!"},
      { type: "animation", animation: "spin"},
      { type: "stateChange", damage: 15}
    ]
  },
  damage4: {
    name: "Scorpion Death Drop!",
    description: "This is Sting!",
    success: [
      { type: "textMessage", text: "{CASTER} uses {ACTION}!"},
      { type: "animation", animation: "spin"},
      { type: "stateChange", damage: 15}
    ]
  },
  damage5: {
    name: "Scorpion Deathlock!",
    description: "Sting is going to make him tap!",
    success: [
      { type: "textMessage", text: "{CASTER} uses {ACTION}!"},
      { type: "animation", animation: "spin"},
      { type: "stateChange", damage: 10}
    ]
  },
  damage6: {
    name: "Razors Edge!",
    description: "The Bad Guy has them up!",
    success: [
      { type: "textMessage", text: "{CASTER} uses {ACTION}!"},
      { type: "animation", animation: "spin"},
      { type: "stateChange", damage: 20}
    ]
  },
  damage7: {
    name: "Figure Four!",
    description: "The Nature Boy has him locked up",
    success: [
      { type: "textMessage", text: "{CASTER} uses {ACTION}!"},
      { type: "animation", animation: "spin"},
      { type: "stateChange", damage: 10}
    ]
  },
  damage8: {
    name: "Harlem Hangover!",
    description: "Can you dig it",
    success: [
      { type: "textMessage", text: "{CASTER} uses {ACTION}!"},
      { type: "animation", animation: "spin"},
      { type: "stateChange", damage: 13}
    ]
  },
  saucyStatus: {
    name: "Hulking Up",
    description: "HOOF",
    targetType: "friendly",
    success: [
      { type: "textMessage", text: "{CASTER} uses {ACTION}!"},
      { type: "stateChange", status: { type: "adrenaline", expiresIn: 3 } },
    ]
  },
  clumsyStatus: {
    name: "Outside Interference",
    description: "What is the ref looking at?",
    success: [
      { type: "textMessage", text: "{CASTER} uses {ACTION}!"},
      { type: "animation", animation: "glob", color: "#dafd2a" },
      { type: "stateChange", status: { type: "clumsy", expiresIn: 3 } },
      { type: "textMessage", text: "{TARGET} is slipping all around!"},
    ]
  },
  //Items
  item_recoverStatus: {
    name: "Gimmick",
    description: "Fanny Pack",
    targetType: "friendly",
    success: [
      { type: "textMessage", text: "{CASTER} uses a {ACTION}!"},
      { type: "stateChange", recover: 40, },
      { type: "textMessage", text: "Feeling fresh!", },
    ]
  },
  item_recoverHp: {
    name: "Rigs",
    targetType: "friendly",
    success: [
      { type:"textMessage", text: "{CASTER} uses {ACTION}!", },
      { type:"stateChange", recover: 20, },
      { type:"textMessage", text: "{CASTER} recovers HP!", },
    ]
  },
  item_rage: {
    name: "Roid Rage",
    targetType: "enemy",
    success: [
      { type:"textMessage", text: "{CASTER} uses {ACTION}!", },
      { type:"stateChange", damage: 35, },
      { type:"textMessage", text: "{CASTER} is on the Gas!", },
    ]
  },
}