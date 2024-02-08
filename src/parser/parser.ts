import {Scanner} from "./scanner.ts"
import {DotsAndBoxesModel, Step} from "../shared/step.ts"
import {TokenType} from "./tokenType.ts"
import {Token} from "./token.ts"
import {Point} from "../shared/point.ts"
import {BoxControl} from "../controls/box/boxControl.ts"
import {DotControl} from "../controls/dot/dotControl.ts"
import {ActionBase} from "../shared/actionBase.ts"
import {Move} from "../actions/move.ts"
import {Swap} from "../actions/swap.ts"
import {Clone} from "../actions/clone.ts"
import {Sign} from "../shared/sign.ts"
import {BLACK, COLORS, WHITE} from "../shared/constants.ts"
import {Assign} from "../actions/assign.ts"
import {Keywords} from "./keywords.ts"
import {CameraMove} from "../actions/cameraMove.ts";
import {LineControl} from "../controls/line/lineControl.ts";
import {Layout} from "../shared/layout.ts";

export class Parser {
    scanner = new Scanner()
    model = Parser.newModel()
    position = 0
    tokens: Token[] = []

    static newModel(): DotsAndBoxesModel {
        return new DotsAndBoxesModel('', [], [])
    }

    public eof(): boolean {
        return this.tokens.length <= this.position
    }

    public advance(): Token {
        return this.tokens[this.position++]
    }

    public peek(): Token {
        return this.tokens[this.position]
    }

    public parse(source: string): DotsAndBoxesModel {
        this.model = Parser.newModel()
        this.tokens = this.scanner.scan(source)
        while (this.position < this.tokens.length) {
            const token = this.advance()
            switch (token.type) {
                case TokenType.TITLE:
                    this.title()
                    break
                case TokenType.BOX:
                    this.box()
                    break
                case TokenType.DOT:
                    this.dot()
                    break
                case TokenType.LINE:
                    this.line()
                    break
                case TokenType.DOTS:
                    this.dots()
                    break
                case TokenType.STEPS:
                    this.steps()
                    break
            }
        }

        return this.model
    }

    box() {
        const box_tokens: Array<TokenType> = [TokenType.ID, TokenType.SIZE, TokenType.AT, TokenType.TEXT, TokenType.COLOR, TokenType.VISIBLE, TokenType.SELECTED]
        let size = new Point(100, 100)
        let at = new Point(0, 0)
        let text = ''
        let id = null
        let color = WHITE
        let visible = true
        let selected = false
        while (!this.eof() && box_tokens.includes(this.peek().type)) {
            const token = this.advance()
            switch (token.type) {
                case TokenType.ID:
                    id = this.propertyControlId()
                    break
                case TokenType.TEXT:
                    text = this.text()
                    break
                case TokenType.AT:
                    at = this.at()
                    break
                case TokenType.SIZE:
                    size = this.sizePoint()
                    break
                case TokenType.COLOR:
                    color = this.color()
                    break
                case TokenType.VISIBLE:
                    visible = this.visible()
                    break
                case TokenType.SELECTED:
                    selected = this.selected()
                    break
            }
        }
        if (id == null && text == '') {
            id = 'b' + this.model.controls.length
        }
        const box = new BoxControl(id != null ? id : text, at, size, color, text, visible, selected)
        this.model.controls.push(box)
        if (box.selected) {
            this.model.selectedControls.push(box)
        }
    }

    line() {
        const line_tokens: Array<TokenType> = [TokenType.ID, TokenType.END, TokenType.AT, TokenType.WIDTH, TokenType.COLOR, TokenType.VISIBLE, TokenType.SELECTED]
        let end = new Point(100, 100)
        let at = new Point(0, 0)
        let width = 1
        let id = null
        let color = BLACK
        let visible = true
        let selected = false
        while (!this.eof() && line_tokens.includes(this.peek().type)) {
            const token = this.advance()
            switch (token.type) {
                case TokenType.ID:
                    id = this.propertyControlId()
                    break
                case TokenType.AT:
                    at = this.at()
                    break
                case TokenType.END:
                    end = this.end()
                    break
                case TokenType.WIDTH:
                    width = this.width()
                    break
                case TokenType.COLOR:
                    color = this.color()
                    break
                case TokenType.VISIBLE:
                    visible = this.visible()
                    break
                case TokenType.SELECTED:
                    selected = this.selected()
                    break
            }
        }
        if (id == null) {
            id = 'l' + this.model.controls.length
        }
        const line = new LineControl(id, at, end, width, color, visible, selected)
        this.model.controls.push(line)
        if (line.selected) {
            this.model.selectedControls.push(line)
        }
    }

    dots() {
        const dots_tokens: Array<TokenType> = [TokenType.SIZE, TokenType.AT, TokenType.IDS]
        let size = 20
        let at = new Point(0, 0)
        let text = ''
        let id = ''
        let ids: string[] = []

        let layout = Layout.COL //todo support more layouts
        while (!this.eof() && dots_tokens.includes(this.peek().type)) {
            const token = this.advance()
            switch (token.type) {
                case TokenType.ID:
                    id = this.propertyControlId()
                    break
                case TokenType.AT:
                    at = this.at()
                    break
                case TokenType.SIZE:
                    size = this.size()
                    break
                case TokenType.IDS:
                    ids = this.ids()
                    break
            }
        }
        if (ids.length == 0) {
            throw new Error(`data attribute is mandatory for dots at ${this.peek().position}`)
        }
        let span = size * 2 + 10 //todo support explicit span
        let i = 0;
        for (id of ids) {
            let position = at.clone()
            if (layout === Layout.COL) {
                position.x += i * span
            }
            let color = COLORS[this.model.controls.length % COLORS.length]
            const dot = new DotControl(id != '' ? id : text, position, size, color, text != '' ? text : id, true, false)
            this.model.controls.push(dot)
            if (dot.selected) {
                this.model.selectedControls.push(dot)
            }
            i++
        }
    }

    dot() {
        const dot_tokens: Array<TokenType> = [TokenType.ID, TokenType.SIZE, TokenType.AT, TokenType.TEXT, TokenType.COLOR, TokenType.VISIBLE, TokenType.SELECTED]
        let size = 20
        let at = new Point(0, 0)
        let text = ''
        let id = ''
        let color = COLORS[this.model.controls.length % COLORS.length]
        let visible = true
        let selected = false
        while (!this.eof() && dot_tokens.includes(this.peek().type)) {
            const token = this.advance()
            switch (token.type) {
                case TokenType.ID:
                    id = this.propertyControlId()
                    break
                case TokenType.TEXT:
                    text = this.text()
                    break
                case TokenType.COLOR:
                    color = this.color()
                    break
                case TokenType.AT:
                    at = this.at()
                    break
                case TokenType.SIZE:
                    size = this.size()
                    break
                case TokenType.VISIBLE:
                    visible = this.visible()
                    break
                case TokenType.SELECTED:
                    selected = this.selected()
                    break
            }
        }
        if (id == '' && text == '') {
            id = 'd' + this.model.controls.length
        }
        const dot = new DotControl(id != '' ? id : text, at, size, color, text != '' ? text : id, visible, selected)
        this.model.controls.push(dot)
        if (dot.selected) {
            this.model.selectedControls.push(dot)
        }
    }

    text(): string {
        this.expectColon()
        if (this.peek().type == TokenType.STRING) {
            return this.advance().value
        }
        let result = ''
        while (this.peek().type == TokenType.IDENTIFIER) {
            const token = this.advance()
            result += ' ' + token.value.toString()
        }
        return result.trim()
    }

    color(): string {
        this.expectColon()
        let result = ''
        if (this.peek().type == TokenType.IDENTIFIER) {
            let token = this.advance()
            result += token.value
            if (this.match(TokenType.LEFT_BRACKET)) {
                result += '('
                result += this.number().toString()
                while (this.match(TokenType.COMMA)) {
                    result += ','
                    result += this.number().toString()
                }
                if (this.match(TokenType.RIGHT_BRACKET)) {
                    result += ')'
                } else {
                    throw new Error(`Expected closing bracket at ${this.peek().position} got token ${this.peek().value} instead`)
                }
            }
        }
        return result
    }

    at() {
        this.expectColon()
        return this.point()
    }

    end() {
        this.expectColon()
        return this.point()
    }

    size(): number {
        this.expectColon()
        return this.number()
    }

    sizePoint(): Point {
        this.expectColon()
        return this.point()
    }

    width() {
        this.expectColon()
        return this.number()
    }

    expectColon(){
        if (!this.match(TokenType.COLON)) {
            throw new Error(`Expected colon at ${this.position} got ${this.peek().value} instead`)
        }
    }

    number() {
        let minus
        let token = this.peek()
        minus = token.type == TokenType.MINUS
        if (minus) {
            this.advance()
        }
        token = this.advance()
        if (token.type == TokenType.NUMBER) {
            let result = token.value.includes('.') ? parseFloat(token.value) : parseInt(token.value, 10)
            return minus ? -result : result
        } else {
            throw new Error(`Expected number at position: ${token.position} got token ${token.value} instead`)
        }
    }

    title() {
        this.model.title = this.text()
    }

    steps() {
        this.expectColon()
        let step = new Step()
        let action = this.action()
        while (action != null) {
            step.actions.push(action)
            if (!this.match(TokenType.COMMA)) {
                this.model.steps.push(step)
                step = new Step()
            }
            action = this.action()
        }
        if (step.actions.length > 0) {
            this.model.steps.push(step)
        }
    }

    action(): ActionBase | null {
        if (this.eof())
            return null
        let controlId = this.controlId()

        let token = this.peek()
        switch (token.type) {
            case TokenType.ASSIGN:
                return this.assign(controlId)
            case TokenType.MOVE:
                return this.move(controlId)
            case TokenType.SWAP:
                return this.swap(controlId)
            case TokenType.CLONE:
                this.advance()
                token = this.peek()
                if (token.type == TokenType.IDENTIFIER) {
                    this.advance()
                    return new Clone(this.model, controlId, token.value)
                }
                break
        }
        return null
    }

    propertyControlId(): string {
        this.expectColon()
        return this.controlId()
    }

    controlId(): string {
        let token = this.advance()
        if (this.canBeId(token.type)) {
            return token.value
        } else {
            throw new Error(`Expected control identifier at ${token.position} got ${token.value} instead`)
        }
    }

    canBeId(tokenType: TokenType) {
        return tokenType == TokenType.IDENTIFIER || tokenType == TokenType.STRING || tokenType == TokenType.NUMBER
    }

    ids(): string[] {
        this.expectColon()
        let values: string[] = []
        while (!this.eof() && this.canBeId(this.peek().type)) {
            values.push(this.peek().value)
            this.advance()
        }
        return values
    }


    move(leftControlId: string): ActionBase {
        this.advance()
        let point: Point = Point.zero()
        let rightId = ''
        let isPoint = this.pointInBracketsAhead()
        if (isPoint) {
            point = this.point()
        } else {
            let token = this.peek()
            rightId = token.value
            this.advance()
        }
        if (leftControlId == 'camera') {
            if (point.sign == Sign.NONE) {
                throw new Error(`Only relative move for camera is currently supported`)
            }
            return new CameraMove(this.model, point)
        }
        return new Move(this.model, leftControlId, point, rightId)
    }

    pointInBracketsAhead(): boolean {
        const token = this.peek();
        return token.type == TokenType.PLUS
            || token.type == TokenType.MINUS
            || token.type == TokenType.LEFT_BRACKET
    }

    assign(controlId: string): Assign {
        this.advance()
        let token = this.peek()
        let properties: Map<string, any> = new Map()

        while (!this.eof() && Keywords.ASSIGN_PROPERTIES.includes(token.type)) {
            let propertyName = ''
            let propertyTokenType = token.type
            if (propertyTokenType == TokenType.STRING) {
                propertyName = 'text'
            } else {
                this.advance()
                propertyName = token.type.toString()
            }

            const valueToken = this.peek()
            let value
            if (propertyTokenType == TokenType.COLOR) {
                value = this.color()
            } else if (propertyTokenType === TokenType.SELECTED || propertyTokenType === TokenType.VISIBLE) {
                this.expectColon()
                value = this.boolean()
                this.advance()
            } else {
                value = valueToken.value
                this.advance()
            }
            properties.set(propertyName, value)

            token = this.peek()
        }

        return new Assign(this.model, controlId, properties)
    }

    visible(): boolean {
        this.expectColon()
        return this.boolean()
    }

    selected(): boolean {
        this.expectColon()
        return this.boolean()
    }

    boolean(): boolean {
        const token = this.peek()
        switch (token.type) {
            case TokenType.TRUE:
                return true
            case TokenType.FALSE:
                return false
            default:
                throw new Error(`Expected boolean value: ${token.position} got token ${token.value} instead`)
        }
    }

    swap(leftControlId: string): Swap {
        this.advance()
        let token = this.peek()
        const rightControlId = token.value
        this.advance()
        return new Swap(this.model, leftControlId, rightControlId)
    }

    plus(): boolean {
        return this.match(TokenType.PLUS)
    }

    minus(): boolean {
        return this.match(TokenType.MINUS)
    }

    sign(): Sign {
        let sign: Sign = Sign.NONE
        if (this.plus()) {
            sign = Sign.PLUS
        }
        if (this.minus()) {
            sign = Sign.MINUS
        }
        return sign
    }

    point() {
        let sign = this.sign()
        const hasLeftBracket = this.match(TokenType.LEFT_BRACKET)
        let x = this.number()
        if (sign == Sign.MINUS && !hasLeftBracket) {
            x = -x
        }
        let token = this.advance()
        if (token.type != TokenType.COMMA) {
            throw new Error(`Expected comma at position: ${token.position} got token ${token} instead`)
        }
        let y = this.number()
        if (hasLeftBracket && !this.match(TokenType.RIGHT_BRACKET)) {
            throw new Error(`Expected right bracket at position: ${token.position} got token ${token} instead`)
        }
        return new Point(x, y, sign)
    }

    match(tokenType: TokenType) {
        if (this.eof()) return false
        if (this.peek().type != tokenType) return false

        this.position++
        return true
    }

    error(message: string) {
        throw new Error(message)
    }

}