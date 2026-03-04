export default async function handler(req, res) {
    // CORS Handling
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    const API_KEY = process.env.OPENROUTER_API_KEY;

    if (!API_KEY) {
        return res.status(500).json({ error: 'Server configuration error: Missing API Key' });
    }

    const { messages } = req.body;

    if (!messages) {
        return res.status(400).json({ error: 'Missing messages in request body' });
    }

    try {
        // 1. Define preferred free models (High Quality Free Tier)
        const preferredModels = [
            "liquid/lfm-2.5-1.2b-instruct:free",
            "liquid/lfm-2.5-1.2b-thinking:free",
            "allenai/molmo-2-8b:free",
            "mistralai/mistral-7b-instruct:free",
            "google/gemini-2.0-flash-lite-preview-02-05:free",
            "qwen/qwen3-next-80b-a3b-instruct:free"
        ];

        // Pick a random one from the preferred list to start
        let selectedModel = preferredModels[Math.floor(Math.random() * preferredModels.length)];
        console.log("Auto-selected preferred model:", selectedModel);

        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${API_KEY}`,
                "Content-Type": "application/json",
                "HTTP-Referer": "https://todos-app-green.vercel.app", // Replace you domain here
                "X-Title": "ToDoS App" // Replace you app name here
            },
            body: JSON.stringify({
                model: selectedModel,
                messages: messages
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("OpenRouter API Error:", errorText);
            return res.status(response.status).json({ error: 'Failed to fetch from AI provider' });
        }

        const data = await response.json();
        return res.status(200).json(data);

    } catch (error) {
        console.error("Function Error:", error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}
