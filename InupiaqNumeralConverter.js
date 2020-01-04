// ==UserScript==
// @name         Inupiaq Number Converter
// @namespace    0347#0347
// @version      0.1
// @description  Convert all numbers into Inupiaq Numerals
// @author       0347#0347
// @match        *://*/*
// @grant        none
// ==/UserScript==

(function() {
    let numbers = ''

    function decimalToBase(number) {
        if (number == 0) return numbers[0]
        let output = ''
        let radix = numbers.length
        while (number != 0) {
            let digit = number % radix
            output = numbers[digit] + output
            number = (number - digit) / radix
        }
        return output
    }

    function fixTextNode(textNode) {
        {
            let parentNode = textNode.parentNode
            if (parentNode.tagName == 'span' && parentNode.className == 'inupiaq-numeral') return
        }
        let text = textNode.textContent
        let buildingNumber = undefined
        for (let i = 0; i < text.length; i++) {
            if (text[i] >= '0' && text[i] <= '9') {
                if (!buildingNumber) {
                    textNode.textContent = text.substring(0, i)
                    text = text.substring(i)
                    i = 0
                    buildingNumber = text[i]
                } else {
                    buildingNumber += text[i]
                }
            } else {
                if (buildingNumber) {
                    let spanNode = document.createElement('span')
                    spanNode.className = 'inupiaq-numeral'
                    spanNode.style.fontFamily = 'InupiaqNumbers'

                    let numeralNode = document.createTextNode(decimalToBase(parseInt(buildingNumber)))
                    spanNode.appendChild(numeralNode)

                    textNode.parentNode.insertBefore(spanNode, textNode.firstSibling)

                    textNode = document.createTextNode('')
                    spanNode.parentNode.insertBefore(textNode, spanNode.firstSibling)
                    text = text.substring(i)

                    buildingNumber = ''
                }
            }
        }
        if (buildingNumber) {
            let spanNode = document.createElement('span')
            spanNode.className = 'inupiaq-numeral'
            spanNode.style.fontFamily = 'InupiaqNumbers'

            let numeralNode = document.createTextNode(decimalToBase(parseInt(buildingNumber)))
            spanNode.appendChild(numeralNode)

            textNode.parentNode.insertBefore(spanNode, textNode.firstSibling)
            textNode = spanNode
        } else {
            textNode.textContent = text
        }
        return textNode
    }

    function fix(root) {
        let node = root.childNodes[0]
        while (node != null) {
            console.log(node)
            if (node.nodeType == Node.TEXT_NODE) {
                fixTextNode(node)
            }
            let realTagName = node.tagName ? node.tagName.toLowerCase() : undefined
            if (node.hasChildNodes() && realTagName != 'script' && realTagName != 'svg' && realTagName != 'style') {
                node = node.firstChild
            } else {
                while (node.nextSibling == null && node != root) {
                    node = node.parentNode
                }
                if (node == root) break
                node = node.nextSibling
            }
        }
    }

    fix(document.body)

    let observer = new MutationObserver((mutations) => {
        observer.disconnect()
        mutations.forEach(mutation => fix(mutation.target))
        observer.observe(document.body, { subtree: true, childList: true })
    })
    observer.observe(document.body, { subtree: true, childList: true })
})();