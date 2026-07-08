'use strict';
/**
 * Confident Computing - 16 accessible digital-skills lessons.
 *
 * Designed for supported adults and staff-led delivery:
 * - one clear outcome per lesson
 * - short guided steps
 * - interactive checks that reinforce the real workflow
 * - staff notes for prompt fading and evidence of independence
 */
const course = {
  slug: 'confident-computing',
  title: 'Confident Computing',
  description: 'Build practical computer confidence from first sign-in through everyday Word and Excel tasks, one calm step at a time.',
  lessons: [
    {
      title: 'Turn on and sign in',
      goal: 'Switch the computer on, sign in safely, and recognise the desktop.',
      steps: [
        'Find the power button and press it once',
        'Wait while the computer starts',
        'Type the computer password carefully',
        'Check that the desktop has appeared',
        'If ready: open the Start menu and find the shut down option',
      ],
      tasks: [
        {
          q: 'Which control turns the computer on?',
          type: 'pick',
          ok: 'Correct. The power control starts the computer.',
          hint: 'Look for the option that says Power.',
          options: [
            { t: 'Power', ok: true, s: 'key' },
            { t: 'Volume', s: 'key' },
            { t: 'Brightness', s: 'key' },
          ],
        },
        {
          q: 'Type a practice password to sign in:',
          type: 'type',
          placeholder: 'Type here',
          ok: 'Good. That is the careful pace we use when signing in.',
        },
      ],
      carer: 'Let the learner press the power button and type. Offer one prompt at a time, then wait.',
    },

    {
      title: 'Use the mouse and click',
      goal: 'Move the pointer, click once, and choose an item on screen.',
      steps: [
        'Rest your hand gently on the mouse',
        'Move the mouse and watch the pointer move',
        'Point to the item you want',
        'Click once to choose it',
        'If ready: right-click once and close the menu by clicking away',
      ],
      tasks: [
        {
          q: 'Click once on the Word app.',
          type: 'pick',
          ok: 'Yes. One click chooses the item.',
          hint: 'Word is the blue W.',
          options: [
            { t: 'W', ok: true, s: 'icon-w' },
            { t: 'X', s: 'icon-x' },
            { t: 'Bin', s: 'icon' },
          ],
        },
        {
          q: 'How many clicks do we use to choose something?',
          type: 'pick',
          ok: 'Correct. One click chooses.',
          options: [
            { t: 'One click', ok: true },
            { t: 'Five clicks' },
          ],
        },
      ],
      carer: 'If hand movement is difficult, guide at the wrist, then reduce support as confidence grows.',
    },

    {
      title: 'Open with double-click',
      goal: 'Open a file or folder with two quick clicks.',
      steps: [
        'Point at the folder or app',
        'Keep the mouse still',
        'Click twice quickly',
        'Wait for the folder or app to open',
        'If ready: double-click Word from the desktop',
      ],
      tasks: [
        {
          q: 'How do we open something from the desktop?',
          type: 'pick',
          ok: 'Correct. Two quick clicks opens it.',
          options: [
            { t: 'Two quick clicks', ok: true },
            { t: 'One slow click' },
          ],
        },
        {
          q: 'Double-click the Documents folder.',
          type: 'pick',
          ok: 'It opened. That is a confident double-click.',
          options: [
            { t: 'Documents folder', ok: true, s: 'icon' },
          ],
        },
      ],
      carer: 'Count the rhythm if needed: click-click. Keep praise specific to the action.',
    },

    {
      title: 'Use the keyboard',
      goal: 'Type letters, make spaces, start a new line, and fix a mistake.',
      steps: [
        'Click where the cursor is flashing',
        'Type a short word',
        'Press Space to make a gap',
        'Press Enter to start a new line',
        'If ready: hold Shift for one capital letter',
      ],
      tasks: [
        {
          q: 'Type the word: cat',
          type: 'type',
          placeholder: 'Type cat',
          answer: 'cat',
          ok: 'Well done. You typed the word accurately.',
          hint: 'Find c, then a, then t.',
        },
        {
          q: 'Which key removes the last letter?',
          type: 'pick',
          ok: 'Correct. Backspace removes the last letter.',
          options: [
            { t: 'Backspace', ok: true, s: 'key' },
            { t: 'Enter', s: 'key' },
            { t: 'Space', s: 'key' },
          ],
        },
      ],
      carer: 'Give time for visual scanning. If the learner makes a mistake, practise Backspace calmly.',
    },

    {
      title: 'Open, minimise and close',
      goal: 'Open a program, control the window, and close it safely.',
      steps: [
        'Open one program',
        'Find the window controls in the top corner',
        'Minimise the window if you need it out of the way',
        'Close the window with X when finished',
        'If ready: reopen the same program from the taskbar',
      ],
      tasks: [
        {
          q: 'Which button closes a window?',
          type: 'pick',
          ok: 'Correct. X closes the window.',
          hint: 'Close means finished with this window.',
          options: [
            { t: 'Minimise', s: 'win' },
            { t: 'Maximise', s: 'win' },
            { t: 'X Close', ok: true, s: 'win-x' },
          ],
        },
        {
          q: 'What is best when learning a new task?',
          type: 'pick',
          ok: 'Correct. One window keeps the screen easier to understand.',
          options: [
            { t: 'Keep one window open', ok: true },
            { t: 'Open everything at once' },
          ],
        },
      ],
      carer: 'Keep the screen calm. Close distractions before the next instruction.',
    },

    {
      title: 'Save a file',
      goal: 'Save work with a clear name in the Documents folder.',
      steps: [
        'Click File',
        'Choose Save As',
        'Type a simple file name',
        'Choose Documents',
        'If ready: use Ctrl + S to save changes quickly',
      ],
      tasks: [
        {
          q: 'Type a clear file name:',
          type: 'type',
          placeholder: 'my first note',
          ok: 'Good file name. Clear names make work easier to find.',
        },
        {
          q: 'Where should we save practice work first?',
          type: 'pick',
          ok: 'Correct. Documents is the safe first place to save.',
          options: [
            { t: 'Documents', ok: true, s: 'icon' },
            { t: 'Recycle Bin', s: 'icon' },
          ],
        },
      ],
      carer: 'Repeat the same save location each time until the routine is familiar.',
    },

    {
      title: 'Find files and folders',
      goal: 'Open Documents, find a saved file, and understand what folders are for.',
      steps: [
        'Open File Explorer',
        'Choose Documents',
        'Look for the file name you saved',
        'Open the file to check it',
        'If ready: create a new folder for practice work',
      ],
      tasks: [
        {
          q: 'A folder helps you keep files...',
          type: 'pick',
          ok: 'Correct. Folders keep related files together.',
          options: [
            { t: 'Organised', ok: true },
            { t: 'Hidden forever' },
          ],
        },
        {
          q: 'Choose the place where your saved work is usually kept.',
          type: 'pick',
          ok: 'Yes. Documents is where we look first.',
          options: [
            { t: 'Documents', ok: true, s: 'icon' },
            { t: 'Downloads only', s: 'icon' },
          ],
        },
      ],
      carer: 'Use real file names from the learner where possible. This makes the lesson meaningful.',
    },

    {
      title: 'Practice: save and find',
      goal: 'Complete the full routine: create, save, close, and find again.',
      steps: [
        'Open Word',
        'Type a short note',
        'Save it in Documents',
        'Close Word',
        'If ready: find and reopen the note with no reminders',
      ],
      tasks: [
        {
          q: 'Type a short note:',
          type: 'type',
          placeholder: 'Today I practised saving my work.',
          ok: 'Great. That is ready to save.',
        },
        {
          q: 'What should happen before closing the file?',
          type: 'pick',
          ok: 'Correct. Save before closing so the work is not lost.',
          options: [
            { t: 'Save first', ok: true },
            { t: 'Close first' },
          ],
        },
      ],
      carer: 'Step back for this lesson. Record the prompt level honestly so progress is useful.',
    },

    {
      title: 'Word: type a sentence',
      goal: 'Open Word and write a complete sentence with a capital letter and full stop.',
      steps: [
        'Open Microsoft Word',
        'Click the blank page',
        'Start with a capital letter',
        'End with a full stop',
        'If ready: write two connected sentences',
      ],
      tasks: [
        {
          q: 'Choose the app used for documents.',
          type: 'pick',
          ok: 'Correct. Word is used for documents and letters.',
          options: [
            { t: 'W', ok: true, s: 'icon-w' },
            { t: 'X', s: 'icon-x' },
          ],
        },
        {
          q: 'Which key helps make a capital letter?',
          type: 'pick',
          ok: 'Correct. Hold Shift for one capital letter.',
          options: [
            { t: 'Shift', ok: true, s: 'key' },
            { t: 'Space', s: 'key' },
            { t: 'Backspace', s: 'key' },
          ],
        },
        {
          q: 'Type a full sentence:',
          type: 'type',
          placeholder: 'I am learning to use a computer.',
          ok: 'Excellent. That sentence is clear and complete.',
        },
      ],
      carer: 'Focus on meaning first, then accuracy. Support punctuation after the sentence is typed.',
    },

    {
      title: 'Word: copy, paste and undo',
      goal: 'Select text, copy it, paste it, and undo a mistake.',
      steps: [
        'Select the word or sentence',
        'Copy with Ctrl + C',
        'Click where the copy should go',
        'Paste with Ctrl + V',
        'If ready: undo with Ctrl + Z',
      ],
      tasks: [
        {
          q: 'Copy is Ctrl plus which letter?',
          type: 'pick',
          ok: 'Correct. Ctrl + C copies.',
          hint: 'C is for copy.',
          options: [
            { t: 'C', ok: true, s: 'key' },
            { t: 'V', s: 'key' },
            { t: 'Z', s: 'key' },
          ],
        },
        {
          q: 'Paste is Ctrl plus which letter?',
          type: 'pick',
          ok: 'Correct. Ctrl + V pastes.',
          options: [
            { t: 'V', ok: true, s: 'key' },
            { t: 'C', s: 'key' },
            { t: 'B', s: 'key' },
          ],
        },
        {
          q: 'Undo is Ctrl plus which letter?',
          type: 'pick',
          ok: 'Correct. Ctrl + Z undoes the last change.',
          options: [
            { t: 'Z', ok: true, s: 'key' },
            { t: 'Y', s: 'key' },
            { t: 'A', s: 'key' },
          ],
        },
      ],
      carer: 'Teach one shortcut at a time. Say the action first, then the keys.',
    },

    {
      title: 'Word: format text',
      goal: 'Make text easier to read using bold, italic, underline and colour.',
      steps: [
        'Select the word first',
        'Press B for bold',
        'Press I for italic',
        'Press U for underline',
        'If ready: change the font colour for a heading',
      ],
      tasks: [
        {
          q: 'Which button makes text bold?',
          type: 'pick',
          ok: 'Correct. B makes text bold.',
          options: [
            { t: 'B', ok: true, s: 'bold' },
            { t: 'I', s: 'it' },
            { t: 'U', s: 'ul' },
          ],
        },
        {
          q: 'Which button makes text italic?',
          type: 'pick',
          ok: 'Correct. I makes text italic.',
          options: [
            { t: 'I', ok: true, s: 'it' },
            { t: 'B', s: 'bold' },
            { t: 'U', s: 'ul' },
          ],
        },
        {
          q: 'Which button changes text colour?',
          type: 'pick',
          ok: 'Correct. The A colour button changes text colour.',
          options: [
            { t: 'A Colour', ok: true, s: 'colour' },
            { t: 'B', s: 'bold' },
            { t: 'U', s: 'ul' },
          ],
        },
      ],
      carer: 'Repeat: choose first, then change. This prevents accidental formatting.',
    },

    {
      title: 'Word: title and alignment',
      goal: 'Create a clear title, change the text size, and centre it on the page.',
      steps: [
        'Type a title at the top',
        'Select the title',
        'Choose a bigger font size',
        'Make the title bold',
        'If ready: centre the title',
      ],
      tasks: [
        {
          q: 'For a bigger title, choose a...',
          type: 'pick',
          ok: 'Correct. Bigger numbers make bigger text.',
          options: [
            { t: 'Bigger number', ok: true },
            { t: 'Smaller number' },
          ],
        },
        {
          q: 'Which alignment puts the title in the middle?',
          type: 'pick',
          ok: 'Correct. Centre alignment puts it in the middle.',
          options: [
            { t: 'Left' },
            { t: 'Centre', ok: true },
            { t: 'Right' },
          ],
        },
        {
          q: 'Type a title for a simple document:',
          type: 'type',
          placeholder: 'My Shopping List',
          ok: 'That title is clear and useful.',
        },
      ],
      carer: 'Use a real document idea, such as a shopping list, appointment note or letter.',
    },

    {
      title: 'Word: lists, spell check and PDF',
      goal: 'Create a bulleted list, check spelling, and save a document as a PDF.',
      steps: [
        'Use the bullet button to make a list',
        'Look for red wavy spelling lines',
        'Right-click a word to see spelling suggestions',
        'Choose File, Save As, then PDF',
        'If ready: practise printing or sharing the PDF',
      ],
      tasks: [
        {
          q: 'A red wavy line usually means...',
          type: 'pick',
          ok: 'Correct. It means check the spelling.',
          options: [
            { t: 'Check the spelling', ok: true },
            { t: 'The word is bold' },
          ],
        },
        {
          q: 'Which option makes a neat list?',
          type: 'pick',
          ok: 'Correct. Bullets make a clear list.',
          options: [
            { t: 'Bullets', ok: true },
            { t: 'Bold only', s: 'bold' },
          ],
        },
        {
          q: 'To share a document safely, save as...',
          type: 'pick',
          ok: 'Correct. PDF keeps the layout consistent.',
          options: [
            { t: 'PDF', ok: true, s: 'key' },
            { t: 'Music file', s: 'key' },
            { t: 'Random folder', s: 'key' },
          ],
        },
      ],
      carer: 'A PDF is useful for sending, printing or evidencing completed work.',
    },

    {
      title: 'Excel: cells, rows and columns',
      goal: 'Recognise cells, rows, columns and the cell name in Excel.',
      steps: [
        'Open Microsoft Excel',
        'Notice the grid of cells',
        'Columns use letters across the top',
        'Rows use numbers down the side',
        'If ready: click A1 and move with arrow keys',
      ],
      tasks: [
        {
          q: 'Each box in Excel is called a...',
          type: 'pick',
          ok: 'Correct. Each box is a cell.',
          options: [
            { t: 'Cell', ok: true },
            { t: 'Bag' },
          ],
        },
        {
          q: 'Choose the first cell in the top-left corner.',
          type: 'pick',
          ok: 'Correct. The first cell is A1.',
          options: [
            { t: 'A1', ok: true, s: 'cell' },
            { t: 'B2', s: 'cell' },
            { t: 'C3', s: 'cell' },
          ],
        },
        {
          q: 'Columns are named with...',
          type: 'pick',
          ok: 'Correct. Columns use letters.',
          options: [
            { t: 'Letters', ok: true },
            { t: 'Colours' },
          ],
        },
      ],
      carer: 'Use zoom if the grid feels busy. Keep the language consistent: columns across, rows down.',
    },

    {
      title: 'Excel: build a tidy table',
      goal: 'Enter simple data, add a header, widen a column and format money.',
      steps: [
        'Click cell A1',
        'Type a column heading',
        'Type items down the column',
        'Make the header bold',
        'If ready: format prices as currency',
      ],
      tasks: [
        {
          q: 'Type a useful table heading:',
          type: 'type',
          placeholder: 'Item',
          ok: 'Good. A clear heading starts a tidy table.',
        },
        {
          q: 'How should a header row stand out?',
          type: 'pick',
          ok: 'Correct. Bold headers are easier to scan.',
          options: [
            { t: 'Bold', ok: true, s: 'bold' },
            { t: 'Hidden' },
          ],
        },
        {
          q: 'Which format is used for prices?',
          type: 'pick',
          ok: 'Correct. Currency is used for money.',
          options: [
            { t: 'Currency', ok: true, s: 'key' },
            { t: 'Percent', s: 'key' },
            { t: 'Bold text', s: 'bold' },
          ],
        },
      ],
      carer: 'Practise with realistic examples such as snacks, bus fares or weekly shopping.',
    },

    {
      title: 'Excel: formulas and totals',
      goal: 'Use a simple formula and AutoSum to calculate a total.',
      steps: [
        'Every formula starts with =',
        'Add two numbers, for example =2+3',
        'Use AutoSum to add a column',
        'Press Enter to show the answer',
        'If ready: explain what the total means',
      ],
      tasks: [
        {
          q: 'Every Excel formula starts with which sign?',
          type: 'pick',
          ok: 'Correct. Formulas start with =.',
          options: [
            { t: '=', ok: true, s: 'key' },
            { t: '?', s: 'key' },
            { t: '#', s: 'key' },
          ],
        },
        {
          q: 'Type a formula to add 2 and 3:',
          type: 'type',
          placeholder: '=2+3',
          answer: '2+3',
          ok: 'Correct. That formula gives 5.',
          hint: 'Start with = and then type 2+3.',
        },
        {
          q: 'Which option adds a whole column for you?',
          type: 'pick',
          ok: 'Correct. AutoSum adds the selected numbers.',
          options: [
            { t: 'AutoSum', ok: true, s: 'key' },
            { t: 'Bold', s: 'bold' },
            { t: 'Percent', s: 'key' },
          ],
        },
      ],
      carer: 'Celebrate the completed course. Ask the learner to describe one thing they can now do more independently.',
    },
  ],
};

const extendedPractice = [
  [
    { q: 'Staff setup: prepare the real computer before the learner starts.', type: 'practice', minutes: 5, detail: 'Check the device is charged, the keyboard and mouse are connected, and the learner can sit comfortably with the screen visible.', evidence: 'Staff can describe any access needs before the task begins.' },
    { q: 'Guided routine: turn on, wait, sign in and point to the desktop.', type: 'practice', minutes: 12, detail: 'Repeat the full start-up routine twice. First time with staff prompts, second time with fewer prompts.', evidence: 'Learner reaches the desktop and says or points to one thing they recognise.' },
    { q: 'Decision check: what should you do if the computer is still starting?', type: 'pick', ok: 'Correct. Waiting is part of starting a computer safely.', options: [{ t: 'Wait calmly', ok: true }, { t: 'Press every key' }, { t: 'Turn it off immediately' }] },
    { q: 'Independence practice: start from a signed-out screen.', type: 'practice', minutes: 15, detail: 'Staff signs out, then the learner signs back in with only one prompt at a time. Pause after each prompt so they can think.', evidence: 'Record whether the learner needed physical, gesture, verbal or no support.' },
    { q: 'Reflection: type one thing you saw on the desktop.', type: 'type', placeholder: 'Start menu', ok: 'Good noticing. Recognising the desktop builds confidence.' },
    { q: 'Stretch task: shut down safely with staff support.', type: 'practice', minutes: 8, detail: 'Open the Start menu, choose the power option, and identify Shut down. Staff can complete the final click if needed.', evidence: 'Learner can find the power menu again when asked.' },
  ],
  [
    { q: 'Warm-up: move the pointer to all four corners of the screen.', type: 'practice', minutes: 8, detail: 'Ask the learner to move slowly to top-left, top-right, bottom-left and bottom-right. Repeat until the movement is calmer.', evidence: 'Pointer movement becomes more controlled by the end.' },
    { q: 'Accuracy practice: click five named targets.', type: 'practice', minutes: 12, detail: 'Use real icons or safe blank desktop space. Staff names a target, learner moves to it and single-clicks once.', evidence: 'Count how many clicks landed on the intended target.' },
    { q: 'Which click chooses something without opening it?', type: 'pick', ok: 'Correct. One click chooses.', options: [{ t: 'One click', ok: true }, { t: 'Double-click' }, { t: 'Hold the button down' }] },
    { q: 'Real-world practice: open the Start menu and choose a pinned app.', type: 'practice', minutes: 12, detail: 'Learner single-clicks Start, points to an app, and clicks once to choose or highlight it. Close the menu and repeat.', evidence: 'Learner can explain that one click chooses.' },
    { q: 'Typing check: type the word click.', type: 'type', placeholder: 'click', answer: 'click', ok: 'Correct. That word matches today skill.' },
    { q: 'Independent round: staff gives three target names only.', type: 'practice', minutes: 10, detail: 'Staff says the target name but avoids pointing. Move back to gesture prompts only if the learner gets stuck.', evidence: 'Record the lowest prompt level that worked.' },
  ],
  [
    { q: 'Warm-up: practise click-click rhythm away from the icon.', type: 'practice', minutes: 6, detail: 'Learner practises two quick taps on the mouse while keeping the hand still.', evidence: 'Clicks become closer together and the mouse moves less.' },
    { q: 'Guided open: double-click Documents three times.', type: 'practice', minutes: 12, detail: 'Open Documents, close it, then open it again. Repeat with staff fading prompts each time.', evidence: 'Learner opens the folder at least once with reduced support.' },
    { q: 'What matters most during a double-click?', type: 'pick', ok: 'Correct. Keeping the mouse still helps the computer read two clicks.', options: [{ t: 'Keep the mouse still', ok: true }, { t: 'Move quickly across the screen' }, { t: 'Click slowly once' }] },
    { q: 'Real-world practice: open Word and close it again.', type: 'practice', minutes: 12, detail: 'Learner double-clicks Word, waits for it to open, then closes it using X with staff support.', evidence: 'Learner can say or show when the app is open.' },
    { q: 'Type the action we use to open an icon.', type: 'type', placeholder: 'double-click', answer: 'double', ok: 'Good. Double-click opens desktop items.' },
    { q: 'Independent round: open one folder and one app.', type: 'practice', minutes: 12, detail: 'Staff names the target only. Learner attempts the double-click without hand-over-hand support unless needed.', evidence: 'Record prompt level and any motor access adjustment.' },
  ],
  [
    { q: 'Warm-up: find five letters on the keyboard.', type: 'practice', minutes: 8, detail: 'Staff names letters from the learner name or a familiar word. Learner points first, then presses.', evidence: 'Learner scans the keyboard with less support by the end.' },
    { q: 'Guided typing: type three short words.', type: 'practice', minutes: 12, detail: 'Use simple words such as cat, bus and tea. After each word, press Space before the next word.', evidence: 'Learner uses Space between words at least once.' },
    { q: 'Which key fixes the last mistake?', type: 'pick', ok: 'Correct. Backspace removes the last character.', options: [{ t: 'Backspace', ok: true, s: 'key' }, { t: 'Enter', s: 'key' }, { t: 'Shift', s: 'key' }] },
    { q: 'Line practice: type two words, press Enter, then type two more.', type: 'practice', minutes: 12, detail: 'Learner practises Space and Enter in a short note. Staff points only if needed.', evidence: 'Learner creates at least two lines of text.' },
    { q: 'Type a short message to practise:', type: 'type', placeholder: 'I can type today.', ok: 'Great. That is a useful message.' },
    { q: 'Stretch: make one capital letter using Shift.', type: 'practice', minutes: 8, detail: 'Practise holding Shift and pressing one letter. Keep this calm; it is a stretch task.', evidence: 'Learner attempts Shift with the support level recorded.' },
  ],
  [
    { q: 'Warm-up: name the three window buttons.', type: 'practice', minutes: 8, detail: 'Point to minimise, maximise and close. Explain that X means finished with this window.', evidence: 'Learner identifies X without guessing.' },
    { q: 'Guided open-close routine.', type: 'practice', minutes: 12, detail: 'Open one app, wait, minimise it, bring it back, then close it. Repeat slowly.', evidence: 'Learner completes at least two window actions.' },
    { q: 'Which button means finished with this window?', type: 'pick', ok: 'Correct. X closes the window.', options: [{ t: 'X Close', ok: true, s: 'win-x' }, { t: 'Minimise', s: 'win' }, { t: 'Maximise', s: 'win' }] },
    { q: 'Screen tidying practice.', type: 'practice', minutes: 12, detail: 'Open two safe windows, then close one and keep one open. Talk about why a calm screen helps learning.', evidence: 'Learner can reduce clutter with support.' },
    { q: 'Type the word for the button that closes a window.', type: 'type', placeholder: 'close', answer: 'close', ok: 'Correct. Close means finished.' },
    { q: 'Independent round: open, minimise, restore and close.', type: 'practice', minutes: 12, detail: 'Staff gives the four actions in order. Learner attempts each before staff prompts.', evidence: 'Record the lowest successful prompt level.' },
  ],
  [
    { q: 'Warm-up: decide on a real file name.', type: 'practice', minutes: 6, detail: 'Pick a meaningful name such as shopping list, appointment note or my practice note.', evidence: 'Learner chooses or agrees a clear file name.' },
    { q: 'Guided save: create a note and save it in Documents.', type: 'practice', minutes: 15, detail: 'Open Word, type one sentence, use Save As, type the file name and choose Documents.', evidence: 'A file is saved with a recognisable name.' },
    { q: 'Where should today practice file go first?', type: 'pick', ok: 'Correct. Documents is the first safe place.', options: [{ t: 'Documents', ok: true, s: 'icon' }, { t: 'Recycle Bin', s: 'icon' }, { t: 'Random folder' }] },
    { q: 'Find it again.', type: 'practice', minutes: 12, detail: 'Close Word, open Documents, and locate the saved file. Open it to confirm it is the right one.', evidence: 'Learner finds the saved file with support level recorded.' },
    { q: 'Type the name you would give a practice file:', type: 'type', placeholder: 'my practice note', ok: 'Good. Clear names help you find files later.' },
    { q: 'Stretch: change the note and save again.', type: 'practice', minutes: 8, detail: 'Add one new word or sentence and use Ctrl + S or Save to update the file.', evidence: 'Learner understands saving again keeps changes.' },
  ],
  [
    { q: 'Warm-up: sort file and folder examples.', type: 'practice', minutes: 8, detail: 'Staff says examples: holiday photo, Documents, CV, shopping folder. Learner decides file or folder.', evidence: 'Learner can explain that folders hold files.' },
    { q: 'Guided folder tour.', type: 'practice', minutes: 12, detail: 'Open File Explorer and visit Desktop, Documents and Downloads. Keep returning to Documents as the main place.', evidence: 'Learner recognises Documents as the first place to look.' },
    { q: 'A folder is used to keep files...', type: 'pick', ok: 'Correct. Folders organise files.', options: [{ t: 'Organised', ok: true }, { t: 'Deleted' }, { t: 'Invisible' }] },
    { q: 'Create a practice folder.', type: 'practice', minutes: 12, detail: 'With staff support, create a new folder in Documents called Practice Work.', evidence: 'Folder is created or learner can describe the steps.' },
    { q: 'Type the name for a folder that holds your work:', type: 'type', placeholder: 'Practice Work', ok: 'Good. That is a clear folder name.' },
    { q: 'Stretch: move or save a file into the practice folder.', type: 'practice', minutes: 10, detail: 'Use a safe test file. Staff supports the learner to place it inside the new folder.', evidence: 'Learner sees the file inside the folder.' },
  ],
  [
    { q: 'Warm-up: say the full routine before touching the computer.', type: 'practice', minutes: 5, detail: 'Create, type, save, close, find. Staff says it once, learner repeats or points to prompt cards.', evidence: 'Learner understands the sequence before starting.' },
    { q: 'Guided full routine.', type: 'practice', minutes: 18, detail: 'Open Word, type a note, save it in Documents, close Word, then reopen the file.', evidence: 'Full workflow completed with prompt level recorded.' },
    { q: 'What comes before closing?', type: 'pick', ok: 'Correct. Save first so work is not lost.', options: [{ t: 'Save first', ok: true }, { t: 'Close first' }, { t: 'Turn off first' }] },
    { q: 'Second attempt with fewer prompts.', type: 'practice', minutes: 15, detail: 'Repeat with a new file name. Staff waits longer before helping.', evidence: 'Compare prompt level with the first attempt.' },
    { q: 'Type one sentence for your second note:', type: 'type', placeholder: 'I saved and found my work.', ok: 'Excellent. That sentence fits today practice.' },
    { q: 'Reflection: tell staff what step was easiest and hardest.', type: 'practice', minutes: 7, detail: 'Use words, pointing or yes/no choices. Staff notes barriers and next support.', evidence: 'Reflection captured in support notes if useful.' },
  ],
  [
    { q: 'Warm-up: open Word and find the blank page.', type: 'practice', minutes: 8, detail: 'Learner opens Word, clicks the page, and watches for the flashing cursor.', evidence: 'Learner can place the cursor on the page.' },
    { q: 'Guided sentence building.', type: 'practice', minutes: 15, detail: 'Build one sentence together: capital letter, words, spaces and full stop.', evidence: 'Sentence is readable and complete.' },
    { q: 'Which key helps make one capital letter?', type: 'pick', ok: 'Correct. Hold Shift for a capital letter.', options: [{ t: 'Shift', ok: true, s: 'key' }, { t: 'Space', s: 'key' }, { t: 'Enter', s: 'key' }] },
    { q: 'Independent sentence attempt.', type: 'practice', minutes: 15, detail: 'Learner writes a sentence about something real: lunch, family, work, weather or today lesson.', evidence: 'Record whether they needed help with cursor, Shift, spacing or full stop.' },
    { q: 'Type a full practice sentence:', type: 'type', placeholder: 'I am learning digital skills.', ok: 'Good sentence. It has a clear meaning.' },
    { q: 'Stretch: write a second sentence on a new line.', type: 'practice', minutes: 8, detail: 'Press Enter and add another sentence. Staff supports punctuation only after the idea is typed.', evidence: 'Two-line document created.' },
  ],
  [
    { q: 'Warm-up: select a word three times.', type: 'practice', minutes: 8, detail: 'Practise selecting a word by double-clicking or dragging. Staff can use a large sample word.', evidence: 'Learner understands selected text changes appearance.' },
    { q: 'Guided copy and paste.', type: 'practice', minutes: 15, detail: 'Select one word, copy it with Ctrl + C, click lower on the page and paste with Ctrl + V.', evidence: 'Same word appears twice in the document.' },
    { q: 'Which shortcut copies selected text?', type: 'pick', ok: 'Correct. Ctrl + C copies.', options: [{ t: 'Ctrl + C', ok: true, s: 'key' }, { t: 'Ctrl + V', s: 'key' }, { t: 'Ctrl + Z', s: 'key' }] },
    { q: 'Undo practice.', type: 'practice', minutes: 10, detail: 'Make a safe mistake, such as pasting too many times, then use Ctrl + Z to undo it.', evidence: 'Learner sees that mistakes can be reversed.' },
    { q: 'Type the shortcut letter for paste:', type: 'type', placeholder: 'V', answer: 'v', ok: 'Correct. Ctrl + V pastes.' },
    { q: 'Independent editing challenge.', type: 'practice', minutes: 12, detail: 'Learner copies a name, pastes it twice, then undoes one paste. Staff only prompts when needed.', evidence: 'Record which shortcut was remembered independently.' },
  ],
  [
    { q: 'Warm-up: select text before changing it.', type: 'practice', minutes: 8, detail: 'Learner selects a word, then clicks away. Repeat until choose first, change second is clear.', evidence: 'Learner can select text intentionally.' },
    { q: 'Guided formatting set.', type: 'practice', minutes: 15, detail: 'Apply bold, italic and underline to three different words. Undo one and apply it again.', evidence: 'Document shows at least three formatting changes.' },
    { q: 'Which button makes text bold?', type: 'pick', ok: 'Correct. B means bold.', options: [{ t: 'B', ok: true, s: 'bold' }, { t: 'I', s: 'it' }, { t: 'U', s: 'ul' }] },
    { q: 'Colour practice.', type: 'practice', minutes: 10, detail: 'Select a heading or name and change its colour. Keep colour choice readable.', evidence: 'Learner chooses and applies one text colour.' },
    { q: 'Type the rule for formatting:', type: 'type', placeholder: 'choose first then change', answer: 'choose', ok: 'Correct. Choose first, then change.' },
    { q: 'Independent mini-design.', type: 'practice', minutes: 12, detail: 'Learner formats a three-line note so the title stands out and key words are readable.', evidence: 'Staff records whether formatting choices were independent.' },
  ],
  [
    { q: 'Warm-up: compare title and body text.', type: 'practice', minutes: 6, detail: 'Show a plain sentence and a title. Ask which one is easier to spot and why.', evidence: 'Learner recognises title as larger or more prominent.' },
    { q: 'Guided title creation.', type: 'practice', minutes: 15, detail: 'Type a useful title, select it, make it bigger, make it bold and centre it.', evidence: 'Document has a clear title at the top.' },
    { q: 'For a bigger title, choose a...', type: 'pick', ok: 'Correct. Bigger number means bigger text.', options: [{ t: 'Bigger number', ok: true }, { t: 'Smaller number' }] },
    { q: 'Build a short document under the title.', type: 'practice', minutes: 15, detail: 'Add three short lines underneath the title. Practise returning to normal text size.', evidence: 'Title and body text are visually different.' },
    { q: 'Type a title for today document:', type: 'type', placeholder: 'My Weekly Plan', ok: 'Good. That is a practical title.' },
    { q: 'Stretch: align one line left, centre and right.', type: 'practice', minutes: 8, detail: 'Use alignment buttons to show how text moves. Return the final title to centre.', evidence: 'Learner identifies centre alignment.' },
  ],
  [
    { q: 'Warm-up: list three real items.', type: 'practice', minutes: 6, detail: 'Choose a real list: shopping, medication reminders, jobs, appointments or packing.', evidence: 'Learner chooses a meaningful list topic.' },
    { q: 'Guided bulleted list.', type: 'practice', minutes: 15, detail: 'Create a bulleted list with at least four items. Practise Enter for a new bullet.', evidence: 'List has multiple bullet points.' },
    { q: 'A red wavy line usually means...', type: 'pick', ok: 'Correct. Check the spelling.', options: [{ t: 'Check the spelling', ok: true }, { t: 'Make it bold' }, { t: 'Close Word' }] },
    { q: 'Spell-check practice.', type: 'practice', minutes: 12, detail: 'Type one deliberate spelling mistake, notice the red line, and choose a suggested correction.', evidence: 'Learner sees spelling support as helpful, not failure.' },
    { q: 'Type the file type that keeps a document layout the same:', type: 'type', placeholder: 'PDF', answer: 'pdf', ok: 'Correct. PDF keeps the layout consistent.' },
    { q: 'Save/share practice.', type: 'practice', minutes: 12, detail: 'Use Save As and choose PDF. Staff may stop before final saving if using a shared device.', evidence: 'Learner can find PDF in the save options.' },
  ],
  [
    { q: 'Warm-up: point to rows, columns and cells.', type: 'practice', minutes: 8, detail: 'Use a blank spreadsheet. Learner points to a column letter, row number and a cell.', evidence: 'Learner distinguishes letters across and numbers down.' },
    { q: 'Guided navigation.', type: 'practice', minutes: 12, detail: 'Click A1, B1, A2 and C3. Use the name box or staff prompts to confirm each cell.', evidence: 'Learner reaches named cells with reduced support.' },
    { q: 'Each box in Excel is called a...', type: 'pick', ok: 'Correct. Each box is a cell.', options: [{ t: 'Cell', ok: true }, { t: 'Folder' }, { t: 'Page' }] },
    { q: 'Arrow-key practice.', type: 'practice', minutes: 10, detail: 'Start at A1 and move around the sheet using arrow keys. Say or point to the new cell name.', evidence: 'Learner uses arrow keys without losing place.' },
    { q: 'Type the name of the first top-left cell:', type: 'type', placeholder: 'A1', answer: 'a1', ok: 'Correct. A1 is the first cell.' },
    { q: 'Stretch: explain one cell name.', type: 'practice', minutes: 8, detail: 'Ask what B3 means: column B, row 3. Use pointing if spoken explanation is difficult.', evidence: 'Learner understands a cell reference as letter plus number.' },
  ],
  [
    { q: 'Warm-up: choose a real table topic.', type: 'practice', minutes: 6, detail: 'Pick something useful: snacks and prices, bus times, chores, attendance or weekly spending.', evidence: 'Learner understands what the table is for.' },
    { q: 'Guided data entry.', type: 'practice', minutes: 15, detail: 'Create headings in row 1, then enter at least five rows of simple data.', evidence: 'Table contains headings and multiple rows.' },
    { q: 'How should a header row stand out?', type: 'pick', ok: 'Correct. Bold headers are easier to scan.', options: [{ t: 'Bold', ok: true, s: 'bold' }, { t: 'Blank' }, { t: 'Hidden' }] },
    { q: 'Column width practice.', type: 'practice', minutes: 10, detail: 'Widen a column so the longest word can be read. Try dragging the boundary between column letters.', evidence: 'Learner sees that columns can be resized.' },
    { q: 'Type a money heading for a table:', type: 'type', placeholder: 'Cost', ok: 'Good. Cost is a useful money heading.' },
    { q: 'Format prices.', type: 'practice', minutes: 12, detail: 'Enter simple prices and apply currency formatting. Discuss why money formatting helps.', evidence: 'At least one number is shown as a price.' },
  ],
  [
    { q: 'Warm-up: formula confidence.', type: 'practice', minutes: 6, detail: 'Show that formulas are instructions for Excel. Say: equals means Excel, please work this out.', evidence: 'Learner recognises formulas start with equals.' },
    { q: 'Guided simple formula.', type: 'practice', minutes: 12, detail: 'Type =2+3, press Enter, then change the numbers and try again.', evidence: 'Learner sees the result change after pressing Enter.' },
    { q: 'Every Excel formula starts with...', type: 'pick', ok: 'Correct. Equals starts a formula.', options: [{ t: '=', ok: true, s: 'key' }, { t: '?' }, { t: 'PDF' }] },
    { q: 'Cell formula practice.', type: 'practice', minutes: 15, detail: 'Put two numbers in cells, then add them with a formula such as =A1+B1. Use simple values first.', evidence: 'Formula uses cell names, not only typed numbers.' },
    { q: 'Type a formula that adds 4 and 6:', type: 'type', placeholder: '=4+6', answer: '4+6', ok: 'Correct. That is a real formula.' },
    { q: 'AutoSum and certificate task.', type: 'practice', minutes: 12, detail: 'Enter three prices, use AutoSum to total them, then return to iLearn and complete the course.', evidence: 'Learner can explain that AutoSum adds a column.' },
  ],
];

course.lessons.forEach((lesson, index) => {
  lesson.tasks = [...lesson.tasks, ...extendedPractice[index]];
});

module.exports = course;
