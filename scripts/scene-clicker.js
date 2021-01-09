import { libWrapper } from './shim.js';

const MODULE_ID = 'scene-clicker';
const MODULE_NAME = "Scene Clicker";

function getSetting (settingName) {
  return game.settings.get(MODULE_ID, settingName)
}

//CONFIG.debug.hooks = true;

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



Hooks.once('setup', function () {
  libWrapper.register( 
    MODULE_ID, 
    'TextEditor._onClickEntityLink', 
      function(existing_onClickEntityLink, event) {
        
        //const element = event.currentTarget;
        //const entityId = element.parentElement.dataset.entityId;
        //const entity = this.constructor.collection.get(entityId);

        //if (entity.entity == "Scene") {
        //  entity.view();
        //}
        //else return existing_onClickHyperlink.bind(this)(event)
        let x = 1;
        return existing_onClickEntityLink.bind(this)(event);
    },
    'MIXED',
  )
})