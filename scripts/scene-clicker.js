import { libWrapper } from './shim.js';

const MODULE_ID = 'scene-clicker';
const MODULE_NAME = "Scene Clicker";

function getSetting (settingName) {
  return game.settings.get(MODULE_ID, settingName)
}

console.log("Hello world! This code runs immediately when the file is loaded");

Hooks.once('setup', function () {
  libWrapper.register( 
    MODULE_ID, 
    'SidebarDirectory.prototype._onClickEntityName', 
      function(event) {
        event.preventDefault();
        const element = event.currentTarget;
        const entityId = element.parentElement.dataset.entityId;

        // Special shout out to Calego (ElfFriend) (Calego#0914 on Discord) who gave me the workaround to get  
        // the call to the `this` object to woirk properly. Instead of having two separate definitions (one for 
        // the definition of the overriding function and another for the libWrapper register), we can just 
        // write everything in one big block.
        const entity = this.constructor.collection.get(entityId);
        const sheet = entity.sheet;

        // If the sheet is already rendered:
        if ( sheet.rendered ) {
          sheet.maximize();
          sheet.bringToTop();
        }

        // ****** This is the new behavior I'm adding in! *********
        // If the sheet is from a Scene, `view` the scene instead 
        // of rendering the Scene's Config Sheet.
        else if (entity.entity == "Scene") {
          entity.view();
        }
        // ******** End of new behavior ****************

        // Otherwise render the sheet
        else sheet.render(true);
    },
    'OVERRIDE',
  )
})



