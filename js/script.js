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

function GameOver(height, width) {
   this.element = newElement('div', 'game-over-board')

   const textTitle = newElement('h1', 'game-over-info')
   const textScore = newElement('p', 'game-over-info')
   const textHighScore = newElement('p', 'game-over-info')
   const textTryAgain = newElement('p', 'game-over-info')

   textTitle.innerHTML = 'GAME OVER'
   textTryAgain.innerHTML = 'Press any key to try again'

   this.element.appendChild(textTitle)
   this.element.appendChild(textScore)
   this.element.appendChild(textHighScore)
   this.element.appendChild(textTryAgain)

   this.setScores = (score, highScore) => {
      textScore.innerHTML = `Score: ${score}`
      textHighScore.innerHTML = `High Score: ${highScore}`
   }
}

function GameStart(height, width) {
   this.element = newElement('div', 'game-over-board')

   const title = newElement('h1', 'game-over-info')
   title.innerHTML = 'Press any key to start'

   this.element.appendChild(title)
}

function FlappyBird() {
   let score = 0
   let highScore = 0
   let isPlaying = false

   const gameArea = document.querySelector('[fb-flappy]')
   const height = gameArea.clientHeight
   const width = gameArea.clientWidth

   let gameStart = null
   let progress = null
   let barriers = null
   let bird = null
   let gameOver = null

   const initialize = () => {
      score = 0
      gameStart = new GameStart(height, width)
      progress = new Progress()
      barriers = new Barriers(height, width, 200, 400, () => {
         progress.updateScore(++score)
         if (score > highScore) {
            highScore = score
         }
      })
      bird = new Bird(height)
      gameOver = new GameOver(height, width)

      gameArea.appendChild(gameStart.element)
      gameArea.appendChild(progress.element)
      gameArea.appendChild(bird.element)
      barriers.pairs.forEach(pair => {
         gameArea.appendChild(pair.element)
      })
   }

   this.start = () => {
      initialize()
      window.onkeypress = e => {
         isPlaying = true
         gameStart.element.innerHTML = ''
      }

      const timer = setInterval(() => {
         if (isPlaying) {
            barriers.animate()
            bird.animate()

            if (verifyCollision(bird, barriers)) {
               isPlaying = false

               window.onkeyup = e => {
                  setTimeout(() => {
                     gameOver.setScores(score, highScore)
                     gameArea.appendChild(gameOver.element)

                     window.onkeyup = e => {
                        window.onkeyup = null
                        gameArea.innerHTML = ''
                        this.start()
                     }
                  }, 200)
               }

               window.onkeypress = null

               clearInterval(timer)
            }
         }
      }, 20)
   }
}

new FlappyBird().start()