var fs = require('fs').promises;
var ZwiftAccount = require("zwift-mobile-api");
var username = "photobysurs8@gmail.com";
var password = "ParoldlyZwift1";
var playerId = "6366058";
var account = new ZwiftAccount(username, password);

var world = account.getWorld(1);

// Добавляем массив для хранения последних измерений
const measurements = [];
const WINDOW_SIZE = 5; // Размер окна скользящего среднего

function calculateSlope(x1, y1, altitude1, x2, y2, altitude2) {
    // Calculate horizontal distance using x and y coordinates
    const horizontalDistance = Math.sqrt(
        Math.pow(x2 - x1, 2) + 
        Math.pow(y2 - y1, 2)
    );
    
    // Calculate vertical distance (altitude difference)
    const verticalDistance = altitude2 - altitude1;
    
    // Slope percentage is rise over run, multiplied by 100
    const slopePercentage = (verticalDistance / horizontalDistance) * 100;
    
    // Calculate angle in degrees using arctangent
    // Use Math.atan instead of Math.atan2 since we already have the ratio
    const slopeDegrees = Math.atan(verticalDistance / horizontalDistance) * (180 / Math.PI);
    
    return {
        degrees: slopeDegrees,
        percentage: slopePercentage
    };
}

function calculateMovingAverage(measurements) {
    const sumDegrees = measurements.reduce((sum, m) => sum + m.degrees, 0);
    const sumPercentage = measurements.reduce((sum, m) => sum + m.percentage, 0);
    return {
        degrees: sumDegrees / measurements.length,
        percentage: sumPercentage / measurements.length
    };
}

function hasPositionChanged(oldPos, newPos, threshold = 1) {
    const xDiff = Math.abs(oldPos.x - newPos.x);
    const yDiff = Math.abs(oldPos.y - newPos.y);
    const altDiff = Math.abs(oldPos.altitude - newPos.altitude);
    
    return xDiff > threshold && 
           yDiff > threshold && 
           altDiff > threshold;
}

let previousState = null;

function trackSlope() {
    world.riderStatus(playerId).then(status => {
        if (previousState && hasPositionChanged(previousState, status)) {
            const currentSlope = calculateSlope(
                previousState.x,
                previousState.y,
                previousState.altitude,
                status.x,
                status.y,
                status.altitude
            );

            // Добавляем текущее измерение в массив
            measurements.push(currentSlope);
            
            // Оставляем только последние WINDOW_SIZE измерений
            if (measurements.length > WINDOW_SIZE) {
                measurements.shift();
            }

            // Рассчитываем скользящее среднее
            const averageSlope = calculateMovingAverage(measurements);

            console.log(`x: ${status.x}, y: ${status.y}, altitude: ${status.altitude}`);
            console.log(`Мгновенный уклон: ${currentSlope.degrees.toFixed(2)}° (${currentSlope.percentage.toFixed(1)}%)`);
            console.log(`Средний уклон: ${averageSlope.degrees.toFixed(2)}° (${averageSlope.percentage.toFixed(1)}%)`);
        }
        
        previousState = status;
    });
}

setInterval(trackSlope, 1500);
