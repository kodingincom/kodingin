import fs from 'fs';

function getBBoxRegex(svgString) {
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    const paths = [...svgString.matchAll(/<path\s+d="([^"]+)"\s+fill="[^"]+"\s+transform="translate\(([^,]+),([^)]+)\)"/g)];
    for (const match of paths) {
        const d = match[1];
        const tx = parseFloat(match[2]);
        const ty = parseFloat(match[3]);
        const coords = d.match(/-?\d+\.?\d*/g);
        if (coords) {
            for (let i = 0; i < coords.length; i += 2) {
                const x = tx + parseFloat(coords[i]);
                const y = ty + parseFloat(coords[i + 1]);
                if (x < minX) minX = x;
                if (x > maxX) maxX = x;
                if (y < minY) minY = y;
                if (y > maxY) maxY = y;
            }
        }
    }
    return { minX, minY, width: maxX - minX, height: maxY - minY };
}

console.log('1-', getBBoxRegex(fs.readFileSync('./vue_app/src/assets/1-removebg-preview.svg', 'utf8')));
console.log('2-', getBBoxRegex(fs.readFileSync('./vue_app/src/assets/2-removebg-preview.svg', 'utf8')));
