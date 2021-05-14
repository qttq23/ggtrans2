
// create only 1 window for translate?? when user click too fast: click icon + click search context???
// detect window after close
// handle runtime.lastError???
// make translate window close when click at 'reload' button on extension manager page: popup must be ext's file

// shortcut keyboard: select all, paste to input, listen, shortcut for context menu
// option page: config shortcut??

console.log('background.js: hello');
let windowGgTrans = null;


// create window when icon clicked
async function focusWindow(windowId) {
  return new Promise((resolve, reject)=>{

    chrome.windows.update(windowId, {focused: true}, function(win){
      resolve(win);
    });
  });
}

async function createTranslateWindow() {

  if(windowGgTrans) {
    return windowGgTrans;
  }

  // create window
  windowGgTrans = await new Promise((resolve, reject)=>{

    chrome.windows.create({
      url: 'https://translate.google.com/',
      type: 'popup',
      width: 400,
      height: 500

    }, function(createdWindow){

      resolve(createdWindow);


    });

  });
  return windowGgTrans;

}



// remove reference when window is removed
chrome.windows.onRemoved.addListener(id=>{
  if(windowGgTrans && windowGgTrans.id == id) {
    windowGgTrans = null;
  }
});



chrome.browserAction.onClicked.addListener(function(tab) {
  console.log('click at braction');

  createTranslateWindow();

});


// create context menu
let contextMenuItems = [
{
  id: '1',
  title: 'search with google translate (Alt+1)',
  type: 'normal',
  contexts: ['selection'],

},
];

for(let item of contextMenuItems){
  chrome.contextMenus.create(item);  
}


// handle context menu clicked
function pasteAndFocus(windowId, selectedText) {

  chrome.tabs.query({
    windowId: windowId,
    index: 0,
    // url: startwith translate...??
  }, (tabs)=>{


    let sendToTranslateWindow = (selectedText) => {

      // send request to contentscript
      chrome.tabs.sendMessage(tabs[0].id, {
        type: 'search',
        input: selectedText 
      },
      null,
      (response)=>{

        if(!response) {
          console.log('set retry');
          setTimeout(()=>{sendToTranslateWindow(selectedText);}, 1000);
          return;
        }
        console.log(response);

      });

      // focus on translate window
      // chrome.windows.update(windowId, {focused: true});
      focusWindow(windowId);
    };
    sendToTranslateWindow(selectedText);

  });
}
chrome.contextMenus.onClicked.addListener(async function(info, tab){

  // text
  let selectedText = info.selectionText;
  console.log(selectedText);

  // window id
  await createTranslateWindow();

  let windowId = windowGgTrans.id;


  pasteAndFocus(windowId, selectedText);


});


// handle requests
chrome.runtime.onMessage.addListener((msg, sender, sendResponse)=>{

  console.log(msg);
  if(msg.type == 'is_remove_header') {

    if(windowGgTrans) {

      chrome.tabs.query({
        windowId: windowGgTrans.id,
        index: 0,
        // url: startwith translate...??
      }, (tabs)=>{

        if(tabs.length > 0 && tabs[0].id == sender.tab.id) {

          sendResponse({
            type: 'res_is_remove_header',
            isOk: true
          });

        }
        else {
          sendResponse({
            type: 'res_is_remove_header',
            isOk: false
          });
        }
      });

    }
    else {
      sendResponse({
        type: 'res_is_remove_header',
        isOk: false
      });
    }



  }
  else if(msg.type == 'show_and_paste') {

    let handle = async ()=>{
      let selectedText = msg.selectedText;
      let win = await createTranslateWindow();
      pasteAndFocus(win.id, selectedText);

      sendResponse({
        type: 'res_show_and_paste',
        isOk: true
      });
    };
    handle();

  }

  return true;
});


// handle keyboard shortcut 
chrome.commands.onCommand.addListener(async function(command) {

  if (command === 'show_translate_window_paste') {

    chrome.tabs.executeScript({
      code: `
      (()=>{
        let selectedText = window.getSelection().toString();
        chrome.runtime.sendMessage({
          type: 'show_and_paste',
          selectedText: selectedText
        }, (response)=>{});
      })();
      `
    });


  }

});
