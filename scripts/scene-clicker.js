import { libWrapper } from './shim.js';

const MODULE_ID = 'scene-clicker';
const MODULE_NAME = "Scene Clicker";

function getSetting (settingName) {
  return game.settings.get(MODULE_ID, settingName)
}

console.log("PREPARE TO HAVE YOUR MINDS BLOWN BY THE SHEER POWER OF THIS MODULE.");

Hooks.once('setup', function () {
  libWrapper.register( 
    MODULE_ID, 
    'SidebarDirectory.prototype._onClickEntityName', 
      function(existing_onClickEntityName, event) {
        
        const element = event.currentTarget;
        const entityId = element.parentElement.dataset.entityId;
        const entity = this.constructor.collection.get(entityId);

        if (entity.entity == "Scene") {
          entity.view();
        }
        else return existing_onClickEntityName.bind(this)(event)
    },
    'MIXED',
  )
})



