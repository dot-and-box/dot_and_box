import {TokenType} from "./tokenType.ts";
import {Token} from "./token.ts";

export class Parser {
    start: number = 0;
    position = 0;
    line = 1;
    tokens: Token[] = [];
    source = ''

    public parse(source: string) {
        this.source = source
        while (this.position < source.length) {
            const c = this.advance()
            switch (c) {
                case ' ':
                case '\r':
                case '\t':
                    break;
                case '(':
                    this.addToken(TokenType.LEFT_BRACKET)
                    break;
                case ')':
                    this.addToken(TokenType.RIGHT_BRACKET)
                    break;
                case ':':
                    this.addToken(TokenType.COLON)
                    break;
                case ',':
                    this.addToken(TokenType.COMMA)
                    break;
                case 'd':
                    this.match('o')
                    break
                default:
                    if (this.isDigit(c)) {
                        this.number()
                    }
            }
            this.start = this.position
        }
    }

    addToken(tokenType: TokenType) {
        this.addTokenValue(tokenType, null)
    }

    addTokenValue(tokenType: TokenType, value) {
        this.tokens.push(new Token(this.start, tokenType, value))
    }

    advance(): string {
        return this.source.charAt(this.position++)
    }

    isAtEnd() {
        return this.position >= this.source.length;
    }

    peek(): string {
        return this.isAtEnd() ? '\0' : this.source.charAt(this.position)
    }

    match(expected) {
        if (this.isAtEnd()) return false;
        if (this.source.charAt(this.position) != expected) return false;

        this.position++;
        return true;
    }

    private isDigit(c: string): boolean {
        return c >= '0' && c <= '9';
    }

    private number() {
        while (this.isDigit(this.peek())) {
            this.advance()
        }
        let val = this.source.substring(this.start, this.position)
        this.addTokenValue(TokenType.NUMBER, val)
    }
}