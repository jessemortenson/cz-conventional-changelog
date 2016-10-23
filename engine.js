"format cjs";

var wrap = require('word-wrap');
var map = require('lodash.map');
var longest = require('longest');
var rightPad = require('right-pad');

// This can be any kind of SystemJS compatible module.
// We use Commonjs here, but ES6 or AMD would do just
// fine.
module.exports = function (options) {

  var types = options.types;

  var length = longest(Object.keys(types)).length + 1;
  var choices = map(types, function (type, key) {
    return {
      name: rightPad(key + ':', length) + ' ' + type.description,
      value: key
    };
  });

  return {
    // When a user runs `git cz`, prompter will
    // be executed. We pass you cz, which currently
    // is just an instance of inquirer.js. Using
    // this you can ask questions and get answers.
    //
    // The commit callback should be executed when
    // you're ready to send back a commit template
    // to git.
    //
    // By default, we'll de-indent your commit
    // template and will keep empty lines.
    prompter: function(cz, commit) {
      console.log('\nLine 1 will be cropped at 100 characters. All other lines will be wrapped after 100 characters.\n');

      // Let's ask some questions of the user
      // so that we can populate our commit
      // template.
      //
      // See inquirer.js docs for specifics.
      // You can also opt to use another input
      // collection library if you prefer.
      cz.prompt([
        {
          type: 'list',
          name: 'type',
          message: 'Select the type of change that you\'re committing:',
          choices: choices
        }, {
          type: 'input',
          name: 'task',
          message: 'Enter Teamwork task url, or url in some other task/ticketing system:\n'
        }, {
          type: 'input',
          name: 'group',
          message: 'Add any grouping term or tag you want to apply to this commit:\n'
        }, {
          type: 'input',
          name: 'subject',
          message: 'Write a short description of the change (shorter than this prompt!):\n'
        }, {
          type: 'input',
          name: 'body',
          message: 'Provide a longer description of the change:\n'
        }
      ]).then(function(answers) {

        var maxLineWidth = 100;

        var wrapOptions = {
          trim: true,
          indent:'',
          width: maxLineWidth
        };

        var group = answers.group.trim();
        group = group ? '::' + answers.group.trim() + ':: ' : '';

        var task = answers.task.trim();
        task = task ? '\n\nTask: ' + answers.task.trim() : '';

        // Hard limit this line
        var head = (group + answers.subject.trim()).slice(0, maxLineWidth);

        // Wrap these lines at 100 characters
        var body = wrap(answers.body, wrapOptions);

        commit(head + '\n\n' + body + task + "\tType: " + answers.type);
      });
    }
  };
};
