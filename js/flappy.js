function newElement(tagName, className) {
   const element = document.createElement(tagName)
   element.className = className
   return element
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
   this.setX = () => this.element.style.left = `${x}px`
   this.getWidth = () => this.element.clientWidth

   this.sortOpening()
   this.setX(x)
}

const b = new ParallelBars(700, 200, 400)
document.querySelector('[fb-flappy]').appendChild(b.element)