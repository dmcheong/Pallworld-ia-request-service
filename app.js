require('dotenv').config();
const express = require('express');
const OpenAI = require('openai');
const cors = require('cors'); // Importer cors


const app = express();
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// Utilisation du middleware cors
app.use(cors());

// Route pour la génération d'images
app.get('/generate-image', async (req, res) => {
    try {
        const { text } = req.query; // Récupération du texte saisi en paramètre

        // Vérification si le texte est présent
        if (!text) {
            return res.status(400).json({ error: 'Le paramètre "text" est requis.' });
        }

        // Génération de l'image en utilisant OpenAI
        const response = await openai.images.generate({
            model: "dall-e-3",
            prompt: text + "il faut que ce soit absolument une créature dans l'univers de Pokémon ou palworld",
            n: 1,
            size: "1024x1024",
        });

        // Récupération de l'URL de l'image générée
        const imageUrl = response.data;
        console.log(imageUrl);

        // Renvoi de l'URL de l'image dans la réponse
        res.json({ imageUrl });
    } catch (error) {
        console.error('Erreur lors de la création de l\'image:', error);
        res.status(500).json({ error: 'se que tu demande ne peut pas etre générer tu a écrit un text qui ne convient avec la politique de notre site .' });
    }
});

// Démarrage du serveur
const PORT = process.env.PORT || 3009;
app.listen(PORT, () => {
    console.log(`Serveur Express démarré sur le port ${PORT}`);
});
