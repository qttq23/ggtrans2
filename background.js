
// create only 1 window for translate?? when user click too fast: click icon + click search context???
// detect window after close???
// handle runtime.lastError???
// make translate window close when click at 'reload' button on extension manager page???


console.log('background.js: hello');
let windowGgTrans = null;


// create window when icon clicked
async function createTranslateWindow() {

  // create window
  windowGgTrans = await new Promise((resolve, reject)=>{

    chrome.windows.create({
      url: 'https://translate.google.com/',
      type: 'popup',
      width: 400,
      height: 500

    }, function(createdWindow){

      console.log(createdWindow);
      windowGgTrans = createdWindow;
      resolve(createdWindow);
    });

  });


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
  title: 'search with google translate',
  type: 'normal',
  contexts: ['selection'],

},
];

for(let item of contextMenuItems){
  chrome.contextMenus.create(item);  
}


// handle context menu clicked
chrome.contextMenus.onClicked.addListener(async function(info, tab){

  // text
  let selectedText = info.selectionText;
  console.log(selectedText);

  // window id
  if(!windowGgTrans || !windowGgTrans.id) {
    await createTranslateWindow();
  }
  let windowId = windowGgTrans.id;
  

  // tabid
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
      chrome.windows.update(windowId, {focused: true});
    };
    sendToTranslateWindow(selectedText);

  });


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

  return true;
});