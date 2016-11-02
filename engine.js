"format cjs";

var wrap = require('word-wrap');

// This can be any kind of SystemJS compatible module.
// We use Commonjs here, but ES6 or AMD would do just
// fine.
module.exports = function (options) {

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
      var allowedShort = 50;
      var allowedLong = 72;
      console.log('\nLine 1 will be cropped at ' + allowedShort + ' characters. All other lines will be wrapped after ' + allowedLong + ' characters.\n');

      // Let's ask some questions of the user
      // so that we can populate our commit
      // template.
      //
      // See inquirer.js docs for specifics.
      // You can also opt to use another input
      // collection library if you prefer.
      cz.prompt([
        {
          type: 'input',
          name: 'task',
          message: 'Enter Teamwork task url, or url in some other task/ticketing system:\n',
          validate: function(input) {
            if (input.length == 0) {
              return 'A task URL is required.'
            }
            return true;
          }
        }, {
          type: 'input',
          name: 'group',
          message: '(optional) Add any grouping term or tag you want to apply to this commit:\n'
        }, {
          type: 'input',
          name: 'subject',
          message: 'Write a short description of the change (shorter than this prompt!):\n',
          validate: function (input) {
            allowedLength = allowedShort - 11;
            if (input.length > allowedLength) {
              return 'Please try again. Your message must be no longer than this: ' + input.substring(0, allowedLength);
            }
            return true;
          }
        }, {
          type: 'input',
          name: 'body',
          message: 'Provide a longer description of the change:\n'
        }
      ]).then(function(answers) {

        var maxLineWidth = 72;

        var wrapOptions = {
          trim: true,
          indent:'',
          width: maxLineWidth
        };

        var group = answers.group.trim();
        group = group ? '::' + answers.group.trim() + ':: ' : '';

        // Task URL and generate task code#
        var taskResponse = answers.task.trim();
        var taskUrl = taskResponse ? '\n\nTask: ' + taskResponse : '';

        // Derive taskCode from Task URL if we match a known URL signature
        var taskCode = '';
        var teamworkSignature = 'projects.origineight.net/tasks/';
        if (taskResponse && taskResponse.indexOf(teamworkSignature) != -1) {
          // Format TeamWork task code
          taskCode = taskResponse.substring(taskResponse.indexOf(teamworkSignature) + teamworkSignature.length + 1);
          taskCode = (taskCode.indexOf('?') != -1) ? taskCode.substring(0, taskCode.indexOf('?')) : taskCode;
          taskCode = 'TW #' + taskCode + ' ';
        }

        // Hard limit this line
        var head = (taskCode + group + answers.subject.trim()).slice(0, maxLineWidth);

        // Wrap these lines at 100 characters
        var body = wrap(answers.body, wrapOptions);

        commit(head + '\n\n\n\n' + body + taskUrl);
      });
    }
  };
};
