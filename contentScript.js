
chrome.runtime.onMessage.addListener((message, sender, sendReponse)=>{

	if(message.type == 'search') {

		try {
			let pasteToInputPanel = (text)=>{
				let translateInputTextArea = document.querySelector("textarea.er8xn");

				if(text){
					translateInputTextArea.value = text;    
					translateInputTextArea.select();
					document.execCommand("copy");
				}

				translateInputTextArea.value="";
				translateInputTextArea.focus();
				document.execCommand("paste");
				translateInputTextArea.blur();

			};

			pasteToInputPanel(message.input);

			sendReponse({
				type: 'res_search',
				isOk: true
			});

		}
		catch(error){
			console.log(error);

			sendReponse({
				type: 'res_search',
				isOk: false
			});
		}
		

	}

	else if(message.type == 'remove_header') {

		// optional
		// remove the header bar which is not needed
		(()=>{
			let headerBar = document.querySelector('#gb > div.gb_Kd.gb_4d.gb_Td.gb_Sd');
			if(!headerBar) {
				console.log('not found headerBar');
				return;
			}
			headerBar.style.display = 'none';
		})();

		sendReponse({
			type: 'res_remove_header',
			isOk: true
		})


	}

});




