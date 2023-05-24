const frameRate = 1000 / 30;
const canvas = { width: 1280, height: 720 };
const boxSize = 20;
const wallThickness = 20;
const gameImage = []
var callback

export function setPhysicsUpdateCallback(c) {
    callback = c
}

const entities = {
    boxes: [],
    walls: [
        Matter.Bodies.rectangle(
            canvas.width / 2, 0,
            canvas.width,
            wallThickness,
            { isStatic: true }
        ),
        Matter.Bodies.rectangle(
            0, canvas.height / 2,
            wallThickness,
            canvas.height,
            { isStatic: true }
        ),
        Matter.Bodies.rectangle(
            canvas.width,
            canvas.width / 2,
            wallThickness,
            canvas.width,
            { isStatic: true }
        ),
        Matter.Bodies.rectangle(
            canvas.width / 2,
            canvas.height,
            canvas.width,
            wallThickness,
            { isStatic: true }
        ),
    ]
};

export function showImage(gameImage, maxWidth) {
    // console.log('maxWidth')
    // console.log(maxWidth)
    // console.log('canvas.width')
    // console.log(canvas.width)

    var box = Matter.Bodies.rectangle(
        Math.random() * canvas.width,
        maxWidth,
        maxWidth,
        maxWidth,
    )

    entities.boxes.push(box)
    // gameImages.push(gameImage)
    Matter.Composite.add(engine.world, box);
}

const engine = Matter.Engine.create();
Matter.Composite.add(engine.world, Object.values(entities).flat());
// const toVertices = e => e.vertices.map(({ x, y }) => ({ x, y }));

setInterval(() => {
    Matter.Engine.update(engine, frameRate);
    callback({
        boxes: entities.boxes.map(toVertices),
        walls: entities.walls.map(toVertices)
      })
}, frameRate);

// io.emit("update state", {
//     boxes: entities.boxes.map(toVertices),
//     walls: entities.walls.map(toVertices)
//   });

export function showTitle() {
    entities.boxes.forEach(function (box) {
      Matter.Composite.remove(engine.world, box)
      entities.boxes = []
    })
  }