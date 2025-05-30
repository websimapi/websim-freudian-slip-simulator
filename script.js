document.addEventListener('DOMContentLoaded', () => {
    const thoughtsDisplay = document.getElementById('thoughtsDisplay');
    const userInput = document.getElementById('userInput');
    const speakButton = document.getElementById('speakButton');
    const slipDisplay = document.getElementById('slipDisplay');
    const loadingMessage = document.getElementById('loadingMessage');

    let currentThoughts = "Nothing in particular.";
    let thoughtsHistory = []; // For providing more context to the thought generator

    // Function to fetch and display a new subconscious thought
    async function fetchNewThought() {
        thoughtsDisplay.innerHTML = `<p><i>Thinking...</i></p>`;
        try {
            const messages = [
                {
                    role: "system",
                    content: "You are the stream of consciousness of a person's subconscious. Generate a brief, fleeting thought. This thought might be a desire, a fear, a random image, a suppressed memory, or a passing judgment. Make it concise, under 15 words. Be creative and slightly unpredictable."
                }
            ];
            if (thoughtsHistory.length > 0) {
                messages.push({
                    role: "user",
                    content: `Previous thoughts were: "${thoughtsHistory.slice(-3).join('; ')}". What's on your mind now, building on or contrasting with that? Or just something new.`
                });
            } else {
                messages.push({
                    role: "user",
                    content: "What's the very first fleeting thought that comes to mind?"
                });
            }

            const completion = await websim.chat.completions.create({
                messages: messages,
            });

            const newThought = completion.content.trim();
            currentThoughts = newThought;
            thoughtsDisplay.innerHTML = `<p>${newThought}</p>`;
            
            thoughtsHistory.push(newThought);
            if (thoughtsHistory.length > 5) {
                thoughtsHistory.shift(); // Keep history manageable
            }

        } catch (error) {
            console.error("Error fetching thought:", error);
            thoughtsDisplay.innerHTML = `<p>Error fetching thoughts. Try again later.</p>`;
            currentThoughts = "A mental block...";
        }
    }

    // Function to generate the Freudian slip
    async function generateFreudianSlip() {
        const intendedText = userInput.value.trim();
        if (!intendedText) {
            slipDisplay.innerHTML = `<p>You need to intend to say something first!</p>`;
            return;
        }

        speakButton.disabled = true;
        loadingMessage.style.display = 'block';
        slipDisplay.innerHTML = `<p>...</p>`;

        try {
            const completion = await websim.chat.completions.create({
                messages: [
                    {
                        role: "system",
                        content: `You are an expert at crafting Freudian slips.
A user will provide an "intended_sentence" and a "subconscious_thought".
Your task is to subtly and naturally weave the essence of the subconscious thought into the intended sentence, creating a plausible slip of the tongue.
The result should primarily be the intended sentence, but with a word or short phrase changed or added that hints at the subconscious thought.
It should sound like an accidental mistake. Avoid making it too obvious or directly stating the subconscious thought.
Respond directly with JSON, following this JSON schema, and no other text:
{
  "slip": "The Freudian slip version of the sentence."
}`
                    },
                    {
                        role: "user",
                        content: JSON.stringify({
                            intended_sentence: intendedText,
                            subconscious_thought: currentThoughts
                        })
                    }
                ],
                json: true,
            });
            
            const result = JSON.parse(completion.content);
            slipDisplay.innerHTML = `<p>${result.slip}</p>`;

        } catch (error) {
            console.error("Error generating slip:", error);
            slipDisplay.innerHTML = `<p>Couldn't quite process that slip... try again.</p>`;
        } finally {
            speakButton.disabled = false;
            loadingMessage.style.display = 'none';
        }
    }

    // Event listeners
    speakButton.addEventListener('click', generateFreudianSlip);

    // Start fetching thoughts periodically
    fetchNewThought(); // Initial thought
    setInterval(fetchNewThought, 7000); // New thought every 7 seconds
});

