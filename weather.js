#!/usr/bin/env node

import dotenv from 'dotenv'
import axios from 'axios'
import chalk from 'chalk'
import Conf from 'conf'
import inquirer from 'inquirer'
import ora from 'ora'
import path from 'path';
import fs from 'fs';

const configDir = path.join(process.cwd(), 'config')

if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true })
}

const config = new Conf({
    cwd: configDir,
    configName: 'user-profile-config'
})

dotenv.config()

const apiKey = process.env.API_KEY

class UserProfile {
    #username
    #preferredCity

    constructor({username, preferredCity}) {
        this.#username = username
        this.#preferredCity = preferredCity
        
        config.set('username', username)
        config.set('preferredCity', preferredCity)
    }

    get username() {
        return this.#username
    }

    set username(newUsername) {
        this.#username = newUsername
        config.set('username', newUsername)
    }

    get preferredCity() {
        return this.#preferredCity
    }

    set preferredCity(newPreferredCity) {
        this.#preferredCity = newPreferredCity
        config.set('preferredCity', newPreferredCity)
    }
}

const setData = async () => {
    const answers = await inquirer.prompt([
        {
            type: 'input',
            name: 'username',
            message: 'Enter your username:',
            validate: (input) => {
                if (input.trim() === '') {
                    return chalk.red('The username cannot be empty!')
                }
                return true
            }
        },
        {
            type: 'input',
            name: 'preferredCity',
            message: 'Enter your preferred city:',
            validate: (input) => {
                const hasNumbers = /\d/.test(input)

                if (hasNumbers) {
                    return chalk.red('The city name must not contain numbers!')
                }
                if (input.trim() === '') {
                    return chalk.red('The city name cannot be empty!')
                }
                return true
            }
        }
    ])

    const spinner = ora('Adding data...').start()
    await new Promise(resolve => setTimeout(resolve, 1500))

    const user = new UserProfile({
        username: answers.username,
        preferredCity: answers.preferredCity
    })

    spinner.succeed(chalk.green(`Welcome, ${user.username}`))

    return user
}

const getWeather = async (city) => {
    try {
        const response = await axios.get(
            'https://api.weatherapi.com/v1/current.json', 
            {
                params: {
                    q: city,          
                    key: apiKey,      
                    lang: 'en'        
                }
            }
        )

        const { location, current } = response.data

        console.log(`
            📍 Location:     ${location.name}, ${location.country}
            🌡️ Temperature:  ${current.temp_c}°C / ${current.temp_f}°F
            🌤️ Condition:    ${current.condition.text}
            💨 Wind:         ${current.wind_kph} kph
        `)
    } catch (error) {
        console.error(
            chalk.red(`Weather error: {error.message}`),
        )
    }
}

const changeCity = (city, user) => {
    user.preferredCity = city
}

const changeUsername = (username, user) => {
    user.username = username
}

const main = async () => {
    let user

    if (!config.get('username') || !config.get('preferredCity')) {
        user = await setData()

        if (!user) return 

        config.set('username', user.username)
        config.set('preferredCity', user.preferredCity)
    } else {
        user = new UserProfile({
            username: config.get('username'),
            preferredCity: config.get('preferredCity')
        })

        console.log(chalk.green(`Welcome back, ${user.username} from ${user.preferredCity}`))
    }

    menuLoop: while (true) {
        console.log(
            chalk.cyan(`
             ██████╗██╗     ██╗     ██╗    ██╗███████╗ █████╗ ████████╗██╗  ██╗███████╗██████╗ 
            ██╔════╝██║     ██║     ██║    ██║██╔════╝██╔══██╗╚══██╔══╝██║  ██║██╔════╝██╔══██╗
            ██║     ██║     ██║     ██║ █╗ ██║█████╗  ███████║   ██║   ███████║█████╗  ██████╔╝
            ██║     ██║     ██║     ██║███╗██║██╔══╝  ██╔══██║   ██║   ██╔══██║██╔══╝  ██╔══██╗
            ╚██████╗███████╗██║     ╚███╔███╔╝███████╗██║  ██║   ██║   ██║  ██║███████╗██║  ██║
             ╚═════╝╚══════╝╚═╝      ╚══╝╚══╝ ╚══════╝╚═╝  ╚═╝   ╚═╝   ╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝
            `)
        )

        console.log(chalk.white('1) View weather'))
        console.log(chalk.white('2) Change username'))
        console.log(chalk.white('3) Change preferred city'))
        console.log(chalk.white('4) Profile'))
        console.log(chalk.white('5) Exit'))

        const answers = await inquirer.prompt([
            {
                type: 'input',
                name: 'option',
                message: chalk.yellow('Select an option:')
            }
        ])

        switch (answers.option) {
            case '1':
                await getWeather(user.preferredCity)
                break

            case '2': {
                const answers = await inquirer.prompt([
                    {
                        type: 'input',
                        name: 'username',
                        message: chalk.yellow('Enter a new username:'),
                        validate: (input) => {
                            if (input.trim() === '') {
                                return chalk.red('The username cannot be empty!')
                            }
                            return true
                        }
                    }
                ])

                changeUsername(answers.username, user)
                break
            }

            case '3': {
                const answers = await inquirer.prompt([
                    {
                        type: 'input',
                        name: 'city',
                        message: chalk.yellow('Enter a new city:'),
                        validate: (input) => {
                            const hasNumbers = /\d/.test(input)

                            if (hasNumbers) {
                                return chalk.red('The city name must not contain numbers!')
                            }
                            if (input.trim() === '') {
                                return chalk.red('The city name cannot be empty!')
                            }
                            return true
                        }
                    }
                ])

                changeCity(answers.city, user)
                break
            }

            case '4':
                console.log(`
                    👤 Username: ${user.username}
                    🌆 Preferred city: ${user.preferredCity}
                `)
                break

            case '5':
                break menuLoop
        }
    }
}

main()