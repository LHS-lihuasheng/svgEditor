test('AST解析和生成', () => {
  const code = `
    <svg width="100" height="{height}">
      <rect x="10" y="20" width="{width}" fill="red" />
      <text>{textContent}</text>
    </svg>
  `
  
  const ast = parseCodeToAST(code)
  
  expect(ast).toEqual({
    type: 'element',
    name: 'svg',
    attributes: {
      width: 100,
      height: { type: 'expression', value: 'height' }
    },
    children: [
      {
        type: 'element',
        name: 'rect',
        attributes: {
          x: 10,
          y: 20,
          width: { type: 'expression', value: 'width' },
          fill: 'red'
        },
        children: []
      },
      {
        type: 'element',
        name: 'text',
        attributes: {},
        children: [
          {
            type: 'text',
            value: '{textContent}'
          }
        ]
      }
    ]
  })

  const generatedCode = generateCodeFromAST(ast)
  expect(generatedCode).toMatchInlineSnapshot(`
    "<?xml version="1.0" encoding="UTF-8"?>
    <svg width="100" height="{height}">
      <rect x="10" y="20" width="{width}" fill="red" />
      <text>
        {textContent}
      </text>
    </svg>"
  `)
}) 