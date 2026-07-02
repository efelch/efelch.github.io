"use strict";
// Helper to surface HTML content from conventional sections in index.html
// Converts rich HTML into terminal-friendly minimal HTML/text while stripping styles/headings.
function __sectionHTML(id) {
    try {
        const root = document.getElementById(id);
        if (!root) return "";

        const ESC = (s) => String(s)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");

        const ESC_ATTR = (s) => ESC(s).replace(/\n|\r|\t/g, " ");

        const isHeading = (tag) => /^(H1|H2|H3|H4|H5|H6)$/.test(tag);

        function serialize(node) {
            if (!node) return "";
            if (node.nodeType === Node.TEXT_NODE) {
                // Collapse any whitespace/newlines inside text nodes to single spaces
                const v = node.nodeValue || "";
                return v.replace(/\s+/g, ' ');
            }
            if (node.nodeType !== Node.ELEMENT_NODE) return "";

            const tag = node.tagName;
            // Skip scripts/styles entirely
            if (tag === 'SCRIPT' || tag === 'STYLE') return "";
            // Drop headings so we don't duplicate the room title
            if (isHeading(tag)) return "";
            if (tag === 'BR') return "\n";

            // Serialize children first
            let inner = "";
            for (const child of node.childNodes) {
                inner += serialize(child);
            }

            // Block-level handling
            if (tag === 'P') {
                // For paragraphs, collapse internal whitespace and add a blank line after
                inner = inner.replace(/\s+/g, ' ').trim();
                return inner ? inner + "\n\n" : "";
            }
            if (tag === 'LI') {
                inner = inner.replace(/\s+/g, ' ').trim();
                return inner ? "- " + inner + "\n" : "";
            }
            if (tag === 'UL' || tag === 'OL') {
                return inner.trim() ? inner.trim() + "\n" : "";
            }
            if (tag === 'A') {
                const href = node.getAttribute('href') || '#';
                const text = inner.trim() || href;
                // Keep anchors clickable but neutralize styling; rel security attributes are already in CSS/HTML
                return `<a href="${ESC_ATTR(href)}" target="_blank" rel="noopener noreferrer">${ESC(text)}</a>`;
            }

            // Default: return concatenated children
            return inner;
        }

        let out = "";
        for (const child of root.childNodes) {
            out += serialize(child);
        }

        // Normalize whitespace: collapse 3+ newlines to 2, trim edges, convert Windows newlines
        out = out.replace(/\r\n?/g, "\n")
                 .replace(/\n{3,}/g, "\n\n")
                 .replace(/[ \t]{2,}/g, ' ')
                 .trim();
        return out;
    } catch (_) {
        return "";
    }
}

const personalData = {
    items: {
        portal: {
            description: "A dark portal, breathing in a measured way. Wisps curl from it and catch in your throat like the idea of smoke."
        }
    },
    hints: {
        "personal_aboutMe": "You are in the About section. Go south to see the Experience section.",
        "personal_resume": "This is the Experience section. Go south for Photos.",
        "personal_photos": "This is the Photos section. Go south for Projects.",
        "personal_links": "Here are some Projects. Go south for the Gateway.",
        "personal_gateway": "You stand at the gateway. A dark portal breathes in and out, patient. You could enter it."
    },
    rooms: {
        personal_aboutMe: {
            name: "ABOUT",
            typeOfRoom: "personal",
            description: () => __sectionHTML('content-about'),
            exits: {
                south: "personal_resume"
            }
        },
        personal_resume: {
            name: "EXPERIENCE",
            typeOfRoom: "personal",
            description: () => __sectionHTML('content-experience'),
            exits: {
                north: "personal_aboutMe",
                south: "personal_photos"
            }
        },
        personal_photos: {
            name: "PHOTOS",
            typeOfRoom: "personal",
            description: () => __sectionHTML('content-photos'),
            exits: {
                north: "personal_resume",
                south: "personal_links"
            }
        },
        personal_links: {
            name: "LINKS",
            typeOfRoom: "personal",
            description: () => __sectionHTML('content-links'),
            exits: {
                north: "personal_photos",
                south: "personal_gateway"
            }
        },
        personal_gateway: {
            name: "GATEWAY TO ADVENTURE",
            typeOfRoom: "personal",
            objects: ["portal"],
            description: () => __sectionHTML('content-gateway'),
            exits: {
                north: "personal_links",
                "enter portal": "forest_westOfHouse",
                "in": "forest_westOfHouse"
            }
        }
    }
};
