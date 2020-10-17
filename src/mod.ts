import { install } from 'source-map-support'
install()
import { readFileSync } from 'fs'
import { validIdentiferChars } from './lib/charcode'
import { Tokenizer } from './lib/tokenizer'

if (process.env.DUMP_CHAR_CODES) {
  const validChars = `0 1 2 3 4 5 6 7 8 9 \
a b c d e f g h i j k l m n o p q r s t u v x y z \
A B C D E F G H I J K L M N O P Q R S T U V X Y Z \
= + - * / { } % _ \
\t \n`
    .split(' ')
    .concat([' '])

  for (const c of validChars) {
    console.log(`%O = %O`, c, c.charCodeAt(0))
  }

  console.log(`\n`)

  console.log(
    `%O`,
    Object.values(validChars)
      .map((c) => c.charCodeAt(0))
      .sort((a, b) => a - b)
  )
} else if (process.env.TEST_TOKENIZER) {
  const data = readFileSync('samples/fibonacci.bitsy').toString('utf8')
  const tokenizer = new Tokenizer(data).tokenize()

  console.log(`Tokens:`, tokenizer.tokens)
} else if (process.env.TEST_CHARS) {
  console.log(`Valid ident chars:`, validIdentiferChars())
}
