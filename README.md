## Dots and Boxes

Project goal is to create markdown like simple language and visualizer for graph and number algorithms 
and other simple animations visualizing your raw ideas. Dots and boxes is a *HTML5 custom element* you can add to your page with code 
attribute defining dots and boxes and action (animation) steps.

Project was highly inspired by [mermaid.js](https://mermaid.js.org/) project, although it has very different goals

#### Use cases
- visualize bubble sort algorithm
- event driven architecture communication visualization
- visualize common request response pattern 

## How to use it

Just insert source script below reference and declare dots and boxes custom tag 

eg.

```html
<script src="insert_url_here"></script>
<dots-and-boxes style="margin:20px;height: 400px; width: 600px;" color="white" code="
   title: sort with bubble sort
   box id: win at: -255, -25 size: (100, 50) color: rgba(254,193,7,0.6) visible: false
   dots ids: 1 2 3 5 4 at: -120, 0 size: 20
   step: '(0)' duration: 750
   2 -> +(50,250)
   2 -> +(150,-250)
   step: '(1) select first two numbers'  duration: 2750
   win <- visible: true,  win -> +(110,0)
   2 <-> 1, 1 -> +(0,100)
   step: '(2) swap if left bigger'
   2 <-> 1 // swap dot 2 with 1
   2 -> +(50,0)
   step: '(3) select next two numbers'
   win -> +(50,0) // move window by 50px right
   step: '(4) ignore if left is smaller'
   win -> +(50,0)
   step: '(4) again swap if left bigger'
   5 <-> 3
   step: '(5) bla bla'
   win -> +(50,0)
   step: 'repeat from start'
   win -> -(150,0)
</dots-and-boxes>
```

## Development

### Run in dev mode

```shell
npm run dev
```

### Build from source code

```shell
npm run build
```

### Test

```shell
npm run test
```

## DABL - (D)ots (A)nd (B)oxes (L)anguage

**DABL** allows to declare controls like dots and boxes
and actions like move or swap grouped in steps to make simple animations

In a typical **DABL* program first you define controls like dots and boxes 
and then number of steps affecting their state e.g. changing their position or color

### define a dot

Dot is the simplest thing you can show with Dots and Boxes language. 
It draws the control a dot
e.g.

```dabl
dot color: fred text: 'd1' size: 20
```
### define a box

```dabl
box color: fred text: 'a text in a box' size: (20,200), visible: true
```
### steps and actions

Whenever you want to change any control property you need to take an action. Actions are grouped in steps.

So the simple step could look like this:

```text
step: 'this is my step' 2s
myBox -> (100,50)
```
Above step has title and takes 2s to run. It consists of one Action moving control *myBox to position 100 50

Below we define possible action types.

Action types

#### move control to point 

> x -> (x,y)

Move action, moves control to point at position x, y

e.g. moving control a1 to point at position (x,y) 56, 160 would be:

> a1 -> (56,150)

"+" and "-" makes move relative e.g.

> a1 -> +(50,-10)

last option is moving to other control's location

> a1 -> b1

 
#### swap controls

> c1 <-> c2

swaps c1 and c2 position 

#### clone control
e.g.
> c1 *-> new_c1

clones control c1 and creates a new one with id new_c1

#### assign value

> c1 <- text: 'new text' visible: true

Assigns one or more property to control

text property is used by default, so you can omit 'text' property name 
> c2 <- 'my new text'

### <dots-and-boxes> tag attributes

#### Supported attributes

**controls**  - show controls menu

**autoplay** - starts fast-forward on load

**keyboard** - left and right arrow does backward and forward respectively

## credits

- [Easing functions](https://gizma.com/easing/)
- [Prism.js - code highlighting](https://prismjs.com/)
- [mermaid.js](https://mermaid.js.org/) 