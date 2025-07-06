			// Progressive text reveal on scroll with sequential footer reveals
(function() {
    // Find the paragraph containing the target text
    const targetParagraph = document.querySelector('main p');
    const sectionFooter = document.querySelector('.section-footer');
    const footer = document.querySelector('footer');
    
    if (!targetParagraph || !sectionFooter || !footer) return;
    
    // Initially hide the section footer and footer
    sectionFooter.style.opacity = '0';
    sectionFooter.style.transition = 'opacity 0.33s ease-in-out';
    footer.style.opacity = '0';
    footer.style.transition = 'opacity 0.33s ease-in-out';
    
    // Get the HTML content
    const originalHTML = targetParagraph.innerHTML;
    
    // Function to split text while preserving HTML tags
    function splitTextPreservingTags(html) {
        const parts = [];
        let currentPos = 0;
        let inTag = false;
        let currentWord = '';
        
        for (let i = 0; i < html.length; i++) {
            const char = html[i];
            
            if (char === '<') {
                // If we have a current word, add it to parts
                if (currentWord.trim()) {
                    parts.push({type: 'word', content: currentWord.trim()});
                    currentWord = '';
                }
                inTag = true;
                currentWord = char;
            } else if (char === '>') {
                currentWord += char;
                inTag = false;
                // Add the complete tag
                parts.push({type: 'tag', content: currentWord});
                currentWord = '';
            } else if (inTag) {
                currentWord += char;
            } else if (char === ' ' || char === '\n' || char === '\t') {
                if (currentWord.trim()) {
                    parts.push({type: 'word', content: currentWord.trim()});
                    currentWord = '';
                }
            } else {
                currentWord += char;
            }
        }
        
        // Add the last word if any
        if (currentWord.trim()) {
            parts.push({type: 'word', content: currentWord.trim()});
        }
        
        return parts;
    }
    
    // Split the content while preserving HTML tags
    const parts = splitTextPreservingTags(originalHTML);
    
    // Find where "I'm Vincent Tantardini," ends
    let alwaysVisibleParts = [];
    let hiddenParts = [];
    let foundEnd = false;
    
    for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        
        if (!foundEnd && part.type === 'word' && (part.content.includes('Tantardini,') || i <= 6)) {
            alwaysVisibleParts.push(part);
            if (part.content.includes('Tantardini,')) {
                foundEnd = true;
            }
        } else {
            hiddenParts.push(part);
        }
    }
    
    // Create the new HTML structure
    let newHTML = '';
    
    // Add always visible parts
    alwaysVisibleParts.forEach((part, index) => {
        if (part.type === 'tag') {
            newHTML += part.content;
        } else {
            newHTML += part.content;
            if (index < alwaysVisibleParts.length - 1) {
                newHTML += ' ';
            }
        }
    });
    
    // Add a space after the always visible content if needed
    if (alwaysVisibleParts.length > 0 && hiddenParts.length > 0) {
        newHTML += ' ';
    }
    
    // Add hidden parts
    let hiddenWordIndex = 0;
    hiddenParts.forEach((part, index) => {
        if (part.type === 'tag') {
            // Tags are always visible, just add them as-is
            newHTML += part.content;
        } else {
            // Wrap words in spans for animation
            newHTML += `<span class="hidden-word" data-index="${hiddenWordIndex}">${part.content}</span>`;
            hiddenWordIndex++;
            if (index < hiddenParts.length - 1 && hiddenParts[index + 1].type === 'word') {
                newHTML += ' ';
            }
        }
    });
    
    // Replace the paragraph content
    targetParagraph.innerHTML = newHTML;
    
    // Add CSS for the hidden words
    const style = document.createElement('style');
    style.textContent = `
        .hidden-word {
            display: inline-block;
            opacity: 0;
            transform: translateY(12px);
            transition: opacity 0.33s ease-in-out, transform 0.33s ease-in-out;
        }
        .hidden-word.visible {
            opacity: 1;
            transform: translateY(0);
        }
    `;
    document.head.appendChild(style);
    
    // Get all hidden word spans
    const hiddenWordSpans = document.querySelectorAll('.hidden-word');
    const totalWords = hiddenWordSpans.length;
    
    // Track scroll position and reveal words
    let lastScrollY = window.scrollY;
    let sectionFooterShown = false;
    let footerShown = false;
    
    function updateWordVisibility() {
        const scrollY = window.scrollY;
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;
        const maxScroll = documentHeight - windowHeight;
        
        // Calculate how many words should be visible based on scroll position
        // Use 40% of scroll range for words, 20% for section footer, 20% for footer
        const wordScrollRange = maxScroll * 0.4;
        const sectionFooterScrollRange = maxScroll * 0.6;
        const footerScrollRange = maxScroll * 0.8;
        
        // Show words based on scroll position
        const scrollProgress = Math.min(scrollY / wordScrollRange, 1);
        const wordsToShow = Math.floor(scrollProgress * totalWords);
        
        // Show/hide words based on scroll position
        hiddenWordSpans.forEach((span, index) => {
            if (index < wordsToShow) {
                span.classList.add('visible');
            } else {
                span.classList.remove('visible');
            }
        });
        
        // Show section footer after all words are visible
        if (scrollY >= sectionFooterScrollRange && !sectionFooterShown) {
            sectionFooter.style.opacity = '1';
            sectionFooterShown = true;
        } else if (scrollY < sectionFooterScrollRange && sectionFooterShown) {
            sectionFooter.style.opacity = '0';
            sectionFooterShown = false;
        }
        
        // Show footer after section footer
        if (scrollY >= footerScrollRange && !footerShown) {
            footer.style.opacity = '1';
            footerShown = true;
        } else if (scrollY < footerScrollRange && footerShown) {
            footer.style.opacity = '0';
            footerShown = false;
        }
        
        lastScrollY = scrollY;
    }
    
    // Throttle scroll events for better performance
    let ticking = false;
    function requestUpdateWordVisibility() {
        if (!ticking) {
            requestAnimationFrame(updateWordVisibility);
            ticking = true;
        }
    }
    
    // Listen for scroll events
    window.addEventListener('scroll', () => {
        requestUpdateWordVisibility();
        ticking = false;
    });
    
    // Initial check
    updateWordVisibility();
})();