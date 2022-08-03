![License](https://img.shields.io/github/license/AdamT20054/DJSCaptcha.svg?style=for-the-badge) ![Repo Size](https://img.shields.io/github/languages/code-size/AdamT20054/DJSCaptcha.svg?style=for-the-badge) ![TOP_LANGUAGE](https://img.shields.io/github/languages/top/AdamT20054/DJSCaptcha.svg?style=for-the-badge) ![FORKS](https://img.shields.io/github/forks/AdamT20054/DJSCaptcha.svg?style=for-the-badge&social) ![Stars](https://img.shields.io/github/stars/AdamT20054/DJSCaptcha.svg?style=for-the-badge)

# DJS Captcha

## Table of Contents

- [Description](#description)
- [Getting Started](#getting-started)
    - [Prerequisites](#prerequisites)
    - [Installation](#installation)
- [Example Code](#example-code)
    - [Presenting a CAPTCHA to a Member (With Built-In CAPTCHA Creation):](#presenting-a-captcha-to-a-member-with-built-in-captcha-creation)
    - [Presenting a CAPTCHA to a Member With Custom CAPTCHA Image Data](#presenting-a-captcha-to-a-member-with-custom-captcha-image-data)
    - [Manually Creating a CAPTCHA](#manually-creating-a-captcha)
- [Captcha Events](#captcha-events)
- [Screenshots](#screenshots)
- [License](#license)
- [Acknowledgements](#acknowledgements)
- [Contacts](#contacts)
  <br/>

# Description

DJS Captcha sets out to generate on-the-fly CAPTCHAs based off your desired inputs to present to members of your server. The module both creates the CAPTCHA, listens for a result and then acts on the result by removing and/or adding roles to users in your server.

The module was designed to primarily be used as a welcome CAPTCHA verification system.
<br/>
<br/>



# Getting Started

This bot is designed for DiscordJS@V14, you may run into issues using it in earlier versions as DiscordJS switched to EmbedBuilder().
<br/>
<br/>




## Prerequisites

DiscordJS@V14 requires Node@v16.9 or higher to run.

If you are using a Ubuntu and other Debian based systems, you may need to install some Prerequisits for Canvas to run. You can install these by running the following in the CLI:
```bash
sudo apt-get update
```
```bash
sudo apt-get install build-essential libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev
```
For more information on installing see [the Canvas Ubuntu and other Debian based systems installation page](https://github.com/Automattic/node-canvas/wiki/Installation%3A-Ubuntu-and-other-Debian-based-systems)

<br/>



## Installation

To install this module, type the command shown below into your Terminal.
```bash
npm i djscaptcha
```
<br/>

# Example Code

```javascript
const { EmbedBuilder, Collection, PermissionsBitField, Embed, Colors } = require('discord.js');
const { Captcha } = require("djscaptcha");
const client = (`..`) // Import client here

// Triggered by the guildMemberAdd event.

client.on('guildMemberAdd', async (member) => {
    const captcha = new Captcha(client, {
        guildID: "803763753429762098", // [Mandatory] The ID of the guild to use.
        roleAddID: "803853753357959189", // [Optional if addRoleOnSuccess = false] The ID of the role to add to the user.
        roleRemoveID: "807093688466800712", // [Optional if removeRoleOnSuccess = false] The ID of the role to remove from the user.
        channelID: "803763753429762100", // [Optional if sendToTextChannel = false] The ID of the channel to send the CAPTCHA to.
        sendToTextChannel: false, // [Optional | defaults to false] Whether to send the CAPTCHA to a text channel.
        addRoleOnSuccess: true, // [Optional | defaults to true] Whether you want the bot to add the role to the user if the captcha is solved.
        removeRoleOnSuccess: true, // [Optional | defaults to false] Whether you want the bot to remove the role from the user if the captcha is not solved.
        kickOnFailure: true, // [Optional | defaults to false] Whether you want the bot to kick the user if the captcha is failed.
        caseSensitive: true, // [Optional | defaults to true] Whether you want the captcha responses to be case-sensitive.
        attempts: 3, // [Optional | defaults to 3] The number of attempts before captcha is considered to be failed.
        timeout: 300000, // [Optional | defaults to 60000] The time the user has to solve the captcha on each attempt in milliseconds.
        showAttemptCount: true, // [Optional | defaults to true] Whether to show the number of attempts left in embed footer.
        customPromptEmbed: new EmbedBuilder() // [Optional] Customise the embed that will be sent
            .setTitle(`Welcome to ${member.guild.name}!`)
            .addFields({
                name: "I'm Not a Robot",
                value: `${member.user}, to gain access to **${member.guild.name}**, please solve the CAPTCHA below!\n\nThis is done to protect the server from raids consisting of spam bots.`
            })
            .setColor('#0099ff') // Set a custom color for the Prompt Embed
            .setThumbnail(member.guild.iconURL({dynamic: true})),
        customSuccessEmbed: new EmbedBuilder() // [Optional] Customise the embed that will be sent
            .setTitle("✅ CAPTCHA Solved!")
            .setDescription(`${member.user}, you completed the CAPTCHA successfully, and you have been given access to **${member.guild.name}**!`)
            .setTimestamp()
            .setColor('#29ff00')
            .setColor(Colors.Aqua)
            .setThumbnail(member.guild.iconURL({dynamic: true})),
        customFailureEmbed: new EmbedBuilder() // [Optional] Customise the embed that will be sent
            .setTitle("❌ You Failed to Complete the CAPTCHA!")
            .setDescription(`${member.user}, you failed to solve the CAPTCHA!`)
            .setTimestamp()
            .setColor('#c71515')
            .setThumbnail(member.guild.iconURL({dynamic: true})),
    });

    captcha.present(member);


});
```
## To use the default embeds, simply use the following code:

```javascript
    customPromptEmbed: new EmbedBuilder(), // [Optional] Customise the embed that will be sent
    customSuccessEmbed: new EmbedBuilder(), // [Optional] Customise the embed that will be sent
    customFailureEmbed: new EmbedBuilder(), // [Optional] Customise the embed that will be sent
```
### To learn more about creating your own embeds, refer to the [Discord.js EmbedBuilder](https://discordjs.guide/popular-topics/embeds) documentation.
<br/>
<br/>


## **`channelID`** Option Explained
The `channelID` option is the ID of the Discord Text Channel to Send the CAPTCHA to if the user's Direct Messages are locked. If no ID is provided then the CAPTCHA will not be sent at all if the users DMs are locked.

Use the option `sendToTextChannel`, and set it to `true` to always send the CAPTCHA to the Text Channel.
<br/>
<br/>

## **`sendToTextChannel`** Option Explained
The `sendToTextChannel` option determines whether you want the CAPTCHA to be sent to a specified Text Channel instead of Direct Messages, regardless of whether the user's DMs are locked.

Use the option `channelID` to specify the Text Channel.
<br/>
<br/>
<br/>


## Presenting a CAPTCHA to a Member With Built-In CAPTCHA Creation
---

Discord.js Captcha can automatically create a CAPTCHA for you, if you don't want to create one yourself.

**Note:** Built-In CAPTCHA Creation requires you to install the `canvas` package which should be preinstalled as part of the prerequisites. If `canvas` is not installed, you can install it with
```bash
npm i canvas
```

```js
client.on("guildMemberAdd", async member => {
    //in your bot application in the dev portal, make sure you have intents turned on!
    captcha.present(member); //captcha is created by the package, and sent to the member
});
```
<br/>
<br/>

## Presenting a CAPTCHA to a Member With Custom CAPTCHA Image Data
---

Don't like how the automatically created CAPTCHA looks? Simply pass in your own `CaptchaImageData` to the `present` method!

```js
client.on("guildMemberAdd", async member => {
    //in your bot application in the dev portal, make sure you have intents turned on!
    const captchaImageBuffer = //custom image as buffer
    const captchaImageText = //answer to the captcha as string
    captcha.present(member, { image: captchaImageBuffer, text: captchaImageText });
});
```

**Note:** When displaying a CAPTCHA to the user, the CAPTCHA image will automatically be attached to the `customPromptEmbed` for you.

In addition, if you have the `showAttemptCount` option enabled, any embed footer text on the `customPromptEmbed` will be overwritten with the number of attempts left.
<br/>
<br/>

## Manually Creating a CAPTCHA
---

You can use the `createCaptcha` method to easily create your own CAPTCHA using Discord.js Captcha's Built-In CAPTCHA Creation. It also comes with broader control over the length of the CAPTCHA, and the characters you would like to use by using a blacklist.

**Note:** Built-In CAPTCHA Creation uses `A-Z`, `a-z` and `0-9`.

```js
const { createCaptcha } = require("discord.js-captcha");

(async () => {
    //creating a CAPTCHA with 4 characters, and EXCLUDING numbers
    const myCaptcha = await createCaptcha(4, "0123456789");
    console.log(myCaptcha);
    // => { image: Buffer, text: "aBCd" }
})();
```
<br/>
<br/>

# CAPTCHA Events

There are five events that you can use to log CAPTCHA actions, responses, and other details. They are:

- `prompt` - Emitted when a CAPTCHA is presented to a user.
- `answer` - Emitted when a user responds to a CAPTCHA.
- `success` - Emitted when a CAPTCHA is successfully solved.
- `failure` - Emitted when a CAPTCHA is failed to be solved.
- `timeout` - Emitted when a user does not solve the CAPTCHA in time.

All of these events are emitted by the `Captcha` class. Here's an example of how to use them:

```js
captcha.on("success", data => {
    console.log(`A Member has Solved a CAPTCHA!`);
    console.log(data);
});
```

<br/>

# Screenshots
![Image of Captcha](https://github.com/AdamT20054/DJSCaptcha/blob/main/images/CaptchaSolved.png?raw=true)
![Image of Captcha](https://github.com/AdamT20054/DJSCaptcha/blob/main/images/CaptchaFailed.png?raw=true)
![Image of Captcha](https://github.com/AdamT20054/DJSCaptcha/blob/main/images/CaptchaAudit.png?raw=true)
<br/>

## License

<a href="https://choosealicense.com/licenses/gpl-3.0"><img src="https://raw.githubusercontent.com/johnturner4004/readme-generator/master/src/components/assets/images/gpl3.svg" height=40 /> GNU GPLv3 License</a>
<br/>
<br/>

## Acknowledgements

This is a modification from [discord.js-captcha](https://www.npmjs.com/package/discord.js-captcha) for DJS@v14 with modifications and additions suited towards personal projects.
<br/>
<br/>

## Contact me

- Need Help? [Join our Discord Server](https://discord.gg/YbtckEktmn)

- Found a Bug? [Open an Issue](https://github.com/AdamT20054/DJSCaptcha/issues), or Fork and [Submit a Pull Request](https://github.com/AdamT20054/DJSCaptcha/pulls) on our [GitHub Repository](https://github.com/AdamT20054/DJSCaptcha)!
