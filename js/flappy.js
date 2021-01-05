function newElement(tagName, className) {
   const element = document.createElement(tagName)
   element.className = className
   return element
}


function isOverlapping(elementA, elementB) {
   const a = elementA.getBoundingClientRect()
   const b = elementB.getBoundingClientRect()

   const horizontal = a.left + a.width >= b.left && b.left + b.width >= a.left
   const vertical = a.top + a.height >= b.top && b.top + b.height >= a.top

   return horizontal && vertical
}

function verifyCollision(bird, barriers) {
   let isColliding = false
   barriers.pairs.forEach(pair => {
      if (!isColliding) {
         const top = pair.topBarrier.element
         const bottom = pair.bottomBarrier.element

         isColliding = isOverlapping(bird.element, bottom) || isOverlapping(bird.element, top)
      }
   })

   return isColliding
}


function Barrier(reverse = false) {
   const border = newElement('div', 'border')
   const body = newElement('div', 'body')

   this.element = newElement('div', 'barrier')
   this.element.appendChild(reverse ? body : border)
   this.element.appendChild(reverse ? border : body)

   this.setHeight = height => body.style.height = `${height}px`
}

function ParallelBars(height, opening, x) {
   this.element = newElement('div', 'parallel-bars')

   this.topBarrier = new Barrier(true)
   this.bottomBarrier = new Barrier(false)

   this.element.appendChild(this.topBarrier.element)
   this.element.appendChild(this.bottomBarrier.element)

   this.sortOpening = () => {
      const topHeight = Math.random() * (height - opening)
      const bottomHeight = height - opening - topHeight

      this.topBarrier.setHeight(topHeight)
      this.bottomBarrier.setHeight(bottomHeight)
   }

   this.getX = () => parseInt(this.element.style.left.split('px')[0])
   this.setX = (x) => this.element.style.left = `${x}px`
   this.getWidth = () => this.element.clientWidth

   this.sortOpening()
   this.setX(x)
}

function Barriers(height, width, opening, space, notifyScore) {
   this.pairs = [
      new ParallelBars(height, opening, width),
      new ParallelBars(height, opening, width + space),
      new ParallelBars(height, opening, width + space * 2),
      new ParallelBars(height, opening, width + space * 3)
   ]

   const displacement = 3

   this.animate = () => {
      this.pairs.forEach(pair => {
         pair.setX(pair.getX() - displacement)

         if (pair.getX() < -pair.getWidth()) {
            pair.setX(pair.getX() + space * this.pairs.length)
            pair.sortOpening()
         }

         const middle = width / 2
         const crossMiddle = pair.getX() + displacement >= middle && pair.getX() < middle

         if (crossMiddle) {
            notifyScore()
         }
      })
   }
}

function Bird(gameHeight) {
   let isFlying = false

   this.element = newElement('img', 'bird')
   this.element.src = 'imgs/flappy-bird.png'

   this.getY = () => parseInt(this.element.style.bottom.split('px')[0])
   this.setY = y => this.element.style.bottom = `${y}px`

   window.onkeydown = e => isFlying = true
   window.onkeyup = e => isFlying = false

   this.animate = () => {
      const toUp = 8
      const toDown = -5

      const newY = this.getY() + (isFlying ? toUp : toDown)
      const maxHeight = gameHeight - this.element.clientHeight

      if (newY < 0) {
         this.setY(0)
      } else if (newY >= maxHeight) {
         this.setY(maxHeight)
      } else {
         this.setY(newY)
      }
   }

   this.setY(gameHeight / 2)
}

function Progress() {
   this.element = newElement('span', 'progress')
   this.updateScore = score => {
      this.element.innerHTML = score
   }
   this.updateScore(0)
}

function FlappyBird() {
   let score = 0

   const gameArea = document.querySelector('[fb-flappy]')
   const height = gameArea.clientHeight
   const width = gameArea.clientWidth

   const progress = new Progress()
   const barriers = new Barriers(height, width, 200, 400, () => {
      progress.updateScore(++score)
   })
   const bird = new Bird(height)

   gameArea.appendChild(progress.element)
   gameArea.appendChild(bird.element)
   barriers.pairs.forEach(pair => {
      gameArea.appendChild(pair.element)
   })

   this.start = () => {
      const timer = setInterval(() => {
         barriers.animate()
         bird.animate()

         if (verifyCollision(bird, barriers)) {
            clearInterval(timer)
         }
      }, 20)
   }
}

new FlappyBird().start()