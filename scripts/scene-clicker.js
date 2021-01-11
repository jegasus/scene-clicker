import { libWrapper } from './shim.js';

const MODULE_ID = 'scene-clicker';
const MODULE_NAME = "Scene Clicker";

function getSetting (settingName) {
  return game.settings.get(MODULE_ID, settingName)
}

//CONFIG.debug.hooks = true;

console.log("PREPARE TO HAVE YOUR MINDS BLOWN BY THE SHEER POWER OF THIS MODULE.");

// Takes care of left-clicking on a Scene in the right-hand panel 
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


// Takes care of left-clicking on a Scene link inside a journal entry
// Wrapped the following function:
// TextEditor._onClickEntityLink
// Address in foundry.js: line 13984
Hooks.on('init', () => {
  libWrapper.register(
    MODULE_ID, 
    'TextEditor._onClickEntityLink', 
    function(existing_onClickEntityLink, event) {
      return new_onClickEntityLink.bind(this)(event, existing_onClickEntityLink);
    }, 
    "MIXED");
});

function new_onClickEntityLink(event,existing_onClickEntityLink){
  event.preventDefault();
  const  a = event.currentTarget;
  let entity = null;

  // Target is World Entity Link
  if ( !a.dataset.pack ) {
    const cls = CONFIG[a.dataset.entity].entityClass;
    entity = cls.collection.get(a.dataset.id);
    if ( entity.entity === "Scene"){
      if ( !entity.hasPerm(game.user, "LIMITED") ) {
        return ui.notifications.warn(`You do not have permission to view this Scene.`);
      }
      else {
        return entity.view();
      }
    }
  }
  return existing_onClickEntityLink.bind(this)(event)
}
