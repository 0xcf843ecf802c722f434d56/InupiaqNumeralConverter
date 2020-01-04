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
    // These are the unicode representations of the Inupiaq Numerals
    // (at least, from what I could tell the commercial font was using
    // already. I used this in my font and that's how I got this
    // coding)
    let numbers = ''
    // Name of the font to use for displaying the numbers
    let fontFamily = 'InupiaqNumbers'

    // Converts an integer to a base-20 string in Inupiaq Numerals.
    function decimalToBase(number) {
        if (number == 0) return numbers[0] // Otherwise it returns ''
        let output = ''
        let radix = numbers.length
        while (number != 0) {
            let digit = number % radix
            output = numbers[digit] + output
            number = (number - digit) / radix // Remove the last digit and shift it back.
            // Eg (in base 10):
            // (534 - 4) / 10
            // 530 / 10
            // 53
        }
        return output
    }

    // Takes a text node and replaces all numbers with `span`s with the correct font
    function fixTextNode(textNode) {
        {
            // Ensure this doesn't apply recursively.
            let parentNode = textNode.parentNode
            if (parentNode.tagName == 'span' && parentNode.className == 'inupiaq-numeral') return
        }
        let text = textNode.textContent
        let buildingNumber = undefined
        for (let i = 0; i < text.length; i++) {
            if (text[i] >= '0' && text[i] <= '9') {
                if (!buildingNumber) {
                    textNode.textContent = text.substring(0, i) // Truncate `textNode` upto the first number
                    text = text.substring(i) // Set text to start at the number
                    i = 0
                    buildingNumber = text[i]
                } else {
                    buildingNumber += text[i]
                }
            } else if (text[i] == ',' && text[i + 1] >= '0' && text[i + 1] <= '9') {
                // This allows numbers formatted as '341,414' to be correctly parsed as '341414' and converted.
            } else {
                if (buildingNumber) {
                    let spanNode = document.createElement('span')
                    spanNode.className = 'inupiaq-numeral'
                    spanNode.style.fontFamily = fontFamily

                    let numeralNode = document.createTextNode(
                        decimalToBase(
                            parseInt(buildingNumber)
                        )
                    )
                    spanNode.appendChild(numeralNode)

                    // Insert `spanNode` after `textNode`
                    textNode.parentNode.insertBefore(spanNode, textNode.firstSibling)

                    // Replace `textNode` with the next section of text & add it after `spanNode`
                    textNode = document.createTextNode('')
                    spanNode.parentNode.insertBefore(textNode, spanNode.firstSibling)
                    text = text.substring(i) // Truncate text again.
                    i = 0

                    buildingNumber = ''
                }
            }
        }
        if (buildingNumber) {
            let spanNode = document.createElement('span')
            spanNode.className = 'inupiaq-numeral'
            spanNode.style.fontFamily = fontFamily

            let numeralNode = document.createTextNode(
                decimalToBase(
                    parseInt(buildingNumber)
                )
            )
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
        // Traverses the node tree of `root` and replaces any digits with Inupiaq numerals.
        while (node != null) {
            if (node.nodeType == Node.TEXT_NODE) {
                node = fixTextNode(node)
            }
            let realTagName = node.tagName ? node.tagName.toLowerCase() : undefined
            // Ignoring `script`, `svg`, and `style` tags since they should never have their contents changed.
            // Potentially other tags are needed here.
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
        // Disconnect the observer so it doesn't observe itself replacing digits with Inupiaq numerals
        observer.disconnect()
        mutations.forEach(mutation => fix(mutation.target))
        observer.observe(document.body, { subtree: true, childList: true })
    })
    observer.observe(document.body, { subtree: true, childList: true })
})();
