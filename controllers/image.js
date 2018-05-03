const Clarifai = require('clarifai');

const app = new Clarifai.App({
    apiKey: process.env.CLARIFAI_KEY
});

const handleImageURL = (req, res) => {
    app.models.predict(
        Clarifai.FACE_DETECT_MODEL,
        req.body.input
    )
    .then(data => res.json(data))
    .catch(err => res.status(400).json('clarifai not working!'))
}

module.exports = {
    handleImageURL: handleImageURL
}