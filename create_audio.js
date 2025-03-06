const fs = require('fs');
const { exec } = require('child_process');
const path = require('path');

// Ensure the audio directory exists
const audioDir = path.join(__dirname, 'kidskills', 'public', 'audio');
if (!fs.existsSync(audioDir)) {
  fs.mkdirSync(audioDir, { recursive: true });
}

// Function to create a simple audio file using sox
function createAudioFile(filename, command) {
  return new Promise((resolve, reject) => {
    const outputPath = path.join(audioDir, filename);
    exec(command + ' ' + outputPath, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error creating ${filename}:`, error);
        reject(error);
      } else {
        console.log(`Created ${filename}`);
        resolve();
      }
    });
  });
}

// Create the audio files
async function createAudioFiles() {
  try {
    // Create button click sound
    await createAudioFile(
      'button-click.mp3',
      'sox -n -r 44100 -c 1 -b 16 -t wav - synth 0.1 sine 1000 fade 0 0.1 0.05 | lame -b 64 -'
    );

    // Create correct answer sound
    await createAudioFile(
      'correct-answer.mp3',
      'sox -n -r 44100 -c 1 -b 16 -t wav - synth 0.15 sine 880 sine 1760 fade 0 0.15 0.05 | lame -b 64 -'
    );

    // Create incorrect answer sound
    await createAudioFile(
      'incorrect-answer.mp3',
      'sox -n -r 44100 -c 1 -b 16 -t wav - synth 0.15 sine 440 sine 220 fade 0 0.15 0.05 | lame -b 64 -'
    );

    // Create navigation sound
    await createAudioFile(
      'navigation.mp3',
      'sox -n -r 44100 -c 1 -b 16 -t wav - synth 0.15 sine 660 sine 880 fade 0 0.15 0.05 | lame -b 64 -'
    );

    // Create card select sound
    await createAudioFile(
      'card-select.mp3',
      'sox -n -r 44100 -c 1 -b 16 -t wav - synth 0.15 sine 440 sine 660 fade 0 0.15 0.05 | lame -b 64 -'
    );

    // Create success sound
    await createAudioFile(
      'success.mp3',
      'sox -n -r 44100 -c 1 -b 16 -t wav - synth 0.3 sine 880 sine 1320 sine 1760 fade 0 0.3 0.1 | lame -b 64 -'
    );

    // Create hint sound
    await createAudioFile(
      'hint.mp3',
      'sox -n -r 44100 -c 1 -b 16 -t wav - synth 0.2 sine 660 sine 990 fade 0 0.2 0.05 | lame -b 64 -'
    );

    console.log('All audio files created successfully!');
  } catch (error) {
    console.error('Error creating audio files:', error);
  }
}

// Run the function
createAudioFiles();
