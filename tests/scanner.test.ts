import {expect, test} from 'vitest'
import {Scanner} from "../src/parser/scanner";

test('scanner not null', () => {
    let p = new Scanner()
    expect(p).not.eq(null)
})

test('scanner simple', () => {
    let eg1 = `title: bubble sort
                     box: 
                       name: router
                       at: 120, 160
                       size: 100, 150
                     dots:
                       at: 50, 160
                       size: 35
                       data: 3,6,8,9,4,7,1,2
                     actions:
                     4 <-> 7
                     1 <-> 2
                     1 -> router
                    `
    let p = new Scanner()
    p.scan(eg1)
    console.log(p.tokens)

    expect(p).not.eq(null)
})