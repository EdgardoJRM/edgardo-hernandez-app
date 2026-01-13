"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runEngine = runEngine;
const arquetipo_v1_1 = require("./arquetipo_v1");
async function runEngine(formId, answers) {
    switch (formId) {
        case 'arquetipo_v1':
            return (0, arquetipo_v1_1.runArquetipoV1)(answers);
        default:
            throw new Error(`No engine found for formId: ${formId}`);
    }
}
//# sourceMappingURL=index.js.map