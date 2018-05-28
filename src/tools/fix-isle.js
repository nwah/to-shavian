function detectBotchedPOS(dict) {
  const botched = []
  for (let headword in dict) {
    const variants = dict[headword]
    if (variants.length < 2) continue
    const ipas = variants.map(([tags, ipa, line]) => [ipa.join(''), line])
    let v = ipas.filter(ipa => /v$/.test(ipa[0]))
    let vv = v.filter(ipa => /v,v$/.test(ipa[0]))
    let n = ipas.filter(ipa => /n$/.test(ipa[0]))
    let nn = n.filter(ipa => /n,n$/.test(ipa[0]))
    if (v.length && n.length) {
      botched.push({ v: vv.length ? vv : v, n: nn.length ? nn : n })
    }
  }
  return botched
}

function fixBotchedPOS(dict) {
  const data = fs.readFileSync(islePath, 'utf8')
  const lines = data.split('\n')
  const botched = detectBotchedPOS(dict)
  botched.forEach(({ n, v }) => {
    n.forEach(([ipa, line]) => lines[line] = lines[line].replace(/n #$/, '#'))
    v.forEach(([ipa, line]) => lines[line] = lines[line].replace(/v #$/, '#'))
  })
  fs.writeFileSync(islePath, lines.join('\n'), 'utf8')
}