import * as math from 'mathjs';

class Calculator {
    constructor() {
        this.scope = {};
        this.aliases = {};
        this.aliasCounter = 0;
    }

    getAlias(name) {
        if (this.aliases[name]) return this.aliases[name];
        const alias = 'var_' + (this.aliasCounter++);
        this.aliases[name] = alias;
        return alias;
    }

    evaluate(text) {
        if (!text) return [];

        // Normalize full-width math operators first
        const normalizedText = text
            .replace(/＋/g, '+')
            .replace(/－/g, '-')
            .replace(/×/g, '*')
            .replace(/÷/g, '/')
            .replace(/％/g, '%')
            .replace(/（/g, '(')
            .replace(/）/g, ')')
            .replace(/(?<!\d)(\d{1,3}(?:,\d{3})+)(?!\d)/g, match => match.replace(/,/g, ''));

        const lines = normalizedText.split('\n');
        const results = [];

        // reset state
        this.scope = {};

        // We keep all values we assign so that subsequent lines can use them
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            if (!line.trim()) {
                results.push('');
                continue;
            }

            let assignTo = null;
            let exprPart = line.trim();

            // Check for assignment: any non empty string before =
            const assignMatch = exprPart.match(/^([^=＝]+)[=＝](.*)$/);
            if (assignMatch && !exprPart.includes('==') && !exprPart.includes('!=')) {
                assignTo = assignMatch[1].trim();
                exprPart = assignMatch[2].trim();
            }

            // If exprPart is empty, skip
            if (!exprPart) {
                results.push('');
                continue;
            }

            // Replace variables in exprPart, except numbers.
            // Match words including Chinese, letters, _, but not starting with numbers.
            // E.g. price -> var_0.
            let translatedExpr = exprPart.replace(/[\p{L}_][\p{L}\p{N}_]*/gu, (match) => {
                return this.getAlias(match);
            });

            try {
                // Evaluate
                let res = math.evaluate(translatedExpr, this.scope);

                if (res !== undefined && res !== null && typeof res !== 'function') {
                    // Handle formatting
                    if (typeof res === 'number') {
                        // round to max 4 decimal places to avoid floating point errors
                        res = Math.round(res * 10000) / 10000;
                    }

                    // Extract plain string if it's a mathjs unit or complex number
                    if (res.toString) {
                        res = res.toString();
                    }

                    if (assignTo) {
                        this.scope[this.getAlias(assignTo)] = res;
                    }

                    // If the expression was just a single number assignment (like price = 10), 
                    // maybe we don't need to show '10' on the right, or maybe we do.
                    // Usually it's nice to show it to confirm it parsed. Let's show it.
                    results.push(res);
                } else {
                    results.push('');
                }
            } catch (e) {
                // Silently ignore evaluation errors because users might be midway typing
                results.push('');
            }
        }
        return results;
    }
}

export const calculator = new Calculator();
