var LevelPackOne = [
  {
    levelId: 1,
    ritualLength: 3,
    shapeConstraints: [
      { kind: 'polygon', numSides: { min: 3, max: 6 } }
    ],
    numShapes: 10,
    sizeFactor: 1,
    speedFactor: 0.25,
    spinFactor: 0,
    timeLimit: 20,
    hideIcons: false
  },
  {
    levelId: 2,
    ritualLength: 3,
    shapeConstraints: [
      { kind: 'polygon', numSides: { min: 3, max: 8 } }
    ],
    numShapes: 10,
    sizeFactor: 0.8,
    speedFactor: 0.35,
    spinFactor: 0,
    timeLimit: 15,
    hideIcons: false
  },
  {
    levelId: 3,
    ritualLength: 3,
    shapeConstraints: [
      { kind: 'polygon', numSides: { min: 3, max: 8 } }
    ],
    numShapes: 12,
    sizeFactor: 0.8,
    speedFactor: 0.35,
    spinFactor: 0.25,
    timeLimit: 10,
    hideIcons: false
  },
  {
    levelId: 4,
    ritualLength: 3,
    shapeConstraints: [
      { kind: 'icon', families: [ 'food' ] }
    ],
    numShapes: 12,
    sizeFactor: 0.8,
    speedFactor: 0.35,
    spinFactor: 0,
    timeLimit: 20,
    hideIcons: false
  },
  {
    levelId: 5,
    ritualLength: 4,
    shapeConstraints: [
      { kind: 'icon', families: [ 'food' ] }
    ],
    numShapes: 15,
    sizeFactor: 0.8,
    speedFactor: 0.35,
    spinFactor: 0.25,
    timeLimit: 15,
    hideIcons: false
  },
  {
    levelId: 6,
    ritualLength: 4,
    shapeConstraints: [
      { kind: 'icon', families: [ 'food' ] }
    ],
    numShapes: 20,
    sizeFactor: 0.7,
    speedFactor: 0.55,
    spinFactor: 0.45,
    timeLimit: 12,
    hideIcons: false
  },
  {
    levelId: 7,
    ritualLength: 3,
    shapeConstraints: [
      { kind: 'icon', families: [ 'astrology' ] }
    ],
    numShapes: 12,
    sizeFactor: 0.8,
    speedFactor: 0.35,
    spinFactor: 0,
    timeLimit: 15,
    hideIcons: false
  },
  { levelId: 8,
    ritualLength: 4,
    shapeConstraints: [
      { kind: 'icon', families: [ 'astrology' ] }
    ],
    numShapes: 12,
    sizeFactor: 0.8,
    speedFactor: 0.35,
    spinFactor: 0.25,
    timeLimit: 12,
    hideIcons: false
  },
  {
    levelId: 9,
    ritualLength: 4,
    shapeConstraints: [
      { kind: 'icon', families: [ 'astrology' ] }
    ],
    numShapes: 18,
    sizeFactor: 0.7,
    speedFactor: 0.45,
    spinFactor: 0.45,
    timeLimit: 10,
    hideIcons: false
  },
  {
    levelId: 10,
    ritualLength: 5,
    shapeConstraints: [
      { kind: 'polygon', numSides: { min: 3, max: 8 } },
      { kind: 'icon', families: [ 'astrology', 'food' ] }
    ],
    numShapes: 20,
    sizeFactor: 0.7,
    speedFactor: 0.35,
    spinFactor: 0.5,
    timeLimit: 10,
    hideIcons: false
  }
];
