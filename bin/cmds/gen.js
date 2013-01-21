var path      = require('path')
  , fs        = require('fs')
  , exec      = require('child_process').exec
  , faker     = require('Faker')

module.exports.opts = [
  {full : 'no-deps', abbr: 'nd', args: false}
];

module.exports.call = function() {
  var args = this.utils.makeArray(arguments)
    , name = args[0]
    , tpl  = path.resolve(pineapple.PATH, 'tpl')
    , dir

  if (! name) {
    pineapple.logger.warn("Aw shucks, you didn't provide me with an app name, but hey, don't fret! I can generate one for you!");
    
    promptAppname();
  }
  else {
    makeApp(name);
  }
  
  function makeApp(name) {
    dir  = path.resolve(args[1]) + '/' + name

    exec(['mkdir', dir].join(' '), function(error, stdout, stderr){
      if (error) {
        pineapple.logger.error(stderror);
        pineapple.fatal("Something went wrong creating the app directory for " + name);
      }
      else {
        exec(['cp -rf', tpl + '/*', dir].join(' '), function(error, stdout, stderr){
          if (error) {
            pineapple.logger.error(stderr);
            pineapple.fatal("Something went wrong generating the app " + name);
          }

          if (!pineapple.parser.opts['no-deps']) {
            pineapple.logger.info("Going to grab all of those dependencies now..")
            pineapple.logger.info("This may take a while..");
            process.chdir(dir);
            exec('npm install .', function(error, stdout, stderr){
              if (error) {
                pineapple.logger.error(stderr);
                pineapple.fatal("Something went wrong installing dependencies with npm for " + name);
              }

              pineapple.logger.success("All dependencies installed! =)");
            });
          }

          pineapple.logger.info("Sweet! I've created a new Pineapple application here => ".cyan + dir.blue);
        });
      }
    })
  }

  function promptAppname() {
    name = faker.Internet.domainWord();
    
    try {
      pineapple.logger.cli.close();
    }
    catch (e){}

    pineapple.logger.question("How does ["+ name.cyan +"] sound? (y/n/exit)", function(answer){
      switch (answer.toLowerCase()) {
        case 'y':
          makeApp(name);
          pineapple.logger.cli.close();
        break;

        case 'n':
          pineapple.logger.info("Okay, I understand. Let's try again. You can respond with exit if you want me to stop.");
          promptAppname();
        break;

        case 'exit' :
          pineapple.logger.info("Okay, okay. I get it. Maybe you should provide your own then.");
          pineapple.die();
        break;

        default : 
          pineapple.logger.info("Oops! Looks like that is a response I just don't understand.");
          promptAppname();
        break;
      }
    });
  }
};

module.exports.help = function(help) {
  return help('gen', "Generates a new pineapple api application.");
};