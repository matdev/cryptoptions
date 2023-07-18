
/*
 * inputTimesSeries: A time series such as [2, 4, 6, 8, 10, 12]
 * sliceSize: The size of each slice i.e. if sliceSize = 3 => returns [[2, 4, 6], [4, 6, 8], [6, 8, 10], [8, 10, 12]]
 */
export function sliceTimeSeries(inputTimesSeries, sliceSize) {

    console.log("sliceTimeSeries() INPUT : inputTimesSeries.length " + inputTimesSeries.length + " sliceSize = " + sliceSize);

    let lastSliceIndex = inputTimesSeries.length - sliceSize;

    let result = [];

    for (let i = 0; i <= lastSliceIndex; i++) {
        const slice = inputTimesSeries.slice(i, sliceSize + i);

        result[i] = slice;
    }

    console.log("sliceTimeSeries() OUTPUT : result.length " + result.length + " result = " + result);

    return result;
}

/*
 const inputData = [
    [1, 2, 3, 4],   // Data point 1: input features [1, 2, 3] and target value 4
    [2, 4, 6, 8],   // Data point 2: input features [2, 4, 6] and target value 8
    [3, 6, 9, 12],  // Data point 3: input features [3, 6, 9] and target value 12
    // ... additional data points
];
*/
export function forecastTimeSeries(inputData, forecastLength) {
    // Normalize the input data
    const normalizedData = normalizeData(inputData);

    // Split the normalized data into training and testing sets
    const trainingData = normalizedData.slice(0, Math.floor(normalizedData.length * 0.8));
    const testingData = normalizedData.slice(Math.floor(normalizedData.length * 0.8));

    // Set the parameters for the radial basis neural network
    const numCenters = 10; // original: 10 Number of radial basis functions (centers)
    const learningRate = 0.01; // original: 0.01 Learning rate
    const numIterations = 100; // original: 100 Number of training iterations

    // Initialize the radial basis neural network
    const rbfNetwork = new RadialBasisNetwork(numCenters, inputData[0].length - 1);

    // Train the network using the training data
    for (let i = 0; i < numIterations; i++) {
        for (const data of trainingData) {
            const input = data.slice(0, data.length - 1);
            const target = data[data.length - 1];
            rbfNetwork.train(input, target, learningRate);
        }
    }

    // Make forecasts for the testing data
    const forecasts = [];
    let lastInput = testingData[0].slice(0, testingData[0].length - 1);
    for (let i = 0; i < forecastLength; i++) {
        const forecast = rbfNetwork.predict(lastInput);
        forecasts.push(forecast);
        lastInput = lastInput.slice(1).concat(forecast); // Shift the input by 1 and append the forecast
    }

    // Denormalize the forecasts
    const denormalizedForecasts = denormalizeData(forecasts, inputData);

    return denormalizedForecasts;
}

export function forecastTimeSeries_v2(inputData, forecastLength) {

    console.log("forecastTimeSeries_v2 : inputData = " + inputData);

    // Normalize the input data
    const normalizedData = normalizeData_v2(inputData);

    // Set the parameters for the radial basis neural network
    const numCenters = 10; // Number of radial basis functions (centers)
    const learningRate = 0.01; // Learning rate
    const numIterations = 100; // Number of training iterations

    // Initialize the radial basis neural network
    const rbfNetwork = new RadialBasisNetwork(numCenters, 1); // 1 input feature

    // Train the network using the input data
    const trainingData = normalizedData.slice(0, normalizedData.length - 1);
    const targetData = normalizedData.slice(1);
    for (let i = 0; i < numIterations; i++) {
        for (let j = 0; j < trainingData.length; j++) {
            const input = [trainingData[j]];
            const target = targetData[j];
            rbfNetwork.train(input, target, learningRate);
        }
    }

    // Make forecasts
    const lastInput = [normalizedData[normalizedData.length - 1]]; // Use the last value of the normalized input data
    const forecasts = [];
    for (let i = 0; i < forecastLength; i++) {
        const forecast = rbfNetwork.predict(lastInput);
        forecasts.push(forecast);
        lastInput[0] = forecast; // Update the input with the forecasted value
    }

    // Denormalize the forecasts
    const denormalizedForecasts = denormalizeData_v2(forecasts, inputData);

    return denormalizedForecasts;
}

// Helper function to normalize the data
function normalizeData_v2(data) {
    const min = Math.min(...data);
    const max = Math.max(...data);
    const normalizedData = data.map((value) => (value - min) / (max - min));
    return normalizedData;
}

// Helper function to denormalize the data
function denormalizeData_v2(data, originalData) {
    const min = Math.min(...originalData);
    const max = Math.max(...originalData);
    const denormalizedData = data.map((value) => value * (max - min) + min);
    return denormalizedData;
}

// Helper function to normalize the data
function normalizeData(data) {
    const min = Math.min(...data.flat());
    const max = Math.max(...data.flat());
    const normalizedData = data.map((dataPoint) => {
        const normalizedPoint = dataPoint.slice(); // Make a copy of the data point
        for (let i = 0; i < normalizedPoint.length; i++) {
            normalizedPoint[i] = (normalizedPoint[i] - min) / (max - min);
        }
        return normalizedPoint;
    });
    return normalizedData;
}

// Helper function to denormalize the data
function denormalizeData(data, originalData) {
    const min = Math.min(...originalData.flat());
    const max = Math.max(...originalData.flat());
    const denormalizedData = data.map((value) => value * (max - min) + min);
    return denormalizedData;
}

// Radial basis neural network class
class RadialBasisNetwork {
    constructor(numCenters, numInputs) {
        this.numCenters = numCenters;
        this.numInputs = numInputs;

        // Initialize the weights and centers randomly
        this.weights = [];
        this.centers = [];
        for (let i = 0; i < numCenters; i++) {
            const center = [];
            for (let j = 0; j < numInputs; j++) {
                center.push(Math.random());
            }
            this.centers.push(center);
            this.weights.push(Math.random());
        }
    }

    // Train the network
    train(input, target, learningRate) {
        const activations = this.calculateActivations(input);
        const output = this.calculateOutput(activations);

        // Update the weights based on the error
        for (let i = 0; i < this.numCenters; i++) {
            const error = target - output;
            const delta = learningRate * error * activations[i];
            this.weights[i] += delta;
        }
    }

    // Predict the output for a given input
    predict(input) {
        const activations = this.calculateActivations(input);
        const output = this.calculateOutput(activations);
        return output;
    }

    // Calculate the activations of the radial basis functions
    calculateActivations(input) {
        const activations = [];
        for (let i = 0; i < this.numCenters; i++) {
            const center = this.centers[i];
            let activation = 0;
            for (let j = 0; j < this.numInputs; j++) {
                const distance = Math.abs(input[j] - center[j]);
                activation += distance * distance;
            }
            activation = Math.exp(-activation);
            activations.push(activation);
        }
        return activations;
    }

    // Calculate the output based on the activations and weights
    calculateOutput(activations) {
        let output = 0;
        for (let i = 0; i < this.numCenters; i++) {
            output += activations[i] * this.weights[i];
        }
        return output;
    }
}

