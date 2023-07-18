const tf = require('@tensorflow/tfjs');

function preprocessData(data) {
    // Normalize the data
    const min = Math.min(...data);
    const max = Math.max(...data);
    const normalizedData = data.map((value) => (value - min) / (max - min));

    // Convert the data into appropriate input format for the RNN
    const input = normalizedData.slice(0, -1);
    const target = normalizedData.slice(1);

    // Convert the input and target into TensorFlow tensors
    const inputTensor = tf.tensor2d(input, [input.length, 1]);
    const targetTensor = tf.tensor2d(target, [target.length, 1]);

    return { input: inputTensor, target: targetTensor, min, max };
}

function createRNNModel() {
    const model = tf.sequential();
    model.add(tf.layers.simpleRNN({
        units: 32, // Number of units (hidden neurons)
        inputShape: [1] // Input shape: [number of features]
    }));
    model.add(tf.layers.dense({ units: 1 })); // Output layer with 1 unit
    model.compile({ optimizer: 'adam', loss: 'meanSquaredError' });
    return model;
}

function denormalizeData(data, min, max) {
    const denormalizedData = data.map((value) => value * (max - min) + min);
    return denormalizedData;
}

async function trainRNN(data, epochs) {
    const { input, target, min, max } = preprocessData(data);
    const model = createRNNModel();

    await model.fit(input, target, { epochs });

    return { model, min, max };
}

function forecastRNN(model, seedData, forecastLength) {
    const { min, max } = model;
    const seed = seedData.slice(); // Create a copy of the seed data
    const forecast = [];

    // Normalize the seed data
    const normalizedSeed = seed.map((value) => (value - min) / (max - min));

    // Generate forecasts
    let input = tf.tensor2d([normalizedSeed], [1, 1]);
    for (let i = 0; i < forecastLength; i++) {
        const output = model.predict(input);
        const denormalizedOutput = output.dataSync()[0] * (max - min) + min;
        forecast.push(denormalizedOutput);
        seed.shift(); // Remove the first element from the seed
        seed.push(denormalizedOutput); // Append the forecasted value to the seed
        input = tf.tensor2d([seed.map((value) => (value - min) / (max - min))], [1, 1]);
    }

    return forecast;
}

// Example usage
const data = [1, 2, 3, 4, 5, 6, 7, 8, 9];
const epochs = 100;
const forecastLength = 5;

(async function () {
    const { model, min, max } = await trainRNN(data, epochs);
    const seedData = data.slice(data.length - 1); // Use the last value as seed data
    const forecast = forecastRNN(model, seedData, forecastLength);
    const denormalizedForecast = denormalizeData(forecast, min, max);
    console.log('Forecast:', denormalizedForecast);
})();
