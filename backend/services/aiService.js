const { GoogleGenAI } = require('@google/genai');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const analyzeTicket = async (subject, description) => {
    const prompt = `Ticket Subject: ${subject}\nTicket Description: ${description}`;

    const systemInstruction = `You are an AI support agent for BookLeaf Publishing. 
TONE GUIDELINES: Always empathetic and professional. Acknowledge concerns before solving. Be specific with numbers/dates. Own faults directly—no corporate deflection. End with a clear next step.
KNOWLEDGE BASE:
- Royalty: 80/20 split (author gets 80% net profit). Net = MRP - print - commission - shipping. Paid quarterly within 45 days. Minimum payout ₹1,000.
- ISBN: Unique ISBNs assigned by us. ISBN errors are HIGH PRIORITY and escalated to production (48hr resolution).
- Printing: In-house. Turnaround 5-7 business days. Free reprints for verified defects (ask for photos).
- Distribution: Sync issues (Amazon/Flipkart) resolved in 24-48 hours.
PRIORITY LOGIC: ISBN metadata issues and overdue payments must be 'High' or 'Critical'. Bio/Description updates are 'Low'.
CATEGORIES: ['Royalty & Payments', 'ISBN & Metadata Issues', 'Printing & Quality', 'Distribution & Availability', 'Book Status & Production Updates', 'General Inquiry']. 
CRITICAL CONSTRAINTS: 
1. You must NEVER invent policies, prices, or timelines. 
2. If a query requires checking an author's specific database record (like checking their exact production status or missing payment), you must defer to the human support team. 
3. TONE VIOLATION PREVENTION: When deferring to the human team, you MUST explicitly state they will investigate and respond 'within 48 hours'. You are strictly forbidden from using open-ended promises like 'as soon as possible' or 'shortly'.`;

    const responseSchema = {
        type: "OBJECT",
        properties: {
            category: {
                type: "STRING",
                description: "The category of the ticket based on BookLeaf categories."
            },
            priority: {
                type: "STRING",
                description: "The priority of the ticket based on BookLeaf logic."
            },
            draftResponse: {
                type: "STRING",
                description: "The drafted response to the author following BookLeaf tone guidelines."
            }
        },
        required: ["category", "priority", "draftResponse"]
    };

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                systemInstruction: systemInstruction,
                responseMimeType: 'application/json',
                responseSchema: responseSchema
            }
        });

        return JSON.parse(response.text);
    } catch (error) {
        console.error("AI Service Error:", error);
        return {
            category: "General Inquiry",
            priority: "Unassigned",
            draftResponse: "[SYSTEM WARNING]: The BookLeaf AI Assistant is currently experiencing high traffic or upstream API timeouts. This ticket was safely captured via our graceful degradation fallback system. Please manually assign priority and draft a response to the author."
        };
    }
};

module.exports = { analyzeTicket };
