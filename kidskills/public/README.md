# KidSkills Assets Directory

This directory contains all the static assets used in the KidSkills application. The assets are organized into subdirectories based on their type and purpose.

## Directory Structure

- **audio/** - Sound effects and audio files
- **images/** - Visual assets organized by category
  - **activities/** - Icons for different activity types
  - **achievements/** - Achievement badges
  - **backgrounds/** - Background images for different subjects
  - **characters/** - Character guide images with different emotions
  - **subjects/** - Subject icons for math, english, and leadership
- **fonts/** - Custom fonts used in the application

## Asset Usage Guidelines

### Images

1. **Subject Icons**: Used on the home page and in navigation to represent different subjects.
   - `math.svg` - Icon for math activities
   - `english.svg` - Icon for English activities
   - `leadership.svg` - Icon for leadership activities

2. **Activity Type Icons**: Used to visually represent different types of activities.
   - `multiple-choice.svg` - Icon for multiple choice activities
   - `drag-drop.svg` - Icon for drag and drop activities
   - `fill-blank.svg` - Icon for fill in the blank activities
   - `matching.svg` - Icon for matching activities
   - `tracing.svg` - Icon for tracing activities

3. **Character Images**: Used for the character guide that provides feedback and instructions.
   - Each character has four emotion states: happy, excited, thinking, and confused
   - See the README in the characters directory for more details

4. **Background Images**: Used as page backgrounds for different subject areas.
   - `math-bg.svg` - Background for math activities
   - `english-bg.svg` - Background for English activities
   - `leadership-bg.svg` - Background for leadership activities

5. **Achievement Badges**: Displayed when users earn achievements.
   - `math-master.svg` - Badge for math achievements
   - `english-expert.svg` - Badge for English achievements
   - `leadership-champion.svg` - Badge for leadership achievements

### Audio

1. **Sound Effects**: Used for user interactions and feedback.
   - `button-click.mp3` - Sound for button clicks
   - `navigation.mp3` - Sound for page navigation
   - `card-select.mp3` - Sound for selecting activity cards

See the README in the audio directory for more details on audio files.

## Adding New Assets

When adding new assets:

1. Place them in the appropriate subdirectory
2. Use consistent naming conventions
3. Optimize images for web (SVG preferred for icons and illustrations)
4. Keep file sizes small (under 100KB for images, under 500KB for audio)
5. Update this README if adding new asset categories

## Asset Credits

The assets in this directory were created specifically for the KidSkills application and are not licensed for external use without permission. 