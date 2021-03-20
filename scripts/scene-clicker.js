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
            
            // Only GMs are allowed to see the config sheet.
            if (game.user.isGM) {
              // If the sheet is already rendered:
              if ( sheet.rendered ) {
                sheet.maximize();
                sheet.bringToTop();
              }
      
              // Otherwise render the sheet
              else sheet.render(true);
            }
            else return existing_onClickEntityName.bind(this)(event);
          }
          else if (!event.ctrlKey && !event.altKey) {
            entity.view();
          }
          else return existing_onClickEntityName.bind(this)(event);
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

// New function for clicking on a Journal link
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
          
          // Only GMs are allowed to see the config sheet.
          if (game.user.isGM) {
            // If the sheet is already rendered:
            if ( entity.sheet.rendered ) {
              entity.sheet.maximize();
              entity.sheet.bringToTop();
            }
    
            // Otherwise render the sheet
            else entity.sheet.render(true);
          }
          else return existing_onClickEntityLink.bind(this)(event)
        }
        
        else if (!event.ctrlKey && !event.altKey) {
          entity.view();
        }
        else return existing_onClickEntityLink.bind(this)(event);
      }
    }
    else return existing_onClickEntityLink.bind(this)(event)
  }
  else return existing_onClickEntityLink.bind(this)(event)
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
  let entity = game.scenes.get(sceneId);
  
  // If the clicked entity link is a Scene,
  // we need to handle three different cases:
  // -Ctrl pressed (to activate)
  // -Alt pressed (to render sheet)
  // -Nothing pressed (to view)
  if (event.ctrlKey && !event.altKey) {
    entity.activate();
  }
  else if (!event.ctrlKey && event.altKey ) {
    // Only the GM is allowed to see the config sheet
    if (game.user.isGM) {
      // If the sheet is already rendered:
      if ( entity.sheet.rendered ) {
        entity.sheet.maximize();
        entity.sheet.bringToTop();
      }

      // Otherwise render the sheet
      else entity.sheet.render(true);
    }
    else return existing_onClickScene.bind(this)(event);
  }
  
  else if (!event.ctrlKey && !event.altKey) {
    entity.view();
  }
  else return existing_onClickScene.bind(this)(event);
}
