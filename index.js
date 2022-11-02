const core = require("@actions/core");

const isJSON = (str) => {
    try {
        const parsed = JSON.parse(str);

        return parsed;
    } catch (err) {
        return false;
    }
}

(
    async () => {
        try {
            const content = JSON.parse(core.getInput("json_string"));

            const splitChar = core.getInput("split_char");

            const fields = core.getInput("field").split(splitChar ? splitChar : ".");

            let checkField = { ...content };

            for (const field of fields) {
                if (!field in checkField) throw `${field} doesn't exist in the json string`;

                checkField = checkField[field];
            }

            const value = core.getInput("value");
            const parsedValue = isJSON(value) ? isJSON(value) : value;
            const partsOfContent = [content];

            for (const index in fields) {
                const field = fields[index];

                let part = partsOfContent[partsOfContent.length - 1];

                if (Number(index) !== 0) part = part[1];

                part = part[field];

                if (Number(index) === fields.length - 1) part = parsedValue;

                partsOfContent.push([field, part]);
            }

            const reveresedParts = partsOfContent.reverse();

            for (const index in reveresedParts) {
                if (Number(index) === reveresedParts.length - 1) break;
                
                const previousIndex = Number(index) + 1;

                const part = partsOfContent[index];
                const partBefore = partsOfContent[previousIndex]

                if (previousIndex === reveresedParts.length - 1) partBefore[part[0]] = part[1];
                else partBefore[1][part[0]] = part[1];

                partsOfContent[previousIndex] = partBefore;
            }

            const editedContent = reveresedParts[reveresedParts.length - 1];

            core.setOutput("content", JSON.stringify(editedContent));
        } catch (err) {
            core.setFailed(err);
        }
    }
)();