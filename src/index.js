const { Command, flags } = require('@oclif/command')
const path = require('path')
const { cli } = require('cli-ux')
const fs = require('fs-extra')
const ejs = require('ejs')
const { spawn } = require("child_process")


class ReactBoilerplateCommand extends Command {

  static args = [
    { name: 'projectName' }
  ]

  async run() {
    const { args, flags } = this.parse(ReactBoilerplateCommand)
    let projectName
    const projectRoot = process.cwd()

    if (typeof (args.projectName) === 'undefined') {
      projectName = await cli.prompt('Name of the project')
    } else {
      projectName = args.projectName
    }

    const newProjectFolder = path.join(projectRoot, projectName)

    const packageJsonTemplate = await fs.readFile(
      path.join(__dirname, '../resources/package.json'),
      { encoding: 'utf-8' }
    )
    const packageJsonString = ejs.render(packageJsonTemplate, {
      name: projectName
    })

    fs.mkdir(newProjectFolder).then(() => {
      fs.copy(path.join(__dirname, '../resources'), newProjectFolder).then(() => {
        fs.writeFile(path.join(newProjectFolder, '/package.json'), packageJsonString).then(() => {
          console.log('Installing dependencies ...')
          const cmd = /^win/.test(process.platform) ? 'npm.cmd' : 'npm';
          const ls = spawn(cmd, ['i'], { env: process.env, cwd: newProjectFolder, stdio: 'inherit' })
        })
      })
    }, err => {
      console.warn('There is an existing folder in the specified directory')
    })
  }
}

ReactBoilerplateCommand.description = 'Creates a React boilerplate with minimum configuration'

ReactBoilerplateCommand.flags = {
  // add --version flag to show CLI version
  version: flags.version({ char: 'v' }),
  // add --help flag to show CLI version
  help: flags.help({ char: 'h' })
}

module.exports = ReactBoilerplateCommand
