//import { libWrapper } from './shim.js';

const MODULE_ID = 'scene-clicker';
const MODULE_NAME = "Scene Clicker";

function handleSceneClicked(event, document)
{
    if (document.documentName != "Scene") {
        return false;
    }

    if ( !document.testUserPermission(game.user, "LIMITED") ) {
      ui.notifications.warn(`You do not have permission to view this Scene.`);
      return false;
    }

    return getSceneClickEventHandler(event)(document);
}

function getSceneClickEventHandler(event)
{
    // If the clicked document is a Scene,
    // we need to handle three different cases:
    // -Ctrl pressed (to activate)
    // -Alt pressed (to render sheet)
    // -Nothing pressed (to view)
    if (event.ctrlKey && !event.altKey) {
        return onActivateRequested;
    }
    else if (!event.ctrlKey && event.altKey) {
        return onRenderRequested;
    }
    else if (!event.ctrlKey && !event.altKey) {
        return onViewRequested;
    }
    else {
        return function (document) { return false; };
    }
}

function onActivateRequested(document)
{
    document.activate();
    return true;
}

function onRenderRequested(document)
{
    if (!game.user.isGM) {
        return false;
    }

    const sheet = document.sheet;

    // If the sheet is already rendered:
    if ( sheet.rendered ) {
        sheet.maximize();
        sheet.bringToTop();
    }
    // Otherwise render the sheet
    else {
        sheet.render(true);
    }

    return true;
}

function onViewRequested(document)
{
    document.view();
    return true;
}

function getSetting (settingName) {
  return game.settings.get(MODULE_ID, settingName)
}

//CONFIG.debug.hooks = true;

Hooks.once('ready', () => {
  if(!game.modules.get('lib-wrapper')?.active && game.user.isGM)
      ui.notifications.error("The 'Scene Clicker' module requires the 'libWrapper' module. Please install and activate it.");
});

// Takes care of left-clicking on a Scene in the right-hand panel 
Hooks.once('setup', function () {
  libWrapper.register( 
    MODULE_ID, 
    'SidebarDirectory.prototype._onClickDocumentName', 
      function(existing_onClickDocumentName, event) {
        return new_onClickDocumentName.bind(this)(event, existing_onClickDocumentName);
      },
    'MIXED',
  )
})

// New function for clicking on a Scene in the right-hand panel
function new_onClickDocumentName(event, existing_onClickDocumentName) {
  const element = event.currentTarget;
  const documentId = element.parentElement.dataset.documentId;
  const document = this.constructor.collection.get(documentId);

  if (!handleSceneClicked(event, document)) {
    return existing_onClickDocumentName.bind(this)(event);
  }
}

// Takes care of left-clicking on a Scene link inside a journal entry
// Wraps the following function:
// TextEditor._onClickContentLink
// Address in foundry.js: line 21212
Hooks.on('init', () => {
  libWrapper.register(
    MODULE_ID, 
    'TextEditor._onClickContentLink', 
    function(existing_onClickContentLink, event) {
      return new_onClickContentLink.bind(this)(event, existing_onClickContentLink);
    }, 
    "MIXED");
});

// New function for clicking on a Journal link
function new_onClickContentLink(event,existing_onClickContentLink){
  event.preventDefault();
  const currentTarget = event.currentTarget;
  let document = null;

  // Target is not World Document Link, defer to existing callback.
  if ( currentTarget.dataset.pack ) {
    return existing_onClickContentLink.bind(this)(event);
  }
  
  const collection = game.collections.get(currentTarget.dataset.type);
  document = collection.get(currentTarget.dataset.id);

  if (!handleSceneClicked(event, document)) {
    return existing_onClickContentLink.bind(this)(event);
  }
}

// Takes care of left-clicking on a Scene in the navigation menu
// at the top of the screen.
// Wraps the following function:
// SceneNavigation._onClickScene
// Address in foundry.js: line 21223
Hooks.on('init', () => {
  libWrapper.register(
    MODULE_ID, 
    'SceneNavigation.prototype._onClickScene', 
    function(existing_onClickScene, event) {
      return new_onClickScene.bind(this)(event, existing_onClickScene);
    }, 
    "MIXED");
});

// New function for clicking on a scene in the navigation bar
function new_onClickScene(event,existing_onClickScene){
  event.preventDefault();
  let sceneId = event.currentTarget.dataset.sceneId;
  let document = game.scenes.get(sceneId);

  if (!handleSceneClicked(event, document)) {
    return existing_onClickScene.bind(this)(event);
  }
}
