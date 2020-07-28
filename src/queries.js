import session from "./database"

const readRulesBySection = (sectionTitle) => {
    const query = `
        MATCH (s:Section {title: $sectionTitle}), (p:Paragraph), (r:Rule)
        WHERE (s)-[:CONTAINS]->(p) AND (p)-[:CONTAINS]->(r) 
        RETURN r
        ORDER BY r.index`;

    return session.readTransaction(tx => tx.run(query, { sectionTitle }))
}

const readRulesByParagraph = (paragraphIndex, limit = 100) => {
    const query = `
        MATCH (p:Paragraph {index: $paragraphIndex}), (r:Rule)
        WHERE (p)-[:CONTAINS]->(r) 
        RETURN r
        ORDER BY r.index LIMIT $limit`;

    return session.readTransaction(tx => tx.run(query, { paragraphIndex, limit }))
}

const readRequirementsByType = (paragraphIndex) => {
    const query = `
        MATCH (p:Paragraph {index: $paragraphIndex}), (r:Rule {desc: 'Requirements:'}), (s:SubRule)
        WHERE (p)-[:CONTAINS]->(r) AND (r)-[:CONTAINS]->(s)
        RETURN r, s
        ORDER BY r, s.index`;

    return session.readTransaction(tx => tx.run(query, { paragraphIndex }))
}

export {
    readRulesBySection,
    readRulesByParagraph,
    readRequirementsByType
}