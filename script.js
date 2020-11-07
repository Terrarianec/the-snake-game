
const canvas = document.getElementById("field"),
    other = document.getElementById("other"),
    stats = document.getElementById("stats"),
    boxSize = 96,
    Width = Math.floor(window.innerWidth / boxSize) * boxSize,
    Height = Math.floor(window.innerHeight / boxSize) * boxSize,
    TPinBox = 16 //Количество пикселей на одну текстуру т.е. 1 пиксель текстуры = (boxSize / TPinBox)^2 обычных пикселей

canvas.width = Width
other.style.width = canvas.style.width = canvas.width + "px"
other.style.left = canvas.getBoundingClientRect().x + "px"

canvas.height = Height
other.style.height = canvas.style.height = canvas.height + "px"
other.style.top = canvas.getBoundingClientRect().y + "px"
const childs = [];

const ctx = canvas.getContext("2d");

let beforeClickAt = Date.now()
document.addEventListener('mouseup', (event) => {

    if (event.button === 0) {
        let AddTarget = () => {
            targets.add({
                x: Math.round((event.x - boxSize / 2) / boxSize), y: Math.round((event.y - boxSize / 2) / boxSize)
            });
            Base.AI = false;
            beforeClickAt = Date.now();
        }
        (beforeClickAt - Date.now() < 125)
            ? setTimeout(() => AddTarget(), beforeClickAt - Date.now())
            : AddTarget()
    } else if (event.button === 2) {
        Base.AI = true;
        return false;
    }
})
document.addEventListener('contextmenu', function (event) {
    event.preventDefault();
    return false;
}, false);
document.addEventListener("wheel", (event) => {
    result = FPS + (event.deltaY < 0 ? 1 : -1)
    FPS = (result <= 600 && result >= 0) ? (result) : result < 0 ? 2 : result > 600 ? 600 : 60 + Math.round(Math.random() * 540)
    Base.Interval = 1000 / FPS
    if (!targets.length) drawGame()
    clearInterval(Base.Timer)
    Base.Timer = setInterval(Frame, Base.Interval)
})

let FPS = 60

const Base = {
    Start: { x: 1, y: 1, direction: "right" },
    BodyLength: 1,
    Food: { x: Math.floor(Width / boxSize / 2), y: Math.floor(Height / boxSize / 2) },
    AI: false,
    Interval: 1000 / FPS,
    Win: false,
    Min: 0,
    Fastest: 0,
    LastStart: Date.now(),
    Timer: setInterval(Frame, 1000 / FPS),
},
    targets = new class extends Array {
        constructor(...args) {
            super(...args)
            this.limit = 25
            this.add = (Pos) => {
                this.push(Pos)
                if (this.length > this.limit) this.splice(0, this.length - this.limit)
            }
        }

    },
    Frames = new class extends Array {
        constructor(...args) {
            super(...args)
            this.limit = FPS
            this.add = (Time) => {
                this.push(Time)
                if (this.length > this.limit) this.splice(0, this.length - this.limit)
            }
            this._average = FPS
            this._counter = 0
        }
        get average() {
            this._counter++;
            return this._average = this.length > 0 && this._counter % (FPS / 4) === 0 ? (1000 / this.reduce((before, now, index) => before + index > 0 ? now - this[index - 1] : 0)).toFixed(1) : this._average
        }
    },
    actions = {
        "right": (snake) => {
            let will = snake.head.x + 1
            snake.head.direction = "right"
            snake.body.unshift({ x: snake.head.x, y: snake.head.y, direction: `${snake.head.direction}-${GetDirection(snake.head, snake.body)}` })
            snake.head.x = will >= Width / boxSize ? 0 : will
            if (Base.Food.x === snake.head.x && Base.Food.y === snake.head.y) { generateFood(); snake.body.push({ x: snake.tail.x, y: snake.tail.y, direction: `${snake.body[snake.body.length - 1]}-${snake.tail.direction}` }) }
            return snake
        },
        "left": (snake) => {
            let will = snake.head.x - 1
            snake.head.direction = "left"
            snake.body.unshift({ x: snake.head.x, y: snake.head.y, direction: `${snake.head.direction}-${GetDirection(snake.head, snake.body)}` })
            snake.head.x = will < 0 ? Width / boxSize - 1 : will
            if (Base.Food.x === snake.head.x && Base.Food.y === snake.head.y) { generateFood(); snake.body.push({ x: snake.tail.x, y: snake.tail.y, direction: `${snake.body[snake.body.length - 1]}-${snake.tail.direction}` }) }
            return snake
        },
        "down": (snake) => {
            let will = snake.head.y + 1
            snake.head.direction = "down"
            snake.body.unshift({ x: snake.head.x, y: snake.head.y, direction: `${snake.head.direction}-${GetDirection(snake.head, snake.body)}` })
            snake.head.y = will >= Height / boxSize ? 0 : will
            if (Base.Food.x === snake.head.x && Base.Food.y === snake.head.y) { generateFood(); snake.body.push({ x: snake.tail.x, y: snake.tail.y, direction: `${snake.body[snake.body.length - 1]}-${snake.tail.direction}` }) }
            return snake
        },
        "up": (snake) => {
            let will = snake.head.y - 1
            snake.head.direction = "up"
            snake.body.unshift({ x: snake.head.x, y: snake.head.y, direction: `${snake.head.direction}-${GetDirection(snake.head, snake.body)}` })
            snake.head.y = will < 0 ? Height / boxSize - 1 : will
            if (Base.Food.x === snake.head.x && Base.Food.y === snake.head.y) { generateFood(); snake.body.push({ x: snake.tail.x, y: snake.tail.y, direction: `${snake.body[snake.body.length - 1]}-${snake.tail.direction}` }) }
            return snake
        },
        "Nothng": (snake) => snake
    }

let snake = {
    head: Base.Start,
    body: [],
    tail: { x: Base.Start.x, y: Base.Start.y, direction: GetOpposite(Base.Start.direction) }
},
    beforePositions = {
        head: { x: -Base.Start.x, y: -Base.Start.y, direction: GetOpposite(Base.Start.direction) },
        tail: { x: -Base.Start.x, y: -Base.Start.y, direction: Base.Start.direction }
    }

if (!isFinite(Base.BodyLength) || Base.BodyLength > Width * Height / (boxSize ** 2) - 1) Base.BodyLength = Width * Height / (boxSize ** 2) - 1
for (let i = 0; i < Math.abs(Base.BodyLength); i++) snake.body.push({ x: Base.Start.x, y: Base.Start.y, direction: `${Base.Start.direction}-${GetOpposite(Base.Start.direction)}` })

function GetOpposite(direction) {
    return direction === "right"
        ? "left"
        : direction === "down"
            ? "up"
            : direction === "up"
                ? "down"
                : "right"
}

function GetDirection(head, body) {
    if (body.length === 0) return GetOpposite(head.direction)

    const diffX = Math.abs(head.x - body[0].x) > 1
        ? head.x - body[0].x > 0
            ? -1
            : 1
        : head.x - body[0].x,
        diffY = Math.abs(head.y - body[0].y) > 1
            ? head.y - body[0].y > 0
                ? -1
                : 1
            : head.y - body[0].y
    return diffX === 0
        ? diffY > 0
            ? "up"
            : "down"
        : diffX > 0
            ? "left"
            : "right"

}

function generateFood() {
    ctx.clearRect(Base.Food.x * boxSize, Base.Food.y * boxSize, boxSize, boxSize)
    let newFood = {},
        tries = 1
    for (; ;) {
        newFood = {
            x: Math.round(Math.random() * (Width) / boxSize),
            y: Math.round(Math.random() * (Height) / boxSize)
        },
            fullsnake = [snake.head].concat(snake.body, [snake.tail]).map(item => `${item.x}:${item.y}`).join("; ")
        if (fullsnake.includes(`${newFood.x}:${newFood.y}`) || newFood.x < 0 || newFood.y < 0 || newFood.x >= Width / boxSize || newFood.y >= Height / boxSize) {
            if (tries > 5) {
                if ((Base.Min < 2 ? 1e12 : Base.Min) > snake.body.length) Base.Min = snake.body.length;
                if ((Base.Fastest < 2 ? 1e12 : Base.Fastest) > Date.now() - Base.LastStart) Base.Fastest = Date.now() - Base.LastStart;
                Base.Win = true;
            }
            tries++
            continue
        }
        else break;
    }
    Base.Food = newFood
    Draw(PredrawFood(Base.Food))
}

function moveToTarget(target) {
    if (snake.head.x === target.x && snake.head.y === target.y || target.x >= Width / boxSize || target.y >= Height / boxSize || target.x < 0 || target.y < 0) { targets.shift(); drawGame(); return }
    let now = snake.head,
        difference = {
            x: [
                target.x - now.x,
                target.x + Width / boxSize + now.x ? target.x + Width / boxSize + now.x : Width / boxSize,
                target.x - Width / boxSize - now.x ? target.x - Width / boxSize - now.x : Width / boxSize
            ].sort((a, b) => Math.abs(a) - Math.abs(b))[0],
            y: [
                target.y - now.y,
                target.y + Height / boxSize + now.y ? target.y + Height / boxSize + now.y : Height / boxSize,
                target.y - Height / boxSize - now.y ? target.y - Height / boxSize - now.y : Height / boxSize
            ].sort((a, b) => Math.abs(a) - Math.abs(b))[0]
        }
    WayType = Math.round(Math.random() * 2)
    if (difference.x && WayType !== 1) {
        let action = difference.x > 0 ? "right" : "left"
        snake = actions[action](snake)
        let newTail = snake.body.pop()
        snake.tail = { x: newTail.x, y: newTail.y, direction: snake.body.length > 0 ? snake.body[snake.body.length - 1].direction.split("-")[1] : GetOpposite(snake.head.direction) }
    }
    if (difference.y && WayType > 0) {
        let action = difference.y > 0 ? "down" : "up"
        snake = actions[action](snake)
        let newTail = snake.body.pop()
        snake.tail = { x: newTail.x, y: newTail.y, direction: snake.body.length > 0 ? snake.body[snake.body.length - 1].direction.split("-")[1] : GetOpposite(snake.head.direction) }
    }
    //console.log(`{${snake.head.x}, ${snake.head.y} => ${snake.head.direction}} [${snake.body.map((item, index) => `${index}: {${item.x}, ${item.y} => ${item.direction}}`).join(" ")}] ${snake.tail ? `{${snake.tail.x}, ${snake.tail.y} => ${snake.tail.direction}}` : ""}`)
    drawGame()
}

function drawGame(start) {
    if (start) {
        ctx.clearRect(0, 0, canvas.width, canvas.height)

        Draw(PredrawFood(Base.Food));

        Draw(PredrawTail(snake.tail));

        for (let segment of snake.body) {
            Draw(PredrawBody(segment))
        }

        Draw(PredrawHead(snake.head));
    } else {
        let willRedraw = [],
            functions = {
                "head": PredrawHead,
                "body": PredrawBody,
                "tail": PredrawTail
            },
            wholeSnake = [{ x: snake.tail.x, y: snake.tail.y, direction: snake.tail.direction, type: "tail" }].concat(snake.body.map(segment => { return { x: segment.x, y: segment.y, direction: segment.direction, type: "body" } }), [{ x: snake.head.x, y: snake.head.y, direction: snake.head.direction, type: "head" }])
        if (beforePositions.tail.x !== snake.tail.x || beforePositions.tail.y !== snake.tail.y) {
            willRedraw.push({ x: snake.tail.x, y: snake.tail.y })
            willRedraw.push({ x: beforePositions.tail.x, y: beforePositions.tail.y })

            beforePositions.tail = { x: snake.tail.x, y: snake.tail.y, direction: snake.tail.direction }
        }
        if (beforePositions.head.x !== snake.head.x || beforePositions.head.y !== snake.head.y) {

            willRedraw.push({ x: snake.head.x, y: snake.head.y })
            willRedraw.push({ x: beforePositions.head.x, y: beforePositions.head.y })

            beforePositions.head = { x: snake.head.x, y: snake.head.y, direction: snake.head.direction }
        }
        willRedraw.forEach((coordinates) => {
            ctx.clearRect(coordinates.x * boxSize, coordinates.y * boxSize, boxSize, boxSize)
        })

        Draw(Unite(wholeSnake.filter(element => willRedraw.map(({ x, y }) => `${x}:${y}`).includes(`${element.x}:${element.y}`)).map(element => functions[element.type](element))))
    }
};

function Frame() {
    if (Base.Win) {
        Base.Win = false;
        snake = {
            head: { x: -1, y: -1, direction: "right" },
            body: [],
            tail: { x: -1, y: -1, direction: "left" }
        };
        return drawGame(true)
    }
    if (targets.length > 0) {
        moveToTarget(targets[0])
    } else if (Base.AI) targets.add(Base.Food)

    stats.innerHTML = `<a>Size: ${canvas.width}px x ${canvas.height}px // ${canvas.width / boxSize}vp x ${canvas.height / boxSize}vp (${canvas.width * canvas.height / (boxSize ** 2)}vp)</a><br />` +
        `<a>Score: ${snake.body.length}</a><br />` +
        (Base.Min === 0 ? "" : `<a>Min: ${Base.Min}</a><br />`) +
        (Base.Fastest === 0 ? "" : `<a>Fastest: ${Base.Fastest / 1000}s</a><br />`) +
        `<a>Average FPS: ${Frames.average}</a>`

    childs.forEach((child, index) => {
        let target = targets[index]
        targetElement = document.getElementsByClassName(`t${index}`)[0]
        if (!target) {
            targetElement.style.left = -2 * canvas.width + "px";
            targetElement.style.top = -2 * canvas.height + "px";
        } else {
            targetElement.style.left = (target.x + 0.125) * boxSize + "px"
            targetElement.style.top = (target.y + 0.125) * boxSize + "px"
        }
    })
    Frames.add(Date.now())
}

function GetConditions(direction) {
    let directions = {
        "right": { mirrorX: false, mirrorY: false, replace: false },
        "down": { mirrorX: false, mirrorY: true, replace: true },
        "left": { mirrorX: true, mirrorY: true, replace: false },
        "up": { mirrorX: true, mirrorY: false, replace: true }
    }
    return directions[direction]
}

function GetCoordinates(startPosition, X, Y, conditions) {
    const { mirrorX, mirrorY, replace } = conditions
    x = mirrorX ? TPinBox - 1 - X : X
    y = mirrorY ? TPinBox - 1 - Y : Y
    return { x: startPosition.x + (replace ? y : x) / TPinBox, y: startPosition.y + (replace ? x : y) / TPinBox }
}

function Unite(Dots) {
    return Dots.flat().filter((segment, index, array) => array.slice().reverse().findIndex(item => item.x === segment.x && item.y === segment.y) === array.length - 1 - index)
}

function Predraw(position, texture, colors, conditions = { mirrorX: false, mirrorY: false, replace: false }) {
    const Dots = [];
    let matchesColor = (symbol, index) => index === ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "A", "B", "C", "D", "E", "F"].indexOf(typeof symbol === "string" ? symbol.toUpperCase() : symbol.toString())
    colors.forEach((color, index) => {
        if (texture.length < TPinBox) for (let i = 0; i < (TPinBox - texture.length); i++) texture.push(" ".repeat(16))
        texture.forEach((y_line, ordinate) => {
            if (y_line.length < TPinBox) y_line1 = y_line + " ".repeat(TPinBox - y_line.length)
            else y_line1 = y_line
            y_line1.replace(/\s/g, "_").split("").forEach((x_elem, abscissa) => {
                if (matchesColor(x_elem, index)) {
                    const DotCoordinates = GetCoordinates(position, abscissa, ordinate, conditions)
                    Dots.push({ x: DotCoordinates.x, y: DotCoordinates.y, color })
                }
            })
        })
    })
    return Dots
}

function PredrawFood(food) {
    return Predraw(food, Textures.food.texture, Textures.food.colors)
}

function PredrawHead(head) {
    return Predraw(head, Textures.head.texture, Textures.head.colors, GetConditions(head.direction))
}

function PredrawBody(segment) {

    const directions = segment.direction.split("-"),
        previous = directions[0],
        next = directions[1],
        same = previous === next,
        opposite = GetOpposite(previous) === next,
        { colors } = Textures.body

    if (opposite) return Predraw(segment, Textures.body.straight, colors, GetConditions(previous))
    else if (same) return Predraw(segment, Textures.body.back, colors, GetConditions(previous))
    else {
        let directions = ["right", "down", "left", "up"],
            prev = directions.indexOf(previous) + 1,
            nxt = directions.indexOf(next) + 1,
            anticlockwise = prev - (nxt === 0 ? 4 : nxt) === 1 || prev - nxt === -3,
            coordinates = GetConditions(previous)

        return Predraw(segment, anticlockwise ? Textures.body.turn.slice().reverse() : Textures.body.turn, colors, coordinates)
    }

}

function PredrawTail(tail) {
    return Predraw(tail, Textures.tail.texture, Textures.tail.colors, GetConditions(tail.direction))
}

function Draw(Dots) {
    Dots.forEach(({ x, y, color }) => {
        ctx.fillStyle = color;
        ctx.fillRect(x * boxSize, y * boxSize, boxSize / TPinBox, boxSize / TPinBox)
    })

}

drawGame(true)

for (let n = 0; n < targets.limit; n++) {
    let child = document.createElement("div")
    let number = document.createElement("a")
    other.appendChild(child)
    child.appendChild(number)
    number.innerHTML = `#${n + 1}`
    child.style.position = "absolute"
    child.style.left = -2 * boxSize + "px"
    child.style.top = -2 * boxSize + "px"
    child.style.background = child.style.borderColor = "rgb(0, 0, 255)"
    child.classList.add(`target`)
    child.classList.add(`t${n}`)
    child.style.height = child.style.width = boxSize * 0.75 + "px"
    child.style.borderRadius = `50%`
    child.style.font = `bold ${Math.round(boxSize * 0.25)}px serif`
    childs.push(child)
}