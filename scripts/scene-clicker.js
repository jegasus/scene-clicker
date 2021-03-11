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
        const sheet = entity.sheet;

        // If the clicked entity is a Scene,
        // we need to handle three different cases:
        // -Ctrl pressed (to activate)
        // -Alt pressed (to render sheet)
        // -Nothing pressed (to view)
        if (entity.entity == "Scene") {
          if (event.ctrlKey && !event.altKey) {
            entity.activate();
          }
          else if (!event.ctrlKey && event.altKey) {
            // If the sheet is already rendered:
            if ( sheet.rendered ) {
              sheet.maximize();
              sheet.bringToTop();
            }
    
            // Otherwise render the sheet
              else sheet.render(true);
          }
          
          else if (!event.ctrlKey && !event.altKey) {
            entity.view();
          }
        }
        else return existing_onClickEntityName.bind(this)(event);
    },
    'MIXED',
  )
})


// Takes care of left-clicking on a Scene link inside a journal entry
// Wraps the following function:
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
  const currentTarget = event.currentTarget;
  let entity = null;
  

  // Target is World Entity Link
  if ( !currentTarget.dataset.pack ) {
    const cls = CONFIG[currentTarget.dataset.entity].entityClass;
    entity = cls.collection.get(currentTarget.dataset.id);
    if ( entity.entity === "Scene"){
      if ( !entity.hasPerm(game.user, "LIMITED") ) {
        return ui.notifications.warn(`You do not have permission to view this Scene.`);
      }
      else {
        // If the clicked entity link is a Scene,
        // we need to handle three different cases:
        // -Ctrl pressed (to activate)
        // -Alt pressed (to render sheet)
        // -Nothing pressed (to view)
        if (event.ctrlKey && !event.altKey) {
          entity.activate();
        }
        else if (!event.ctrlKey && event.altKey ) {
          // If the sheet is already rendered:
          if ( entity.sheet.rendered ) {
            entity.sheet.maximize();
            entity.sheet.bringToTop();
          }
  
          // Otherwise render the sheet
            else entity.sheet.render(true);
        }
        
        else if (!event.ctrlKey && !event.altKey) {
          entity.view();
        }

      }
    }
    else return existing_onClickEntityLink.bind(this)(event)
  }
  else return existing_onClickEntityLink.bind(this)(event)
}
