"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runArquetipoV1 = runArquetipoV1;
function runArquetipoV1(answers) {
    // Example scoring logic - replace with actual business logic
    const scoresByCategory = {};
    const recommendations = [];
    // Calculate scores based on answers
    Object.keys(answers).forEach((key) => {
        const answer = answers[key];
        // Example: if answer is a number (scale question), accumulate
        if (typeof answer === 'number') {
            const category = key.split('_')[0] || 'general';
            scoresByCategory[category] = (scoresByCategory[category] || 0) + answer;
        }
        // Example: if answer is an array (multi-select), count selections
        if (Array.isArray(answer)) {
            const category = key.split('_')[0] || 'general';
            scoresByCategory[category] = (scoresByCategory[category] || 0) + answer.length;
        }
    });
    // Determine archetype based on highest score
    const categories = Object.keys(scoresByCategory);
    let maxScore = 0;
    let archetype = 'equilibrado';
    categories.forEach((category) => {
        if (scoresByCategory[category] > maxScore) {
            maxScore = scoresByCategory[category];
            archetype = category;
        }
    });
    // Generate recommendations based on archetype
    const archetypeRecommendations = {
        lider: [
            'Desarrolla tu capacidad de influencia a través de la comunicación clara',
            'Practica la escucha activa para fortalecer relaciones',
            'Busca oportunidades para mentorizar a otros',
        ],
        creativo: [
            'Dedica tiempo regular para explorar nuevas ideas',
            'Colabora con personas de diferentes disciplinas',
            'Documenta tus procesos creativos para replicar éxitos',
        ],
        estratega: [
            'Analiza tendencias del mercado regularmente',
            'Desarrolla planes a corto y largo plazo',
            'Evalúa resultados y ajusta estrategias continuamente',
        ],
        equilibrado: [
            'Mantén un balance entre diferentes áreas de tu vida',
            'Prioriza el bienestar personal y profesional',
            'Busca feedback constante para mejorar',
        ],
    };
    recommendations.push(...(archetypeRecommendations[archetype] || archetypeRecommendations.equilibrado));
    return {
        archetype,
        scoresByCategory,
        recommendations,
        calculatedAt: new Date().toISOString(),
    };
}
//# sourceMappingURL=arquetipo_v1.js.map