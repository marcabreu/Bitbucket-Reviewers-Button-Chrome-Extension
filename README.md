Bitbucket Server Reviewers Groups - Extension
==================

<p align="center">
<img src="https://raw.githubusercontent.com/dragouf/Stash-Reviewers-Chrome-Extension/master/docs/launch.png" alt="extension art" />
</p>

>:warning: if you have stash server (previous version of bitbucket) please switch to 'stash-server-version' branch

This chrome/firefox extension allow to define groups of reviewers in Atlassian Bitbucket Server (previously stash) to bulk add them when creating or updating pull request.

### Features

* Add button in pull request creation page to add group of reviewers

### Installation

#### Chrome

from the code source of this repository:

- clone this repository
- Go to chrome settings->extensions (extension manager)
- Check the "Developer Mode" checkbox
- Click on "Load unpacked extension" button.
- From there choose the extension/chrome/src folder of this repository.

### Configuration

##### Enable/Disable features
just go to options panel and enable or disable features you want.

##### Configure reviewers groups
A "Bitbucket" icon will appear on the top right corner of chrome window. Click on it. It will ask you to add a json to describe which group you want to create with which reviewers.

![Configuration](/docs/configuration_resized.png)

Json format is as follow :

```
{ "groups": [ {
    "groupName":"first group name",
    "reviewers": ["first reviewer name or email"]
  },
  {
    "groupName":"second group name",
    "reviewers": ["first reviewer name or email", "second reviewer name or email"]
  } ] }
```


##### Using centralized lists
If you want to share one list between more users. You need to upload .json file so it is accessible by everyone. Then you just add URL to `URL to json` field. There can be more sources. All lists from files and from JSON field are merged together. Remote lists are reloaded on launch and every 6 hours.

![Add Urls](/docs/add_urls.png)

After that when you will go to pull request creation page or update page a dropdown will appear after reviewers list with a list of groups you defined.

![Add Group](/docs/add_group.png)

**Note**: the extension will make a bitbucket server api request to find reviewers. It will simply send the string you added in the reviewers array as search term. Normally if you add email or username as recommanded API should return only one user. You can also enter a name but in this case if the API return more than one user, only the first one will be added.