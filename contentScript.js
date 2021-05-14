
(()=>{

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

				if(message.input != '') {
					pasteToInputPanel(message.input);
					
				}

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

		

	});



	// check if need to remove headerBar
	chrome.runtime.sendMessage({
		type: 'is_remove_header'
	}, (response)=>{
		console.log(response);

		if(response.type == 'res_is_remove_header'
			&& response.isOk) {
			(()=>{
				let headerBar = document.querySelector('#gb > div.gb_Kd.gb_4d.gb_Td.gb_Sd');
				if(!headerBar) {
					console.log('not found headerBar');
					return;
				}
				headerBar.style.display = 'none';
			})();
		}
	});



	// listen sendKey event
	let handleKeyDown = (event) => {

		console.log('contentScript.js: keydown');
		console.log(event);


		// paste text to input
		if (event['altKey'] == true && event.key === 'v') {

			let translateInputTextArea = document.querySelector("textarea.er8xn");

			translateInputTextArea.value="";
			translateInputTextArea.focus();
			document.execCommand("paste");		
		}
		else if (event['altKey'] == true && event.key === 'l') {

			let listenBtn = document.querySelector("span.material-icons-extended.VfPpkd-Bz112c-kBDsod");
			listenBtn.click();
		}
		else if (event['altKey'] == true && event.key === 'a') {

			let translateInputTextArea = document.querySelector("textarea.er8xn");
			translateInputTextArea.focus();
			translateInputTextArea.select();
		}



	};
	document.addEventListener('keydown', handleKeyDown);


})();
