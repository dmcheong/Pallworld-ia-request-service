require('dotenv').config();
const express = require('express');
const OpenAI = require('openai');
const cors = require('cors');
const axios = require('axios');

const app = express();
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// Utilisation du middleware cors
app.use(cors());

// Route pour la génération d'images
app.get('/generate-image', async (req, res) => {
    try {
        const { text, userId } = req.query;

        if (!text || !userId) {
            return res.status(400).json({ error: 'Les paramètres "text" et "userId" sont requis.' });
        }

        // Vérification des tokens de l'utilisateur
        const userResponse = await axios.get(`http://localhost:3005/api/users/${userId}/credits`);
        const userCredits = userResponse.data.credits;

        if (userCredits <= 0) {
            return res.status(400).json({ error: "Vous n'avez pas assez de tokens pour générer une image." });
        }

        console.log("Texte pour la génération d'image :", text);

        const response = await openai.images.generate({
            model: "dall-e-3",
            prompt: text + " dans un contexte amical et non-violent, une créature fantastique venant du monde de Pokémon ou Palworld.",
            n: 1,
            size: "1024x1024",
        });

        console.log("Réponse de l'API OpenAI :", response);

        if (response && response.data && response.data.length > 0 && response.data[0].url) {
            const imageUrl = response.data[0].url;
            console.log("URL de l'image générée :", imageUrl);

            // Déduction d'un token après la génération de l'image
            await axios.put(`http://localhost:3005/api/users/${userId}`, {
                tokenDeduction: 1,
            });

            res.json({ imageUrl, remainingTokens: userCredits - 1 });
        } else {
            console.error('La réponse de l\'API n\'a pas renvoyé de données valides.');
            throw new Error('La réponse de l\'API n\'a pas renvoyé de données valides.');
        }
    } catch (error) {
        console.error('Erreur lors de la création de l\'image:', error.message);
        res.status(500).json({ error: 'Erreur lors de la génération de l\'image.' });
    }
});

// Démarrage du serveur
const PORT = process.env.PORT || 3009;
app.listen(PORT, () => {
    console.log(`Serveur Express démarré sur le port ${PORT}`);
});
